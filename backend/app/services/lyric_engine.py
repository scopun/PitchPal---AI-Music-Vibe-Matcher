import json
from openai import OpenAI
from app.core.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def get_ai_lyrical_scores(user_lyrics, candidate_artists):
    if not user_lyrics or not candidate_artists:
        return {}

    prompt = f"""
    Act as a professional A&R. Analyze these lyrics:
    "{user_lyrics[:400]}..." 
    
    Candidates: {', '.join(candidate_artists)}
    
    Task: Rate fit (0.0-1.0) AND provide a 1-sentence reason why.
    Return strictly JSON format:
    {{
        "Artist Name": {{ "score": 0.85, "reason": "Matches the rebellious, dark pop themes typical of this artist." }},
        ...
    }}
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful JSON assistant."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.3
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"OpenAI Error: {e}")
        # Fallback if AI fails
        return {artist: {"score": 0.5, "reason": "AI analysis unavailable."} for artist in candidate_artists}