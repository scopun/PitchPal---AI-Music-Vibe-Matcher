import numpy as np
import json
from sklearn.metrics.pairwise import cosine_similarity
from app.services.lyric_engine import get_semantic_shortlist
from app.core.config import settings
# Ensure you are importing from the new database file to avoid circular errors
from app.core.database import get_database

CHROMA_VECTOR_KEY = 'avg_chroma_vector'

def calculate_musical_similarity(user_features, artist_features):
    # 1. Chroma (Harmonic) Score
    user_chroma = np.array(user_features.get(CHROMA_VECTOR_KEY, [0]*12)).reshape(1, -1)
    artist_chroma = np.array(artist_features.get(CHROMA_VECTOR_KEY, [0]*12)).reshape(1, -1)
    
    try:
        chroma_score = cosine_similarity(user_chroma, artist_chroma)[0][0]
    except:
        chroma_score = 0.5 # Fallback

    # 2. Feature Distance Score
    feature_weights = {
        'tempo': {'max_diff': 30.0, 'weight': 0.35},
        'energy': {'max_diff': 0.4, 'weight': 0.35},
        'rhythm_complexity': {'max_diff': 40.0, 'weight': 0.15},
        'median_f0': {'max_diff': 150.0, 'weight': 0.15}
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
    
    # Combined Audio Score
    return (0.3 * chroma_score) + (0.7 * feature_score)

async def find_best_match(user_audio_features, user_lyrics):
    # Load DB from RAM Cache
    artist_database = get_database()
    
    if not artist_database:
         return [{"error": "Database not available (Cache Empty)."}]

    print("🚀 Sending to AI (Async)...")
    
    semantic_candidates = await get_semantic_shortlist(user_lyrics, artist_database, user_audio_features)
    
    if not semantic_candidates:
        print("⚠️ AI returned empty. Using broad fallback.")
        semantic_candidates = list(artist_database.keys())[:50]

    final_results = []
    
    user_bpm = user_audio_features.get('tempo', 0)
    user_energy = user_audio_features.get('energy', 0)

    for artist_name in semantic_candidates:
        if artist_name not in artist_database:
            continue
            
        db_features = artist_database[artist_name]
        
        # 1. Musical Score
        m_score = calculate_musical_similarity(user_audio_features, db_features)
        
        # 2. Lyrical/Vibe Score
        try:
            rank_index = semantic_candidates.index(artist_name)
            # Top result gets 1.0, 2nd gets 0.98...
            l_score = max(0.5, 1.0 - (rank_index * 0.03)) 
        except ValueError:
            l_score = 0.5 
        
        # 3. THE VETO LOGIC
        penalty_factor = 1.0
        artist_bpm = db_features.get('tempo', 0)
        
        if user_bpm > 125 and artist_bpm < 110:
            penalty_factor = 0.6  
        elif user_bpm < 100 and artist_bpm > 120:
            penalty_factor = 0.6

        # 4. Final Weighted Score
        raw_score = (0.40 * m_score) + (0.60 * l_score)
        final_score = raw_score * penalty_factor
        
        # Determine the primary "Vibe" for the reason text
        artist_genres = db_features.get('genres', ['Pop'])
        primary_vibe = artist_genres[0] if artist_genres else "General"

        final_results.append({
            'artist': artist_name,
            # FIXED: Return decimal (0.92) not integer (92.0)
            'final_score': round(final_score, 2), 
            
            # FIXED: Renamed keys back to what Frontend expects
            'musical_score': round(m_score, 2),
            'lyrical_score': round(l_score, 2),
            
            # Improved Reason Text
            'reason': f"Matched on {primary_vibe} energy & lyrical theme",
            
            'tech_comparison': {
                'user_bpm': int(user_bpm),
                'artist_bpm': int(artist_bpm),
                'user_energy': round(user_energy, 2),
                'artist_energy': round(db_features.get('energy', 0), 2)
            }
        })

    final_results.sort(key=lambda x: x['final_score'], reverse=True)
    return final_results[:10]