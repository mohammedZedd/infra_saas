from __future__ import annotations

import asyncio

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_full_user_flow_crud(auth_client: AsyncClient):
    create = await auth_client.post(
        "/api/v1/projects/",
        json={"name": "Flow", "description": "integration", "region": "eu-west-3"},
    )
    assert create.status_code == 201
    project_id = create.json()["id"]

    fetch = await auth_client.get(f"/api/v1/projects/{project_id}")
    assert fetch.status_code == 200

    update = await auth_client.patch(f"/api/v1/projects/{project_id}", json={"status": "active"})
    assert update.status_code == 200
    assert update.json()["status"] == "active"

    delete = await auth_client.delete(f"/api/v1/projects/{project_id}")
    assert delete.status_code == 204


@pytest.mark.asyncio
async def test_user_cannot_access_other_users_resources(auth_client: AsyncClient, second_auth_client: AsyncClient):
    create = await auth_client.post(
        "/api/v1/projects/",
        json={"name": "Owned", "description": "secret", "region": "eu-west-3"},
    )
    project_id = create.json()["id"]

    forbidden = await second_auth_client.patch(f"/api/v1/projects/{project_id}", json={"name": "Hack"})
    assert forbidden.status_code == 404


@pytest.mark.asyncio
async def test_filter_sort_and_pagination_combined(auth_client: AsyncClient):
    payloads = [
        {"name": "Alpha", "description": "d", "region": "eu-west-3"},
        {"name": "Gamma", "description": "d", "region": "eu-west-3"},
        {"name": "Beta", "description": "d", "region": "us-east-1"},
    ]
    for payload in payloads:
        res = await auth_client.post("/api/v1/projects/", json=payload)
        assert res.status_code == 201

    res = await auth_client.get(
        "/api/v1/projects/?region=eu-west-3&page=1&page_size=1&sort_by=name&sort_order=asc"
    )
    assert res.status_code == 200
    body = res.json()
    assert body["total"] == 2
    assert len(body["items"]) == 1
    assert body["items"][0]["name"] == "Alpha"
