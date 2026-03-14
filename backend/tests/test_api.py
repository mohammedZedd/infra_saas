from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_root(client: AsyncClient):
    res = await client.get("/")
    assert res.status_code == 200
    body = res.json()
    assert "name" in body
    assert "docs" in body


@pytest.mark.asyncio
async def test_health(client: AsyncClient):
    res = await client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] in {"ok", "degraded"}


@pytest.mark.asyncio
async def test_health_detailed(client: AsyncClient):
    res = await client.get("/health/detailed")
    assert res.status_code == 200
    body = res.json()
    assert "checks" in body
    assert "database" in body["checks"]


@pytest.mark.asyncio
async def test_ready(client: AsyncClient):
    res = await client.get("/ready")
    assert res.status_code == 200
    assert "ready" in res.json()


@pytest.mark.asyncio
async def test_auth_compat_prefix(client: AsyncClient, user_payload: dict[str, str]):
    res = await client.post("/api/auth/register", json=user_payload)
    assert res.status_code == 201
