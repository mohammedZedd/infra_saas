from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_projects_list_empty(auth_client: AsyncClient):
    res = await auth_client.get("/api/v1/projects/?page=1&page_size=10")
    assert res.status_code == 200
    body = res.json()
    assert body["items"] == []
    assert body["total"] == 0


@pytest.mark.asyncio
async def test_project_create_and_get(auth_client: AsyncClient):
    create = await auth_client.post(
        "/api/v1/projects/",
        json={"name": "Infra", "description": "desc", "region": "eu-west-3", "environment": "dev"},
    )
    assert create.status_code == 201
    project_id = create.json()["id"]

    get_one = await auth_client.get(f"/api/v1/projects/{project_id}")
    assert get_one.status_code == 200
    assert get_one.json()["name"] == "Infra"


@pytest.mark.asyncio
async def test_project_create_requires_auth(client: AsyncClient):
    res = await client.post("/api/v1/projects/", json={"name": "X", "region": "eu-west-3"})
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_project_create_invalid_payload(auth_client: AsyncClient):
    res = await auth_client.post("/api/v1/projects/", json={"description": "missing required fields"})
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_project_pagination(auth_client: AsyncClient):
    for i in range(3):
        res = await auth_client.post(
            "/api/v1/projects/",
            json={"name": f"Proj-{i}", "description": "d", "region": "eu-west-3"},
        )
        assert res.status_code == 201

    page1 = await auth_client.get("/api/v1/projects/?page=1&page_size=2")
    assert page1.status_code == 200
    body = page1.json()
    assert len(body["items"]) == 2
    assert body["total"] == 3
    assert body["has_next"] is True


@pytest.mark.asyncio
async def test_project_filtering_and_sorting(auth_client: AsyncClient):
    await auth_client.post(
        "/api/v1/projects/",
        json={"name": "A", "description": "d", "region": "eu-west-3"},
    )
    await auth_client.post(
        "/api/v1/projects/",
        json={"name": "B", "description": "d", "region": "us-east-1"},
    )

    filtered = await auth_client.get("/api/v1/projects/?region=eu-west-3&sort_by=name&sort_order=asc")
    assert filtered.status_code == 200
    items = filtered.json()["items"]
    assert len(items) == 1
    assert items[0]["region"] == "eu-west-3"


@pytest.mark.asyncio
async def test_project_update_partial(auth_client: AsyncClient):
    create = await auth_client.post(
        "/api/v1/projects/",
        json={"name": "Before", "description": "desc", "region": "eu-west-3"},
    )
    project_id = create.json()["id"]

    patch = await auth_client.patch(f"/api/v1/projects/{project_id}", json={"name": "After"})
    assert patch.status_code == 200
    assert patch.json()["name"] == "After"
    assert patch.json()["description"] == "desc"


@pytest.mark.asyncio
async def test_project_delete(auth_client: AsyncClient):
    create = await auth_client.post(
        "/api/v1/projects/",
        json={"name": "DeleteMe", "description": "desc", "region": "eu-west-3"},
    )
    project_id = create.json()["id"]

    delete = await auth_client.delete(f"/api/v1/projects/{project_id}")
    assert delete.status_code == 204

    get_one = await auth_client.get(f"/api/v1/projects/{project_id}")
    assert get_one.status_code == 404


@pytest.mark.asyncio
async def test_project_ownership_isolation(auth_client: AsyncClient, second_auth_client: AsyncClient):
    created = await auth_client.post(
        "/api/v1/projects/",
        json={"name": "Private", "description": "d", "region": "eu-west-3"},
    )
    project_id = created.json()["id"]

    denied = await second_auth_client.get(f"/api/v1/projects/{project_id}")
    assert denied.status_code == 404


@pytest.mark.asyncio
async def test_files_and_runs_endpoints(auth_client: AsyncClient):
    created = await auth_client.post(
        "/api/v1/projects/",
        json={"name": "FilesRuns", "description": "d", "region": "eu-west-3"},
    )
    project_id = created.json()["id"]

    save_file = await auth_client.post(
        f"/api/v1/projects/{project_id}/files/save",
        json={"path": "main.tf", "content": 'resource "null_resource" "x" {}'},
    )
    assert save_file.status_code == 200

    list_files = await auth_client.get(f"/api/v1/projects/{project_id}/files")
    assert list_files.status_code == 200
    assert list_files.json()["total"] == 1

    run_plan = await auth_client.post(f"/api/v1/projects/{project_id}/runs/plan", json={})
    assert run_plan.status_code == 200
    run_id = run_plan.json()["id"]

    run_logs = await auth_client.get(f"/api/v1/projects/{project_id}/runs/{run_id}/logs")
    assert run_logs.status_code == 200
    assert "Terraform plan completed" in run_logs.json()


@pytest.mark.asyncio
async def test_files_content_and_download(auth_client: AsyncClient):
    created = await auth_client.post(
        "/api/v1/projects/",
        json={"name": "Downloadable", "description": "d", "region": "eu-west-3"},
    )
    project_id = created.json()["id"]

    await auth_client.post(
        f"/api/v1/projects/{project_id}/files/save",
        json={"path": "vars.tf", "content": 'variable "region" {}'},
    )

    content = await auth_client.get(f"/api/v1/projects/{project_id}/files/content?path=vars.tf")
    assert content.status_code == 200
    assert content.json()["path"] == "vars.tf"

    download = await auth_client.get(f"/api/v1/projects/{project_id}/files/download?path=vars.tf")
    assert download.status_code == 200
    assert download.headers["content-disposition"].startswith("attachment;")


@pytest.mark.asyncio
async def test_runs_lifecycle_endpoints(auth_client: AsyncClient):
    created = await auth_client.post(
        "/api/v1/projects/",
        json={"name": "RunLifecycle", "description": "d", "region": "eu-west-3"},
    )
    project_id = created.json()["id"]

    apply_run = await auth_client.post(f"/api/v1/projects/{project_id}/runs/apply", json={})
    assert apply_run.status_code == 200
    apply_id = apply_run.json()["id"]

    destroy_run = await auth_client.post(f"/api/v1/projects/{project_id}/runs/destroy", json={})
    assert destroy_run.status_code == 200
    destroy_id = destroy_run.json()["id"]

    list_runs = await auth_client.get(f"/api/v1/projects/{project_id}/runs?page=1&page_size=10")
    assert list_runs.status_code == 200
    assert len(list_runs.json()) >= 2

    detail = await auth_client.get(f"/api/v1/projects/{project_id}/runs/{apply_id}")
    assert detail.status_code == 200
    assert detail.json()["id"] == apply_id

    cancel = await auth_client.post(f"/api/v1/projects/{project_id}/runs/{destroy_id}/cancel", json={})
    assert cancel.status_code == 200
    assert cancel.json()["status"] == "cancelled"

    retry = await auth_client.post(f"/api/v1/projects/{project_id}/runs/{destroy_id}/retry", json={})
    assert retry.status_code == 200


@pytest.mark.asyncio
async def test_not_found_variants(auth_client: AsyncClient):
    unknown_id = "00000000-0000-0000-0000-000000000111"
    missing_project = await auth_client.get(f"/api/v1/projects/{unknown_id}")
    assert missing_project.status_code == 404
