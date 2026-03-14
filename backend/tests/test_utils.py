from __future__ import annotations

from sqlalchemy import Column, Integer, MetaData, String, Table, select

from utils.filters import apply_filter
from utils.pagination import build_pagination, get_offset


def test_get_offset():
    assert get_offset(1, 20) == 0
    assert get_offset(3, 10) == 20
    assert get_offset(0, 10) == 0


def test_build_pagination():
    page = build_pagination(total=45, page=2, page_size=20)
    assert page["total_pages"] == 3
    assert page["has_next"] is True
    assert page["has_previous"] is True


def test_apply_filter_operators():
    metadata = MetaData()
    table = Table("t", metadata, Column("name", String), Column("age", Integer))

    base = select(table)
    queries = [
        apply_filter(base, table.c.age, "eq", 1),
        apply_filter(base, table.c.age, "ne", 1),
        apply_filter(base, table.c.age, "gt", 1),
        apply_filter(base, table.c.age, "gte", 1),
        apply_filter(base, table.c.age, "lt", 1),
        apply_filter(base, table.c.age, "lte", 1),
        apply_filter(base, table.c.name, "like", "abc"),
        apply_filter(base, table.c.name, "in", ["a", "b"]),
        apply_filter(base, table.c.name, "unknown", "x"),
        apply_filter(base, table.c.name, "eq", None),
    ]

    # Ensure operators produce selectable queries without raising.
    assert all(hasattr(q, "whereclause") for q in queries)
