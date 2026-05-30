"""User analytics — aggregations for the Analytics tab.

Returns the five metrics Ciara asked for:
  1. songs_processed       — total tracks the user has uploaded
  2. songs_pitched         — distinct tracks the user has pitched at least once
  3. artists_covered       — unique artists shown across all match screens
  4. top_genre             — most frequent detected_genre on the user's tracks
  5. top_pitched_artists   — most-pitched artist names
"""

from collections import Counter
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth import get_current_user
from app.core.db import get_session
from app.models.track import Pitch, Track
from app.models.user import User

router = APIRouter()


@router.get("/analytics")
async def get_user_analytics(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    # 1. Songs processed — simple count.
    songs_processed = (
        await session.execute(
            select(func.count(Track.id)).where(Track.user_id == current_user.id)
        )
    ).scalar_one()

    # 2. Songs pitched — distinct tracks the user has pitched.
    songs_pitched = (
        await session.execute(
            select(func.count(func.distinct(Pitch.track_id))).where(
                Pitch.user_id == current_user.id
            )
        )
    ).scalar_one()

    # 3 & 4. Iterate this user's tracks once to pull artist names out of
    # match_data and top-detected-genres. This is fine for typical user
    # sizes; we can paginate / materialise later if needed.
    tracks_q = select(Track).where(Track.user_id == current_user.id)
    tracks = (await session.execute(tracks_q)).scalars().all()

    artists_covered: set[str] = set()
    genre_counter: Counter[str] = Counter()

    for t in tracks:
        if t.detected_genre:
            genre_counter[t.detected_genre.strip()] += 1
        if isinstance(t.match_data, dict):
            raw_matches = t.match_data.get("matches")
            if isinstance(raw_matches, list):
                for m in raw_matches:
                    if isinstance(m, dict):
                        name = m.get("artist")
                        if isinstance(name, str) and name.strip():
                            artists_covered.add(name.strip().lower())

    top_genre, top_genre_count = (genre_counter.most_common(1)[0] if genre_counter else (None, 0))

    # 5. Top pitched artists — group by artist_name.
    pitches_q = (
        select(Pitch.artist_name, func.count(Pitch.id).label("c"))
        .where(Pitch.user_id == current_user.id)
        .group_by(Pitch.artist_name)
        .order_by(func.count(Pitch.id).desc())
        .limit(5)
    )
    rows = (await session.execute(pitches_q)).all()
    top_pitched_artists = [{"artist": r[0], "count": int(r[1])} for r in rows]

    return {
        "songs_processed": int(songs_processed or 0),
        "songs_pitched": int(songs_pitched or 0),
        "artists_covered": len(artists_covered),
        "top_genre": top_genre,
        "top_genre_count": int(top_genre_count),
        "top_pitched_artists": top_pitched_artists,
    }
