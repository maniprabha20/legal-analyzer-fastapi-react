from sqlalchemy import select

from database import AsyncSessionLocal
from models import Document
from pdf_extraction import extract_text_from_pdf, get_extraction_summary
from chunking import chunk_pages
from vector_store import add_chunks_to_store 

async def process_document(document_id: int) -> None:
    """
    Runs the full ingestion pipeline for one document.
    """

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Document).where(Document.id == document_id)
        )
        document = result.scalar_one_or_none()

        if document is None:
            return

        try:
            # Mark as processing
            document.status = "processing"
            await db.commit()

            # Extract text
            pages = extract_text_from_pdf(document.file_path)
            summary = get_extraction_summary(pages)

            # Check if extraction failed
            if summary["total_characters_extracted"] < 20:
                document.status = "failed"
                await db.commit()
                return

            # Chunk the document
            chunks = chunk_pages(pages)

            # Store embeddings in ChromaDB
            add_chunks_to_store(document_id, chunks)

            # Mark as ready
            document.status = "ready"
            await db.commit()

        except Exception as e:
            document.status = "failed"
            await db.commit()
            print(f"[ingestion error] document {document_id}: {e}")