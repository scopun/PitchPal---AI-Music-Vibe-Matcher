import os
import shutil
import tempfile
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.audio_engine import analyze_demo_track
from app.services.whisper_engine import extract_lyrics_from_audio
from app.services.matcher import find_best_match

router = APIRouter()


@router.post("/match")
async def match_artist(
    audio_file: UploadFile = File(...),
    debug: bool = Form(False)
):
    """
    Main endpoint — upload audio file only.
    Flow: librosa audio features + AssemblyAI lyrics → Claude AI matching
    """
    filename = (audio_file.filename or "").lower()
    if not filename.endswith((".mp3", ".wav", ".m4a", ".flac", ".aac")):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Supported: MP3, WAV, M4A, FLAC, AAC"
        )

    temp_file_path = ""

    try:
        suffix = os.path.splitext(filename)[1] if "." in filename else ".mp3"
        fd, temp_file_path = tempfile.mkstemp(suffix=suffix)
        os.close(fd)

        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer)

        # Step 1: Audio features
        audio_features = analyze_demo_track(temp_file_path) or {}
        if not audio_features:
            raise HTTPException(status_code=500, detail="Audio analysis failed.")

        # Step 2: Lyrics via AssemblyAI
        whisper_result = extract_lyrics_from_audio(temp_file_path)
        lyrics = whisper_result.get("lyrics", "").strip()
        lyrics_extracted = whisper_result.get("extraction_success", False)

        # Step 3: AI matching
        results = await find_best_match(audio_features, lyrics)

        if isinstance(results, dict):
            results["success"] = True
            results["track_info"] = {
                "filename": audio_file.filename,
                "bpm": round(audio_features.get("tempo", 0)),
                "energy": round(audio_features.get("energy", 0), 2),
            }
            results["lyrics_extracted"] = lyrics_extracted
            if debug:
                results["extracted_features"] = audio_features
                results["lyrics_used"] = lyrics if lyrics else "No lyrics extracted"
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
    Quick test endpoint — no audio needed.
    Provide song description or lyrics directly.
    """
    if not lyrics or not lyrics.strip():
        raise HTTPException(status_code=400, detail="Lyrics cannot be empty.")

    results = await find_best_match({}, lyrics.strip())

    if isinstance(results, dict):
        results["success"] = True
        if debug:
            results["lyrics_used"] = lyrics.strip()
        return results

    return {"success": True, "matches": results}