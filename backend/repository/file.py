from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models.project import FileType, ProjectFile


@dataclass
class FileTreeNode:
    path: str
    name: str
    is_directory: bool
    file_type: str
    size: int
    updated_at: str
    children: list["FileTreeNode"] | None = None


def _normalize_path(path: str) -> str:
    return path.strip().strip("/")


def _basename(path: str) -> str:
    if "/" not in path:
        return path
    return path.rsplit("/", 1)[1]


def _parent_path(path: str) -> str | None:
    if "/" not in path:
        return None
    return path.rsplit("/", 1)[0]


def _guess_language(path: str) -> str:
    if path.endswith(".tf") or path.endswith(".hcl"):
        return "hcl"
    if path.endswith(".json"):
        return "json"
    if path.endswith(".yml") or path.endswith(".yaml"):
        return "yaml"
    if path.endswith(".md"):
        return "markdown"
    return "text"


def _guess_content_type(path: str, is_directory: bool) -> str:
    if is_directory:
        return "folder"
    name = path.lower()
    if name.endswith("terragrunt.hcl") or name.endswith(".hcl"):
        return "terragrunt"
    if name.endswith(".tf"):
        return "terraform"
    if name.endswith(".md"):
        return "markdown"
    if name.endswith(".gitignore"):
        return "gitignore"
    return "other"


async def list_project_files(db: AsyncSession, project_id: UUID) -> tuple[list[ProjectFile], int]:
    stmt = select(ProjectFile).where(ProjectFile.project_id == project_id, ProjectFile.is_deleted.is_(False))
    count_stmt = select(func.count()).select_from(ProjectFile).where(
        ProjectFile.project_id == project_id, ProjectFile.is_deleted.is_(False)
    )
    files = list((await db.scalars(stmt.order_by(ProjectFile.path.asc()))).all())
    total = int(await db.scalar(count_stmt) or 0)
    return files, total


async def list_project_file_tree(db: AsyncSession, project_id: UUID) -> list[dict]:
    files, _ = await list_project_files(db, project_id)
    if not files:
        return []

    nodes_by_path: dict[str, dict] = {}
    for item in files:
        nodes_by_path[item.path] = {
            "path": item.path,
            "name": item.name,
            "is_directory": bool(item.is_directory),
            "file_type": item.content_type or _guess_content_type(item.path, bool(item.is_directory)),
            "size": item.size_bytes,
            "updated_at": item.updated_at.isoformat(),
            "children": [] if item.is_directory else None,
        }

    roots: list[dict] = []
    for path in sorted(nodes_by_path.keys()):
        node = nodes_by_path[path]
        parent = _parent_path(path)
        if parent and parent in nodes_by_path and nodes_by_path[parent]["children"] is not None:
            nodes_by_path[parent]["children"].append(node)
        else:
            roots.append(node)

    def sort_node(n: dict) -> None:
        children = n.get("children")
        if not children:
            return
        children.sort(key=lambda c: (not c["is_directory"], c["name"].lower()))
        for child in children:
            sort_node(child)

    roots.sort(key=lambda c: (not c["is_directory"], c["name"].lower()))
    for root in roots:
        sort_node(root)

    return roots


async def get_project_file_by_path(db: AsyncSession, project_id: UUID, path: str) -> ProjectFile | None:
    normalized = _normalize_path(path)
    stmt = select(ProjectFile).where(
        ProjectFile.project_id == project_id,
        ProjectFile.path == normalized,
        ProjectFile.is_deleted.is_(False),
    )
    return await db.scalar(stmt)


async def ensure_folder(db: AsyncSession, project_id: UUID, path: str) -> ProjectFile:
    normalized = _normalize_path(path)
    if not normalized:
        raise ValueError("Folder path cannot be empty")

    existing = await get_project_file_by_path(db, project_id, normalized)
    if existing is not None:
        if not existing.is_directory:
            raise ValueError(f"Path '{normalized}' already exists as a file")
        return existing

    parent = _parent_path(normalized)
    if parent:
        await ensure_folder(db, project_id, parent)

    folder = ProjectFile(
        project_id=project_id,
        path=normalized,
        name=_basename(normalized),
        filename=_basename(normalized),
        parent_path=parent,
        file_type=FileType.folder.value,
        content_type=_guess_content_type(normalized, True),
        is_directory=True,
        language=None,
        content=None,
        size_bytes=0,
        is_deleted=False,
    )
    db.add(folder)
    await db.flush()
    await db.refresh(folder)
    return folder


async def save_project_file(db: AsyncSession, project_id: UUID, path: str, content: str) -> ProjectFile:
    normalized = _normalize_path(path)
    if not normalized:
        raise ValueError("File path cannot be empty")

    parent = _parent_path(normalized)
    if parent:
        await ensure_folder(db, project_id, parent)

    existing = await get_project_file_by_path(db, project_id, normalized)
    name = _basename(normalized)

    if existing is None:
        existing = ProjectFile(
            project_id=project_id,
            path=normalized,
            name=name,
            filename=name,
            parent_path=parent,
            file_type=FileType.file.value,
            content_type=_guess_content_type(normalized, False),
            is_directory=False,
            language=_guess_language(normalized),
            content=content,
            size_bytes=len(content.encode("utf-8")),
            is_deleted=False,
        )
        db.add(existing)
    else:
        if existing.is_directory:
            raise ValueError(f"Path '{normalized}' is a folder")
        existing.content = content
        existing.language = existing.language or _guess_language(normalized)
        existing.content_type = _guess_content_type(normalized, False)
        existing.size_bytes = len(content.encode("utf-8"))
        existing.parent_path = parent
        existing.name = name
        existing.filename = name

    await db.flush()
    await db.refresh(existing)
    return existing


async def delete_project_path(db: AsyncSession, project_id: UUID, path: str) -> int:
    normalized = _normalize_path(path)
    if not normalized:
        return 0

    stmt = select(ProjectFile).where(
        ProjectFile.project_id == project_id,
        ProjectFile.is_deleted.is_(False),
        or_(ProjectFile.path == normalized, ProjectFile.path.like(f"{normalized}/%")),
    )
    entries = list((await db.scalars(stmt)).all())
    for entry in entries:
        entry.is_deleted = True

    await db.flush()
    return len(entries)


async def move_project_path(db: AsyncSession, project_id: UUID, source_path: str, destination_path: str) -> int:
    src = _normalize_path(source_path)
    dst = _normalize_path(destination_path)
    if not src or not dst:
        raise ValueError("Source and destination paths are required")

    if src == dst:
        return 0

    source = await get_project_file_by_path(db, project_id, src)
    if source is None:
        return 0

    if source.is_directory:
        parent_dst = _parent_path(dst)
        if parent_dst:
            await ensure_folder(db, project_id, parent_dst)

        stmt = select(ProjectFile).where(
            ProjectFile.project_id == project_id,
            ProjectFile.is_deleted.is_(False),
            or_(ProjectFile.path == src, ProjectFile.path.like(f"{src}/%")),
        )
        entries = list((await db.scalars(stmt)).all())

        for entry in entries:
            suffix = entry.path[len(src) :]
            if suffix.startswith("/"):
                suffix = suffix[1:]
            new_path = dst if not suffix else f"{dst}/{suffix}"
            entry.path = new_path
            entry.parent_path = _parent_path(new_path)
            entry.name = _basename(new_path)
            entry.filename = _basename(new_path)

        await db.flush()
        return len(entries)

    parent_dst = _parent_path(dst)
    if parent_dst:
        await ensure_folder(db, project_id, parent_dst)

    source.path = dst
    source.parent_path = parent_dst
    source.name = _basename(dst)
    source.filename = _basename(dst)
    source.content_type = _guess_content_type(dst, False)
    source.language = _guess_language(dst)

    await db.flush()
    return 1
