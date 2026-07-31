from fastapi import FastAPI

from auth import router as auth_router
from documents import router as documents_router


app = FastAPI(
    title="AI Legal Document Analyzer API"
)

app.include_router(auth_router)
app.include_router(documents_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}