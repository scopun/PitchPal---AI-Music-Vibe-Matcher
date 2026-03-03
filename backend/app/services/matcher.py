import re
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from app.services.lyric_engine import get_semantic_shortlist
from app.core.database import get_database

CHROMA_VECTOR_KEY = "avg_chroma_vector"

def _norm_text(t: str) -> str:
    t = (t or "").lower()
    t = re.sub(r"\s+", " ", t).strip()
    return t

def classify_bucket(user_lyrics: str, bpm: float, energy: float) -> str:
    text = _norm_text(user_lyrics)

    girl_group_hits = [
        "girl", "girls", "girlband", "champion", "take over the world",
        "name in lights", "polaroid", "hit us on repeat", "la la"
    ]
    ballad_hits = [
        "saviour", "faith", "religion", "soul", "heart", "believe",
        "breathe again", "let go", "reborn", "crave"
    ]
    club_hits = [
        "club", "dancefloor", "drop", "dj", "rave", "festival", "edm"
    ]

    gg = sum(1 for k in girl_group_hits if k in text)
    bb = sum(1 for k in ballad_hits if k in text)
    cc = sum(1 for k in club_hits if k in text)

    if gg >= 2:
        return "girl_group_pop"

    if bb >= 2 and energy <= 0.75:
        return "ballad_pop"

    if cc >= 2 and bpm >= 120 and energy >= 0.75:
        return "edm_club"

    if bpm >= 118 and energy >= 0.70:
        return "pop_dance_vocal"

    return "general_pop"

def infer_artist_bucket_from_genres(genres: list[str]) -> str:
    g = set([x.strip() for x in (genres or [])])

    edm = {
        "EDM", "House", "Tech House", "UK Garage", "Drum & Bass", "DnB",
        "Dance", "Techno", "Trance", "Happy Hardcore", "Hard Dance",
        "Electro", "Big Room", "Bassline", "Jump Up", "Liquid DnB"
    }
    pop_dance = {"Dance-Pop", "Pop", "Disco", "Electronic", "Electropop"}
    ballad = {"Ballad", "Acoustic", "Folk", "Indie Folk", "Soul", "Neo-Soul", "Jazz", "Blues"}
    girl = {"Girl Group", "Girlband"}

    if g & girl:
        return "girl_group_pop"

    if g & edm and not (g & ballad):
        return "edm_club"

    if g & ballad and not (g & edm):
        return "ballad_pop"

    if g & pop_dance and (g & edm):
        return "pop_dance_vocal"

    if g & pop_dance:
        return "general_pop"

    return "general_pop"

def bucket_penalty(pred_bucket: str, artist_bucket: str) -> float:
    if pred_bucket == artist_bucket:
        return 1.00

    soft = {
        ("pop_dance_vocal", "edm_club"),
        ("edm_club", "pop_dance_vocal"),
        ("general_pop", "pop_dance_vocal"),
        ("general_pop", "girl_group_pop"),
    }
    if (pred_bucket, artist_bucket) in soft:
        return 0.85

    return 0.60

def producer_penalty(pred_bucket: str, artist_name: str, artist_genres: list[str]) -> float:
    name = (artist_name or "").lower()
    g = set([x.lower() for x in (artist_genres or [])])

    producer_signals = {
        "calvin harris", "david guetta", "tiësto", "tiesto", "jax jones",
        "john summit", "swedish house mafia", "alan walker", "armin",
        "punctual"
    }

    is_producer = (name in producer_signals) or ("dj" in g) or ("producer" in g)

    if pred_bucket in {"girl_group_pop", "ballad_pop"} and is_producer:
        return 0.65

    return 1.00

def calculate_musical_similarity(user_features, artist_features):
    user_chroma = np.array(user_features.get(CHROMA_VECTOR_KEY, [0] * 12)).reshape(1, -1)
    artist_chroma = np.array(artist_features.get(CHROMA_VECTOR_KEY, [0] * 12)).reshape(1, -1)

    try:
        chroma_score = float(cosine_similarity(user_chroma, artist_chroma)[0][0])
    except Exception:
        chroma_score = 0.50

    feature_weights = {
        "tempo": {"max_diff": 35.0, "weight": 0.15},
        "energy": {"max_diff": 0.45, "weight": 0.20},
        "rhythm_complexity": {"max_diff": 40.0, "weight": 0.20},
        "median_f0": {"max_diff": 160.0, "weight": 0.10},
        "harmonic_change_rate": {"max_diff": 2.0, "weight": 0.05},
    }

    total_sim = 0.0
    total_weight = 0.0

    for key, params in feature_weights.items():
        if key in user_features:
            u_val = float(user_features.get(key, 0.0))
            a_val = float(artist_features.get(key, 0.0))
            diff = abs(u_val - a_val)
            sim = max(0.0, 1.0 - (diff / params["max_diff"]))
            total_sim += sim * params["weight"]
            total_weight += params["weight"]

    feature_score = (total_sim / total_weight) if total_weight > 0 else 0.50

    return (0.65 * chroma_score) + (0.35 * feature_score)

async def find_best_match(user_audio_features, user_lyrics):
    artist_database = get_database()
    if not artist_database:
        return [{"error": "Database not available"}]

    user_bpm = float(user_audio_features.get("tempo", 0.0))
    user_energy = float(user_audio_features.get("energy", 0.0))

    pred_bucket = classify_bucket(user_lyrics, user_bpm, user_energy)

    semantic_candidates = await get_semantic_shortlist(user_lyrics, artist_database, user_audio_features)

    if not semantic_candidates:
        semantic_candidates = list(artist_database.keys())[:80]

    final_results = []

    for artist_name in semantic_candidates:
        if artist_name not in artist_database:
            continue

        db_features = artist_database[artist_name]
        artist_genres = db_features.get("genres", ["Pop"])

        m_score = calculate_musical_similarity(user_audio_features, db_features)

        try:
            rank_index = semantic_candidates.index(artist_name)
            l_score = max(0.50, 1.0 - (rank_index * 0.02))
        except ValueError:
            l_score = 0.50

        artist_bucket = infer_artist_bucket_from_genres(artist_genres)
        b_pen = bucket_penalty(pred_bucket, artist_bucket)
        p_pen = producer_penalty(pred_bucket, artist_name, artist_genres)

        raw_score = (0.50 * m_score) + (0.50 * l_score)
        final_score = raw_score * b_pen * p_pen

        primary_vibe = artist_genres[0] if artist_genres else "Vibe"

        final_results.append({
            "artist": artist_name,
            "final_score": round(final_score, 2),
            "musical_score": round(m_score, 2),
            "lyrical_score": round(l_score, 2),
            "reason": f"Bucket {pred_bucket} matched with {primary_vibe}",
            "tech_comparison": {
                "user_bpm": int(user_bpm),
                "artist_bpm": int(db_features.get("tempo", 0)),
                "user_energy": round(user_energy, 2),
                "artist_energy": round(float(db_features.get("energy", 0.0)), 2)
            }
        })

    final_results.sort(key=lambda x: x["final_score"], reverse=True)
    return final_results[:10]