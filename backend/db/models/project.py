from __future__ import annotations

from enum import Enum
from uuid import UUID

from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Dict, List, Optional

from db.base_class import Base


class ProjectStatus(str, Enum):
    draft = "draft"
    active = "active"
    deploying = "deploying"
    deployed = "deployed"
    failed = "failed"


class Project(Base):
    __tablename__ = "projects"

    owner_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    region: Mapped[str] = mapped_column(String(100), nullable=False)
    environment: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    status: Mapped[ProjectStatus] = mapped_column(String(20), default=ProjectStatus.draft.value, nullable=False, index=True)
    node_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    estimated_cost: Mapped[float] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    metadata_json: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    architecture_data: Mapped[Optional[Dict]] = mapped_column(JSONB, nullable=True, default=None)

    aws_access_key_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    aws_secret_access_key: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    aws_region: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    owner: Mapped["User"] = relationship("User", back_populates="projects")
    files: Mapped[List["ProjectFile"]] = relationship("ProjectFile", back_populates="project", cascade="all, delete-orphan")
    runs: Mapped[List["TerraformRun"]] = relationship("TerraformRun", back_populates="project", cascade="all, delete-orphan")
    notifications: Mapped[List["Notification"]] = relationship("Notification", back_populates="project", cascade="all, delete-orphan", foreign_keys="Notification.project_id")

    def __repr__(self) -> str:
        return f"Project(id={self.id}, name={self.name})"


class FileType(str, Enum):
    file = "file"
    folder = "folder"


class ProjectFile(Base):
    __tablename__ = "project_files"

    project_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), index=True)
    path: Mapped[str] = mapped_column(Text, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    parent_path: Mapped[Optional[str]] = mapped_column(Text, nullable=True, index=True)
    file_type: Mapped[FileType] = mapped_column(String(20), nullable=False)
    content_type: Mapped[str] = mapped_column(String(30), nullable=False, default="other")
    is_directory: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    language: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    size_bytes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    project: Mapped[Project] = relationship("Project", back_populates="files")

    def __repr__(self) -> str:
        return f"ProjectFile(id={self.id}, path={self.path})"


class TerraformCommand(str, Enum):
    plan = "plan"
    apply = "apply"
    destroy = "destroy"
    init = "init"


class TerraformRunStatus(str, Enum):
    success = "success"
    failed = "failed"
    running = "running"
    cancelled = "cancelled"


class TerraformRun(Base):
    __tablename__ = "terraform_runs"

    project_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), index=True)
    triggered_by: Mapped[str] = mapped_column(String(255), nullable=False)
    command: Mapped[TerraformCommand] = mapped_column(String(20), nullable=False)
    status: Mapped[TerraformRunStatus] = mapped_column(String(20), nullable=False, index=True)
    completed_at: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)
    plan_add: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    plan_change: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    plan_destroy: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    logs: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    project: Mapped[Project] = relationship("Project", back_populates="runs")

    def __repr__(self) -> str:
        return f"TerraformRun(id={self.id}, command={self.command}, status={self.status})"
