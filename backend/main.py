from fastapi import FastAPI

from auth import router as auth_router
from documents import router as documents_router 
from reports import router as reports_router 
from fastapi.middleware.cors import CORSMiddleware
from user_profile import router as profile_router


app = FastAPI(
    title="AI Legal Document Analyzer API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(reports_router)
app.include_router(profile_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}