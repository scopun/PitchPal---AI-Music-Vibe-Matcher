import numpy as np
import json
from sklearn.metrics.pairwise import cosine_similarity
from app.services.lyric_engine import get_semantic_shortlist
from app.core.config import settings

CHROMA_VECTOR_KEY = 'avg_chroma_vector'

def calculate_musical_similarity(user_features, artist_features):
    """
    Calculates the mathematical audio similarity between user track and artist profile.
    """
    # 1. Chroma (Key/Melody) Similarity
    user_chroma = np.array(user_features.get(CHROMA_VECTOR_KEY, [0]*12)).reshape(1, -1)
    artist_chroma = np.array(artist_features.get(CHROMA_VECTOR_KEY, [0]*12)).reshape(1, -1)
    
    # Cosine similarity handles vector direction regardless of magnitude
    chroma_score = cosine_similarity(user_chroma, artist_chroma)[0][0]

    # 2. Feature Similarity (Tempo, Energy, Rhythm)
    feature_weights = {
        'tempo': {'max_diff': 40.0, 'weight': 0.25},
        'energy': {'max_diff': 0.5, 'weight': 0.20},
        'rhythm_complexity': {'max_diff': 50.0, 'weight': 0.15},
        'harmonic_change_rate': {'max_diff': 4.0, 'weight': 0.15},
        'median_f0': {'max_diff': 200.0, 'weight': 0.25}
    }
    
    total_sim = 0.0
    total_weight = 0.0
    
    for key, params in feature_weights.items():
        if key in user_features:
            u_val = user_features[key]
            a_val = artist_features.get(key, 0.0)
            diff = abs(u_val - a_val)
            # Calculate similarity score (1.0 is perfect match, 0.0 is far off)
            sim = max(0.0, 1.0 - (diff / params['max_diff']))
            total_sim += sim * params['weight']
            total_weight += params['weight']
            
    feature_score = total_sim / total_weight if total_weight > 0 else 0.0
    
    # Weighted combination: 40% Key/Melody + 60% Audio Features
    return (0.4 * chroma_score) + (0.6 * feature_score)

def find_best_match(user_audio_features, user_lyrics):
    """
    Orchestrates the matching process using the 'AI-First' Strategy.
    1. AI scans FULL roster for best Vibe/Lyrical matches.
    2. System calculates Audio scores only for those AI picks.
    3. Final Score = 70% AI (Lyrics) + 30% Math (Audio).
    """
    try:
        with open(settings.DATABASE_PATH, "r", encoding="utf-8") as f:
            artist_database = json.load(f)
    except Exception as e:
        return [{"error": f"Database Error: {e}"}]

    # --- STEP 1: SEMANTIC FILTER (The Accuracy Upgrade) ---
    print("Sending full roster to AI for semantic analysis...")
    
    # UPDATE: We now pass user_audio_features so the AI knows the genre/vibe
    semantic_candidates = get_semantic_shortlist(user_lyrics, artist_database, user_audio_features)
    
    # Fallback: If OpenAI fails or returns empty list, use the whole DB (Safeguard)
    if not semantic_candidates:
        print("AI returned no candidates. Falling back to full database scan.")
        semantic_candidates = list(artist_database.keys())

    # --- STEP 2: SCORING & RANKING ---
    final_results = []
    
    for artist_name in semantic_candidates:
        # Check if artist exists in our DB (Handle potential AI spelling hallucinations)
        if artist_name not in artist_database:
            continue
            
        db_features = artist_database[artist_name]
        
        # A. Audio Score (Weight: 30%)
        # We calculate this strictly mathematically
        m_score = calculate_musical_similarity(user_audio_features, db_features)
        
        # B. Lyrical Score (Weight: 70%)
        # We assign a base semantic score based on the AI's ranking preference.
        # If AI put them #1 in the list, they get 1.0 score.
        # If AI put them #20, they get 0.6 score.
        try:
            rank_index = semantic_candidates.index(artist_name)
            # Decays slightly as you go down the list
            l_score = max(0.5, 1.0 - (rank_index * 0.025)) 
        except ValueError:
            l_score = 0.5 # Default if something weird happens
        
        # C. Final Weighted Formula
        # Prioritize Lyrics (0.7) over Audio (0.3)
        final_score = (0.15 * m_score) + (0.85 * l_score)
        
        # Formatting for Frontend Report
        final_results.append({
            'artist': artist_name,
            'final_score': round(final_score, 2), # e.g. 0.85
            'musical_score': round(m_score, 2),
            'lyrical_score': round(l_score, 2),
            'reason': "Matched via Lyrical Theme & Vibe Analysis", # Static reason for MVP, or extract from AI if complex
            'tech_comparison': {
                'user_bpm': int(user_audio_features.get('tempo', 0)),
                'artist_bpm': int(db_features.get('tempo', 0)),
                'user_energy': round(user_audio_features.get('energy', 0), 2),
                'artist_energy': round(db_features.get('energy', 0), 2)
            }
        })

    # Sort by the final weighted score (Highest first)
    final_results.sort(key=lambda x: x['final_score'], reverse=True)
    
    # Return Top 10 for the UI
    return final_results[:10]