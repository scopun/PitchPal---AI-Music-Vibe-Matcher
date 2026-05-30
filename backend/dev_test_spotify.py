"""Dev-only sanity check: directly hits Spotify Web API with creds from .env.

Resilient version — does NOT exit on individual endpoint failures.
Tests each endpoint independently and prints a summary at the end so
we can see exactly what works and what doesn't for PitchPal's needs.

Usage:
    cd backend
    source venv/bin/activate
    python dev_test_spotify.py
"""

import sys
from base64 import b64encode

import requests

from app.core.config import settings


def print_section(title: str) -> None:
    print()
    print("─" * 60)
    print(title)
    print("─" * 60)


def main() -> int:
    results: dict[str, str] = {}

    print("\n=== Spotify account verification ===")

    cid = settings.SPOTIFY_CLIENT_ID
    csec = settings.SPOTIFY_CLIENT_SECRET

    if not cid:
        print("❌ SPOTIFY_CLIENT_ID is EMPTY — check backend/.env")
        return 1
    if not csec:
        print("❌ SPOTIFY_CLIENT_SECRET is EMPTY — check backend/.env")
        return 1

    masked_id = f"{cid[:4]}…{cid[-4:]}"
    masked_sec = f"{csec[:4]}…{csec[-4:]}"
    print(f"✓ Client ID loaded:     {masked_id}  (length {len(cid)})")
    print(f"✓ Client Secret loaded: {masked_sec}  (length {len(csec)})")

    # ───────────────────────────────────────────────────────────────────
    # Step 1: Auth
    # ───────────────────────────────────────────────────────────────────
    print_section("Step 1: Access token (Client Credentials flow)")
    auth = b64encode(f"{cid}:{csec}".encode()).decode()
    r = requests.post(
        "https://accounts.spotify.com/api/token",
        headers={"Authorization": f"Basic {auth}"},
        data={"grant_type": "client_credentials"},
        timeout=10,
    )
    if r.status_code != 200:
        print(f"❌ FAILED: HTTP {r.status_code} — {r.text}")
        return 1
    access_token = r.json()["access_token"]
    print(f"✓ Token received (expires {r.json()['expires_in']}s)")
    results["auth"] = "✅ OK"

    H = {"Authorization": f"Bearer {access_token}"}
    artist_id = None
    artist_name = None

    # ───────────────────────────────────────────────────────────────────
    # Step 2: Search
    # ───────────────────────────────────────────────────────────────────
    print_section("Step 2: Search for artist 'Drake'")
    r = requests.get(
        "https://api.spotify.com/v1/search",
        headers=H, params={"q": "Drake", "type": "artist", "limit": 1},
        timeout=10,
    )
    if r.status_code != 200:
        print(f"❌ FAILED: HTTP {r.status_code} — {r.text}")
        results["search"] = f"❌ HTTP {r.status_code}"
    else:
        items = r.json().get("artists", {}).get("items", [])
        if not items:
            print("❌ No results.")
            results["search"] = "❌ empty result"
        else:
            artist = items[0]
            artist_id = artist.get("id")
            artist_name = artist.get("name")
            print(f"✓ Found: {artist_name}  (id={artist_id})")
            print(f"   Keys: {sorted(artist.keys())}")
            print(f"   followers   = {(artist.get('followers') or {}).get('total', '❌ MISSING')}")
            print(f"   popularity  = {artist.get('popularity', '❌ MISSING')}")
            print(f"   genres      = {artist.get('genres') or '❌ MISSING'}")
            imgs = artist.get("images") or []
            print(f"   image       = {imgs[0]['url'] if imgs else '❌ MISSING'}")
            print(f"   spotify_url = {(artist.get('external_urls') or {}).get('spotify', '❌ MISSING')}")
            results["search"] = "✅ OK (slim — name/id/images/url only)"

    if not artist_id:
        print("\nCannot continue without an artist id. Exiting.")
        return 1

    # ───────────────────────────────────────────────────────────────────
    # Step 3: Direct artist fetch — THIS is where full data should be
    # ───────────────────────────────────────────────────────────────────
    print_section(f"Step 3: GET /artists/{artist_id}  (direct fetch — should have full data)")
    r = requests.get(
        f"https://api.spotify.com/v1/artists/{artist_id}",
        headers=H, timeout=10,
    )
    if r.status_code != 200:
        print(f"❌ FAILED: HTTP {r.status_code} — {r.text}")
        results["artist_direct"] = f"❌ HTTP {r.status_code}"
    else:
        a = r.json()
        print(f"✓ Keys returned: {sorted(a.keys())}")
        f_total = (a.get("followers") or {}).get("total")
        print(f"   followers   = {f'{f_total:,}' if f_total is not None else '❌ MISSING'}")
        print(f"   popularity  = {a.get('popularity', '❌ MISSING')}")
        print(f"   genres      = {a.get('genres') or '❌ MISSING'}")
        imgs = a.get("images") or []
        print(f"   image       = {imgs[0]['url'] if imgs else '❌ MISSING'}")
        print(f"   spotify_url = {(a.get('external_urls') or {}).get('spotify', '❌ MISSING')}")

        has_full = f_total is not None and a.get("popularity") is not None and a.get("genres")
        results["artist_direct"] = "✅ OK (full data)" if has_full else "⚠️ partial"

    # ───────────────────────────────────────────────────────────────────
    # Step 4: Top tracks
    # ───────────────────────────────────────────────────────────────────
    print_section(f"Step 4: GET /artists/{artist_id}/top-tracks")
    r = requests.get(
        f"https://api.spotify.com/v1/artists/{artist_id}/top-tracks",
        headers=H, params={"market": "US"}, timeout=10,
    )
    if r.status_code != 200:
        print(f"❌ FAILED: HTTP {r.status_code} — {r.text}")
        results["top_tracks"] = f"❌ HTTP {r.status_code}"
    else:
        tracks = r.json().get("tracks", [])[:3]
        if not tracks:
            print("❌ Empty list.")
            results["top_tracks"] = "❌ empty"
        else:
            for i, t in enumerate(tracks, 1):
                print(f"   {i}. {t.get('name')}  (popularity: {t.get('popularity')})")
            results["top_tracks"] = "✅ OK"

    # ───────────────────────────────────────────────────────────────────
    # Step 5: Albums
    # ───────────────────────────────────────────────────────────────────
    print_section(f"Step 5: GET /artists/{artist_id}/albums")
    r = requests.get(
        f"https://api.spotify.com/v1/artists/{artist_id}/albums",
        headers=H, params={"include_groups": "album", "limit": 3, "market": "US"},
        timeout=10,
    )
    if r.status_code != 200:
        print(f"❌ FAILED: HTTP {r.status_code} — {r.text}")
        results["albums"] = f"❌ HTTP {r.status_code}"
    else:
        body = r.json()
        total = body.get("total", 0)
        items = body.get("items", [])[:3]
        print(f"✓ Total albums: {total}")
        for i, a in enumerate(items, 1):
            print(f"   {i}. {a.get('name')}  ({a.get('release_date')})")
        results["albums"] = f"✅ OK (total={total})"

    # ───────────────────────────────────────────────────────────────────
    # Step 6: Top tracks WITHOUT market param (try variants)
    # ───────────────────────────────────────────────────────────────────
    print_section(f"Step 6: top-tracks variations")
    for market in ["GB", "ES", None]:
        params = {"market": market} if market else {}
        label = f"market={market}" if market else "no market param"
        r = requests.get(
            f"https://api.spotify.com/v1/artists/{artist_id}/top-tracks",
            headers=H, params=params, timeout=10,
        )
        print(f"  [{label}] → HTTP {r.status_code}", end="")
        if r.status_code == 200:
            t = r.json().get("tracks", [])
            print(f" ({len(t)} tracks)")
        else:
            print(f" — {r.text[:80]}")

    # ───────────────────────────────────────────────────────────────────
    # Step 7: Get a single TRACK directly (different from top-tracks)
    # ───────────────────────────────────────────────────────────────────
    # Pull a track ID from albums we already fetched
    print_section("Step 7: GET /albums/{id}  (album detail with full track list)")
    # Re-fetch first album to grab a track
    r = requests.get(
        f"https://api.spotify.com/v1/artists/{artist_id}/albums",
        headers=H, params={"include_groups": "album", "limit": 1, "market": "US"},
        timeout=10,
    )
    sample_track_id = None
    if r.status_code == 200:
        items = r.json().get("items", [])
        if items:
            album_id = items[0]["id"]
            album_name = items[0]["name"]
            print(f"  Fetching album '{album_name}' (id={album_id})...")
            r = requests.get(
                f"https://api.spotify.com/v1/albums/{album_id}",
                headers=H, timeout=10,
            )
            if r.status_code == 200:
                album = r.json()
                print(f"  ✓ Album keys: {sorted(album.keys())}")
                print(f"     name        = {album.get('name')}")
                print(f"     release     = {album.get('release_date')}")
                print(f"     total_tracks= {album.get('total_tracks')}")
                print(f"     label       = {album.get('label', '❌ MISSING')}")
                print(f"     popularity  = {album.get('popularity', '❌ MISSING')}")
                print(f"     genres      = {album.get('genres', '❌ MISSING')}")
                tracks = album.get("tracks", {}).get("items", [])
                if tracks:
                    sample_track_id = tracks[0].get("id")
                    print(f"     first track = {tracks[0].get('name')} (id={sample_track_id})")
                results["album_detail"] = "✅ OK"
            else:
                print(f"  ❌ Album fetch FAILED: HTTP {r.status_code} — {r.text[:100]}")
                results["album_detail"] = f"❌ HTTP {r.status_code}"

    # ───────────────────────────────────────────────────────────────────
    # Step 8: Get a single TRACK
    # ───────────────────────────────────────────────────────────────────
    if sample_track_id:
        print_section(f"Step 8: GET /tracks/{sample_track_id}")
        r = requests.get(
            f"https://api.spotify.com/v1/tracks/{sample_track_id}",
            headers=H, timeout=10,
        )
        if r.status_code != 200:
            print(f"❌ FAILED: HTTP {r.status_code} — {r.text}")
            results["track_detail"] = f"❌ HTTP {r.status_code}"
        else:
            t = r.json()
            print(f"✓ Track keys: {sorted(t.keys())}")
            print(f"   name        = {t.get('name')}")
            print(f"   duration_ms = {t.get('duration_ms')}")
            print(f"   explicit    = {t.get('explicit')}")
            print(f"   popularity  = {t.get('popularity', '❌ MISSING')}")
            print(f"   preview_url = {t.get('preview_url', '❌ MISSING')}")
            print(f"   spotify_url = {(t.get('external_urls') or {}).get('spotify', '❌ MISSING')}")
            print(f"   markets     = {len(t.get('available_markets') or [])} countries")
            results["track_detail"] = "✅ OK"

    # ───────────────────────────────────────────────────────────────────
    # Step 9: Get Several Artists batch (more efficient for production)
    # ───────────────────────────────────────────────────────────────────
    print_section("Step 9: GET /artists?ids=...  (batch lookup)")
    r = requests.get(
        "https://api.spotify.com/v1/artists",
        headers=H, params={"ids": f"{artist_id},06HL4z0CvFAxyc27GXpf02"},  # Drake, Taylor Swift
        timeout=10,
    )
    if r.status_code != 200:
        print(f"❌ FAILED: HTTP {r.status_code} — {r.text}")
        results["artists_batch"] = f"❌ HTTP {r.status_code}"
    else:
        artists = r.json().get("artists", [])
        print(f"✓ Got {len(artists)} artists")
        for a in artists:
            f_total = (a.get("followers") or {}).get("total")
            print(f"   • {a.get('name'):20s} followers={f_total} popularity={a.get('popularity')} genres={a.get('genres')}")
        results["artists_batch"] = "✅ OK"

    # ───────────────────────────────────────────────────────────────────
    # Step 10: Available markets + genre seeds
    # ───────────────────────────────────────────────────────────────────
    print_section("Step 10: GET /markets + /recommendations/available-genre-seeds")
    r = requests.get("https://api.spotify.com/v1/markets", headers=H, timeout=10)
    print(f"  /markets → HTTP {r.status_code}", end="")
    if r.status_code == 200:
        print(f" ({len(r.json().get('markets', []))} country codes)")
        results["markets"] = "✅ OK"
    else:
        print(f" — {r.text[:100]}")
        results["markets"] = f"❌ HTTP {r.status_code}"

    r = requests.get(
        "https://api.spotify.com/v1/recommendations/available-genre-seeds",
        headers=H, timeout=10,
    )
    print(f"  /genre-seeds → HTTP {r.status_code}", end="")
    if r.status_code == 200:
        print(f" ({len(r.json().get('genres', []))} genres)")
        results["genre_seeds"] = "✅ OK"
    else:
        print(f" — {r.text[:100]}")
        results["genre_seeds"] = f"❌ HTTP {r.status_code}"

    # ───────────────────────────────────────────────────────────────────
    # Final summary
    # ───────────────────────────────────────────────────────────────────
    print()
    print("=" * 60)
    print("SUMMARY — what works on this Spotify dev account:")
    print("=" * 60)
    for k, v in results.items():
        print(f"  {k:18s} {v}")
    print("=" * 60)

    return 0


if __name__ == "__main__":
    sys.exit(main())
