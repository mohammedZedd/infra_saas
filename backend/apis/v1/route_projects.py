from schemas.project import ProjectAWSCredentialsUpdate
from fastapi import APIRouter, Body, Depends, HTTPException, Query, Response, status
from uuid import UUID
from typing import Any, Dict, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from core.deps import get_current_active_user
from db.session import get_db
from repository.file import (
    delete_project_path,
    ensure_folder,
    get_project_file_by_path,
    list_project_file_tree,
    list_project_files,
    move_project_path,
    save_project_file,
)
from repository.project import create_project, delete_project, get_project_by_id, list_projects, update_project
from repository.run import complete_run, create_run, get_run_by_id, list_runs
from schemas.common import MessageResponse, build_pagination_meta
from schemas.file import (
    FileContentResponse,
    FileDeleteResponse,
    FileListResponse,
    FileMoveRequest,
    FileSaveRequest,
    FileSaveResponse,
    FolderCreateRequest,
    ProjectFileResponse,
)
from schemas.project import ProjectCreate, ProjectListResponse, ProjectResponse, ProjectUpdate, TerraformPlanSummary, TerraformRunResponse
from services.project_initializer import initialize_project_structure
from services.terraform_service import execute_terraform

router = APIRouter(prefix="/projects", tags=["projects"])

# Endpoint pour enregistrer les credentials AWS d'un projet
@router.put("/{project_id}/aws-credentials", status_code=200)
async def update_project_aws_credentials(
    project_id: UUID,
    creds: ProjectAWSCredentialsUpdate = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    project = await _get_owned_project_or_404(db, project_id, current_user.id)
    project.aws_access_key_id = creds.aws_access_key_id
    project.aws_secret_access_key = creds.aws_secret_access_key
    project.aws_region = creds.aws_region
    await db.commit()
    await db.refresh(project)
    return {"message": "AWS credentials updated"}


def _serialize_run(run) -> TerraformRunResponse:
    return TerraformRunResponse(
        id=run.id,
        projectId=run.project_id,
        command=run.command,
        status=run.status,
        triggeredBy=run.triggered_by,
        triggeredAt=run.created_at.isoformat(),
        completedAt=run.completed_at,
        planSummary=TerraformPlanSummary(add=run.plan_add, change=run.plan_change, destroy=run.plan_destroy),
        errorMessage=run.error_message,
        logs=run.logs,
        logUrl=None,
    )


def _serialize_project(project, include_runs: bool = False) -> ProjectResponse:
    runs = [_serialize_run(r) for r in (project.runs or [])] if include_runs else None
    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        region=project.region,
        environment=project.environment,
        status=project.status,
        node_count=project.node_count,
        estimated_cost=float(project.estimated_cost),
        created_at=project.created_at,
        updated_at=project.updated_at,
        last_deployed_at=None,
        architecture_data=project.architecture_data,
        runs=runs,
    )


async def _get_owned_project_or_404(db: AsyncSession, project_id: UUID, owner_id: UUID):
    project = await get_project_by_id(db, project_id)
    if not project or project.owner_id != owner_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.get(
    "/",
    response_model=ProjectListResponse,
    summary="List projects",
    description="Return authenticated user projects with pagination, filtering and sorting.",
    responses={401: {"description": "Unauthorized"}},
)
async def get_projects(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=200),
    status_filter: Optional[str] = Query(default=None, alias="status"),
    region: Optional[str] = None,
    sort_by: str = "updated_at",
    sort_order: str = "desc",
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    skip = (page - 1) * page_size
    items, total = await list_projects(
        db,
        owner_id=current_user.id,
        skip=skip,
        limit=page_size,
        filters={"status": status_filter, "region": region},
        sort_by=sort_by,
        sort_order=sort_order,
    )
    meta = build_pagination_meta(total=total, page=page, page_size=page_size)
    return ProjectListResponse(items=[_serialize_project(p) for p in items], **meta.model_dump())


@router.post(
    "/",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create project",
    description="Create a new project owned by the authenticated user.",
    responses={401: {"description": "Unauthorized"}, 422: {"description": "Validation error"}},
)
async def post_project(
    payload: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    project = await create_project(db, payload, owner_id=current_user.id)
    await initialize_project_structure(db, project.id)
    return _serialize_project(project)


@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
    summary="Get project by id",
    description="Return one project and its recent runs for authenticated owner.",
    responses={401: {"description": "Unauthorized"}, 404: {"description": "Project not found"}},
)
async def get_project(project_id: UUID, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
    project = await _get_owned_project_or_404(db, project_id, current_user.id)
    return _serialize_project(project, include_runs=True)


@router.patch(
    "/{project_id}",
    response_model=ProjectResponse,
    summary="Update project",
    description="Partially update project fields.",
    responses={401: {"description": "Unauthorized"}, 404: {"description": "Project not found"}},
)
async def patch_project(
    project_id: UUID,
    payload: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    await _get_owned_project_or_404(db, project_id, current_user.id)
    project = await update_project(db, project_id, payload)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return _serialize_project(project, include_runs=True)


@router.delete(
    "/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete project",
    description="Delete a project and related resources.",
    responses={401: {"description": "Unauthorized"}, 404: {"description": "Project not found"}},
)
async def remove_project(project_id: UUID, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
    await _get_owned_project_or_404(db, project_id, current_user.id)
    deleted = await delete_project(db, project_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{project_id}/initialize-structure", response_model=MessageResponse)
async def post_initialize_project_structure(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    await _get_owned_project_or_404(db, project_id, current_user.id)
    await initialize_project_structure(db, project_id)
    return MessageResponse(message="Project structure initialized")


@router.get("/{project_id}/files", response_model=FileListResponse)
async def get_files(project_id: UUID, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
    await _get_owned_project_or_404(db, project_id, current_user.id)
    tree = await list_project_file_tree(db, project_id)
    _, total = await list_project_files(db, project_id)
    return FileListResponse(files=tree, total=total)


@router.get("/{project_id}/files/content", response_model=FileContentResponse)
async def get_file_content(
    project_id: UUID,
    path: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    await _get_owned_project_or_404(db, project_id, current_user.id)
    file = await get_project_file_by_path(db, project_id, path)
    if file is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    return FileContentResponse(path=file.path, content=file.content or "", language=file.language or "text", size=file.size_bytes)


@router.post(
    "/{project_id}/files/save",
    response_model=FileSaveResponse,
    summary="Save project file",
    description="Create or update a project file by path.",
    responses={401: {"description": "Unauthorized"}, 404: {"description": "Project not found"}},
)
async def post_file_save(
    project_id: UUID,
    payload: FileSaveRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    await _get_owned_project_or_404(db, project_id, current_user.id)
    if not payload.path:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="path is required")
    saved = await save_project_file(db, project_id, payload.path, payload.content)
    return FileSaveResponse(path=saved.path, saved=True, message=payload.message or "File saved")


@router.post(
    "/{project_id}/folders",
    response_model=ProjectFileResponse,
    summary="Create folder",
    description="Create a folder path recursively in project files.",
)
async def post_create_folder(
    project_id: UUID,
    payload: FolderCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    await _get_owned_project_or_404(db, project_id, current_user.id)
    try:
        folder = await ensure_folder(db, project_id, payload.path)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    return ProjectFileResponse(
        id=folder.id,
        path=folder.path,
        name=folder.name,
        type=folder.file_type,
        file_type=folder.content_type,
        is_directory=folder.is_directory,
        content=folder.content,
        language=folder.language,
        size=folder.size_bytes,
        createdAt=folder.created_at,
        updatedAt=folder.updated_at,
    )


@router.get("/{project_id}/files/download")
async def download_file(
    project_id: UUID,
    path: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    await _get_owned_project_or_404(db, project_id, current_user.id)
    file = await get_project_file_by_path(db, project_id, path)
    if file is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    filename = file.name or "download.txt"
    return Response(
        content=(file.content or "").encode("utf-8"),
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{project_id}/files/{file_path:path}", response_model=FileContentResponse)
async def get_file_content_by_path(
    project_id: UUID,
    file_path: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    await _get_owned_project_or_404(db, project_id, current_user.id)
    file = await get_project_file_by_path(db, project_id, file_path)
    if file is None or file.is_directory:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    return FileContentResponse(path=file.path, content=file.content or "", language=file.language or "text", size=file.size_bytes)


@router.put("/{project_id}/files/{file_path:path}", response_model=FileSaveResponse)
async def put_file_content_by_path(
    project_id: UUID,
    file_path: str,
    payload: FileSaveRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    await _get_owned_project_or_404(db, project_id, current_user.id)
    content = payload.content
    try:
        saved = await save_project_file(db, project_id, file_path, content)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return FileSaveResponse(path=saved.path, saved=True, message=payload.message or "File saved")


@router.delete("/{project_id}/files/{file_path:path}", response_model=FileDeleteResponse)
async def delete_file_or_folder_by_path(
    project_id: UUID,
    file_path: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    await _get_owned_project_or_404(db, project_id, current_user.id)
    deleted_count = await delete_project_path(db, project_id, file_path)
    return FileDeleteResponse(path=file_path, deleted=deleted_count > 0, deleted_count=deleted_count)


@router.post("/{project_id}/files/move", response_model=MessageResponse)
async def move_file_or_folder(
    project_id: UUID,
    payload: FileMoveRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    await _get_owned_project_or_404(db, project_id, current_user.id)
    try:
        moved_count = await move_project_path(db, project_id, payload.source_path, payload.destination_path)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    if moved_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Path not found")
    return MessageResponse(message=f"Moved {moved_count} item(s)")


@router.get("/{project_id}/runs", response_model=list[TerraformRunResponse])
async def get_runs(
    project_id: UUID,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    await _get_owned_project_or_404(db, project_id, current_user.id)
    skip = (page - 1) * page_size
    runs, _ = await list_runs(db, project_id, skip=skip, limit=page_size)
    return [_serialize_run(r) for r in runs]


@router.get("/{project_id}/runs/{run_id}", response_model=TerraformRunResponse)
async def get_run_detail(
    project_id: UUID,
    run_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    await _get_owned_project_or_404(db, project_id, current_user.id)
    run = await get_run_by_id(db, project_id, run_id)
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Run not found")
    return _serialize_run(run)


@router.get("/{project_id}/runs/{run_id}/logs", response_model=str)
async def get_run_logs(
    project_id: UUID,
    run_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    await _get_owned_project_or_404(db, project_id, current_user.id)
    run = await get_run_by_id(db, project_id, run_id)
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Run not found")
    return run.logs or ""


async def _trigger_run(project_id: UUID, command: str, db: AsyncSession, current_user) -> TerraformRunResponse:
    await _get_owned_project_or_404(db, project_id, current_user.id)
    run = await create_run(db, project_id, current_user.email, command)
    run = await execute_terraform(db, run, project_id, command)
    return _serialize_run(run)


@router.post(
    "/{project_id}/runs/plan",
    response_model=TerraformRunResponse,
    summary="Trigger terraform plan",
    description="Create a simulated terraform plan run for the project.",
    responses={401: {"description": "Unauthorized"}, 404: {"description": "Project not found"}},
)
async def post_run_plan(project_id: UUID, _: dict | None = None, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
    return await _trigger_run(project_id, "plan", db, current_user)


@router.post("/{project_id}/runs/apply", response_model=TerraformRunResponse)
async def post_run_apply(project_id: UUID, _: dict | None = None, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
    return await _trigger_run(project_id, "apply", db, current_user)


@router.post("/{project_id}/runs/destroy", response_model=TerraformRunResponse)
async def post_run_destroy(project_id: UUID, _: dict | None = None, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
    return await _trigger_run(project_id, "destroy", db, current_user)


@router.post("/{project_id}/runs/{run_id}/cancel", response_model=TerraformRunResponse)
async def post_run_cancel(
    project_id: UUID,
    run_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    await _get_owned_project_or_404(db, project_id, current_user.id)
    run = await get_run_by_id(db, project_id, run_id)
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Run not found")
    run = await complete_run(db, run, status="cancelled", logs=(run.logs or "") + "\nRun cancelled")
    return _serialize_run(run)


@router.post("/{project_id}/runs/{run_id}/retry", response_model=TerraformRunResponse)
async def post_run_retry(
    project_id: UUID,
    run_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    await _get_owned_project_or_404(db, project_id, current_user.id)
    run = await get_run_by_id(db, project_id, run_id)
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Run not found")
    return await _trigger_run(project_id, run.command, db, current_user)


@router.get("/{project_id}/architecture", response_model=dict)
async def get_project_architecture(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    project = await _get_owned_project_or_404(db, project_id, current_user.id)
    return {"architecture_data": project.architecture_data or {}}


@router.put("/{project_id}/architecture", response_model=dict)
async def put_project_architecture(
    project_id: UUID,
    payload: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    project = await _get_owned_project_or_404(db, project_id, current_user.id)
    arch_data = payload.get("architecture_data", payload)
    project.architecture_data = arch_data
    await db.commit()
    await db.refresh(project)
    return {"architecture_data": project.architecture_data or {}}
