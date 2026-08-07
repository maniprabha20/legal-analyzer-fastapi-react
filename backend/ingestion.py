from sqlalchemy import select

from database import AsyncSessionLocal
from models import Document, Chunk

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
            # Mark document as processing
            document.status = "processing"
            await db.commit()


            # Extract text from PDF
            pages = extract_text_from_pdf(document.file_path)

            summary = get_extraction_summary(pages)


            # Extraction failed check
            if summary["total_characters_extracted"] < 20:
                document.status = "failed"
                await db.commit()
                return


            # Create text chunks
            chunks = chunk_pages(pages)


            if not chunks:
                document.status = "failed"
                await db.commit()
                return


            # Save chunks into PostgreSQL
            for chunk in chunks:

                db_chunk = Chunk(
                    document_id=document_id,
                    content=chunk.content,
                    page_number=chunk.page_number,
                    chunk_index=chunk.chunk_index
                )

                db.add(db_chunk)


            await db.commit()


            # Save embeddings into ChromaDB
            add_chunks_to_store(
                document_id,
                chunks
            )


            # Mark document ready
            document.status = "ready"
            await db.commit()


        except Exception as e:

            document.status = "failed"
            await db.commit()

            print(
                f"[ingestion error] document {document_id}: {e}"
            )