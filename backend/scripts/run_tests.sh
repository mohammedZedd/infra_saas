#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

export ENVIRONMENT=test
export DEBUG=false
export TEST_DATABASE_URL="${TEST_DATABASE_URL:-postgresql+asyncpg://cloudforge:cloudforge_dev_password@postgres:5432/cloudforge}"

if command -v docker >/dev/null 2>&1; then
  docker compose up -d postgres >/dev/null
fi

if [[ -x .venv/bin/python ]]; then
  PYTHON=.venv/bin/python
else
  PYTHON=python
fi

$PYTHON scripts/wait-for-db.py --url "$TEST_DATABASE_URL" --attempts 30 --delay 2
$PYTHON -m pytest
