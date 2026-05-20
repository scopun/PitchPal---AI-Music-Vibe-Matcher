"""Dev-only sanity check: hits Spotify directly with the creds from .env.

Usage:
    cd backend
    source venv/bin/activate
    python dev_test_spotify.py

Prints each step so you can pinpoint exactly where the integration breaks.
"""

import sys

from app.core.config import settings
from app.services.spotify_service import enrich_artist


def main() -> None:
    print("\n=== Spotify integration sanity check ===\n")

    cid = settings.SPOTIFY_CLIENT_ID
    csec = settings.SPOTIFY_CLIENT_SECRET

    if not cid:
        print("❌ SPOTIFY_CLIENT_ID is EMPTY — check backend/.env")
        sys.exit(1)
    if not csec:
        print("❌ SPOTIFY_CLIENT_SECRET is EMPTY — check backend/.env")
        sys.exit(1)

    masked_id = f"{cid[:4]}…{cid[-4:]}" if len(cid) > 8 else "(short)"
    masked_sec = f"{csec[:4]}…{csec[-4:]}" if len(csec) > 8 else "(short)"
    print(f"✓ Client ID loaded:     {masked_id}  (length {len(cid)})")
    print(f"✓ Client Secret loaded: {masked_sec}  (length {len(csec)})")
    print()

    test_artists = ["Drake", "Joel Corry", "Morgan Wallen"]
    for artist in test_artists:
        print(f"→ Enriching {artist!r}...")
        result = enrich_artist(artist)
        if not result:
            print(f"  ❌ Empty result. Spotify either failed or didn't find this artist.")
        else:
            print(f"  ✓ followers     = {result.get('followers')}")
            print(f"  ✓ albums_count  = {result.get('albums_count')}")
            print(f"  ✓ artist_image  = {result.get('artist_image')}")
            print(f"  ✓ spotify_id    = {result.get('spotify_id')}")
        print()


if __name__ == "__main__":
    main()
