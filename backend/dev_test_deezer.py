"""Dev-only sanity check: hits Deezer's public API directly.

Usage:
    cd backend
    source venv/bin/activate
    python dev_test_deezer.py

No credentials needed — Deezer's search endpoint is public.
"""

from app.services.deezer_service import enrich_artist


def main() -> None:
    print("\n=== Deezer integration sanity check (no auth required) ===\n")

    test_artists = ["Drake", "Joel Corry", "Morgan Wallen", "Tom Grennan", "Hardy"]
    for artist in test_artists:
        print(f"→ Enriching {artist!r}...")
        result = enrich_artist(artist)
        if not result:
            print(f"  ❌ Empty result.")
        else:
            print(f"  ✓ followers     = {result.get('followers')}")
            print(f"  ✓ albums_count  = {result.get('albums_count')}")
            print(f"  ✓ artist_image  = {result.get('artist_image')}")
            print(f"  ✓ deezer_id     = {result.get('deezer_id')}")
        print()


if __name__ == "__main__":
    main()
