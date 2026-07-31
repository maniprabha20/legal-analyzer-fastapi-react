from sentence_transformers import SentenceTransformer

# Load model once
_model = SentenceTransformer("all-MiniLM-L6-v2")

EMBEDDING_DIMENSIONS = 384


def embed_text(text: str) -> list[float]:
    """
    Convert single text into embedding vector
    """
    vector = _model.encode(text, convert_to_numpy=True)
    return vector.tolist()


def embed_texts_batch(texts: list[str]) -> list[list[float]]:
    """
    Convert multiple texts into embedding vectors
    """
    if not texts:
        return []

    vectors = _model.encode(
        texts,
        convert_to_numpy=True,
        show_progress_bar=False
    )

    return [v.tolist() for v in vectors]


def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """
    Calculate similarity between two vectors
    """

    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))

    magnitude_a = sum(a * a for a in vec_a) ** 0.5
    magnitude_b = sum(b * b for b in vec_b) ** 0.5

    if magnitude_a == 0 or magnitude_b == 0:
        return 0.0

    return dot_product / (magnitude_a * magnitude_b)