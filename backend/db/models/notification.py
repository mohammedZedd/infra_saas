from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
import uuid
from datetime import datetime
from db.base_class import Base

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

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    type = Column(Enum(NotificationType), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=True)
    project_name = Column(String(255), nullable=True)
    action_url = Column(String(255), nullable=True)

    user = relationship("User", back_populates="notifications")
    project = relationship("Project", back_populates="notifications", foreign_keys=[project_id])
