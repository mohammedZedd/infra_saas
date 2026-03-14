from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.deps import get_current_active_user
from core.hashing import verify_password
from core.security import TokenExpiredError, TokenInvalidError, create_access_token, create_refresh_token, decode_token
from db.session import get_db
from repository.user import create_user, get_user_by_email, update_user
from schemas.common import MessageResponse
from schemas.token import AuthResponse, AuthUser, LoginRequest, RefreshTokenRequest, RefreshTokenResponse
from schemas.user import UserCreate, UserUpdate

router = APIRouter(prefix="/auth", tags=["auth"])


def _auth_user_from_model(user) -> AuthUser:
    return AuthUser(
        id=user.id,
        email=user.email,
        name=user.full_name,
        username=user.username,
        avatar_url=user.avatar_url,
        avatar=user.avatar_url,
        plan="free",
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new account and return access/refresh tokens.",
    responses={400: {"description": "Email already registered"}, 422: {"description": "Validation error"}},
)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="An account with this email already exists")

    user = await create_user(db, user_in)
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    return AuthResponse(
        token=access_token,
        accessToken=access_token,
        refreshToken=refresh_token,
        user=_auth_user_from_model(user),
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Authenticate user",
    description="Authenticate with email/password and return access/refresh tokens.",
    responses={401: {"description": "Invalid credentials"}, 403: {"description": "Inactive account"}},
)
async def login(credentials: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await get_user_by_email(db, credentials.email)
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")

    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    return AuthResponse(
        token=access_token,
        accessToken=access_token,
        refreshToken=refresh_token,
        user=_auth_user_from_model(user),
    )


@router.post(
    "/refresh",
    response_model=RefreshTokenResponse,
    summary="Refresh JWT tokens",
    description="Exchange a valid refresh token for a new token pair.",
    responses={401: {"description": "Invalid or expired refresh token"}},
)
async def refresh_token(payload: RefreshTokenRequest):
    try:
        decoded = decode_token(payload.refreshToken)
    except (TokenExpiredError, TokenInvalidError) as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))

    if decoded.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    subject = decoded.get("sub")
    if not subject:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    new_access = create_access_token(subject=subject)
    new_refresh = create_refresh_token(subject=subject)
    return RefreshTokenResponse(accessToken=new_access, refreshToken=new_refresh)


@router.get(
    "/me",
    response_model=dict[str, AuthUser],
    summary="Get current user profile",
    description="Return profile of authenticated user.",
    responses={401: {"description": "Unauthorized"}},
)
async def me(current_user=Depends(get_current_active_user)):
    return {"user": _auth_user_from_model(current_user)}


@router.put(
    "/me",
    response_model=AuthUser,
    summary="Update current user profile",
    description="Update editable fields of authenticated user.",
    responses={401: {"description": "Unauthorized"}, 404: {"description": "User not found"}},
)
async def update_me(
    payload: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    updated = await update_user(db, current_user.id, payload)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return _auth_user_from_model(updated)


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Logout user",
    description="Stateless logout endpoint; kept for frontend compatibility.",
    responses={401: {"description": "Unauthorized"}},
)
async def logout(_: object = Depends(get_current_active_user)):
    return MessageResponse(message="Logged out")
