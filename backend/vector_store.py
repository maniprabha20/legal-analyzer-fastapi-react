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