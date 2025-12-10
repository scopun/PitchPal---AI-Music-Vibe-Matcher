import json
from openai import OpenAI
from app.core.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def get_semantic_shortlist(user_lyrics, artist_database):
    """
    Sends ALL artists to OpenAI to find the best semantic matches first.
    """
    # 1. Format the Roster for the AI context
    roster_text = ""
    for artist, data in artist_database.items():
        genres = data.get("genres", [])
        genre_str = ", ".join(genres) if genres else "General UK Artist"
        roster_text += f"- {artist} ({genre_str})\n"

    # 2. The "Full Roster" Prompt
    prompt = f"""
    You are an expert Music A&R. I have a new song demo and a roster of UK Artists.
    
    NEW SONG LYRICS:
    "{user_lyrics[:800]}..."

    YOUR ROSTER (Choose strictly from here):
    {roster_text}

    TASK:
    Identify the Top 20 artists from the roster who are the best Lyrical and Stylistic match for this song.
    Ignore tempo/BPM conflicts—focus purely on the songwriting style, emotional tone, and artist brand.
    
    RETURN FORMAT:
    Return strictly a JSON object with a list of artist names:
    {{
        "candidates": ["Artist Name 1", "Artist Name 2", ...]
    }}
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a JSON-only music analysis assistant."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.3
        )
        content = response.choices[0].message.content
        data = json.loads(content)
        return data.get("candidates", [])
    except Exception as e:
        print(f"OpenAI Error: {e}")
        return []