import numpy as np
import json
from sklearn.metrics.pairwise import cosine_similarity
from app.services.lyric_engine import get_semantic_shortlist
from app.core.config import settings

CHROMA_VECTOR_KEY = 'avg_chroma_vector'

def calculate_musical_similarity(user_features, artist_features):
    # (Keep this function EXACTLY as it is - no changes needed here)
    # ... [Copy your existing calculate_musical_similarity code here] ...
    # Or just leave it if you didn't delete it.
    # Re-pasting the body just in case:
    user_chroma = np.array(user_features.get(CHROMA_VECTOR_KEY, [0]*12)).reshape(1, -1)
    artist_chroma = np.array(artist_features.get(CHROMA_VECTOR_KEY, [0]*12)).reshape(1, -1)
    chroma_score = cosine_similarity(user_chroma, artist_chroma)[0][0]

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
            sim = max(0.0, 1.0 - (diff / params['max_diff']))
            total_sim += sim * params['weight']
            total_weight += params['weight']
            
    feature_score = total_sim / total_weight if total_weight > 0 else 0.0
    return (0.4 * chroma_score) + (0.6 * feature_score)

# --- CHANGED TO ASYNC ---
async def find_best_match(user_audio_features, user_lyrics):
    try:
        with open(settings.DATABASE_PATH, "r", encoding="utf-8") as f:
            artist_database = json.load(f)
    except Exception as e:
        return [{"error": f"Database Error: {e}"}]

    print("🚀 Sending to AI (Async)...")
    
    # AWAIT the async function
    semantic_candidates = await get_semantic_shortlist(user_lyrics, artist_database, user_audio_features)
    
    if not semantic_candidates:
        print("⚠️ AI returned empty. Using fallback.")
        semantic_candidates = list(artist_database.keys())

    final_results = []
    
    for artist_name in semantic_candidates:
        if artist_name not in artist_database:
            continue
            
        db_features = artist_database[artist_name]
        m_score = calculate_musical_similarity(user_audio_features, db_features)
        
        try:
            rank_index = semantic_candidates.index(artist_name)
            l_score = max(0.5, 1.0 - (rank_index * 0.025)) 
        except ValueError:
            l_score = 0.5 
        
        final_score = (0.15 * m_score) + (0.85 * l_score)
        
        final_results.append({
            'artist': artist_name,
            'final_score': round(final_score, 2),
            'musical_score': round(m_score, 2),
            'lyrical_score': round(l_score, 2),
            'reason': "Matched via Lyrical Theme & Vibe Analysis",
            'tech_comparison': {
                'user_bpm': int(user_audio_features.get('tempo', 0)),
                'artist_bpm': int(db_features.get('tempo', 0)),
                'user_energy': round(user_audio_features.get('energy', 0), 2),
                'artist_energy': round(db_features.get('energy', 0), 2)
            }
        })

    final_results.sort(key=lambda x: x['final_score'], reverse=True)
    return final_results[:10]