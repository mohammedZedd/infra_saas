from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel


class RunActionRequest(BaseModel):
    options: dict | None = None


class TerraformRunListResponse(BaseModel):
    items: list[dict]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_previous: bool


class RunLogResponse(BaseModel):
    run_id: UUID
    logs: str
