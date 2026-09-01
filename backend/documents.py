import os
import aiofiles
import uuid
import json
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    BackgroundTasks,
)

from fastapi.responses import Response

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import Document, User, AnalysisReport, ChatMessage
from schemas import DocumentResponse, AnalysisResponse, ChatMessageResponse
from auth import get_current_user 
from fastapi import Query
from rate_limit import rate_limiter
from storage import upload_file_to_storage

from vector_store import (
    delete_document_chunks,
    get_all_chunks_for_document,
    get_document_page_count,
)
from retrieval import (
    retrieve_relevant_chunks,
    format_chunks_as_context
)
from llm import ask_llm, AI_DISCLAIMER, analyze_document_text
from citations import validate_and_clamp_citations

from pdf_extraction import (
    extract_text_from_pdf,
    get_extraction_summary
)
from ingestion import process_document

from chunking import (
    chunk_pages,
    count_tokens
)
from storage import upload_file_to_storage


router = APIRouter(
    prefix="/documents",
    tags=["documents"]
)
async def _get_owned_document_or_404(
    document_id: int,
    db: AsyncSession,
    current_user: User,
):
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.user_id == current_user.id
        )
    )

    document = result.scalar_one_or_none()

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    return document
def _report_to_response(report: AnalysisReport) -> AnalysisResponse:
    return AnalysisResponse(
        id=report.id,
        document_id=report.document_id,
        result=json.loads(report.result_json),
        created_at=report.created_at,
    )


UPLOAD_DIR = "uploads"
ALLOWED_EXTENSION = ".pdf"
MAX_FILE_SIZE_MB = 20



@router.post(
    "/upload",
    response_model=DocumentResponse,
    status_code=201
)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    if not file.filename.lower().endswith(ALLOWED_EXTENSION):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    contents = await file.read()

    size_mb = len(contents) / (1024 * 1024)

    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail="File too large"
        )

    unique_name = f"{uuid.uuid4()}.pdf"

    upload_file_to_storage(
        unique_name,
        contents
    )

    file_path = unique_name

    new_doc = Document(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        status="uploaded"
    )

    db.add(new_doc)

    await db.commit()

    await db.refresh(new_doc)

    background_tasks.add_task(
        process_document,
        new_doc.id
    )

    return new_doc
@router.get(
    "",
    response_model=list[DocumentResponse]
)
async def list_documents(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    result = await db.execute(
        select(Document)
        .where(
            Document.user_id == current_user.id
        )
        .offset(offset)
        .limit(limit)
    )

    return result.scalars().all()
@router.get(
    "/{document_id}",
    response_model=DocumentResponse
)
async def get_document(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    return await _get_owned_document_or_404(
        document_id,
        db,
        current_user
    )


# NOTE: the duplicate second copy of get_document() that was here has been
# removed - it was dead code silently shadowed by the first definition above,
# not causing errors, but redundant and worth cleaning up.


@router.get("/{document_id}/status")
async def get_document_status(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    document = await _get_owned_document_or_404(
        document_id,
        db,
        current_user
    )

    return {
        "document_id": document.id,
        "status": document.status
    }


@router.get("/{document_id}/search")
async def search_document(
    document_id: int,
    q: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    document = await _get_owned_document_or_404(
        document_id,
        db,
        current_user
    )

    if document.status != "ready":
        raise HTTPException(
            status_code=400,
            detail=f"Document is not ready for search yet (status: {document.status})"
        )

    chunks = retrieve_relevant_chunks(
    question=q,
    document_id=document_id
)
    return {
    "query": q,
    "matches_found": len(chunks),
    "matches": chunks,
    "formatted_context_preview": format_chunks_as_context(chunks)[:500]
}


@router.get("/{document_id}/ask")
async def ask_document(
    document_id: int,
    q: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(rate_limiter("ask")),
):
    document = await _get_owned_document_or_404(
        document_id,
        db,
        current_user,
    )

    if document.status != "ready":
        raise HTTPException(
            status_code=400,
            detail=f"Document is not ready for questions yet (status: {document.status})",
        )

    history_result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.document_id == document_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(6)
    )

    recent_messages = list(reversed(history_result.scalars().all()))

    chat_history = [
        {"role": m.role, "content": m.content}
        for m in recent_messages
    ]

    retrieval_question = q

    if chat_history:
        previous_context = "\n".join(
            f"{m['role']}: {m['content']}"
            for m in chat_history[-4:]
        )

        retrieval_question = (
            f"Conversation context:\n{previous_context}\n\n"
            f"Current question: {q}"
        )

    chunks = retrieve_relevant_chunks(
        question=retrieval_question,
        document_id=document_id,
    )

    if not chunks:
        answer_text = "I could not find information about this in the document."

        db.add(
            ChatMessage(
                document_id=document_id,
                role="user",
                content=q,
            )
        )

        db.add(
            ChatMessage(
                document_id=document_id,
                role="assistant",
                content=answer_text,
            )
        )

        await db.commit()

        return {
            "question": q,
            "answer": answer_text,
            "disclaimer": AI_DISCLAIMER,
            "sources_used": 0,
            "pages_referenced": [],
        }

    context = format_chunks_as_context(chunks)

    result = ask_llm(
        question=q,
        context=context,
        chat_history=chat_history,
    )

    pages_referenced = sorted(
        set(c["page_number"] for c in chunks)
    )

    db.add(
        ChatMessage(
            document_id=document_id,
            role="user",
            content=q,
        )
    )

    db.add(
        ChatMessage(
            document_id=document_id,
            role="assistant",
            content=result["answer"],
        )
    )

    await db.commit()

    return {
        "question": q,
        "answer": result["answer"],
        "disclaimer": result["disclaimer"],
        "sources_used": len(chunks),
        "pages_referenced": pages_referenced,
    }
    context = format_chunks_as_context(chunks)

    result = ask_llm(
        question=q,
        context=context,
        chat_history=chat_history,
    )

    pages_referenced = sorted(set(c["page_number"] for c in chunks))

    db.add(ChatMessage(document_id=document_id, role="user", content=q))
    db.add(ChatMessage(document_id=document_id, role="assistant", content=result["answer"]))
    await db.commit()

    return {
        "question": q,
        "answer": result["answer"],
        "disclaimer": result["disclaimer"],
        "sources_used": len(chunks),
        "pages_referenced": pages_referenced,
    }

@router.get("/{document_id}/chat", response_model=list[ChatMessageResponse])
async def get_chat_history(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    await _get_owned_document_or_404(
        document_id,
        db,
        current_user
    )

    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.document_id == document_id)
        .order_by(ChatMessage.created_at.asc())
    )

    return result.scalars().all()


@router.post(
    "/{document_id}/analyze",
    response_model=AnalysisResponse,
    status_code=201
)
async def analyze_document(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    document = await _get_owned_document_or_404(
        document_id,
        db,
        current_user
    )

    if document.status != "ready":
        raise HTTPException(
            status_code=400,
            detail=f"Document is not ready for analysis yet (status: {document.status})",
        )

    chunks = get_all_chunks_for_document(document_id)

    if not chunks:
        raise HTTPException(
            status_code=400,
            detail="No content available to analyze for this document."
        )

    context = format_chunks_as_context(chunks)

    try:
        analysis = analyze_document_text(context)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {e}")

    max_page = get_document_page_count(document_id)
    analysis = validate_and_clamp_citations(analysis, max_page)

    report = AnalysisReport(
        document_id=document_id,
        result_json=analysis.model_dump_json(),
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)

    return {
        "id": report.id,
        "document_id": report.document_id,
        "result": analysis,
        
        "created_at": report.created_at,
    } 
@router.get("/{document_id}/reports", response_model=list[AnalysisResponse])
async def list_analysis_reports(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(rate_limiter("analyze")),
):

    await _get_owned_document_or_404(
        document_id,
        db,
        current_user
    )

    result = await db.execute(
        select(AnalysisReport)
        .where(AnalysisReport.document_id == document_id)
        .order_by(AnalysisReport.created_at.desc())
    )

    reports = result.scalars().all()

    return [_report_to_response(r) for r in reports]


@router.get(
    "/{document_id}/download"
)
async def download_document(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = await _get_owned_document_or_404(
        document_id,
        db,
        current_user
    )

    try:
        from storage import download_file_from_storage

        file_bytes = download_file_from_storage(
            document.file_path
        )

        return Response(
            content=file_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": (
                    f'attachment; filename="{document.filename}"'
                )
            },
        )

    except Exception as e:
        print(f"[download error] {e}")

        raise HTTPException(
            status_code=404,
            detail=f"File missing from storage: {e}"
        )


@router.delete(
    "/{document_id}",
    status_code=204
)
async def delete_document(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = await _get_owned_document_or_404(
        document_id,
        db,
        current_user
    )

    try:
        from storage import delete_file_from_storage

        delete_file_from_storage(
            document.file_path
        )

    except Exception as e:
        print(f"[delete storage error] {e}")

    delete_document_chunks(document_id)

    await db.delete(document)

    await db.commit()

    return None