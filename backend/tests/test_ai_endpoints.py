from schemas import DocumentAnalysis


async def test_ask_requires_ready_status(client, db_session):
    from models import Document, User
    from sqlalchemy import select

    email = "notready@example.com"

    await client.post(
        "/auth/register",
        json={
            "email": email,
            "password": "testpass123"
        }
    )

    login_response = await client.post(
        "/auth/login",
        data={
            "username": email,
            "password": "testpass123"
        }
    )

    headers = {
        "Authorization": f"Bearer {login_response.json()['access_token']}"
    }

    result = await db_session.execute(
        select(User).where(User.email == email)
    )

    user = result.scalar_one()

    document = Document(
        user_id=user.id,
        filename="processing.pdf",
        file_path="fake.pdf",
        status="processing",
    )

    db_session.add(document)

    await db_session.commit()
    await db_session.refresh(document)

    response = await client.get(
        f"/documents/{document.id}/ask",
        params={"q": "test question"},
        headers=headers,
    )

    assert response.status_code == 400


async def test_ask_returns_grounded_answer(
    client,
    ready_document,
    monkeypatch
):
    headers = ready_document["headers"]
    document = ready_document["document"]

    fake_chunks = [
        {
            "content": "The monthly rent is INR 185,000.",
            "page_number": 1,
            "chunk_index": 0,
            "similarity": 0.82,
        }
    ]

    def fake_retrieve(question, document_id, **kwargs):
        return fake_chunks

    def fake_ask_llm(question, context, chat_history=None):
        return {
            "answer": "The monthly rent is INR 185,000. [Page 1]",
            "disclaimer": "Test disclaimer.",
        }

    monkeypatch.setattr(
        "documents.retrieve_relevant_chunks",
        fake_retrieve
    )

    monkeypatch.setattr(
        "documents.ask_llm",
        fake_ask_llm
    )

    response = await client.get(
        f"/documents/{document.id}/ask",
        params={"q": "What is the monthly rent?"},
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["answer"] == (
        "The monthly rent is INR 185,000. [Page 1]"
    )

    assert data["sources_used"] == 1
    assert data["pages_referenced"] == [1]


async def test_ask_with_no_chunks_skips_llm_call(
    client,
    ready_document,
    monkeypatch
):
    headers = ready_document["headers"]
    document = ready_document["document"]

    llm_was_called = False

    def fake_retrieve(question, document_id, **kwargs):
        return []

    def fake_ask_llm(question, context, chat_history=None):
        nonlocal llm_was_called

        llm_was_called = True

        return {
            "answer": "should not happen",
            "disclaimer": "x",
        }

    monkeypatch.setattr(
        "documents.retrieve_relevant_chunks",
        fake_retrieve
    )

    monkeypatch.setattr(
        "documents.ask_llm",
        fake_ask_llm
    )

    response = await client.get(
        f"/documents/{document.id}/ask",
        params={"q": "unrelated question"},
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["sources_used"] == 0
    assert data["pages_referenced"] == []

    assert llm_was_called is False


async def test_analyze_returns_structured_result(
    client,
    ready_document,
    monkeypatch
):
    headers = ready_document["headers"]
    document = ready_document["document"]

    fake_chunks = [
        {
            "content": "Sample text",
            "page_number": 1,
            "chunk_index": 0,
        }
    ]

    fake_analysis = DocumentAnalysis(
        summary="This is a test summary.",
        risks=[],
        key_clauses=[],
        key_dates=[],
        payment_terms=[],
        obligations=[],
        recommendations=[
            "Review Section 8 carefully."
        ],
        disclaimer="Test disclaimer.",
    )

    monkeypatch.setattr(
        "documents.get_all_chunks_for_document",
        lambda document_id: fake_chunks
    )

    monkeypatch.setattr(
        "documents.analyze_document_text",
        lambda context: fake_analysis
    )

    monkeypatch.setattr(
        "documents.get_document_page_count",
        lambda document_id: 5
    )

    response = await client.post(
        f"/documents/{document.id}/analyze",
        headers=headers,
    )

    assert response.status_code == 201

    data = response.json()

    assert data["result"]["summary"] == (
        "This is a test summary."
    )

    assert data["document_id"] == document.id


async def test_analyze_stores_report_retrievable_via_reports_endpoint(
    client,
    ready_document,
    monkeypatch
):
    headers = ready_document["headers"]
    document = ready_document["document"]

    fake_analysis = DocumentAnalysis(
        summary="Second test summary.",
        risks=[],
        key_clauses=[],
        key_dates=[],
        payment_terms=[],
        obligations=[],
        recommendations=[],
        disclaimer="Test disclaimer.",
    )

    monkeypatch.setattr(
        "documents.get_all_chunks_for_document",
        lambda document_id: [
            {
                "content": "x",
                "page_number": 1,
                "chunk_index": 0,
            }
        ]
    )

    monkeypatch.setattr(
        "documents.analyze_document_text",
        lambda context: fake_analysis
    )

    monkeypatch.setattr(
        "documents.get_document_page_count",
        lambda document_id: 5
    )

    await client.post(
        f"/documents/{document.id}/analyze",
        headers=headers,
    )

    reports_response = await client.get(
        f"/documents/{document.id}/reports",
        headers=headers,
    )

    assert reports_response.status_code == 200

    reports = reports_response.json()

    assert len(reports) == 1

    assert reports[0]["result"]["summary"] == (
        "Second test summary."
    )