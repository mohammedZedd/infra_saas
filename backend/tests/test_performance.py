from __future__ import annotations

import asyncio
import time

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_response_time(client: AsyncClient):
    started = time.perf_counter()
    res = await client.get("/health")
    elapsed = time.perf_counter() - started
    assert res.status_code == 200
    assert elapsed < 1.0


@pytest.mark.asyncio
async def test_projects_pagination_performance(auth_client: AsyncClient):
    for i in range(30):
        res = await auth_client.post(
            "/api/v1/projects/",
            json={"name": f"Perf-{i}", "description": "d", "region": "eu-west-3"},
        )
        assert res.status_code == 201

    started = time.perf_counter()
    page = await auth_client.get("/api/v1/projects/?page=2&page_size=10")
    elapsed = time.perf_counter() - started

    assert page.status_code == 200
    assert len(page.json()["items"]) == 10
    assert elapsed < 1.0


@pytest.mark.asyncio
async def test_concurrent_project_reads(auth_client: AsyncClient):
    created = await auth_client.post(
        "/api/v1/projects/",
        json={"name": "Concurrent", "description": "d", "region": "eu-west-3"},
    )
    assert created.status_code == 201
    project_id = created.json()["id"]

    async def read_once():
        res = await auth_client.get(f"/api/v1/projects/{project_id}")
        return res.status_code

    statuses = await asyncio.gather(*[read_once() for _ in range(8)])
    assert all(code == 200 for code in statuses)
