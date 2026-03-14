from __future__ import annotations

from datetime import datetime, timezone
from time import perf_counter

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from apis.v1.base import api_router
from core.config import settings
from db.session import AsyncSessionLocal, engine

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="CloudForge API",
    version=settings.APP_VERSION,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(o) for o in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)
# Backward compatibility for clients calling /api/* instead of /api/v1/*.
if settings.API_V1_PREFIX != "/api":
    app.include_router(api_router, prefix="/api")


@app.on_event("startup")
async def on_startup() -> None:
    # Startup hook kept for future boot checks and warmups.
    return None


@app.on_event("shutdown")
async def on_shutdown() -> None:
    await engine.dispose()


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


@app.exception_handler(Exception)
async def generic_exception_handler(_: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": str(exc)})


@app.get("/")
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "openapi": f"{settings.API_V1_PREFIX}/openapi.json",
    }


@app.get("/health", tags=["health"])
async def health_check():
    db_ok = False
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
            db_ok = True
    except Exception:
        db_ok = False

    return {
        "status": "ok" if db_ok else "degraded",
        "database": "up" if db_ok else "down",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": settings.APP_VERSION,
    }


@app.get("/health/detailed", tags=["health"])
async def health_detailed():
    checks: dict[str, dict[str, object]] = {
        "database": {"status": "down", "response_time_ms": None},
        "migrations": {"status": "down"},
    }
    overall = "degraded"

    try:
        started = perf_counter()
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
            elapsed = (perf_counter() - started) * 1000
            checks["database"] = {"status": "up", "response_time_ms": round(elapsed, 2)}

            # Consider app healthy if alembic table exists and has at least one version.
            version = await session.execute(text("SELECT version_num FROM alembic_version LIMIT 1"))
            checks["migrations"] = {"status": "up" if version.scalar_one_or_none() else "down"}
            overall = "ok" if checks["migrations"]["status"] == "up" else "degraded"
    except Exception as exc:
        checks["database"] = {"status": "down", "error": str(exc)}

    return {
        "status": overall,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": settings.APP_VERSION,
        "checks": checks,
    }


@app.get("/ready", tags=["health"])
async def readiness_check():
    ready = False
    reason = "database unavailable"
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
            version = await session.execute(text("SELECT version_num FROM alembic_version LIMIT 1"))
            if version.scalar_one_or_none():
                ready = True
                reason = "ready"
            else:
                reason = "migrations not applied"
    except Exception as exc:
        reason = str(exc)

    return {
        "ready": ready,
        "reason": reason,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": settings.APP_VERSION,
    }
