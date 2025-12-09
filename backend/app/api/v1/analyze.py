from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import shutil
import os
import tempfile
from app.services.audio_engine import analyze_demo_track
from app.services.matcher import find_best_match

router = APIRouter()

@router.post("/analyze")
async def analyze_track(
    file: UploadFile = File(...),
    lyrics: str = Form(...)
):
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as tmp_file:
        shutil.copyfileobj(file.file, tmp_file)
        tmp_path = tmp_file.name

    try:
        # 1. Audio Analysis
        audio_features = analyze_demo_track(tmp_path)
        if not audio_features:
            raise HTTPException(status_code=400, detail="Could not extract audio features")

        # 2. Matching
        results = find_best_match(audio_features, lyrics)
        if results and "error" in results[0]:
             raise HTTPException(status_code=500, detail=results[0]["error"])
             
        return results

    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)