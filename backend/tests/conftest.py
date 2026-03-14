from __future__ import annotations

import os
import uuid
from collections.abc import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from db.base_class import Base
from db.session import get_db
from main import app
from repository.user import create_user
from schemas.user import UserCreate
from db.models.user import User

TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://cloudforge:cloudforge_dev_password@postgres:5432/cloudforge",
)

engine_test = create_async_engine(TEST_DATABASE_URL, future=True, pool_pre_ping=False, poolclass=NullPool)
TestSessionLocal = async_sessionmaker(engine_test, class_=AsyncSession, expire_on_commit=False)


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_db() -> AsyncGenerator[None, None]:
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine_test.dispose()


@pytest_asyncio.fixture(scope="function", autouse=True)
async def reset_test_db() -> AsyncGenerator[None, None]:
    table_names = [f'"{table.name}"' for table in Base.metadata.sorted_tables]
    if table_names:
        async with engine_test.begin() as conn:
            await conn.execute(text(f"TRUNCATE TABLE {', '.join(table_names)} RESTART IDENTITY CASCADE"))
    yield


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with TestSessionLocal() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture(scope="function")
async def client() -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with TestSessionLocal() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.fixture
def user_payload() -> dict[str, str]:
    seed = uuid.uuid4().hex[:8]
    return {
        "email": f"test_{seed}@example.com",
        "password": "Password123!",
        "full_name": "Test User",
    }


@pytest_asyncio.fixture
async def created_user(db_session: AsyncSession, user_payload: dict[str, str]):
    user = await create_user(db_session, UserCreate(**user_payload))
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def auth_tokens(client: AsyncClient, user_payload: dict[str, str]) -> dict[str, str]:
    register = await client.post("/api/v1/auth/register", json=user_payload)
    assert register.status_code == 201
    body = register.json()
    return {
        "access": body["accessToken"],
        "refresh": body["refreshToken"],
        "email": user_payload["email"],
        "password": user_payload["password"],
    }


@pytest_asyncio.fixture
async def auth_client(client: AsyncClient, auth_tokens: dict[str, str]) -> AsyncClient:
    client.headers.update({"Authorization": f"Bearer {auth_tokens['access']}"})
    return client


@pytest_asyncio.fixture
async def second_auth_client(client: AsyncClient) -> AsyncClient:
    seed = uuid.uuid4().hex[:8]
    payload = {
        "email": f"other_{seed}@example.com",
        "password": "Password123!",
        "full_name": "Other User",
    }
    register = await client.post("/api/v1/auth/register", json=payload)
    assert register.status_code == 201
    token = register.json()["accessToken"]

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        ac.headers.update({"Authorization": f"Bearer {token}"})
        yield ac


@pytest_asyncio.fixture
async def admin_auth_client(client: AsyncClient) -> AsyncGenerator[AsyncClient, None]:
    seed = uuid.uuid4().hex[:8]
    payload = {
        "email": f"admin_{seed}@example.com",
        "password": "Password123!",
        "full_name": "Admin User",
    }
    register = await client.post("/api/v1/auth/register", json=payload)
    assert register.status_code == 201
    token = register.json()["accessToken"]

    async with TestSessionLocal() as db:
        admin_user = await db.scalar(select(User).where(User.email == payload["email"]))
        if admin_user:
            admin_user.is_superuser = True
            await db.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        ac.headers.update({"Authorization": f"Bearer {token}"})
        yield ac
