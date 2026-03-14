from __future__ import annotations

from datetime import datetime
from uuid import UUID


from pydantic import BaseModel, ConfigDict
from typing import Optional, List


class ProjectFileBase(BaseModel):
    path: str
    name: str
    type: str
    file_type: Optional[str] = None
    is_directory: bool = False
    language: Optional[str] = None
    content: Optional[str] = None
    size: int = 0

class ProjectFileResponse(ProjectFileBase):
    id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    children: Optional[List["ProjectFileResponse"]] = None
    model_config = ConfigDict(from_attributes=True)

class FileContentResponse(BaseModel):
    path: str
    content: str
    language: str
    size: int

class FileSaveRequest(BaseModel):
    path: Optional[str] = None
    content: str
    message: Optional[str] = None

class FileSaveResponse(BaseModel):
    path: str
    saved: bool
    message: str

class FolderCreateRequest(BaseModel):
    path: str

class FileMoveRequest(BaseModel):
    source_path: str
    destination_path: str

class FileDeleteResponse(BaseModel):
    path: str
    deleted: bool
    deleted_count: int

class FileTreeNode(BaseModel):
    path: str
    name: str
    is_directory: bool
    file_type: str
    size: int = 0
    updated_at: Optional[str] = None
    children: Optional[List["FileTreeNode"]] = None

class FileListResponse(BaseModel):
    files: List["FileTreeNode"]
    total: int


class FileContentResponse(BaseModel):
    path: str
    content: str
    language: str
    size: int


class FileSaveResponse(BaseModel):
    path: str
    saved: bool
    message: str


class FolderCreateRequest(BaseModel):
    path: str


class FileMoveRequest(BaseModel):
    source_path: str
    destination_path: str


class FileDeleteResponse(BaseModel):
    path: str
    deleted: bool
    deleted_count: int
