import os
import shutil
import tempfile
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.audio_analyzer import analyze_demo_track
from app.services.matcher import find_best_match

router = APIRouter()

@router.post("/match")
async def match_artist(
    audio_file: UploadFile = File(...),
    lyrics: str = Form(...)
):
    if not audio_file.filename.endswith(('.mp3', '.wav', '.m4a')):
        raise HTTPException(status_code=400, detail="Invalid file format")

    temp_file_path = ""
    try:
        fd, temp_file_path = tempfile.mkstemp(suffix=os.path.splitext(audio_file.filename)[1])
        os.close(fd)
        
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer)

        audio_features = analyze_demo_track(temp_file_path)
        
        if not audio_features:
            raise HTTPException(status_code=500, detail="Audio analysis failed")

        results = await find_best_match(audio_features, lyrics)
        
        return {
            "success": True,
            "matches": results,
            "extracted_features": audio_features
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)