from pdf_extraction import extract_text_from_pdf
from chunking import chunk_pages
from vector_store import add_chunks_to_store, search_similar_chunks

# Replace with your uploaded PDF path
FILE_PATH = "uploads/contract.pdf"

# Fake document id for testing
FAKE_DOCUMENT_ID = 999

pages = extract_text_from_pdf(FILE_PATH)
chunks = chunk_pages(pages)

stored_count = add_chunks_to_store(FAKE_DOCUMENT_ID, chunks)
print(f"Stored {stored_count} chunks in ChromaDB.")

query = "What is this agreement about?"

results = search_similar_chunks(
    query,
    document_id=FAKE_DOCUMENT_ID,
    top_k=3
)

print(f"\nTop {len(results)} matches:\n")

for i, r in enumerate(results, start=1):
    print(f"Match {i}")
    print(f"Page: {r['page_number']}")
    print(f"Similarity: {r['similarity']:.4f}")
    print(r["content"][:200])
    print("-" * 50)