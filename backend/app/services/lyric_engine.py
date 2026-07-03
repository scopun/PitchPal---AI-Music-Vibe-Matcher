import os
import json
import re
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Matching brain model. Accuracy is the whole product, so we use the most
# capable model available. Both stages (genre detection + matching) use it.
MODEL = "claude-opus-4-8"

_WHO_LOOKING = None


def get_who_looking():
    global _WHO_LOOKING
    if _WHO_LOOKING is None:
        try:
            db_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'who_is_looking.json')
            with open(db_path, 'r') as f:
                _WHO_LOOKING = json.load(f)
        except Exception as e:
            print(f"Warning: Could not load who_is_looking.json: {e}")
            _WHO_LOOKING = {"actively_looking": [], "not_available": [], "deceased": []}
    return _WHO_LOOKING


_WRITES_OWN = None


def get_writes_own() -> set[str]:
    """Normalized names of artists who write their own material and are
    unlikely to take an outside song. Cached after first load."""
    global _WRITES_OWN
    if _WRITES_OWN is None:
        try:
            path = os.path.join(os.path.dirname(__file__), '..', 'data', 'writes_own_songs.json')
            with open(path, 'r') as f:
                data = json.load(f)
            _WRITES_OWN = {_normalize_name(n) for n in data.get("writes_own", [])}
        except Exception as e:
            print(f"Warning: Could not load writes_own_songs.json: {e}")
            _WRITES_OWN = set()
    return _WRITES_OWN


def is_lyrics_meaningful(lyrics: str) -> bool:
    if not lyrics or len(lyrics.strip()) < 20:
        return False
    words = lyrics.split()
    if len(words) < 15:
        return False
    if lyrics.count('?') > len(words) * 0.3:
        return False
    artifacts = ['artlist', 'music licensing', 'royalty free']
    if sum(1 for a in artifacts if a in lyrics.lower()) >= 2:
        return False
    return True


def clean_lyrics(lyrics: str) -> str:
    result = lyrics
    for w in ["artlist io", "artlist.io", "artless io", "artless i o",
              "music licensing reimagined", "music licensing reimagine",
              "music licensing", "royalty free"]:
        result = result.lower().replace(w, " ")
    return re.sub(r'\s+', ' ', result).strip()


# ─────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────

def _normalize_name(name: str) -> str:
    """Lowercase, strip punctuation/parentheticals so 'Leigh-Anne (Little
    Mix)' and 'leigh anne' compare equal. Used by the not-available filter."""
    if not name:
        return ""
    n = name.lower()
    n = re.sub(r"\(.*?\)", " ", n)          # drop parentheticals
    n = re.sub(r"[^a-z0-9 ]", " ", n)        # drop punctuation/accents-ish
    n = re.sub(r"\s+", " ", n).strip()
    return n


def _is_blocked(artist_name: str, blocked_norm: set[str]) -> bool:
    """True if this artist is on the not-available / deceased lists. Matches
    on normalized full name, or when a blocked name is fully contained in the
    match name (handles 'Leigh-Anne' vs 'Leigh-Anne (Little Mix)')."""
    norm = _normalize_name(artist_name)
    if not norm:
        return False
    if norm in blocked_norm:
        return True
    for b in blocked_norm:
        if not b:
            continue
        # Whole-token containment both directions, e.g. "dermot kennedy"
        if b == norm or b in norm.split(" / ") or f" {b} " in f" {norm} ":
            return True
    return False


def build_audio_hints(tempo, acousticness, danceability, energy, vocal_hint):
    """Turn raw librosa numbers into a short, NEUTRAL descriptive block.

    IMPORTANT: this no longer pushes the matcher toward any genre. The old
    version hard-coded "default to singer-songwriter, not dance" which made
    every non-EDM track collapse onto the same singer-songwriter cluster.
    These are now treated as *noisy hints* only — the genre detector decides
    the real genre from the whole picture (lyrics + sound)."""
    if acousticness > 0.6:
        production = "leans acoustic/organic (live instruments likely)"
    elif acousticness > 0.35:
        production = "hybrid acoustic + electronic"
    else:
        production = "leans electronic/produced (synths, programmed beats)"

    if tempo < 75:
        tempo_h = "slow"
    elif tempo < 95:
        tempo_h = "mid-tempo"
    elif tempo < 115:
        tempo_h = "upbeat"
    elif tempo < 130:
        tempo_h = "fast"
    else:
        tempo_h = "very fast"

    if energy < 0.35:
        energy_h = "low energy / intimate"
    elif energy < 0.6:
        energy_h = "moderate energy"
    else:
        energy_h = "high energy"

    return production, tempo_h, energy_h


def _vocal_hint(audio_features: dict) -> str:
    median_f0 = audio_features.get('median_f0', 0)
    vocal_confidence = audio_features.get('vocal_confidence', 0.0)
    if vocal_confidence < 0.15 or median_f0 <= 0:
        return "Unclear/instrumental"
    if median_f0 > 175:
        return "Female vocals"
    if median_f0 > 80:
        return "Male vocals"
    return "Unclear/instrumental"


def _audio_block(audio_features: dict, vocal_hint: str) -> str:
    tempo = audio_features.get('tempo', 0)
    energy = audio_features.get('energy', 0)
    acousticness = audio_features.get('acousticness', 0.5)
    danceability = audio_features.get('danceability', 0.5)
    harmonic_ratio = audio_features.get('harmonic_ratio', None)
    spectral_centroid = audio_features.get('spectral_centroid', None)

    prod, tempo_h, energy_h = build_audio_hints(tempo, acousticness, danceability, energy, vocal_hint)
    parts = [
        f"BPM ~{tempo:.0f} ({tempo_h})",
        f"Energy {energy:.2f} ({energy_h})",
        f"Acousticness {acousticness:.2f} ({prod})",
        f"Danceability {danceability:.2f}",
        f"Vocals: {vocal_hint}",
    ]
    if harmonic_ratio is not None:
        parts.append(f"Harmonic ratio {harmonic_ratio:.2f}")
    if spectral_centroid is not None:
        parts.append(f"Spectral centroid {spectral_centroid:.0f} Hz")
    return ", ".join(parts)


def _call_model(system_prompt: str, user_message: str, max_tokens: int = 2000) -> dict:
    """Run one Claude call and parse the first JSON object out of it."""
    response = anthropic_client.messages.create(
        model=MODEL,
        max_tokens=max_tokens,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )
    raw_text = response.content[0].text.strip()
    json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
    if not json_match:
        raise ValueError(f"No JSON in model response: {raw_text[:300]}")
    return json.loads(json_match.group(0))


# ─────────────────────────────────────────────────────────────────────────
# STAGE 1 — Genre / sonic-profile detection
# Its ONLY job is to say what the song IS. No artist matching, no pool, no
# priming. This is the ground truth the whole match depends on.
# ─────────────────────────────────────────────────────────────────────────

def _detect_profile(song_data: str, detected_language: str, vibe_hint: str = "") -> dict:
    system_prompt = """You are a senior musicologist and A&R analyst. Your ONLY
job is to identify precisely WHAT a song is — its genre, sonic world, mood and
vocal character. You do NOT suggest artists to pitch to. Be decisive and specific.

How to read the inputs:
- ARTIST-PROVIDED DIRECTION (if present) is AUTHORITATIVE. The songwriter has
  told you the intended genre and/or reference artists. A rough demo often does
  NOT yet sound like its intended final genre (e.g. a piano/vocal sketch meant
  to become a tech-house record). When a direction is given, set detected_genre
  to match THAT intent, fold the named reference artists into reference_artists,
  and treat the audio numbers as secondary colour only. Do not override the
  stated intent with what the rough audio happens to sound like.
- LYRICS / DESCRIPTION carry the strongest signal about theme, era and lane.
- AUDIO numbers (BPM, acousticness, danceability, energy) are NOISY machine
  hints from a rough analyser — use them as soft evidence, NOT gospel. The
  danceability number in particular runs high for almost all produced music, so
  NEVER call something "dance" on danceability alone. A track can be country-pop,
  neo-soul, nu-disco or theatrical alt-pop at very similar tempos/acousticness,
  so do not collapse everything into "ballad" or "singer-songwriter" just
  because energy is moderate.

Name the genre as specifically as a music journalist would. Examples of the
precision expected: "country-pop", "neo-soul / contemporary R&B", "nu-disco /
funky house", "melodic / progressive house", "theatrical alt-pop", "glam-rock
pop", "emotional piano ballad (Lewis Capaldi lane)", "drum & bass", "jazz-pop".
Do NOT default to a generic "pop" or "singer-songwriter" label unless the song
genuinely is that.

Return ONLY valid JSON:
{
  "detected_genre": "the single most accurate specific genre label",
  "subgenres": ["1-3 adjacent sub-genres"],
  "genre_tags": ["4-7 short descriptive tags"],
  "sonic_descriptors": ["production/texture words e.g. warm, string-led, gritty, glossy, sparse, funky"],
  "mood": "short mood description",
  "energy_level": "low | medium | high",
  "tempo_feel": "ballad | mid-tempo | upbeat | club",
  "production": "acoustic | hybrid | electronic, plus one detail",
  "vocal": "male | female | unclear, plus vocal character",
  "reference_artists": ["3-5 real-world artists this MOST sounds like — pick freely from the whole industry, the truest comparisons, not a fixed list"],
  "avoid_genres": ["genres this is clearly NOT, e.g. dance/EDM, country"]
}"""

    hint_block = ""
    if vibe_hint and vibe_hint.strip():
        hint_block = (
            "ARTIST-PROVIDED DIRECTION (authoritative — this is the intended "
            f"genre / reference artists for the FINAL record):\n{vibe_hint.strip()}\n\n"
        )
    user_message = f"{hint_block}Detected language: {detected_language}\n\n{song_data}\n\nIdentify the song. Return ONLY the JSON."
    return _call_model(system_prompt, user_message, max_tokens=1200)


# ─────────────────────────────────────────────────────────────────────────
# STAGE 2 — Match the detected profile against the Who's-Looking pool +
# industry knowledge. Clean prompt, NO hard-coded artist example lists (those
# were what biased the old output toward the same singer-songwriter cluster).
# ─────────────────────────────────────────────────────────────────────────

def _match_to_pool(profile: dict, who_looking_str: str, not_available_str: str,
                   deceased_str: str, detected_language: str) -> dict:
    is_english = detected_language.lower() in ['en', 'english', '']
    lang_rule = "" if is_english else (
        f"\nLANGUAGE — ABSOLUTE: the song is in {detected_language.upper()}. "
        "Only match artists who genuinely release music in this language/market. "
        "Never match a UK/US English artist to a non-English song."
    )

    system_prompt = f"""You are an expert A&R at a major UK music publisher with
20 years of pitching experience. You are given a PRECISE sonic profile of a song
(its genre is already identified and authoritative). Your job is to find the
artists this song should be pitched to.

TWO sources:
SOURCE 1 — WHO'S LOOKING (artists actively seeking songs right now). Each has a
genre, sonic profile, and a NOT list. Prefer these when they genuinely fit:
{who_looking_str}

SOURCE 2 — your full music-industry knowledge (label these "Industry Match").

MATCHING RULES — follow exactly:
1. Match on the song's DETECTED GENRE and sonic world first. The genre is
   authoritative. If the song is country-pop, return country / country-pop
   artists. If neo-soul, return soul / R&B / jazz-pop artists. If nu-disco or
   house, return disco / house artists. If theatrical alt-pop, return alt-pop
   artists. Do NOT substitute a generic emotional-pop / singer-songwriter
   roster when the genre is something else — that is the #1 failure to avoid.
2. NOT-list enforcement: for each WHO'S LOOKING artist, read their NOT field.
   If the song's genre/tags/descriptors hit ANY phrase in their NOT list, that
   artist scores below 0.78 and is excluded. Apply this BEFORE scoring.
3. Vocal register: if the song's vocal is clearly male, matches must be mostly
   artists who perform in a male register (the artist has to be able to sing
   this melody), and likewise for female. "Unclear" → no vocal constraint.
   This is a strong preference, not a reason to override genre.
4. Scoring (be conservative, default lower when unsure):
   - 0.92+  Strong Match  (genre, mood, production, vocal all align)
   - 0.85-0.91  Good Match  (clear genre + sonic alignment)
   - 0.78-0.84  Worth Considering (adjacent, may suit with adjustment)
   - below 0.78  EXCLUDE — do not return
5. Return the 5-8 best matches, highest score first. Never force weak matches —
   if only 2-3 genuinely fit at 0.85+, return only those. It is better to
   return 3 right artists than 8 with 5 wrong ones.
6. NEVER suggest these (not available): {not_available_str}
7. NEVER suggest these (deceased): {deceased_str}{lang_rule}

Return ONLY valid JSON:
{{
  "matches": [
    {{
      "artist": "Name",
      "label": "Label or '' for industry matches",
      "territory": "UK or International",
      "source": "Who's Looking" or "Industry Match",
      "final_score": 0.88,
      "reason": "Why this artist fits THIS song's genre and sound specifically.",
      "genre_fit": "How the song's genre maps to the artist's lane",
      "brief_match": "How the song slots into what they're looking for"
    }}
  ],
  "pitch_angle": "One-line commercial pitch for this song",
  "market_fit": "Target audience / market"
}}"""

    profile_str = json.dumps(profile, ensure_ascii=False, indent=2)
    user_message = (
        f"SONG SONIC PROFILE (authoritative):\n{profile_str}\n\n"
        "Find the best artist matches. Return ONLY the JSON."
    )
    return _call_model(system_prompt, user_message, max_tokens=3000)


# ─────────────────────────────────────────────────────────────────────────
# Public entrypoint — preserves the original signature + output shape so the
# /match endpoint and matcher.py keep working unchanged.
# ─────────────────────────────────────────────────────────────────────────

async def get_claude_vibe_match(audio_features: dict, lyrics: str = "", detected_language: str = "en", vibe_hint: str = "") -> dict:
    db = get_who_looking()
    actively_looking = db.get("actively_looking", [])
    not_available = db.get("not_available", [])
    deceased = db.get("deceased", [])

    # Build who's looking list string (genre + sonic + NOT, all of which the
    # matcher now relies on heavily).
    artist_lines = []
    for a in actively_looking:
        line = f"- {a['artist']} ({a.get('label','')}, {a.get('territory','')})"
        if a.get('genre'):
            line += f" | GENRE: {a['genre']}"
        if a.get('brief'):
            line += f" | BRIEF: {a['brief']}"
        if a.get('sonic_profile'):
            line += f" | SOUND: {a['sonic_profile']}"
        if a.get('not_this'):
            line += f" | NOT: {a['not_this']}"
        artist_lines.append(line)
    who_looking_str = "\n".join(artist_lines)
    not_available_str = ", ".join(not_available)
    deceased_str = ", ".join(deceased)

    # Build the song-data block from whatever we have (lyrics and/or audio).
    tempo = audio_features.get('tempo', 0)
    energy = audio_features.get('energy', 0)
    vocal_hint = _vocal_hint(audio_features)
    cleaned_lyrics = clean_lyrics(lyrics) if lyrics else ""
    has_audio = tempo > 0 or energy > 0
    has_text = len(cleaned_lyrics.strip()) > 5

    is_english = detected_language.lower() in ['en', 'english', '']
    lang_note = "" if is_english else f"\n(Song language: {detected_language.upper()})"

    if has_text and has_audio:
        song_data = (
            f"LYRICS:{lang_note}\n{cleaned_lyrics}\n\n"
            f"AUDIO (noisy machine hints): {_audio_block(audio_features, vocal_hint)}"
        )
    elif has_text:
        song_data = f"DESCRIPTION:{lang_note}\n{cleaned_lyrics}"
    elif has_audio:
        song_data = f"AUDIO (noisy machine hints): {_audio_block(audio_features, vocal_hint)}"
    else:
        return {"matches": [], "detected_genre": "No data", "genre_tags": [],
                "pitch_angle": "Please upload an audio file.", "market_fit": "", "success": True}

    try:
        # ── Stage 1: detect what the song IS ────────────────────────────────
        try:
            profile = _detect_profile(song_data, detected_language, vibe_hint)
        except Exception as e:
            # Fallback: a minimal profile from the audio block so Stage 2 can
            # still run if the detector call fails.
            print(f"Genre detection failed, using fallback profile: {e}")
            profile = {
                "detected_genre": "Unknown",
                "genre_tags": [],
                "sonic_descriptors": [],
                "mood": "",
                "vocal": vocal_hint,
                "reference_artists": [],
                "_raw_song_data": song_data,
            }

        # ── Stage 2: match the profile to the pool + industry ──────────────
        match_result = _match_to_pool(
            profile, who_looking_str, not_available_str, deceased_str, detected_language
        )
        matches = match_result.get("matches", []) if isinstance(match_result, dict) else []

        # ── Code-level filters (defense in depth — never trust prompt only)─
        blocked_norm = {_normalize_name(n) for n in (not_available + deceased)}
        writes_own_norm = get_writes_own()
        clean_matches = []
        for m in matches:
            if not isinstance(m, dict):
                continue
            if m.get("final_score", 0) < 0.78:
                continue
            if _is_blocked(m.get("artist", ""), blocked_norm):
                continue  # hard-drop not-available / deceased artists
            score = m.get("final_score", 0)
            if score >= 0.92:
                m["confidence_level"] = "Strong Match"
            elif score >= 0.85:
                m["confidence_level"] = "Good Match"
            else:
                m["confidence_level"] = "Worth Considering"
            # Flag artists who write their own material — still shown (strong
            # sonic match) but marked so the user knows a pitch is unlikely to
            # land (Ciara: e.g. London Grammar).
            if _normalize_name(m.get("artist", "")) in writes_own_norm:
                m["writes_own"] = True
            clean_matches.append(m)

        clean_matches.sort(key=lambda m: m.get("final_score", 0), reverse=True)

        # Dedup by artist name — the model occasionally lists the same artist
        # twice. Keep the highest-scored occurrence (list is already sorted).
        seen_names: set[str] = set()
        deduped = []
        for m in clean_matches:
            key = _normalize_name(m.get("artist", ""))
            if key in seen_names:
                continue
            seen_names.add(key)
            deduped.append(m)
        clean_matches = deduped

        # ── Assemble the final result in the legacy output shape ───────────
        genre_tags = profile.get("genre_tags") or profile.get("subgenres") or []
        result = {
            "matches": clean_matches,
            "detected_genre": profile.get("detected_genre", "Unknown"),
            "detected_language": detected_language,
            "genre_tags": genre_tags if isinstance(genre_tags, list) else [],
            "pitch_angle": match_result.get("pitch_angle", "") if isinstance(match_result, dict) else "",
            "market_fit": match_result.get("market_fit", "") if isinstance(match_result, dict) else "",
            "vibe_hint": vibe_hint or "",  # the artist-provided direction, if any
            "sonic_profile": profile,  # full detector output, handy for debugging / UI
            "match_summary": {
                "strong_matches": sum(1 for m in clean_matches if m.get("final_score", 0) >= 0.92),
                "good_matches": sum(1 for m in clean_matches if 0.85 <= m.get("final_score", 0) < 0.92),
                "worth_considering": sum(1 for m in clean_matches if 0.78 <= m.get("final_score", 0) < 0.85),
                "total": len(clean_matches),
            },
        }
        return result

    except Exception as e:
        return {"error": str(e), "matches": []}
