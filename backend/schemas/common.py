from __future__ import annotations

from math import ceil

from pydantic import BaseModel


class PaginationMeta(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_previous: bool


class MessageResponse(BaseModel):
    message: str


def build_pagination_meta(total: int, page: int, page_size: int) -> PaginationMeta:
    total_pages = ceil(total / page_size) if total > 0 else 1
    return PaginationMeta(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_previous=page > 1,
    )
