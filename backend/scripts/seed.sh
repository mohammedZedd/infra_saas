#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

SCENARIO="${1:-full}"

if [[ -x .venv/bin/python ]]; then
  PYTHON=.venv/bin/python
else
  PYTHON=python
fi

echo "[seed] waiting for database"
$PYTHON scripts/wait-for-db.py

echo "[seed] running migrations"
$PYTHON -m alembic upgrade head

echo "[seed] seeding scenario=$SCENARIO"
$PYTHON scripts/seed_data.py --scenario "$SCENARIO"

echo "[seed] done"
