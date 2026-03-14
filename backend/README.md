# CloudForge Backend

FastAPI backend for CloudForge (infra SaaS), using async SQLAlchemy + PostgreSQL.

## Tech Stack
- FastAPI, Uvicorn
- SQLAlchemy 2.x (async)
- PostgreSQL 16
- Alembic migrations
- Pydantic v2 + pydantic-settings
- JWT auth (`python-jose`) + password hashing (`passlib[bcrypt]`)
- Pytest + pytest-asyncio + pytest-cov

## Prerequisites
- Docker + Docker Compose
- Python 3.11 (if running outside containers)

## Quick Start (Docker)
```bash
cd backend
cp .env.example .env
docker compose up --build -d
```

Services:
- Backend: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- PgAdmin: `http://localhost:5050`

## PgAdmin Access
- Email/password from `.env` (`PGADMIN_EMAIL`, `PGADMIN_PASSWORD`)
- Server config:
  - Host: `postgres`
  - Port: `5432`
  - Username: `${POSTGRES_USER}`
  - Password: `${POSTGRES_PASSWORD}`
  - Database: `${POSTGRES_DB}`

## Database Commands
```bash
# Apply migrations
docker compose exec backend alembic upgrade head

# Create migration
docker compose exec backend alembic revision --autogenerate -m "message"

# Rollback one migration
docker compose exec backend alembic downgrade -1
```

## Development (without Docker)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn main:app --reload
```

## Testing
```bash
# Run all tests + coverage
./scripts/run_tests.sh

# Run specific file
python -m pytest tests/test_auth.py

# Run with coverage details
python -m pytest --cov=. --cov-report=term-missing
```

## Seed Data
```bash
# Full seed
./scripts/seed.sh full

# Minimal seed
./scripts/seed.sh minimal
```

## API Overview
Implemented domains:
- Auth: register/login/refresh/me/logout
- Projects: CRUD + list filtering/pagination/sorting
- Project files: list/content/save/download
- Terraform runs: plan/apply/destroy/cancel/retry + logs
- Health: `/health`, `/health/detailed`, `/ready`

Examples: [docs/API_EXAMPLES.md](/Users/Shared/Projects/infra_saas/backend/docs/API_EXAMPLES.md)

## Environment Variables
See `.env.example` for complete list.

Critical variables:
- `DATABASE_URL`
- `SECRET_KEY`
- `ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `REFRESH_TOKEN_EXPIRE_DAYS`
- `BACKEND_CORS_ORIGINS`
- `ENVIRONMENT`, `DEBUG`

## Project Structure
- `apis/v1/`: API routes
- `core/`: config, security, dependencies
- `db/`: session + ORM models
- `repository/`: data access layer
- `schemas/`: request/response models
- `utils/`: pagination/filter helpers
- `alembic/`: migrations
- `tests/`: async test suite
- `scripts/`: startup/test/seed scripts

## Troubleshooting
- DB connection errors: verify `DATABASE_URL`, run `docker compose ps`, then check `docker compose logs postgres`.
- Migration errors: ensure model imports exist in `db/base.py`, then re-run `alembic upgrade head`.
- Auth 401 issues: verify `Authorization: Bearer <token>` header and token expiration.
- Endpoint mismatch: frontend should target `/api/v1/*`; compatibility alias also serves `/api/*`.
