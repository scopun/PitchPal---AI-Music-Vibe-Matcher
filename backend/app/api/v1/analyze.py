from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import shutil
import os
import uuid
import asyncio # <--- NEW IMPORT
from app.services.audio_engine import analyze_demo_track
from app.services.matcher import find_best_match

router = APIRouter()

@router.post("/analyze")
async def analyze_track(
    file: UploadFile = File(...),
    lyrics: str = Form(...)
):
    temp_filename = f"temp_{uuid.uuid4()}.{file.filename.split('.')[-1]}"
    
    try:
        # 1. Save File
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 2. Audio Analysis (Run in THREAD for speed)
        print(f"🎵 Starting Audio Analysis on: {temp_filename}")
        
        # This moves the heavy CPU work off the main path
        audio_features = await asyncio.to_thread(analyze_demo_track, temp_filename)

        if audio_features is None:
            print("⚠️ Audio Analysis Failed. Using Default Values.")
            audio_features = {
                'tempo': 120.0,
                'energy': 0.7,
                'avg_chroma_vector': [0.1] * 12,
                'chroma_vector': [0.1] * 12,
                'rhythm_complexity': 0.5,
                'harmonic_change_rate': 0.5,
                'median_f0': 440.0,
                'duration': 180.0
            }
        else:
            print("✅ Audio Analysis Complete.")

        # 3. AI Matching (Now Async)
        print("🧠 Running AI Matcher...")
        results = await find_best_match(audio_features, lyrics)
        
        if results and "error" in results[0]:
             raise HTTPException(status_code=500, detail=results[0]["error"])
             
        return results

    except Exception as e:
        print(f"❌ Server Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(temp_filename):
            try:
                os.remove(temp_filename)
            except:
                pass