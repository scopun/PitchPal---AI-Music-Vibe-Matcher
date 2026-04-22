import sys
import os
import requests
import time

API_KEY = os.getenv("ASSEMBLYAI_API_KEY", "3da9d06682e649b4ac9daf4da00ec12d")
BASE_URL = "https://api.assemblyai.com"
headers = {"authorization": API_KEY}


def test_assemblyai(audio_path: str):
    print(f"\n🎵 Testing AssemblyAI with: {audio_path}")
    print("=" * 50)

    print("📤 Step 1: Uploading...")
    with open(audio_path, "rb") as f:
        upload_resp = requests.post(
            BASE_URL + "/v2/upload",
            headers=headers,
            data=f
        )

    if upload_resp.status_code != 200:
        print(f"❌ Upload failed: {upload_resp.text}")
        return

    audio_url = upload_resp.json()["upload_url"]
    print(f"✅ Uploaded.")

    print("\n🤖 Step 2: Requesting transcription...")
    transcript_resp = requests.post(
        BASE_URL + "/v2/transcript",
        json={
            "audio_url": audio_url,
            "language_detection": True,
            "speech_models": ["universal-2"]
        },
        headers=headers
    )

    if transcript_resp.status_code != 200:
        print(f"❌ Failed: {transcript_resp.text}")
        return

    transcript_id = transcript_resp.json()["id"]
    print(f"✅ Started. ID: {transcript_id}")

    print("\n⏳ Step 3: Waiting...")
    polling_url = BASE_URL + "/v2/transcript/" + transcript_id

    attempt = 0
    while True:
        attempt += 1
        result = requests.get(polling_url, headers=headers).json()
        status = result["status"]
        print(f"   Attempt {attempt}: {status}...")

        if status == "completed":
            text = result.get("text", "").strip()
            language = result.get("language_code", "unknown")
            word_count = len(text.split())

            print(f"\n{'=' * 50}")
            print(f"✅ DONE!")
            print(f"Language: {language}")
            print(f"Words: {word_count}")
            print(f"\nLyrics:\n{text}")
            print(f"{'=' * 50}")
            break

        elif status == "error":
            print(f"❌ Error: {result.get('error')}")
            break

        time.sleep(3)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 test_assembly.py song.mp3")
        sys.exit(1)

    if not os.path.exists(sys.argv[1]):
        print(f"❌ File not found: {sys.argv[1]}")
        sys.exit(1)

    test_assemblyai(sys.argv[1])