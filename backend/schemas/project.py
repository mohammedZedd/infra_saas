

from __future__ import annotations
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Any, Dict, List, Optional, Union
from uuid import UUID

class ProjectAWSCredentialsUpdate(BaseModel):
    aws_access_key_id: str
    aws_secret_access_key: str
    aws_region: str


class ProjectBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str = ""
    region: str = Field(min_length=1, max_length=100)
    environment: Optional[str] = None


class ProjectCreate(ProjectBase):
    template_id: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    region: Optional[str] = Field(default=None, min_length=1, max_length=100)
    environment: Optional[str] = None
    status: Optional[str] = None
    architecture_data: Optional[Dict[str, Any]] = None


class TerraformPlanSummary(BaseModel):
    add: int = 0
    change: int = 0
    destroy: int = 0


class TerraformRunResponse(BaseModel):
    id: UUID
    projectId: UUID
    command: str
    status: str
    triggeredBy: str
    triggeredAt: str
    completedAt: Optional[str] = None
    planSummary: Optional[TerraformPlanSummary] = None
    errorMessage: Optional[str] = None
    logUrl: Optional[str] = None
    logs: Optional[str] = None


class ProjectResponse(ProjectBase):
    id: UUID
    status: str
    node_count: int
    estimated_cost: float
    created_at: datetime
    updated_at: datetime
    last_deployed_at: Optional[datetime] = None
    architecture_data: Optional[Dict[str, Any]] = None
    runs: Optional[List[TerraformRunResponse]] = None

    model_config = ConfigDict(from_attributes=True)


class ProjectListResponse(BaseModel):
    items: List[ProjectResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_previous: bool
