import sys
import types
from pathlib import Path
from io import BytesIO

# Fake embeddings for tests
_fake_embeddings = types.ModuleType("embeddings")

_fake_embeddings.embed_text = lambda text: [0.0] * 384
_fake_embeddings.embed_texts_batch = lambda texts: [[0.0] * 384 for _ in texts]
_fake_embeddings.cosine_similarity = lambda a, b: 0.0

sys.modules["embeddings"] = _fake_embeddings

# Project path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest
import pytest_asyncio

from httpx import AsyncClient, ASGITransport
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from database import Base, get_db
from main import app
from models import Document, User

from reportlab.pdfgen import canvas


TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture
def sample_pdf_bytes():
    buffer = BytesIO()

    c = canvas.Canvas(buffer)
    c.drawString(100, 750, "Test Agreement")
    c.drawString(
        100,
        700,
        "This is a minimal PDF used only for automated testing."
    )
    c.save()

    buffer.seek(0)
    return buffer.read()


@pytest_asyncio.fixture
async def db_session():
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False}
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    TestSessionLocal = async_sessionmaker(
        engine,
        expire_on_commit=False
    )

    async with TestSessionLocal() as session:
        yield session

    await engine.dispose()


@pytest_asyncio.fixture
async def client(db_session):
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)

    async with AsyncClient(
        transport=transport,
        base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def ready_document(db_session, client):
    email = "ai_test@example.com"
    password = "testpass123"

    await client.post(
        "/auth/register",
        json={
            "email": email,
            "password": password
        }
    )

    login_response = await client.post(
        "/auth/login",
        data={
            "username": email,
            "password": password
        }
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    headers = {
        "Authorization": f"Bearer {token}"
    }

    result = await db_session.execute(
        select(User).where(User.email == email)
    )

    user = result.scalar_one()

    document = Document(
        user_id=user.id,
        filename="ready-test.pdf",
        file_path="fake/path/ready-test.pdf",
        status="ready",
    )

    db_session.add(document)

    await db_session.commit()
    await db_session.refresh(document)

    return {
        "headers": headers,
        "document": document,
    }