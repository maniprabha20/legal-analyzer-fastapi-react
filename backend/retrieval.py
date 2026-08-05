from vector_store import search_similar_chunks


MIN_SIMILARITY_THRESHOLD = 0.3


def retrieve_relevant_chunks(
    question: str,
    document_id: int,
    top_k: int = 5,
    min_similarity: float = MIN_SIMILARITY_THRESHOLD,
) -> list[dict]:

    matches = search_similar_chunks(
        query=question,
        document_id=document_id,
        top_k=top_k
    )

    relevant = [
        chunk
        for chunk in matches
        if chunk["similarity"] >= min_similarity
    ]

    return relevant 

def format_chunks_as_context(chunks: list[dict]) -> str:

    if not chunks:
        return "No relevant content was found in the document."

    formatted_sections = []

    for chunk in chunks:
        section = (
            f"[Page {chunk['page_number']}]\n"
            f"{chunk['content']}"
        )

        formatted_sections.append(section)

    return "\n\n---\n\n".join(formatted_sections)