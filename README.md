# LEXORA — AI Legal Document Analyzer

LEXORA is a full-stack, AI-powered web application for reviewing legal documents. Users upload a contract as a PDF and receive a structured AI analysis — summary, risks, key clauses, key dates, payment terms, obligations, and recommendations — with every finding tied to a page number in the source document. A chat interface lets users ask follow-up questions about the document, answered through retrieval-augmented generation (RAG) and cited back to the pages they came from.

**Live demo:** https://legal-analyzer-fastapi-react-1.onrender.com
**API docs:** https://legal-analyzer-fastapi-react.onrender.com/docs
> AI-generated analysis is provided for informational purposes only and is not legal advice.

---

## Features

**Authentication & accounts**
- User registration and login with JWT-based authentication
- Protected routes on the frontend; every API route that touches user data requires a valid token
- Profile page with change-password (requires the current password)

**Document management**
- Upload PDF documents (PDF type and 20 MB size limit enforced)
- Document list with status badges, summary counts, search by filename, and status filter
- Automatic status refresh while a document is being processed
- Download the original PDF and delete documents (with a confirmation dialog)
- Per-user ownership checks on every document, report, and chat endpoint

**AI analysis**
- Structured analysis produced in a single LLM call: summary, risks (high / medium / low), key clauses, key dates, payment terms, obligations, and recommendations
- Page citations on every finding, validated against the document's real page range
- Clicking a citation jumps the built-in PDF viewer to that page
- Analysis history: every run is stored and retrievable
- Downloadable PDF analysis report

**Chat with your document (RAG)**
- Semantic search over the document's embedded chunks
- Answers grounded only in retrieved content; the model is instructed to say when information is not in the document
- Page references returned with each answer
- Conversation history is stored per document, and recent turns inform follow-up questions
- Markdown rendering of AI responses

**Safety & trust**
- AI disclaimer returned with analysis and chat responses
- Per-user daily rate limiting on the AI endpoints (`/ask` and `/analyze`)

**Frontend**
- Public landing page with sticky, responsive navigation (landing-page testimonials are clearly labeled sample content)
- Login, Register, Forgot Password, Dashboard, Document Detail (PDF viewer with Analysis and Chat tabs), and Profile pages
- Toast notifications, loading states, and a shared design system

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, React-Bootstrap, Axios, react-pdf, react-markdown |
| Backend | FastAPI, SQLAlchemy (async), Pydantic, Uvicorn |
| Database | PostgreSQL on Supabase (Transaction Pooler, `asyncpg` driver) |
| File storage | Supabase Storage |
| Vector database | ChromaDB (persistent, embedded mode) |
| Embeddings | FastEmbed (ONNX Runtime) with `sentence-transformers/all-MiniLM-L6-v2` (384 dimensions) |
| LLM | Groq API (`openai/gpt-oss-120b`) via LangChain |
| PDF processing | PyMuPDF (text extraction), ReportLab (report generation) |
| Chunking | `tiktoken` token-based chunking with overlap |
| Auth | JWT (`python-jose`), `passlib` + bcrypt password hashing |
| Background work | FastAPI `BackgroundTasks` |
| Testing | pytest, pytest-asyncio, httpx |
| Hosting | Render (backend), Supabase (database and storage) |

---

## Architecture

```
┌────────────┐   HTTPS / JSON + JWT   ┌──────────────┐
│   React    │ ─────────────────────► │   FastAPI     │
│   (Vite)   │ ◄───────────────────── │               │
└────────────┘                        └──────┬───────┘
                                              │
              ┌───────────────────┬───────────┼────────────────────┐
              │                   │           │                    │
      ┌───────▼──────┐   ┌────────▼─────┐ ┌───▼──────────┐ ┌───────▼───────┐
      │  PostgreSQL   │   │   ChromaDB    │ │ Supabase      │ │   Groq LLM    │
      │  (Supabase)   │   │ (embeddings)  │ │ Storage (PDFs)│ │ (LangChain)   │
      │ users, docs,  │   └──────────────┘ └──────────────┘ └───────────────┘
      │ chunks, chat, │
      │ reports       │
      └──────────────┘
```

### Document processing pipeline

When a PDF is uploaded, the file is stored in Supabase Storage, a database row is created with status `uploaded`, and a background task runs:

1. **Extract** text page by page with PyMuPDF (a document with almost no extractable text is marked `failed`)
2. **Chunk** the text into overlapping, token-sized pieces, each tagged with its page number
3. **Persist** the chunks in PostgreSQL
4. **Embed** each chunk with FastEmbed and store the vectors in ChromaDB, tagged with the document ID
5. Mark the document `ready`

### Answering a question (RAG)

1. The question is embedded and ChromaDB returns the most similar chunks for that document
2. Chunks below a similarity threshold are discarded; if none remain, the API answers that the information was not found and skips the LLM call
3. The remaining chunks, labeled with their page numbers, and recent chat history are sent to the LLM under a strict grounding prompt
4. The answer, a disclaimer, and the referenced pages are returned, and the exchange is saved

### Producing an analysis

All of a document's chunks are retrieved in order and sent to the LLM in JSON mode. The response is validated against a Pydantic schema, page numbers are clamped to the document's real page range, and the result is stored as a new report.

---

## Project Structure

```
backend/
├── main.py              # App entry point, CORS, router registration
├── auth.py              # Register, login, JWT verification
├── user_profile.py      # Profile and change-password endpoints
├── documents.py         # Upload, list, download, delete, search, ask, chat, analyze
├── reports.py           # Report retrieval and PDF download
├── models.py            # SQLAlchemy models
├── schemas.py           # Pydantic request/response schemas
├── database.py          # Async engine and session setup
├── security.py          # Password hashing and token creation
├── storage.py           # Supabase Storage upload/download/delete
├── ingestion.py         # Background pipeline: extract → chunk → embed → store
├── pdf_extraction.py    # PyMuPDF text extraction
├── chunking.py          # Token-based chunking with overlap
├── embeddings.py        # FastEmbed embedding generation
├── vector_store.py      # ChromaDB storage and retrieval
├── retrieval.py         # Similarity-threshold retrieval and context formatting
├── llm.py               # Groq/LangChain prompts, chat and structured analysis
├── citations.py         # Page-number validation for AI output
├── rate_limit.py        # Per-user daily usage limits
├── report_pdf.py        # PDF report generation (ReportLab)
├── create_tables.py     # Creates database tables
└── tests/               # pytest suite

frontend/src/
├── api/                 # Axios client and API wrappers
├── pages/               # LandingPage, Login, Register, ForgotPassword,
│                        # Dashboard, DocumentDetail, Profile
├── components/          # ProtectedRoute, UploadModal, AnalysisPanel, ChatPanel,
│                        # ConfirmModal, ToastProvider, Brand, AppFooter
└── styles/theme.css     # Shared design system
```

---

## API Overview

All routes except `/health`, `/auth/register`, and `/auth/login` require a valid JWT.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create an account |
| POST | `/auth/login` | Log in (OAuth2 form data), returns a JWT |
| GET | `/auth/me` | Current user |
| GET | `/profile` | Profile details |
| POST | `/profile/change-password` | Change password |
| POST | `/documents/upload` | Upload a PDF |
| GET | `/documents` | List your documents (`limit`, `offset`) |
| GET | `/documents/{id}` | Document details |
| GET | `/documents/{id}/status` | Processing status |
| GET | `/documents/{id}/download` | Download the original PDF |
| DELETE | `/documents/{id}` | Delete a document |
| GET | `/documents/{id}/search?q=` | Semantic search within a document |
| GET | `/documents/{id}/ask?q=` | Ask a question (RAG) |
| GET | `/documents/{id}/chat` | Chat history |
| POST | `/documents/{id}/analyze` | Run AI analysis |
| GET | `/documents/{id}/reports` | Analysis history for a document |
| GET | `/reports/{id}` | A single analysis report |
| GET | `/reports/{id}/download` | Download the report as a PDF |
| GET | `/health` | Health check |

Interactive documentation is available at `/docs` when the backend is running.

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- A Supabase project (PostgreSQL database and a Storage bucket)
- A Groq API key

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```
DATABASE_URL=postgresql+asyncpg://<user>:<password>@<host>:6543/postgres
SECRET_KEY=<long random string>
GROQ_API_KEY=<your Groq key>
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_KEY=<your Supabase service role key>
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

`DATABASE_URL` may use either the `postgresql://` or `postgresql+asyncpg://` prefix; the app converts it to the async driver. For hosted deployments use the Supabase **Transaction Pooler** connection (port 6543).

Create the tables and start the server:

```bash
python create_tables.py
uvicorn main:app --reload
```

The embedding model is downloaded automatically the first time the backend starts.

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

---

## Testing

```bash
cd backend
pytest -v
```

The test suite runs against an in-memory SQLite database with the embedding model stubbed out and LLM calls mocked, so tests do not use external services or API quota.

---

## Deployment Notes

- **Backend:** deployed on Render as a Python web service, with environment variables set in the Render dashboard. Render's free tier spins down when idle, so the first request after a period of inactivity can take 30–60 seconds.
- **Database:** Supabase PostgreSQL accessed through the Transaction Pooler with the `asyncpg` driver.
- **File storage:** uploaded PDFs are stored in Supabase Storage rather than on the server's disk.
- **CORS:** allowed origins are configured in `main.py`; add your frontend's URL there when deploying.

---

## Engineering Notes

- **FastEmbed instead of sentence-transformers.** The original PyTorch-based embedding setup exceeded Render's 512 MB free-tier memory limit. Switching to FastEmbed (ONNX Runtime) with the same underlying model resolved this while keeping 384-dimensional vectors.
- **Calibrated similarity threshold.** Retrieval was initially returning no results because the similarity cutoff was too strict for this embedding model's score range; the threshold was tuned against real documents.
- **Grounded answers.** If retrieval finds nothing relevant, the API answers "not found" without calling the LLM, rather than relying on the prompt alone to prevent guessing.
- **Structured output.** Analysis uses the LLM's JSON mode, validated against Pydantic models, with page numbers clamped to the document's actual page range.
- **Ownership checks return 404.** Requests for another user's resource return "not found" rather than "forbidden", so the API does not reveal which IDs exist.

---

## Known Limitations

- **Vector index storage.** ChromaDB persists to a local folder. On hosting with an ephemeral filesystem (including Render's free tier), that index does not survive restarts or redeploys. Chunk text remains in PostgreSQL, but there is no re-indexing feature yet.
- **Logout is client-side.** The token is removed from the browser; there is no server-side token revocation, so a token stays valid until it expires.
- **Upload validation** checks file extension and size, not the file's contents.
- **Chat citations** are shown for answers received in the current session; they are not stored with chat history, so they do not reappear after a page refresh.
- **Dashboard** loads one page of documents and filters them in the browser; there are no pagination controls yet.
- **Schema management** uses `create_all` rather than migrations, so schema changes need manual handling.
- **Landing-page testimonials** are placeholder sample content and are labeled as such.
- **AI output can be wrong.** Analysis and answers should be verified against the source document.

## Future Work

- Persistent or rebuildable vector storage for hosted deployments
- Activity log and server-side dashboard search, sort, and pagination
- Database migrations (Alembic) and structured logging
- Streaming chat responses
- Comparing two versions of a contract

---

## Disclaimer

LEXORA uses AI to generate summaries, risk assessments, and answers about uploaded documents. This content is provided for informational purposes only and does not constitute legal advice. Consult a qualified legal professional before making decisions based on it.

## License

No license has been specified for this project.