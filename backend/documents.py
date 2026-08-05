import os
import aiofiles
import uuid

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    BackgroundTasks,
)

from fastapi.responses import FileResponse

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import Document, User
from schemas import DocumentResponse

from auth import get_current_user 
 
from vector_store import delete_document_chunks 
from retrieval import (
    retrieve_relevant_chunks,
    format_chunks_as_context
)
from llm import ask_llm

from pdf_extraction import (
    extract_text_from_pdf,
    get_extraction_summary
)
from ingestion import process_document

from chunking import (
    chunk_pages,
    count_tokens
)


router = APIRouter(
    prefix="/documents",
    tags=["documents"]
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

    file_path = os.path.join(
        UPLOAD_DIR,
        unique_name
    )

    os.makedirs(
        UPLOAD_DIR,
        exist_ok=True
    )

    async with aiofiles.open(
        file_path,
        "wb"
    ) as out_file:
        await out_file.write(contents)

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
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    result = await db.execute(
        select(Document)
        .where(
            Document.user_id == current_user.id
        )
    )


    return result.scalars().all()





async def _get_owned_document_or_404(
    document_id: int,
    db: AsyncSession,
    current_user: User
):

    result = await db.execute(
        select(Document)
        .where(
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
            detail=f"Document is not ready for questions yet (status: {document.status})",
        )

    chunks = retrieve_relevant_chunks(
        question=q,
        document_id=document_id
    )

    context = format_chunks_as_context(chunks)

    answer = ask_llm(
        question=q,
        context=context
    )

    return {
        "question": q,
        "answer": answer,
        "sources_used": len(chunks)
    }


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

    if not os.path.exists(document.file_path):
        raise HTTPException(
            status_code=404,
            detail="File missing"
        )

    return FileResponse(
        path=document.file_path,
        filename=document.filename,
        media_type="application/pdf"
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


    if os.path.exists(document.file_path):
        os.remove(document.file_path)
    delete_document_chunks(document_id)


    await db.delete(document)

    await db.commit()


    return None