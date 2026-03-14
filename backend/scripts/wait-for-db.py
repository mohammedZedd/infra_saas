#!/usr/bin/env python3
import argparse
import os
import sys
import time

from sqlalchemy import create_engine, text


def to_sync_url(url: str) -> str:
    if url.startswith("postgresql+asyncpg://"):
        return "postgresql://" + url[len("postgresql+asyncpg://") :]
    return url


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Wait for a database connection to become available.")
    parser.add_argument("--url", default=os.getenv("DATABASE_URL"), help="Database URL")
    parser.add_argument("--attempts", type=int, default=int(os.getenv("DB_MAX_RETRIES", "30")))
    parser.add_argument("--delay", type=float, default=float(os.getenv("DB_RETRY_DELAY", "2")))
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    database_url = args.url
    if not database_url:
        print("DATABASE_URL is not set", file=sys.stderr)
        return 1

    retries = args.attempts
    delay = args.delay

    sync_url = to_sync_url(database_url)
    print(f"Waiting for database: {sync_url}")

    for attempt in range(1, retries + 1):
        try:
            engine = create_engine(sync_url, pool_pre_ping=True)
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("Database is ready")
            return 0
        except Exception as exc:  # noqa: BLE001
            print(f"Attempt {attempt}/{retries} failed: {exc}")
            time.sleep(delay)

    print("Database is not reachable after retries", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
