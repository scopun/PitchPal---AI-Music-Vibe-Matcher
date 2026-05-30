import hashlib
import os
import shutil
import tempfile
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth import get_current_user
from app.core.db import get_session
from app.models.track import Track
from app.models.user import User
from app.schemas.track import TrackDetailResponse, TrackSummaryResponse
from app.services.audio_engine import analyze_demo_track
from app.services.deezer_service import enrich_artist
from app.services.matcher import find_best_match
from app.services.spotify_service import enrich_artist as enrich_spotify
from app.services.whisper_engine import extract_lyrics_from_audio

router = APIRouter()


ALLOWED_EXTENSIONS = (".mp3", ".wav", ".m4a", ".flac", ".aac")

# How long a cached match stays valid. A re-upload of the SAME file (same
# audio_hash) within this window returns the saved match_data instantly, no
# Claude/AssemblyAI roundtrip. This also makes results deterministic across
# re-uploads, which is what client Ciara specifically asked for.
CACHE_TTL_DAYS = 7


def _summarize(track: Track) -> TrackSummaryResponse:
    matches = []
    pitches_count = 0
    if isinstance(track.match_data, dict):
        raw_matches = track.match_data.get("matches")
        if isinstance(raw_matches, list):
            matches = raw_matches
    if track.pitches is not None:
        pitches_count = len(track.pitches)
    return TrackSummaryResponse(
        id=track.id,
        filename=track.filename,
        bpm=track.bpm,
        energy=track.energy,
        detected_genre=track.detected_genre,
        detected_language=track.detected_language,
        lyrics_extracted=track.lyrics_extracted,
        genre_tags=track.genre_tags,
        matches_count=len(matches),
        pitches_count=pitches_count,
        created_at=track.created_at,
    )


@router.post("/match")
async def match_track(
    audio_file: UploadFile = File(...),
    debug: bool = Form(False),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    filename = (audio_file.filename or "").lower()
    if not filename.endswith(ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Supported: MP3, WAV, M4A, FLAC, AAC",
        )

    temp_file_path = ""
    try:
        suffix = os.path.splitext(filename)[1] if "." in filename else ".mp3"
        fd, temp_file_path = tempfile.mkstemp(suffix=suffix)
        os.close(fd)

        # Stream the upload to disk AND compute a SHA-256 hash in the same
        # pass so we don't read the file twice for big uploads.
        hasher = hashlib.sha256()
        with open(temp_file_path, "wb") as buffer:
            while True:
                chunk = audio_file.file.read(1024 * 64)
                if not chunk:
                    break
                hasher.update(chunk)
                buffer.write(chunk)
        audio_hash = hasher.hexdigest()

        # ── Cache short-circuit ───────────────────────────────────────────
        # If THIS user already analysed the same audio bytes within the
        # cache window, return the saved match_data instantly. This gives
        # consistent results on re-uploads (Ciara's feedback #2) AND saves
        # the AssemblyAI + Claude API costs.
        cutoff = datetime.now(timezone.utc) - timedelta(days=CACHE_TTL_DAYS)
        cached_q = (
            select(Track)
            .where(Track.user_id == current_user.id)
            .where(Track.audio_hash == audio_hash)
            .where(Track.created_at >= cutoff)
            .order_by(desc(Track.created_at))
            .limit(1)
        )
        cached_track = (await session.execute(cached_q)).scalar_one_or_none()
        if cached_track and isinstance(cached_track.match_data, dict):
            cached = dict(cached_track.match_data)
            cached["track_id"] = cached_track.id
            cached["cached"] = True
            cached["cached_at"] = cached_track.created_at.isoformat()
            return cached

        audio_features = analyze_demo_track(temp_file_path) or {}
        if not audio_features:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Audio analysis failed.",
            )

        whisper_result = extract_lyrics_from_audio(temp_file_path)
        lyrics = whisper_result.get("lyrics", "").strip()
        lyrics_extracted = whisper_result.get("extraction_success", False)
        detected_language = whisper_result.get("detected_language", "en")

        results = await find_best_match(audio_features, lyrics, detected_language)

        if not isinstance(results, dict):
            results = {"matches": results}

        # Enrich each match with Deezer data (image, followers, albums).
        # Quietly no-ops if Deezer is unreachable — the rest of the flow keeps
        # working with "—" placeholders and demo avatars.
        raw_matches = results.get("matches")
        if isinstance(raw_matches, list):
            for m in raw_matches:
                if not isinstance(m, dict):
                    continue
                artist_name = m.get("artist")
                if not artist_name:
                    continue
                enrichment = enrich_artist(artist_name)
                if not enrichment:
                    continue
                if enrichment.get("artist_image"):
                    m["artist_image"] = enrichment["artist_image"]
                if enrichment.get("followers") is not None:
                    m["followers"] = enrichment["followers"]
                if enrichment.get("albums_count") is not None:
                    m["albums_count"] = enrichment["albums_count"]
                if enrichment.get("deezer_id"):
                    m["deezer_id"] = enrichment["deezer_id"]

                # Hybrid: also fetch the verified Spotify profile URL so the
                # frontend "View Profile" button can open the canonical Spotify
                # page. Deezer stays the source of truth for followers/albums.
                # Quietly no-ops if Spotify isn't configured or the artist
                # isn't on Spotify.
                spotify_enrichment = enrich_spotify(artist_name)
                if spotify_enrichment.get("spotify_url"):
                    m["spotify_url"] = spotify_enrichment["spotify_url"]
                if spotify_enrichment.get("spotify_id"):
                    m["spotify_id"] = spotify_enrichment["spotify_id"]
                # Scraped from the public Spotify artist page — the API
                # doesn't expose this anymore on the dev tier. Prefer it
                # over Deezer fans because most clients recognise Spotify
                # monthly listeners as the canonical streaming metric.
                if spotify_enrichment.get("monthly_listeners") is not None:
                    m["monthly_listeners"] = spotify_enrichment["monthly_listeners"]

        bpm = round(audio_features.get("tempo", 0)) or None
        energy = round(audio_features.get("energy", 0), 2) if audio_features.get("energy") is not None else None

        results["success"] = True
        results["track_info"] = {
            "filename": audio_file.filename,
            "bpm": bpm or 0,
            "energy": energy or 0.0,
        }
        results["lyrics_extracted"] = lyrics_extracted
        results["detected_language"] = detected_language
        if debug:
            results["extracted_features"] = audio_features
            results["lyrics_used"] = lyrics if lyrics else "No lyrics extracted"

        # Persist the analysis so the user can revisit it from My Tracks.
        track = Track(
            user_id=current_user.id,
            filename=audio_file.filename or "Untitled",
            audio_hash=audio_hash,
            bpm=bpm,
            energy=energy,
            detected_genre=results.get("detected_genre"),
            detected_language=detected_language,
            lyrics_extracted=bool(lyrics_extracted),
            genre_tags=results.get("genre_tags") if isinstance(results.get("genre_tags"), list) else None,
            match_data=results,
        )
        session.add(track)
        await session.commit()
        await session.refresh(track)

        results["track_id"] = track.id
        return results

    except HTTPException:
        raise
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass


@router.get("/tracks", response_model=list[TrackSummaryResponse])
async def list_tracks(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[TrackSummaryResponse]:
    result = await session.execute(
        select(Track).where(Track.user_id == current_user.id).order_by(Track.created_at.desc())
    )
    tracks = result.scalars().all()
    summaries = []
    for t in tracks:
        # Lazy-load pitches via a count query to avoid serializing the relation.
        from sqlalchemy import func as sqlfunc
        from app.models.track import Pitch

        count_result = await session.execute(
            select(sqlfunc.count(Pitch.id)).where(Pitch.track_id == t.id)
        )
        pitches_count = count_result.scalar_one()
        matches = []
        if isinstance(t.match_data, dict):
            raw = t.match_data.get("matches")
            if isinstance(raw, list):
                matches = raw
        summaries.append(
            TrackSummaryResponse(
                id=t.id,
                filename=t.filename,
                bpm=t.bpm,
                energy=t.energy,
                detected_genre=t.detected_genre,
                detected_language=t.detected_language,
                lyrics_extracted=t.lyrics_extracted,
                genre_tags=t.genre_tags,
                matches_count=len(matches),
                pitches_count=pitches_count,
                created_at=t.created_at,
            )
        )
    return summaries


@router.get("/tracks/{track_id}", response_model=TrackDetailResponse)
async def get_track(
    track_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> TrackDetailResponse:
    track = await session.get(Track, track_id)
    if track is None or track.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Track not found.")
    return TrackDetailResponse.model_validate(track)


@router.delete("/tracks/{track_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_track(
    track_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    track = await session.get(Track, track_id)
    if track is None or track.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Track not found.")
    await session.delete(track)
    await session.commit()
    return None
