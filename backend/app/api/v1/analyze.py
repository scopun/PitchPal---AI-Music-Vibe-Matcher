import os
import shutil
import tempfile
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.audio_engine import analyze_demo_track
from app.services.matcher import find_best_match

router = APIRouter()

@router.post("/match")
async def match_artist(
    audio_file: UploadFile = File(...),
    lyrics: str = Form(...),
    debug: bool = Form(False)
):
    filename = (audio_file.filename or "").lower()
    if not filename.endswith((".mp3", ".wav", ".m4a")):
        raise HTTPException(status_code=400, detail="Invalid file format")

    temp_file_path = ""
    try:
        suffix = os.path.splitext(filename)[1] if "." in filename else ".mp3"
        fd, temp_file_path = tempfile.mkstemp(suffix=suffix)
        os.close(fd)

        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer)

        audio_features = analyze_demo_track(temp_file_path)
        if not audio_features:
            raise HTTPException(status_code=500, detail="Audio analysis failed")

        results = await find_best_match(audio_features, lyrics)

        payload = {
            "success": True,
            "matches": results,
            "extracted_features": audio_features
        }

        if not debug:
            payload.pop("extracted_features", None)

        return payload

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