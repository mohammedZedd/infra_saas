from __future__ import annotations

from typing import Any


def apply_filter(query, column, operator: str, value: Any):
    if value is None:
        return query
    if operator == "eq":
        return query.where(column == value)
    if operator == "ne":
        return query.where(column != value)
    if operator == "gt":
        return query.where(column > value)
    if operator == "gte":
        return query.where(column >= value)
    if operator == "lt":
        return query.where(column < value)
    if operator == "lte":
        return query.where(column <= value)
    if operator == "like":
        return query.where(column.ilike(f"%{value}%"))
    if operator == "in" and isinstance(value, (list, tuple, set)):
        return query.where(column.in_(value))
    return query
