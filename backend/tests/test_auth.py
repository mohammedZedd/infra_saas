from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest
from httpx import AsyncClient

from core.security import create_access_token, create_refresh_token


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient, user_payload: dict[str, str]):
    res = await client.post("/api/v1/auth/register", json=user_payload)
    assert res.status_code == 201
    body = res.json()
    assert body["user"]["email"] == user_payload["email"]
    assert "hashed_password" not in body
    assert body["tokenType"] == "bearer"


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient, user_payload: dict[str, str]):
    await client.post("/api/v1/auth/register", json=user_payload)
    res = await client.post("/api/v1/auth/register", json=user_payload)
    assert res.status_code == 400


@pytest.mark.asyncio
async def test_register_invalid_email(client: AsyncClient):
    res = await client.post(
        "/api/v1/auth/register",
        json={"email": "not-an-email", "password": "Password123!", "full_name": "Test"},
    )
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_register_weak_password(client: AsyncClient):
    res = await client.post(
        "/api/v1/auth/register",
        json={"email": "weak@example.com", "password": "123", "full_name": "Weak"},
    )
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, user_payload: dict[str, str]):
    await client.post("/api/v1/auth/register", json=user_payload)
    res = await client.post(
        "/api/v1/auth/login",
        json={"email": user_payload["email"], "password": user_payload["password"]},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["accessToken"]
    assert body["refreshToken"]


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, user_payload: dict[str, str]):
    await client.post("/api/v1/auth/register", json=user_payload)
    res = await client.post(
        "/api/v1/auth/login",
        json={"email": user_payload["email"], "password": "WrongPassword123"},
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_login_unknown_email(client: AsyncClient):
    res = await client.post("/api/v1/auth/login", json={"email": "nope@example.com", "password": "Password123!"})
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_me_requires_token(client: AsyncClient):
    res = await client.get("/api/v1/auth/me")
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_me_success(auth_client: AsyncClient):
    res = await auth_client.get("/api/v1/auth/me")
    assert res.status_code == 200
    assert "user" in res.json()


@pytest.mark.asyncio
async def test_update_me(auth_client: AsyncClient):
    res = await auth_client.put("/api/v1/auth/me", json={"full_name": "Updated Name"})
    assert res.status_code == 200
    assert res.json()["name"] == "Updated Name"


@pytest.mark.asyncio
async def test_refresh_success(client: AsyncClient, auth_tokens: dict[str, str]):
    res = await client.post("/api/v1/auth/refresh", json={"refreshToken": auth_tokens["refresh"]})
    assert res.status_code == 200
    assert "accessToken" in res.json()


@pytest.mark.asyncio
async def test_refresh_invalid_token(client: AsyncClient):
    res = await client.post("/api/v1/auth/refresh", json={"refreshToken": "invalid.token.value"})
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_refresh_with_access_token_rejected(client: AsyncClient):
    token = create_access_token(subject="00000000-0000-0000-0000-000000000000")
    res = await client.post("/api/v1/auth/refresh", json={"refreshToken": token})
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_expired_access_token_rejected(client: AsyncClient):
    expired = create_access_token(subject="00000000-0000-0000-0000-000000000000", expires_delta=timedelta(minutes=-1))
    res = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {expired}"})
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_expired_refresh_token_rejected(client: AsyncClient):
    expired_refresh = create_refresh_token(
        subject="00000000-0000-0000-0000-000000000000",
        expires_delta=timedelta(minutes=-1),
    )
    res = await client.post("/api/v1/auth/refresh", json={"refreshToken": expired_refresh})
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_logout(auth_client: AsyncClient):
    res = await auth_client.post("/api/v1/auth/logout")
    assert res.status_code == 200
    assert res.json()["message"] == "Logged out"
