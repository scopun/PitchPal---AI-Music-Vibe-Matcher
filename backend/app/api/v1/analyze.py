import os
import shutil
import tempfile
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from app.services.audio_engine import analyze_demo_track
from app.services.whisper_engine import extract_lyrics_from_audio
from app.services.matcher import find_best_match

router = APIRouter()

# Swagger default placeholders to ignore
INVALID_LYRICS = {"string", "str", "text", "lyrics", "none", "", "null"}


def is_valid_lyrics(text: Optional[str]) -> bool:
    """Check if lyrics input is actual content, not a placeholder."""
    if not text:
        return False
    return text.strip().lower() not in INVALID_LYRICS


@router.post("/match")
async def match_artist(
    audio_file: UploadFile = File(...),
    lyrics: Optional[str] = Form(None),
    debug: bool = Form(False)
):
    """
    Main matching endpoint.

    Flow:
    1. Receive audio file (MP3/WAV/M4A)
    2. Extract audio features (tempo, energy, BPM etc.) via librosa
    3. Extract lyrics from audio via Whisper (if no valid lyrics provided)
    4. Run AI matching via Claude
    5. Return structured results
    """

    filename = (audio_file.filename or "").lower()
    if not filename.endswith((".mp3", ".wav", ".m4a", ".flac", ".aac")):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Supported: MP3, WAV, M4A, FLAC, AAC"
        )

    temp_file_path = ""

    try:
        # Save uploaded file to temp location
        suffix = os.path.splitext(filename)[1] if "." in filename else ".mp3"
        fd, temp_file_path = tempfile.mkstemp(suffix=suffix)
        os.close(fd)

        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer)

        # Step 1: Extract audio features
        audio_features = analyze_demo_track(temp_file_path) or {}

        # Step 2: Determine lyrics source
        whisper_result = None
        final_lyrics = None

        if is_valid_lyrics(lyrics):
            # Use provided lyrics
            final_lyrics = lyrics.strip()
        else:
            # Auto-extract via Whisper
            whisper_result = extract_lyrics_from_audio(temp_file_path)
            extracted = whisper_result.get("lyrics", "").strip()
            final_lyrics = extracted if extracted else None

        # Step 3: Fallback for instrumentals (no vocals detected)
        if not final_lyrics:
            tempo = audio_features.get("tempo", 0)
            energy = audio_features.get("energy", 0)
            final_lyrics = (
                f"Instrumental track. "
                f"Tempo: {tempo:.0f} BPM. "
                f"Energy: {'high' if energy > 0.7 else 'medium' if energy > 0.4 else 'low'}. "
                f"Match based on musical style and energy profile."
            )

        # Step 4: AI matching
        results = await find_best_match(audio_features, final_lyrics)

        # Step 5: Build clean response
        if isinstance(results, dict):
            results["success"] = True
            results["track_info"] = {
                "filename": audio_file.filename,
                "bpm": round(audio_features.get("tempo", 0)),
                "energy": round(audio_features.get("energy", 0), 2),
            }

            if whisper_result:
                results["lyrics_extracted"] = whisper_result.get("extraction_success", False)
                results["detected_language"] = whisper_result.get("detected_language", "en")

            if debug:
                results["extracted_features"] = audio_features
                results["lyrics_used"] = final_lyrics

            return results

        return {"success": True, "matches": results}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass


@router.post("/match-lyrics-only")
async def match_lyrics_only(
    lyrics: str = Form(...),
    debug: bool = Form(False)
):
    """
    Lyrics-only endpoint — for quick testing without audio.
    """
    if not is_valid_lyrics(lyrics):
        raise HTTPException(
            status_code=400,
            detail="Please provide actual song lyrics or description."
        )

    results = await find_best_match({}, lyrics.strip())

    if isinstance(results, dict):
        results["success"] = True
        if debug:
            results["lyrics_used"] = lyrics
        return results

    return {"success": True, "matches": results}