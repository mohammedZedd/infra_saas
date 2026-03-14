#!/usr/bin/env bash
set -euo pipefail

python /app/scripts/wait-for-db.py

alembic upgrade head

exec uvicorn main:app --host 0.0.0.0 --port "${BACKEND_INTERNAL_PORT:-8000}" --reload
