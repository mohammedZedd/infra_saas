from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.hashing import get_password_hash
from db.models.user import User
from schemas.user import UserCreate, UserUpdate


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    stmt = select(User).where(User.email == email.lower())
    return await db.scalar(stmt)


async def get_user_by_id(db: AsyncSession, user_id: UUID) -> User | None:
    stmt = select(User).where(User.id == user_id)
    return await db.scalar(stmt)


async def create_user(db: AsyncSession, user_in: UserCreate) -> User:
    user = User(
        email=user_in.email.lower(),
        full_name=user_in.full_name,
        username=user_in.username,
        avatar_url=user_in.avatar_url,
        hashed_password=get_password_hash(user_in.password),
        is_active=True,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


async def list_users(
    db: AsyncSession,
    *,
    skip: int = 0,
    limit: int = 20,
    filters: dict[str, Any] | None = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
) -> tuple[list[User], int]:
    filters = filters or {}
    stmt: Select[tuple[User]] = select(User)
    count_stmt = select(func.count()).select_from(User)

    if "is_active" in filters:
        stmt = stmt.where(User.is_active == filters["is_active"])
        count_stmt = count_stmt.where(User.is_active == filters["is_active"])

    sort_column = getattr(User, sort_by, User.created_at)
    stmt = stmt.order_by(sort_column.asc() if sort_order == "asc" else sort_column.desc())
    stmt = stmt.offset(skip).limit(limit)

    total = int(await db.scalar(count_stmt) or 0)
    items = list((await db.scalars(stmt)).all())
    return items, total


async def update_user(db: AsyncSession, user_id: UUID, user_in: UserUpdate) -> User | None:
    user = await get_user_by_id(db, user_id)
    if user is None:
        return None

    data = user_in.model_dump(exclude_none=True)
    for key, value in data.items():
        setattr(user, key, value)

    await db.flush()
    await db.refresh(user)
    return user


async def delete_user(db: AsyncSession, user_id: UUID) -> bool:
    user = await get_user_by_id(db, user_id)
    if user is None:
        return False
    await db.delete(user)
    await db.flush()
    return True
