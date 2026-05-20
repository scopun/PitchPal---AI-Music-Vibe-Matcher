"""Deezer API enrichment — fetches artist image, fan count, album count.

Deezer's public API requires NO authentication for these endpoints. We cache
results in memory for 24 hours to stay well under their rate limits
(50 requests per 5 seconds per IP).

Why Deezer instead of Spotify: as of late 2024, Spotify requires the
developer account owner to have a Premium subscription to make Web API
calls in development mode. Deezer has no such restriction and exposes
artist images + fan counts + album counts on its public API.
"""

import sys
import time
from typing import Any, Optional

import requests


def _emit(msg: str) -> None:
    """Always-visible stdout/stderr log line, independent of logger setup."""
    print(f"[deezer] {msg}", file=sys.stderr, flush=True)


_ARTIST_CACHE_TTL = 24 * 60 * 60  # 24 hours
_NEGATIVE_CACHE_TTL = 60 * 60     # 1 hour — re-try unknown names sooner
_artist_cache: dict[str, dict[str, Any]] = {}
_artist_cache_expires: dict[str, float] = {}
_startup_logged = False


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
    deezer_id (int|None).
    Returns {} if the API call fails or the artist can't be found.
    """
    global _startup_logged
    if not _startup_logged:
        _startup_logged = True
        _emit("active — public Deezer API (no auth required)")

    if not name or not name.strip():
        return {}

    key = name.strip().lower()
    cached = _cache_get(key)
    if cached is not None:
        return cached

    # Fetch top 5 results so we can pick the most-popular match by fan count
    # — Deezer search sometimes returns less-famous artists ahead of the real
    # ones when they share a name.
    try:
        resp = requests.get(
            "https://api.deezer.com/search/artist",
            params={"q": name.strip(), "limit": 5},
            timeout=10,
        )
    except Exception as exc:  # noqa: BLE001
        _emit(f"search EXCEPTION for {name!r}: {exc}")
        return {}

    if resp.status_code != 200:
        _emit(f"search FAILED for {name!r} status={resp.status_code} body={resp.text[:200]}")
        return {}

    payload = resp.json()
    items = payload.get("data") or []

    if not items:
        _emit(f"no results for {name!r}")
        _cache_set(key, {}, _NEGATIVE_CACHE_TTL)
        return {}

    # Prefer the result whose name matches (case-insensitive) AND has the most
    # fans. This handles the "minor artist with same name" case cleanly.
    target = name.strip().lower()

    def _name_score(a: dict[str, Any]) -> tuple[int, int]:
        a_name = (a.get("name") or "").strip().lower()
        exact = 2 if a_name == target else 1 if target in a_name or a_name in target else 0
        return (exact, int(a.get("nb_fan") or 0))

    items_sorted = sorted(items, key=_name_score, reverse=True)
    artist = items_sorted[0]

    # Deezer returns several size variants of the artist photo. Prefer the
    # largest (1000x1000) so it stays crisp at any UI size.
    image_url = (
        artist.get("picture_xl")
        or artist.get("picture_big")
        or artist.get("picture_medium")
        or artist.get("picture")
    )
    # Deezer uses md5("") = d41d8cd98f00b204e9800998ecf8427e as the "no image"
    # placeholder. Treat it as a missing image so the UI falls back to a real
    # placeholder instead of showing a generic grey square.
    if image_url and "d41d8cd98f00b204e9800998ecf8427e" in image_url:
        image_url = None

    result: dict[str, Any] = {
        "artist_image": image_url,
        "followers": artist.get("nb_fan"),
        "albums_count": artist.get("nb_album"),
        "deezer_id": artist.get("id"),
    }
    _cache_set(key, result, _ARTIST_CACHE_TTL)
    _emit(
        f"enriched {name!r}: fans={artist.get('nb_fan')} "
        f"albums={artist.get('nb_album')} image={'yes' if image_url else 'no'}"
    )
    return result
