import os
import whisper
import tempfile
from pathlib import Path

# Load model once at module level (base model = fast + accurate enough for demos)
_model = None

def get_whisper_model():
    """Lazy load whisper model — loads once, reuses after."""
    global _model
    if _model is None:
        print("🎙️ Loading Whisper model...")
        _model = whisper.load_model("base")
        print("✅ Whisper model loaded.")
    return _model


def extract_lyrics_from_audio(audio_path: str) -> dict:
    """
    Extract lyrics/spoken text from an audio file using Whisper.
    Returns a dict with 'lyrics' and 'detected_language'.
    Falls back gracefully if extraction fails.
    """
    try:
        model = get_whisper_model()

        result = model.transcribe(
            audio_path,
            fp16=False,          # CPU safe
            language=None,       # Auto-detect language
            verbose=False
        )

        transcript = result.get("text", "").strip()
        language = result.get("language", "en")

        if not transcript:
            return {
                "lyrics": "",
                "detected_language": language,
                "extraction_success": False,
                "message": "No speech detected in audio"
            }

        return {
            "lyrics": transcript,
            "detected_language": language,
            "extraction_success": True,
            "message": "Lyrics extracted successfully"
        }

    except Exception as e:
        print(f"Whisper extraction error: {e}")
        return {
            "lyrics": "",
            "detected_language": "en",
            "extraction_success": False,
            "message": str(e)
        }