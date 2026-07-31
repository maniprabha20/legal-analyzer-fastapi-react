from embeddings import embed_text, cosine_similarity

sentence_a = "The tenant may terminate this lease with 30 days written notice."

sentence_b = "Either party can end the agreement by giving one month's warning in writing."

sentence_c = "The chef recommended pairing the dessert with a light dessert wine."


vec_a = embed_text(sentence_a)
vec_b = embed_text(sentence_b)
vec_c = embed_text(sentence_c)


similarity_ab = cosine_similarity(vec_a, vec_b)
similarity_ac = cosine_similarity(vec_a, vec_c)


print(f"Similarity (similar meaning): {similarity_ab:.4f}")
print(f"Similarity (unrelated): {similarity_ac:.4f}")

print()
print(f"Embedding vector length: {len(vec_a)}")
print(f"First 5 numbers: {vec_a[:5]}")
from pdf_extraction import extract_text_from_pdf
from chunking import chunk_pages, count_tokens
from embeddings import embed_texts_batch


pages = extract_text_from_pdf("uploads/8095ef6d-0f12-40aa-9c33-3ab6efe26b8d.pdf")

chunks = chunk_pages(pages)

chunk_texts = [c.content for c in chunks]

vectors = embed_texts_batch(chunk_texts)


print(f"Embedded {len(vectors)} chunks.")
print(f"Each vector has {len(vectors[0])} dimensions.")