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


def analyze_demo_track(audio_file: str):
    """
    Analyse a demo audio file and return musical features.
    Uses librosa 0.10+ compatible API (no deprecated filename= param).
    """
    try:
        # Load full file just to get duration (librosa 0.10+ compatible)
        y_full, sr_full = librosa.load(audio_file, sr=22050, mono=True)
        total_dur = librosa.get_duration(y=y_full, sr=sr_full)

        # Analyse from 30% in, for 20 seconds
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

        # Tempo
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        tempo, _ = librosa.beat.beat_track(onset_envelope=onset_env, sr=sr)
        if isinstance(tempo, np.ndarray):
            tempo = float(tempo[0])
        else:
            tempo = float(tempo)

        # Energy
        rms = librosa.feature.rms(y=y)
        energy = float(np.mean(rms))
        normalized_energy = min(energy * 10, 1.0)

        # Components
        y_harmonic, y_percussive = separate_components(y, sr)
        melody_features = analyze_vocal_melody(y_harmonic, sr)
        rhythm_features = analyze_rhythm_and_chords(y_percussive, sr)

        return {
            'tempo': tempo,
            'energy': normalized_energy,
            'median_f0': melody_features['median_f0'],
            'chroma_vector': melody_features['chroma_vector'],
            'avg_chroma_vector': melody_features['chroma_vector'],
            'rhythm_complexity': rhythm_features['rhythm_complexity'],
            'harmonic_change_rate': rhythm_features['harmonic_change_rate'],
            'duration': total_dur
        }

    except Exception as e:
        print(f"Audio Analysis Error: {e}")
        return None