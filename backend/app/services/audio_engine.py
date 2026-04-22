import librosa
import numpy as np


def separate_components(y, sr):
    y_harmonic, y_percussive = librosa.effects.hpss(y)
    return y_harmonic, y_percussive


def analyze_vocal_melody(y_harmonic, sr):
    pitches, magnitudes = librosa.piptrack(
        y=y_harmonic, sr=sr,
        fmin=librosa.note_to_hz('C2'),
        fmax=librosa.note_to_hz('C6')
    )
    pitch_indices = np.argmax(magnitudes, axis=0)
    pitch_vals = []

    for t in range(magnitudes.shape[1]):
        index = pitch_indices[t]
        if magnitudes[index, t] > np.median(magnitudes):
            pitch_vals.append(pitches[index, t])

    median_f0 = np.median(pitch_vals) if pitch_vals else 0.0
    chroma = librosa.feature.chroma_stft(y=y_harmonic, sr=sr)
    avg_chroma = np.mean(chroma, axis=1)

    return {
        'median_f0': float(median_f0),
        'chroma_vector': avg_chroma.tolist()
    }


def analyze_rhythm_and_chords(y_percussive, sr):
    tempo, beats = librosa.beat.beat_track(y=y_percussive, sr=sr)
    if isinstance(tempo, np.ndarray):
        tempo = float(tempo[0])
    else:
        tempo = float(tempo)

    duration = librosa.get_duration(y=y_percussive, sr=sr)
    rhythm_complexity = len(beats) / (duration / 60) if duration > 0 else 0

    onset_harmonic = librosa.onset.onset_detect(y=y_percussive, sr=sr, units='time')
    harmonic_changes = len(onset_harmonic) / duration if duration > 0 else 0

    return {
        'rhythm_complexity': float(rhythm_complexity),
        'harmonic_change_rate': float(harmonic_changes),
    }


def analyze_acousticness(y, sr):
    """
    Detect how acoustic vs electronic a track is.
    High value = acoustic (country, folk, singer-songwriter)
    Low value = electronic (dance, EDM, synth-pop)
    """
    # Spectral centroid — low = acoustic, high = electronic
    spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    mean_centroid = float(np.mean(spectral_centroid))

    # Spectral rolloff — low = acoustic, high = electronic
    rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
    mean_rolloff = float(np.mean(rolloff))

    # Zero crossing rate — low = tonal/acoustic, high = noisy/electronic
    zcr = librosa.feature.zero_crossing_rate(y)
    mean_zcr = float(np.mean(zcr))

    # Spectral bandwidth — low = acoustic/simple, high = complex/electronic
    bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)
    mean_bandwidth = float(np.mean(bandwidth))

    # Harmonic ratio — high = acoustic/harmonic, low = percussive/electronic
    y_harmonic, y_percussive = librosa.effects.hpss(y)
    harmonic_power = float(np.mean(y_harmonic ** 2))
    percussive_power = float(np.mean(y_percussive ** 2))
    total_power = harmonic_power + percussive_power
    harmonic_ratio = harmonic_power / total_power if total_power > 0 else 0.5

    # Acousticness score (0.0 = fully electronic, 1.0 = fully acoustic)
    # Normalize centroid: typical range 500-4000 Hz
    # Low centroid (500-1500) = acoustic, high (2000+) = electronic
    centroid_score = max(0, 1 - (mean_centroid - 500) / 3500)
    centroid_score = min(1, max(0, centroid_score))

    # ZCR score: low zcr = acoustic
    zcr_score = max(0, 1 - (mean_zcr * 20))
    zcr_score = min(1, max(0, zcr_score))

    # Combined acousticness
    acousticness = (centroid_score * 0.4 + harmonic_ratio * 0.4 + zcr_score * 0.2)
    acousticness = min(1.0, max(0.0, acousticness))

    return {
        'acousticness': round(float(acousticness), 3),
        'spectral_centroid': round(mean_centroid, 1),
        'harmonic_ratio': round(harmonic_ratio, 3),
    }


def analyze_danceability(y, sr, tempo):
    """
    Detect how danceable a track is.
    High value = dance/electronic/pop
    Low value = ballad/acoustic/folk
    """
    # Beat strength
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    beat_strength = float(np.mean(onset_env))

    # Tempo regularity (consistent beats = more danceable)
    tempo_frames = librosa.beat.beat_track(onset_envelope=onset_env, sr=sr)[1]
    if len(tempo_frames) > 1:
        beat_intervals = np.diff(tempo_frames)
        tempo_regularity = 1 - min(1, float(np.std(beat_intervals)) / 10)
    else:
        tempo_regularity = 0.5

    # BPM contribution (90-140 BPM = most danceable)
    if 90 <= tempo <= 140:
        bpm_score = 1.0
    elif tempo < 90:
        bpm_score = tempo / 90
    else:
        bpm_score = max(0, 1 - (tempo - 140) / 40)

    # Combined danceability
    danceability = (
        beat_strength * 0.1 +
        tempo_regularity * 0.5 +
        bpm_score * 0.4
    )
    danceability = min(1.0, max(0.0, danceability))

    return round(float(danceability), 3)


def analyze_demo_track(audio_file: str):
    """
    Full audio analysis including acousticness and danceability.
    These features help Claude accurately detect genre.
    """
    try:
        y_full, sr_full = librosa.load(audio_file, sr=22050, mono=True)
        total_dur = librosa.get_duration(y=y_full, sr=sr_full)

        offset = total_dur * 0.3
        duration_to_analyze = 20

        if total_dur < offset + duration_to_analyze:
            offset = 0

        y, sr = librosa.load(
            audio_file,
            offset=offset,
            duration=duration_to_analyze,
            sr=22050,
            mono=True
        )

        # Tempo & energy
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        tempo, _ = librosa.beat.beat_track(onset_envelope=onset_env, sr=sr)
        if isinstance(tempo, np.ndarray):
            tempo = float(tempo[0])
        else:
            tempo = float(tempo)

        rms = librosa.feature.rms(y=y)
        energy = float(np.mean(rms))
        normalized_energy = min(energy * 10, 1.0)

        # Components
        y_harmonic, y_percussive = separate_components(y, sr)
        melody_features = analyze_vocal_melody(y_harmonic, sr)
        rhythm_features = analyze_rhythm_and_chords(y_percussive, sr)

        # NEW: Acousticness + Danceability
        acoustic_features = analyze_acousticness(y, sr)
        danceability = analyze_danceability(y, sr, tempo)

        return {
            'tempo': tempo,
            'energy': normalized_energy,
            'median_f0': melody_features['median_f0'],
            'chroma_vector': melody_features['chroma_vector'],
            'avg_chroma_vector': melody_features['chroma_vector'],
            'rhythm_complexity': rhythm_features['rhythm_complexity'],
            'harmonic_change_rate': rhythm_features['harmonic_change_rate'],
            'duration': total_dur,
            # Genre detection helpers
            'acousticness': acoustic_features['acousticness'],
            'danceability': danceability,
            'harmonic_ratio': acoustic_features['harmonic_ratio'],
            'spectral_centroid': acoustic_features['spectral_centroid'],
        }

    except Exception as e:
        print(f"Audio Analysis Error: {e}")
        return None