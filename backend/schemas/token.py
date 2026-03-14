from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Optional


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)



class RefreshTokenRequest(BaseModel):
    refreshToken: str


# AuthUser model used in AuthResponse
class AuthUser(BaseModel):
    id: UUID
    email: EmailStr
    name: str
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    avatar: Optional[str] = None
    plan: str = "free"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AuthResponse(BaseModel):
    token: str
    accessToken: str
    refreshToken: str
    tokenType: str = "bearer"
    user: AuthUser


class RefreshTokenResponse(BaseModel):
    accessToken: str
    refreshToken: str


class TokenPayload(BaseModel):
    sub: str
    type: str
    exp: int
    iat: int
