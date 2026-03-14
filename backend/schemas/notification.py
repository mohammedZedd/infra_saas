# (move this class definition below all import statements)
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field
import enum

class NotificationType(str, enum.Enum):
    project_created = "project_created"
    terraform_plan_success = "terraform_plan_success"
    terraform_plan_failed = "terraform_plan_failed"
    terraform_apply_success = "terraform_apply_success"
    terraform_apply_failed = "terraform_apply_failed"
    resource_limit_warning = "resource_limit_warning"
    team_invite = "team_invite"
    system_update = "system_update"
    cost_alert = "cost_alert"

class NotificationBase(BaseModel):
    type: NotificationType
    title: str
    message: str
    project_id: Optional[UUID] = None
    project_name: Optional[str] = None
    action_url: Optional[str] = None

class NotificationCreate(NotificationBase):
    user_id: UUID

class NotificationUpdate(BaseModel):
    read: Optional[bool] = None

class NotificationResponse(NotificationBase):
    id: UUID
    user_id: UUID
    read: bool
    created_at: datetime

    class Config:
        orm_mode = True

class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    total: int

