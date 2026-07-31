import os
import uuid
import aiofiles

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import Document, User
from schemas import DocumentResponse
from auth import get_current_user


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
            detail=f"File too large. Max {MAX_FILE_SIZE_MB}MB allowed."
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
        select(Document).where(
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
            detail="File missing from storage"
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


    await db.delete(document)

    await db.commit()

    return None