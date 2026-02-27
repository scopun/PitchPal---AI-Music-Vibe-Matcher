import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from app.services.lyric_engine import get_semantic_shortlist
from app.core.database import get_database

CHROMA_VECTOR_KEY = 'avg_chroma_vector'

def calculate_musical_similarity(user_features, artist_features):
    user_chroma = np.array(user_features.get(CHROMA_VECTOR_KEY, [0]*12)).reshape(1, -1)
    artist_chroma = np.array(artist_features.get(CHROMA_VECTOR_KEY, [0]*12)).reshape(1, -1)
    
    try:
        chroma_score = cosine_similarity(user_chroma, artist_chroma)[0][0]
    except:
        chroma_score = 0.5 

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
    return (0.3 * chroma_score) + (0.7 * feature_score)

def get_genre_penalty(user_bpm, user_energy, artist_genres):
    electronic_genres = {"EDM", "House", "Drum & Bass", "UK Garage", "Tech House", "Dance", "Jump Up", "Bassline", "Techno", "Trance", "Dance-Pop", "Electro", "Liquid DnB", "Happy Hardcore", "Hard Dance", "Big Room", "Tropical House"}
    acoustic_genres = {"Acoustic", "Folk", "Ballad", "Indie Folk", "Soul", "Neo-Soul", "Jazz", "Ambient", "Lo-Fi", "Spoken Word", "Country", "Folk-Pop", "Blues"}
    
    artist_genres_set = set(artist_genres)
    is_electronic = bool(artist_genres_set & electronic_genres)
    is_acoustic = bool(artist_genres_set & acoustic_genres)
    
    penalty = 1.0
    
    if user_energy >= 0.75 and user_bpm >= 120:
        if is_acoustic and not is_electronic:
            penalty = 0.1 
            
    elif user_energy <= 0.55:
        if is_electronic and not is_acoustic:
            penalty = 0.1
            
    if user_bpm >= 150:
        if not is_electronic and is_acoustic:
            penalty = 0.1
            
    return penalty

async def find_best_match(user_audio_features, user_lyrics):
    artist_database = get_database()
    if not artist_database:
         return [{"error": "Database not available"}]

    semantic_candidates = await get_semantic_shortlist(user_lyrics, artist_database, user_audio_features)
    
    if not semantic_candidates:
        semantic_candidates = list(artist_database.keys())[:50]

    final_results = []
    user_bpm = user_audio_features.get('tempo', 0)
    user_energy = user_audio_features.get('energy', 0)

    for artist_name in semantic_candidates:
        if artist_name not in artist_database:
            continue
            
        db_features = artist_database[artist_name]
        artist_genres = db_features.get('genres', ['Pop'])
        
        m_score = calculate_musical_similarity(user_audio_features, db_features)
        
        try:
            rank_index = semantic_candidates.index(artist_name)
            l_score = max(0.5, 1.0 - (rank_index * 0.02)) 
        except ValueError:
            l_score = 0.5 
            
        penalty_factor = get_genre_penalty(user_bpm, user_energy, artist_genres)
        
        raw_score = (0.50 * m_score) + (0.50 * l_score)
        final_score = raw_score * penalty_factor
        
        primary_vibe = artist_genres[0] if artist_genres else "Vibe"

        final_results.append({
            'artist': artist_name,
            'final_score': round(final_score, 2), 
            'musical_score': round(m_score, 2),
            'lyrical_score': round(l_score, 2),
            'reason': f"Matched on {primary_vibe} energy & lyrical theme",
            'tech_comparison': {
                'user_bpm': int(user_bpm),
                'artist_bpm': int(db_features.get('tempo', 0)),
                'user_energy': round(user_energy, 2),
                'artist_energy': round(db_features.get('energy', 0), 2)
            }
        })

    final_results.sort(key=lambda x: x['final_score'], reverse=True)
    return final_results[:10]