"""One-time backfill: add spotify_url to every saved track's match_data.

Existing tracks were saved before the Spotify enrichment was wired up, so
their match_data has no spotify_url field — the frontend "View Profile"
button falls back to Deezer. This script loops through every track, looks
up each match's Spotify URL, and patches match_data in place.

Usage:
    cd backend
    source venv/bin/activate
    python dev_backfill_spotify.py
"""

import asyncio
from sqlalchemy import select
from sqlalchemy.orm.attributes import flag_modified

from app.core.db import SessionLocal
from app.models.track import Track
from app.models.user import User  # noqa: F401  — needed so FK can resolve
from app.services.spotify_service import enrich_artist as enrich_spotify


async def main() -> None:
    if SessionLocal is None:
        print("❌ DATABASE_URL not configured.")
        return

    async with SessionLocal() as session:
        result = await session.execute(select(Track))
        tracks = result.scalars().all()
        print(f"Found {len(tracks)} tracks to scan.\n")

        updated_tracks = 0
        updated_matches = 0
        for t in tracks:
            if not isinstance(t.match_data, dict):
                continue
            raw_matches = t.match_data.get("matches")
            if not isinstance(raw_matches, list):
                continue

            track_changed = False
            for m in raw_matches:
                if not isinstance(m, dict):
                    continue
                # Skip only when BOTH spotify_url and monthly_listeners are
                # already present — older runs populated url-only and need
                # a second pass for the scraped listeners count.
                if m.get("spotify_url") and m.get("monthly_listeners") is not None:
                    continue
                artist_name = m.get("artist")
                if not artist_name:
                    continue
                enrichment = enrich_spotify(artist_name)
                touched = False
                if enrichment.get("spotify_url") and not m.get("spotify_url"):
                    m["spotify_url"] = enrichment["spotify_url"]
                    touched = True
                if enrichment.get("spotify_id") and not m.get("spotify_id"):
                    m["spotify_id"] = enrichment["spotify_id"]
                    touched = True
                if enrichment.get("monthly_listeners") is not None and m.get("monthly_listeners") is None:
                    m["monthly_listeners"] = enrichment["monthly_listeners"]
                    touched = True
                if touched:
                    track_changed = True
                    updated_matches += 1

            if track_changed:
                # JSONB columns need to be explicitly marked dirty for the
                # in-place mutation to be persisted.
                flag_modified(t, "match_data")
                updated_tracks += 1
                print(f"  ✓ Track #{t.id} ({t.filename}) — patched matches")

        await session.commit()
        print(f"\nDone. Updated {updated_matches} matches across {updated_tracks} tracks.")


if __name__ == "__main__":
    asyncio.run(main())
