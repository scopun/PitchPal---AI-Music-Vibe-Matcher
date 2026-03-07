import os
import json
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

async def get_claude_vibe_match(lyrics: str, audio_features: dict, artist_roster: list) -> dict:
    formatted_roster = "\n".join([f"- {a['name']} (Genre: {a.get('genre', 'Unknown')}, Vibe: {a.get('vibe', 'Unknown')})" for a in artist_roster])
    
    audio_data_str = json.dumps(audio_features, indent=2)

    system_prompt = f"""
    You are an expert music A&R consultant and musicologist specialising 
    in artist matchmaking for songwriters and composers. Your job is to 
    analyse submitted song lyrics and identify the closest matching 
    professional recording artists based on multiple weighted dimensions.
    
    Analyse the following lyrics across these dimensions:
    
    1. LYRICAL STYLE — metaphor density, imagery type (domestic, nature, 
    abstract, body), narrative voice (first person confessional, 
    observational, abstract), vocabulary register (poetic, conversational, 
    raw)
    
    2. EMOTIONAL TONE — primary emotion and emotional arc (e.g. grief to 
    hope, longing to acceptance), emotional intensity (restrained vs. 
    explosive), vulnerability level
    
    3. THEMATIC CONTENT — recurring themes and subject matter (love, loss, 
    identity, spirituality, nature, social commentary etc.)
    
    4. SONIC PROFILE — based on lyrical rhythm, cadence, syllable density 
    and phrasing, infer likely tempo feel (sparse/slow, mid-tempo, 
    driving), likely instrumentation (orchestral, acoustic, electronic, 
    band), vocal delivery style (intimate whisper, powerful belt, 
    conversational)
    
    5. GENRE & SCENE — identify the most likely genre(s) and sub-genre(s) 
    with geographic/cultural context where relevant (e.g. UK indie folk, 
    Nashville country, LA pop, Afrobeats)
    
    6. CULTURAL & MARKET FIT — identify which music markets and audiences 
    this song would resonate with globally
    
    Based on this analysis, return the following:
    
    PRIMARY MATCH: The single closest artist match with a confidence score 
    (0-100%) and a 2-3 sentence explanation of WHY they match across the 
    dimensions above. Be specific — reference the artist's actual known 
    works, lyrical style and sound.
    
    CLOSE ALTERNATIVES (#2 and #3): Two further strong matches with scores 
    and brief explanations.
    
    FULL ROSTER RANKING: Rank the following artists from most to least 
    compatible, with a total score and lyrical fit score for each:
    {formatted_roster}
    
    GENRE TAGS: List 3-5 genre/mood tags for this song.
    
    PITCH ANGLE: Write 1-2 sentences a songwriter could use when pitching 
    this song to a label or publisher — capturing what makes it 
    distinctive.
    
    IMPORTANT RULES:
    - Prioritise lyrical tone, emotional world and thematic resonance 
      OVER assumed tempo or production style
    - Do not default to the most commercially famous artist — match on 
      genuine stylistic alignment
    - Actively consider UK, European, and global artists, not just 
      US-centric matches
    - If the lyrics suggest a niche or emerging scene, say so explicitly
    - Be honest about confidence levels — a 55% match should reflect 
      genuine uncertainty, not false confidence
    
    Lyrics to analyse:
    {lyrics}
    
    Audio analysis data (if available):
    {audio_data_str}

    CRITICAL SYSTEM INSTRUCTION:
    You MUST return the output strictly as a raw JSON object with no markdown formatting or conversational text. Use this exact schema:
    {{
        "matches": [
            {{
                "artist": "Artist Name",
                "final_score": 0.85,
                "lyrical_score": 0.92,
                "reason": "2-3 sentence explanation referencing specific artist works, lyrical style, and sound.",
                "tech_comparison": {{
                    "user_bpm": 120,
                    "artist_bpm": 124,
                    "user_energy": 0.8,
                    "artist_energy": 0.85
                }}
            }}
        ],
        "extracted_features": {audio_features},
        "genre_tags": ["Tag1", "Tag2", "Tag3"],
        "pitch_angle": "1-2 sentences capturing what makes it distinctive for a pitch.",
        "market_fit": "Target market (e.g., UK Indie, Global Pop)"
    }}
    Ensure 'matches' contains the top 8 ranked artists from the full roster ranking.
    """

    try:
        response = anthropic_client.messages.create(
            model="claude-opus-4-6",
            max_tokens=3000,
            temperature=0.3,
            system=system_prompt,
            messages=[
                {"role": "user", "content": "Please analyze the provided lyrics and audio data against the roster according to your instructions and output the JSON."}
            ]
        )

        raw_json_str = response.content[0].text.strip()
        
        if raw_json_str.startswith("```json"):
            raw_json_str = raw_json_str[7:-3].strip()
        elif raw_json_str.startswith("```"):
            raw_json_str = raw_json_str[3:-3].strip()

        return json.loads(raw_json_str)

    except Exception as e:
        print(f"Claude API Error: {e}")
        return {"error": str(e), "matches": []}