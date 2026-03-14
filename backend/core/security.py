from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Union

from jose import JWTError, ExpiredSignatureError, jwt

from core.config import settings


class TokenExpiredError(ValueError):
    pass


class TokenInvalidError(ValueError):
    pass


def _encode_token(subject: Any, expires_delta: timedelta, token_type: str) -> str:
    now = datetime.now(timezone.utc)
    payload: Dict[str, Any] = {
        "sub": str(subject),
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_access_token(subject: Any, expires_delta: Optional[timedelta] = None) -> str:
    delta = expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return _encode_token(subject=subject, expires_delta=delta, token_type="access")


def create_refresh_token(subject: Any, expires_delta: Optional[timedelta] = None) -> str:
    delta = expires_delta or timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return _encode_token(subject=subject, expires_delta=delta, token_type="refresh")


def decode_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except ExpiredSignatureError as exc:
        raise TokenExpiredError("Token has expired") from exc
    except JWTError as exc:
        raise TokenInvalidError("Token is invalid") from exc

    if "sub" not in payload:
        raise TokenInvalidError("Token payload is missing 'sub'")
    return payload
