async def _register_and_login(client, email="doc_test@example.com", password="testpass123"):
    await client.post(
        "/auth/register",
        json={"email": email, "password": password}
    )

    login_response = await client.post(
        "/auth/login",
        data={
            "username": email,
            "password": password
        },
    )

    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


async def test_upload_requires_authentication(client, sample_pdf_bytes):
    response = await client.post(
        "/documents/upload",
        files={
            "file": (
                "test.pdf",
                sample_pdf_bytes,
                "application/pdf"
            )
        },
    )

    assert response.status_code == 401


async def test_upload_rejects_non_pdf(client, sample_pdf_bytes):
    headers = await _register_and_login(client)

    response = await client.post(
        "/documents/upload",
        files={
            "file": (
                "test.txt",
                b"not a pdf",
                "text/plain"
            )
        },
        headers=headers,
    )

    assert response.status_code == 400


async def test_upload_succeeds_with_valid_pdf(client, sample_pdf_bytes):
    headers = await _register_and_login(client)

    response = await client.post(
        "/documents/upload",
        files={
            "file": (
                "test.pdf",
                sample_pdf_bytes,
                "application/pdf"
            )
        },
        headers=headers,
    )

    assert response.status_code == 201

    data = response.json()

    assert data["filename"] == "test.pdf"
    assert data["status"] == "uploaded"


async def test_user_can_only_see_own_documents(client, sample_pdf_bytes):
    headers_a = await _register_and_login(
        client,
        email="usera@example.com"
    )

    headers_b = await _register_and_login(
        client,
        email="userb@example.com"
    )

    upload_response = await client.post(
        "/documents/upload",
        files={
            "file": (
                "test.pdf",
                sample_pdf_bytes,
                "application/pdf"
            )
        },
        headers=headers_a,
    )

    document_id = upload_response.json()["id"]

    response_a = await client.get(
        f"/documents/{document_id}",
        headers=headers_a
    )

    assert response_a.status_code == 200

    response_b = await client.get(
        f"/documents/{document_id}",
        headers=headers_b
    )

    assert response_b.status_code == 404


async def test_user_cannot_delete_others_document(client, sample_pdf_bytes):
    headers_a = await _register_and_login(
        client,
        email="usera2@example.com"
    )

    headers_b = await _register_and_login(
        client,
        email="userb2@example.com"
    )

    upload_response = await client.post(
        "/documents/upload",
        files={
            "file": (
                "test.pdf",
                sample_pdf_bytes,
                "application/pdf"
            )
        },
        headers=headers_a,
    )

    document_id = upload_response.json()["id"]

    delete_response = await client.delete(
        f"/documents/{document_id}",
        headers=headers_b
    )

    assert delete_response.status_code == 404

    get_response = await client.get(
        f"/documents/{document_id}",
        headers=headers_a
    )

    assert get_response.status_code == 200