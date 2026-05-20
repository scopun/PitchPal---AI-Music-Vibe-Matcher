"""Dev-only helper: delete a user by email so you can re-test signup.

Usage:
    cd backend
    source venv/bin/activate
    python dev_delete_user.py user@example.com

Reads DATABASE_URL from your .env (same one the app uses).
DO NOT deploy or expose this on the web.
"""

import asyncio
import sys

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings
from app.core.db import _normalize_db_url


async def delete_user(email: str) -> None:
    if not settings.DATABASE_URL:
        print("DATABASE_URL is not set in .env — aborting.")
        sys.exit(1)

    engine = create_async_engine(_normalize_db_url(settings.DATABASE_URL))
    try:
        async with engine.begin() as conn:
            result = await conn.execute(
                text("DELETE FROM users WHERE lower(email) = lower(:email)"),
                {"email": email},
            )
            print(f"Deleted {result.rowcount} user(s) matching '{email}'.")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python dev_delete_user.py <email>")
        sys.exit(1)
    asyncio.run(delete_user(sys.argv[1]))
