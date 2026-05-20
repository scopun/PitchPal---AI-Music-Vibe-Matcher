from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth import get_current_user
from app.core.db import get_session
from app.models.track import Pitch, Track
from app.models.user import User
from app.schemas.track import PitchCreateRequest, PitchResponse

router = APIRouter()


def _to_response(pitch: Pitch, track_filename: str | None) -> PitchResponse:
    return PitchResponse(
        id=pitch.id,
        track_id=pitch.track_id,
        track_filename=track_filename,
        artist_name=pitch.artist_name,
        artist_image=pitch.artist_image,
        label=pitch.label,
        territory=pitch.territory,
        source=pitch.source,
        final_score=pitch.final_score,
        confidence_level=pitch.confidence_level,
        status=pitch.status,
        created_at=pitch.created_at,
    )


@router.get("/pitches", response_model=list[PitchResponse])
async def list_pitches(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[PitchResponse]:
    result = await session.execute(
        select(Pitch, Track.filename)
        .join(Track, Pitch.track_id == Track.id)
        .where(Pitch.user_id == current_user.id)
        .order_by(Pitch.created_at.desc())
    )
    rows = result.all()
    return [_to_response(pitch, filename) for pitch, filename in rows]


@router.post("/pitches", response_model=PitchResponse, status_code=status.HTTP_201_CREATED)
async def create_pitch(
    payload: PitchCreateRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> PitchResponse:
    track = await session.get(Track, payload.track_id)
    if track is None or track.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Track not found.")

    # Prevent duplicate pitches to the same artist for the same track.
    existing = await session.execute(
        select(Pitch).where(
            Pitch.user_id == current_user.id,
            Pitch.track_id == payload.track_id,
            Pitch.artist_name == payload.artist_name,
        )
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"You've already pitched this track to {payload.artist_name}.",
        )

    pitch = Pitch(
        user_id=current_user.id,
        track_id=payload.track_id,
        artist_name=payload.artist_name,
        artist_image=payload.artist_image,
        label=payload.label,
        territory=payload.territory,
        source=payload.source,
        final_score=payload.final_score,
        confidence_level=payload.confidence_level,
        status="Sent",
    )
    session.add(pitch)
    await session.commit()
    await session.refresh(pitch)
    return _to_response(pitch, track.filename)


@router.delete("/pitches/{pitch_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pitch(
    pitch_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    pitch = await session.get(Pitch, pitch_id)
    if pitch is None or pitch.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pitch not found.")
    await session.delete(pitch)
    await session.commit()
    return None
