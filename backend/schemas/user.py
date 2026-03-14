from __future__ import annotations

from datetime import datetime
from uuid import UUID


from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from typing import Optional, List


# User creation schema
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=255)
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    plan: str = "free"

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Password must not be blank")
        return value


# User update schema
class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    plan: Optional[str] = None


# User response schema
class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    plan: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# User list response schema
class UserListResponse(BaseModel):
    items: List[UserResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_previous: bool
