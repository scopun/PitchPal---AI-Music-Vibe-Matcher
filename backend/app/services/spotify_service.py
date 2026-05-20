"""Spotify Web API enrichment — fetches artist image, followers, album counts.

Uses the client_credentials flow (no user auth) so it can run server-side.
Caches results in memory for 24 hours per artist to stay well under rate limits.

If SPOTIFY_CLIENT_ID/SECRET are not configured, every call returns an empty dict
and the rest of the app degrades gracefully (no images, "—" for stats).
"""

import logging
import sys
import time
from typing import Any, Optional

import requests

from app.core.config import settings

logger = logging.getLogger(__name__)


def _emit(msg: str) -> None:
    """Print to stdout so logs are always visible, regardless of logger setup."""
    print(f"[spotify] {msg}", file=sys.stderr, flush=True)


# Token cache — refreshed on demand when expired.
_token: Optional[str] = None
_token_expires_at: float = 0.0
_startup_logged = False

# Artist enrichment cache — keyed by lowercased artist name.
_ARTIST_CACHE_TTL = 24 * 60 * 60  # 24 hours
_NEGATIVE_CACHE_TTL = 60 * 60     # 1 hour — re-try names we couldn't find sooner
_artist_cache: dict[str, dict[str, Any]] = {}
_artist_cache_expires: dict[str, float] = {}


def _is_configured() -> bool:
    return bool(settings.SPOTIFY_CLIENT_ID and settings.SPOTIFY_CLIENT_SECRET)


def _get_access_token() -> Optional[str]:
    global _token, _token_expires_at, _startup_logged

    if not _startup_logged:
        _startup_logged = True
        if _is_configured():
            cid = settings.SPOTIFY_CLIENT_ID
            masked = f"{cid[:4]}…{cid[-4:]}" if len(cid) > 8 else "(short)"
            _emit(f"configured ✓ — client id {masked}")
        else:
            _emit("NOT configured ✗ — SPOTIFY_CLIENT_ID/SECRET missing in .env")

    if _token and time.time() < _token_expires_at:
        return _token

    if not _is_configured():
        return None

    try:
        resp = requests.post(
            "https://accounts.spotify.com/api/token",
            data={"grant_type": "client_credentials"},
            auth=(settings.SPOTIFY_CLIENT_ID, settings.SPOTIFY_CLIENT_SECRET),
            timeout=10,
        )
    except Exception as exc:  # noqa: BLE001
        _emit(f"token request EXCEPTION: {exc}")
        return None

    if resp.status_code != 200:
        _emit(f"token request FAILED status={resp.status_code} body={resp.text[:200]}")
        return None

    payload = resp.json()
    _token = payload.get("access_token")
    if not _token:
        _emit(f"token response missing access_token: {payload}")
        return None
    # Refresh 60 seconds before actual expiry to avoid edge cases.
    _token_expires_at = time.time() + max(0, int(payload.get("expires_in", 3600)) - 60)
    _emit("access token obtained ✓")
    return _token


def _cache_get(key: str) -> Optional[dict[str, Any]]:
    if key in _artist_cache and time.time() < _artist_cache_expires.get(key, 0):
        return _artist_cache[key]
    return None


def _cache_set(key: str, value: dict[str, Any], ttl: int) -> None:
    _artist_cache[key] = value
    _artist_cache_expires[key] = time.time() + ttl


def enrich_artist(name: str) -> dict[str, Any]:
    """Return enrichment dict for an artist name.

    Keys: artist_image (str|None), followers (int|None), albums_count (int|None),
    spotify_id (str|None), genres (list[str]|None), popularity (int|None).
    Returns {} if Spotify isn't configured or the artist can't be found.
    """
    if not name or not name.strip():
        return {}

    key = name.strip().lower()
    cached = _cache_get(key)
    if cached is not None:
        return cached

    token = _get_access_token()
    if not token:
        return {}

    headers = {"Authorization": f"Bearer {token}"}

    # Step 1: search for the artist by name
    try:
        search_resp = requests.get(
            "https://api.spotify.com/v1/search",
            params={"q": name.strip(), "type": "artist", "limit": 1},
            headers=headers,
            timeout=10,
        )
    except Exception as exc:  # noqa: BLE001
        _emit(f"search EXCEPTION for {name!r}: {exc}")
        return {}

    if search_resp.status_code != 200:
        _emit(f"search FAILED for {name!r} status={search_resp.status_code} body={search_resp.text[:200]}")
        return {}

    items = search_resp.json().get("artists", {}).get("items", []) or []

    if not items:
        _emit(f"search returned 0 results for {name!r}")
        # Negative cache so we don't hammer the API for unknown names.
        _cache_set(key, {}, _NEGATIVE_CACHE_TTL)
        return {}

    artist = items[0]
    spotify_id = artist.get("id")
    followers = (artist.get("followers") or {}).get("total")
    popularity = artist.get("popularity")
    genres = artist.get("genres") or []
    images = artist.get("images") or []
    image_url = images[0].get("url") if images else None

    # Step 2: count albums (singles/EPs excluded — "album" group only)
    albums_count: Optional[int] = None
    if spotify_id:
        try:
            albums_resp = requests.get(
                f"https://api.spotify.com/v1/artists/{spotify_id}/albums",
                params={"include_groups": "album", "limit": 50, "market": "US"},
                headers=headers,
                timeout=10,
            )
            albums_resp.raise_for_status()
            albums_data = albums_resp.json()
            albums_count = albums_data.get("total")
            if albums_count is None and isinstance(albums_data.get("items"), list):
                albums_count = len(albums_data["items"])
        except Exception as exc:  # noqa: BLE001
            logger.warning("Spotify albums fetch failed for %r: %s", name, exc)

    result: dict[str, Any] = {
        "artist_image": image_url,
        "followers": followers,
        "albums_count": albums_count,
        "spotify_id": spotify_id,
        "genres": genres,
        "popularity": popularity,
    }
    _cache_set(key, result, _ARTIST_CACHE_TTL)
    _emit(f"enriched {name!r}: followers={followers} albums={albums_count} image={'yes' if image_url else 'no'}")
    return result
