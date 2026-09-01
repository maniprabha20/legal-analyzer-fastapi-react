async def test_register(client):
    response = await client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "password": "Test@1234"
        }
    )

    assert response.status_code == 201
    data = response.json()

    assert data["email"] == "test@example.com"
    assert "id" in data


async def test_login(client):
    await client.post(
        "/auth/register",
        json={
            "email": "login@example.com",
            "password": "Test@1234"
        }
    )

    response = await client.post(
        "/auth/login",
        data={
            "username": "login@example.com",
            "password": "Test@1234"
        }
    )

    assert response.status_code == 200
    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"


async def test_invalid_login(client):
    response = await client.post(
        "/auth/login",
        data={
            "username": "wrong@example.com",
            "password": "WrongPassword"
        }
    )

    assert response.status_code == 401


async def test_get_current_user(client):
    await client.post(
        "/auth/register",
        json={
            "email": "me@example.com",
            "password": "Test@1234"
        }
    )

    login_response = await client.post(
        "/auth/login",
        data={
            "username": "me@example.com",
            "password": "Test@1234"
        }
    )

    token = login_response.json()["access_token"]

    response = await client.get(
        "/auth/me",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 200
    assert response.json()["email"] == "me@example.com"


async def test_me_without_token(client):
    response = await client.get("/auth/me")

    assert response.status_code == 401