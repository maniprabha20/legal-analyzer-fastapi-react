import chromadb
from chromadb.config import Settings

from embeddings import embed_texts_batch, embed_text


CHROMA_DIR = "chroma_data"


# Persistent ChromaDB client
_client = chromadb.PersistentClient(
    path=CHROMA_DIR,
    settings=Settings(anonymized_telemetry=False)
)


# Create collection
_collection = _client.get_or_create_collection(
    name="document_chunks",
    metadata={"hnsw:space": "cosine"}
)


def add_chunks_to_store(document_id: int, chunks: list) -> int:
    """
    Store document chunks and their embeddings in ChromaDB
    """

    if not chunks:
        return 0

    texts = [c.content for c in chunks]

    # Create embeddings
    vectors = embed_texts_batch(texts)

    # Unique IDs
    ids = [
        f"doc{document_id}_chunk{c.chunk_index}"
        for c in chunks
    ]

    # Metadata
    metadatas = [
        {
            "document_id": document_id,
            "page_number": c.page_number,
            "chunk_index": c.chunk_index
        }
        for c in chunks
    ]

    print("ADDING TO CHROMA:", document_id, len(chunks)) 
    _collection.add(
        ids=ids,
        embeddings=vectors,
        documents=texts,
        metadatas=metadatas
    )

    return len(chunks)



def search_similar_chunks(
    query: str,
    document_id: int,
    top_k: int = 5
) -> list[dict]:
    print("SEARCH DOCUMENT:", document_id)
    # Convert question into vector
    query_vector = embed_text(query)


    results = _collection.query(
        query_embeddings=[query_vector],
        n_results=top_k,
        where={
            "document_id": document_id
        }
    )


    matches = []

    for text, metadata, distance in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0]
    ):

        matches.append(
            {
                "content": text,
                "page_number": metadata["page_number"],
                "chunk_index": metadata["chunk_index"],
                "similarity": 1 - distance
            }
        )


    return matches



def delete_document_chunks(document_id: int):
    """
    Delete vectors of a document
    """

    _collection.delete(
        where={
            "document_id": document_id
        }
    ) 
def get_all_chunks_for_document(document_id: int) -> list[dict]:
    """
    Retrieves every stored chunk for a document, in original page/chunk
    order. Used for full-document analysis (Day 18), as opposed to
    search_similar_chunks() above, which only returns the top-k chunks
    most relevant to one specific question.
    """
    results = _collection.get(
        where={"document_id": document_id},
        include=["documents", "metadatas"],
    )

    combined = list(zip(results["documents"], results["metadatas"]))
    combined.sort(key=lambda pair: pair[1]["chunk_index"])

    return [
        {
            "content": text,
            "page_number": meta["page_number"],
            "chunk_index": meta["chunk_index"],
        }
        for text, meta in combined
    ]


def get_document_page_count(document_id: int) -> int:
    """
    Returns the highest page_number seen among this document's stored
    chunks - used as an approximation of the document's total page count,
    to validate that AI-reported citations (Day 19) stay within real
    bounds.
    """
    chunks = get_all_chunks_for_document(document_id)
    if not chunks:
        return 1
    return max(c["page_number"] for c in chunks)   