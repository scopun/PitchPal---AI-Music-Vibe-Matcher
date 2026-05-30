"""Dev-only helper: wipe ALL data from users + tracks + pitches tables.

Usage:
    cd backend
    source venv/bin/activate
    python dev_reset_db.py

Reads DATABASE_URL from your .env. Asks for explicit YES confirmation
before deleting. Schema stays intact — tables are TRUNCATEd, not dropped —
so the backend doesn't need to restart afterwards.

DO NOT expose this on the web or run it from production code.
"""

import asyncio
import sys

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings
from app.core.db import _normalize_db_url


TABLES = ["pitches", "tracks", "users"]  # child → parent order (matters for CASCADE)


async def reset() -> None:
    if not settings.DATABASE_URL:
        print("❌ DATABASE_URL is not set in .env — aborting.")
        sys.exit(1)

    masked = settings.DATABASE_URL.split("@")[-1][:60] if "@" in settings.DATABASE_URL else "(local)"
    print(f"\n⚠️  About to WIPE all data from these tables on:\n   {masked}\n")
    for t in TABLES:
        print(f"   • {t}")
    print()
    confirm = input("Type 'YES' to proceed (anything else cancels): ").strip()
    if confirm != "YES":
        print("Cancelled.")
        return

    engine = create_async_engine(_normalize_db_url(settings.DATABASE_URL))
    try:
        async with engine.begin() as conn:
            # Single TRUNCATE statement with CASCADE handles FK cycles and
            # RESTART IDENTITY resets the auto-increment counters back to 1
            # so the next user/track/pitch gets id=1 again.
            await conn.execute(text(
                f"TRUNCATE TABLE {', '.join(TABLES)} RESTART IDENTITY CASCADE"
            ))
        print("\n✅ All tables wiped. Schema intact — backend keeps running normally.")
        print("   Next signup will create user id=1, first track id=1, etc.\n")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(reset())
