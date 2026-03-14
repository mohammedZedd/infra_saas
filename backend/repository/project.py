from __future__ import annotations

from typing import Any, Dict, List, Tuple, Union
from uuid import UUID

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from db.models.project import Project
from schemas.project import ProjectCreate, ProjectUpdate


async def create_project(db: AsyncSession, project_in: ProjectCreate, owner_id: UUID) -> Project:
    project = Project(
        owner_id=owner_id,
        name=project_in.name,
        description=project_in.description,
        region=project_in.region,
        environment=project_in.environment,
    )
    db.add(project)
    await db.flush()
    await db.refresh(project)
    return project


async def get_project_by_id(db: AsyncSession, project_id: UUID) -> Union[Project, None]:
    stmt = select(Project).where(Project.id == project_id).options(selectinload(Project.runs))
    return await db.scalar(stmt)


async def list_projects(
    db: AsyncSession,
    *,
    owner_id: UUID,
    skip: int = 0,
    limit: int = 20,
    filters: Union[Dict[str, Any], None] = None,
    sort_by: str = "updated_at",
    sort_order: str = "desc",
    ) -> Tuple[List[Project], int]:
    filters = filters or {}
    stmt: Select = select(Project).where(Project.owner_id == owner_id)
    count_stmt = select(func.count()).select_from(Project).where(Project.owner_id == owner_id)

    if filters.get("status"):
        stmt = stmt.where(Project.status == filters["status"])
        count_stmt = count_stmt.where(Project.status == filters["status"])

    if filters.get("region"):
        stmt = stmt.where(Project.region == filters["region"])
        count_stmt = count_stmt.where(Project.region == filters["region"])

    sort_column = getattr(Project, sort_by, Project.updated_at)
    stmt = stmt.order_by(sort_column.asc() if sort_order == "asc" else sort_column.desc())
    stmt = stmt.offset(skip).limit(limit)

    total = int(await db.scalar(count_stmt) or 0)
    items = list((await db.scalars(stmt)).all())
    return items, total


from typing import Union

async def update_project(db: AsyncSession, project_id: UUID, project_in: ProjectUpdate) -> Union[Project, None]:
    project = await get_project_by_id(db, project_id)
    if project is None:
        return None

    data = project_in.model_dump(exclude_none=True)
    for key, value in data.items():
        setattr(project, key, value)

    await db.flush()
    await db.refresh(project)
    return project


async def delete_project(db: AsyncSession, project_id: UUID) -> bool:
    project = await get_project_by_id(db, project_id)
    if project is None:
        return False
    await db.delete(project)
    await db.flush()
    return True
