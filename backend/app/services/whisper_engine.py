import os
import requests
import time
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "https://api.assemblyai.com"


def extract_lyrics_from_audio(audio_path: str) -> dict:
    """
    Extract lyrics from audio using AssemblyAI.
    Uploads file, waits for transcription, returns lyrics.
    """
    try:
        api_key = os.getenv("ASSEMBLYAI_API_KEY", "")

        if not api_key:
            return {
                "lyrics": "",
                "extraction_success": False,
                "message": "ASSEMBLYAI_API_KEY not set"
            }

        # Verify file still exists before uploading
        if not os.path.exists(audio_path):
            return {
                "lyrics": "",
                "extraction_success": False,
                "message": f"Audio file not found: {audio_path}"
            }

        headers = {"authorization": api_key}

        # Step 1: Upload file
        with open(audio_path, "rb") as f:
            upload_response = requests.post(
                BASE_URL + "/v2/upload",
                headers=headers,
                data=f,
                timeout=60
            )

        if upload_response.status_code != 200:
            return {
                "lyrics": "",
                "extraction_success": False,
                "message": f"Upload failed: {upload_response.text}"
            }

        audio_url = upload_response.json()["upload_url"]

        # Step 2: Request transcription
        transcript_response = requests.post(
            BASE_URL + "/v2/transcript",
            json={
                "audio_url": audio_url,
                "language_detection": True,
                "speech_models": ["universal-2"]
            },
            headers=headers,
            timeout=30
        )

        if transcript_response.status_code != 200:
            return {
                "lyrics": "",
                "extraction_success": False,
                "message": f"Transcription request failed: {transcript_response.text}"
            }

        transcript_id = transcript_response.json()["id"]
        polling_url = BASE_URL + "/v2/transcript/" + transcript_id

        # Step 3: Poll for result
        for attempt in range(40):  # max 2 minutes
            result = requests.get(polling_url, headers=headers, timeout=30).json()

            if result["status"] == "completed":
                transcript = (result.get("text") or "").strip()
                word_count = len(transcript.split())

                if word_count < 8:
                    return {
                        "lyrics": "",
                        "detected_language": result.get("language_code", "en"),
                        "extraction_success": False,
                        "word_count": word_count,
                        "message": "Insufficient vocals detected"
                    }

                return {
                    "lyrics": transcript,
                    "detected_language": result.get("language_code", "en"),
                    "extraction_success": True,
                    "word_count": word_count,
                    "message": "Lyrics extracted successfully"
                }

            elif result["status"] == "error":
                return {
                    "lyrics": "",
                    "extraction_success": False,
                    "message": f"Transcription error: {result.get('error', 'Unknown')}"
                }

            time.sleep(3)

        return {
            "lyrics": "",
            "extraction_success": False,
            "message": "Transcription timeout after 2 minutes"
        }

    except Exception as e:
        print(f"AssemblyAI error: {e}")
        return {
            "lyrics": "",
            "extraction_success": False,
            "message": str(e)
        }