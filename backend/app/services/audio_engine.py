import librosa
import numpy as np

def separate_components(y, sr):
    y_harmonic, y_percussive = librosa.effects.hpss(y)
    return y_harmonic, y_percussive

def analyze_vocal_melody(y_harmonic, sr):
    f0, _, _ = librosa.pyin(
        y_harmonic, 
        fmin=librosa.note_to_hz('C2'), 
        fmax=librosa.note_to_hz('C6'),
        sr=sr
    )
    median_f0 = np.median(f0[f0 > 0]) if np.any(f0 > 0) else 0.0
    chroma = librosa.feature.chroma_stft(y=y_harmonic, sr=sr)
    avg_chroma = np.mean(chroma, axis=1)
    
    return {
        'median_f0': float(median_f0) if not np.isnan(median_f0) else 0.0,
        'chroma_vector': avg_chroma.tolist() 
    }

def analyze_rhythm_and_chords(y_percussive, sr):
    tempo, beats = librosa.beat.beat_track(y=y_percussive, sr=sr)
    rhythm_complexity = len(beats) / (librosa.get_duration(y=y_percussive, sr=sr) / 60)
    onset_harmonic = librosa.onset.onset_detect(y=y_percussive, sr=sr, units='time')
    harmonic_changes = len(onset_harmonic) / librosa.get_duration(y=y_percussive, sr=sr)
    
    return {
        'rhythm_complexity': float(rhythm_complexity),
        'harmonic_change_rate': float(harmonic_changes),
    }

def analyze_demo_track(audio_file):
    try:
        y, sr = librosa.load(audio_file, duration=30, sr=22050)
        
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        tempo, _ = librosa.beat.beat_track(onset_envelope=onset_env, sr=sr)
        
        rms = librosa.feature.rms(y=y)
        energy = np.mean(rms)
        normalized_energy = min(energy * 10, 1.0)
        
        y_harmonic, y_percussive = separate_components(y, sr)
        melody_features = analyze_vocal_melody(y_harmonic, sr)
        rhythm_features = analyze_rhythm_and_chords(y_percussive, sr)
        
        return {
            'tempo': float(tempo[0]) if isinstance(tempo, np.ndarray) else float(tempo),
            'energy': float(normalized_energy),
            'median_f0': melody_features['median_f0'],
            'chroma_vector': melody_features['chroma_vector'],
            'rhythm_complexity': rhythm_features['rhythm_complexity'],
            'harmonic_change_rate': rhythm_features['harmonic_change_rate'],
            'duration': librosa.get_duration(y=y, sr=sr)
        }
    except Exception as e:
        print(f"Audio Analysis Error: {e}")
        return None