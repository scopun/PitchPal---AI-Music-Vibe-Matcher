import numpy as np
import json
from sklearn.metrics.pairwise import cosine_similarity
from app.services.lyric_engine import get_ai_lyrical_scores
from app.core.config import settings

CHROMA_VECTOR_KEY = 'avg_chroma_vector'

def calculate_musical_similarity(user_features, artist_features):
    # (Keep your existing math logic here, it is fine)
    # ... [Copy the calculate_musical_similarity function from previous steps] ...
    # For brevity, I am assuming you kept the function I gave you earlier.
    # If you lost it, I can repost it, but the key change is in find_best_match below.
    
    # RE-INSERTING THE MATH HERE TO BE SAFE:
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

def find_best_match(user_audio_features, user_lyrics):
    try:
        with open(settings.DATABASE_PATH, "r", encoding="utf-8") as f:
            artist_database = json.load(f)
    except Exception as e:
        return [{"error": f"Database Error: {e}"}]

    candidates = []
    for artist, db_features in artist_database.items():
        m_score = calculate_musical_similarity(user_audio_features, db_features)
        candidates.append({'artist': artist, 'musical_score': m_score, 'db_features': db_features})

    # Sort & Shortlist
    candidates.sort(key=lambda x: x['musical_score'], reverse=True)
    shortlist = candidates[:10]
    shortlist_names = [c['artist'] for c in shortlist]
    
    # OpenAI Analysis
    ai_results = get_ai_lyrical_scores(user_lyrics, shortlist_names)
    
    final_results = []
    for c in shortlist:
        artist = c['artist']
        m_score = c['musical_score']
        
        # Extract AI data
        ai_data = ai_results.get(artist, {"score": 0.5, "reason": "No data"})
        l_score = ai_data.get("score", 0.5)
        reason = ai_data.get("reason", "Analysis unavailable")
        
        final_score = (0.5 * m_score) + (0.5 * l_score)
        
        # Add Technical Comparison Data for the Report
        final_results.append({
            'artist': artist,
            'final_score': final_score,
            'musical_score': m_score,
            'lyrical_score': l_score,
            'reason': reason,
            'tech_comparison': {
                'user_bpm': int(user_audio_features.get('tempo', 0)),
                'artist_bpm': int(c['db_features'].get('tempo', 0)),
                'user_energy': round(user_audio_features.get('energy', 0), 2),
                'artist_energy': round(c['db_features'].get('energy', 0), 2)
            }
        })
        
    final_results.sort(key=lambda x: x['final_score'], reverse=True)
    return final_results