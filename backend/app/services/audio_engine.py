import librosa
import numpy as np
import asyncio

def separate_components(y, sr):
    y_harmonic, y_percussive = librosa.effects.hpss(y)
    return y_harmonic, y_percussive

def analyze_vocal_melody(y_harmonic, sr):
    # 'piptrack' is lighter on RAM than 'pyin'
    pitches, magnitudes = librosa.piptrack(y=y_harmonic, sr=sr, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C6'))
    
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
        tempo = tempo[0]
        
    duration = librosa.get_duration(y=y_percussive, sr=sr)
    rhythm_complexity = len(beats) / (duration / 60) if duration > 0 else 0
    
    onset_harmonic = librosa.onset.onset_detect(y=y_percussive, sr=sr, units='time')
    harmonic_changes = len(onset_harmonic) / duration if duration > 0 else 0
    
    return {
        'rhythm_complexity': float(rhythm_complexity),
        'harmonic_change_rate': float(harmonic_changes),
    }

def analyze_demo_track(audio_file):
    try:
        # CRITICAL FIX: Skip the intro!
        # 1. Get total duration without loading file
        total_dur = librosa.get_duration(filename=audio_file)
        
        # 2. Start 30% into the track (e.g., skip first 40s of a 2min song)
        offset = total_dur * 0.3
        
        # 3. Load 20s from the "meat" of the song
        # Lower sample rate (22050) saves RAM
        y, sr = librosa.load(audio_file, offset=offset, duration=20, sr=22050)
        
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        tempo, _ = librosa.beat.beat_track(onset_envelope=onset_env, sr=sr)
        
        if isinstance(tempo, np.ndarray):
            tempo = tempo[0]
            
        rms = librosa.feature.rms(y=y)
        energy = np.mean(rms)
        # Normalize energy 0.0 - 1.0 (Approximate)
        normalized_energy = min(energy * 10, 1.0)
        
        y_harmonic, y_percussive = separate_components(y, sr)
        melody_features = analyze_vocal_melody(y_harmonic, sr)
        rhythm_features = analyze_rhythm_and_chords(y_percussive, sr)
        
        return {
            'tempo': float(tempo),
            'energy': float(normalized_energy),
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