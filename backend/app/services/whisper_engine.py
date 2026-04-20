import whisper

_model = None

def get_whisper_model():
    global _model
    if _model is None:
        print("🎙️ Loading Whisper model...")
        _model = whisper.load_model("base")
        print("✅ Whisper model loaded.")
    return _model


def extract_lyrics_from_audio(audio_path: str) -> dict:
    """
    Extract lyrics from audio using Whisper.
    If extracted text is too short (instrumental), returns empty lyrics
    so the system can fall back to audio features description.
    """
    try:
        model = get_whisper_model()

        result = model.transcribe(
            audio_path,
            fp16=False,
            language=None,
            verbose=False
        )

        transcript = result.get("text", "").strip()
        language = result.get("language", "en")

        # If less than 10 words extracted — likely instrumental, treat as empty
        word_count = len(transcript.split())
        if word_count < 10:
            return {
                "lyrics": "",
                "detected_language": language,
                "extraction_success": False,
                "message": "Instrumental or insufficient vocals detected"
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