from fastapi import FastAPI, HTTPException
from datetime import datetime
from schemas import DocumentCreate, DocumentResponse

app = FastAPI(title="AI Legal Document Analyzer API")

# Temporary database (Day 2 only)
fake_db = []
next_id = 1


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/documents", response_model=DocumentResponse)
def create_document(document: DocumentCreate):
    global next_id

    new_doc = {
        "id": next_id,
        "filename": document.filename,
        "status": "uploaded",
        "upload_date": datetime.now(),
    }

    fake_db.append(new_doc)
    next_id += 1

    return new_doc


@app.get("/documents", response_model=list[DocumentResponse])
def list_documents():
    return fake_db


@app.get("/documents/{document_id}", response_model=DocumentResponse)
def get_document(document_id: int):
    for doc in fake_db:
        if doc["id"] == document_id:
            return doc

    raise HTTPException(status_code=404, detail="Document not found")