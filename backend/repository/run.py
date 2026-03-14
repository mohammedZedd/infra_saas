from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models.project import TerraformCommand, TerraformRun, TerraformRunStatus


async def list_runs(db: AsyncSession, project_id: UUID, skip: int = 0, limit: int = 20) -> tuple[list[TerraformRun], int]:
    stmt = (
        select(TerraformRun)
        .where(TerraformRun.project_id == project_id)
        .order_by(TerraformRun.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    count_stmt = select(func.count()).select_from(TerraformRun).where(TerraformRun.project_id == project_id)
    items = list((await db.scalars(stmt)).all())
    total = int(await db.scalar(count_stmt) or 0)
    return items, total


async def get_run_by_id(db: AsyncSession, project_id: UUID, run_id: UUID) -> TerraformRun | None:
    stmt = select(TerraformRun).where(TerraformRun.project_id == project_id, TerraformRun.id == run_id)
    return await db.scalar(stmt)


async def create_run(db: AsyncSession, project_id: UUID, triggered_by: str, command: str) -> TerraformRun:
    run = TerraformRun(
        project_id=project_id,
        triggered_by=triggered_by,
        command=TerraformCommand(command).value,
        status=TerraformRunStatus.running.value,
        logs=f"[{datetime.now(timezone.utc).isoformat()}] Terraform {command} started",
    )
    db.add(run)
    await db.flush()
    await db.refresh(run)
    return run


async def complete_run(
    db: AsyncSession,
    run: TerraformRun,
    *,
    status: str,
    logs: str,
    plan_add: int = 0,
    plan_change: int = 0,
    plan_destroy: int = 0,
    error_message: str | None = None,
) -> TerraformRun:
    run.status = status
    run.completed_at = datetime.now(timezone.utc).isoformat()
    run.logs = logs
    run.plan_add = plan_add
    run.plan_change = plan_change
    run.plan_destroy = plan_destroy
    run.error_message = error_message
    await db.flush()
    await db.refresh(run)
    return run
