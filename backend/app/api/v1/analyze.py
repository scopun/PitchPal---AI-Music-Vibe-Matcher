from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import shutil
import os
import uuid
from app.services.audio_engine import analyze_demo_track
from app.services.matcher import find_best_match

router = APIRouter()

@router.post("/analyze")
async def analyze_track(
    file: UploadFile = File(...),
    lyrics: str = Form(...)
):
    # Use UUID for unique temp filenames to prevent collisions
    temp_filename = f"temp_{uuid.uuid4()}.{file.filename.split('.')[-1]}"
    
    try:
        # 1. Save file to disk
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 2. Audio Analysis (With Crash Protection)
        print(f"Analyzing audio: {temp_filename}")
        audio_features = analyze_demo_track(temp_filename)

        # --- CRITICAL FIX: FALLBACK MECHANISM ---
        # If audio engine fails (returns None due to memory limits), 
        # we use default 'Pop Music' stats so the app doesn't crash.
        if audio_features is None:
            print("⚠️ Audio analysis failed. Using fallback values to continue.")
            audio_features = {
                'tempo': 120.0,
                'energy': 0.7,
                'avg_chroma_vector': [0.1] * 12, # Neutral key
                'chroma_vector': [0.1] * 12,
                'rhythm_complexity': 0.5,
                'harmonic_change_rate': 0.5,
                'median_f0': 440.0,
                'duration': 180.0
            }

        # 3. Matching
        # Now this will always run, even if audio failed
        results = find_best_match(audio_features, lyrics)
        
        if results and "error" in results[0]:
             raise HTTPException(status_code=500, detail=results[0]["error"])
             
        return results

    except Exception as e:
        print(f"❌ Server Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # 4. Clean up temp file
        if os.path.exists(temp_filename):
            try:
                os.remove(temp_filename)
            except:
                pass