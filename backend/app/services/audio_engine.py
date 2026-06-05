import librosa
import numpy as np


def separate_components(y, sr):
    y_harmonic, y_percussive = librosa.effects.hpss(y)
    return y_harmonic, y_percussive


def analyze_vocal_melody(y_harmonic, sr):
    # Band-aware vocal F0 detection.
    #
    # Earlier versions (piptrack, then naive PYIN-median) all suffered the
    # same problem: instrumental pitches (bass guitar E2 = 82 Hz, piano /
    # guitar harmonics > 400 Hz) dominated the voiced-frame pool and
    # dragged the median into the wrong gender bucket. Track 3 (a clearly
    # female J-pop vocal) was returning median F0 = 69.7 Hz because PYIN
    # locked onto the synth bass, not the singer.
    #
    # New approach: keep PYIN over the full C2-C6 range so we don't lose
    # baritone or soprano frames, but then bucket voiced frames into
    # frequency BANDS (bass / male / female / high) and pick the band that
    # carries the most confidence-weighted evidence among the two VOCAL
    # bands (male / female). Median F0 is then computed over that vocal
    # band's frames only — bass and high-instrumental frames are ignored
    # for the gender call.
    try:
        f0, voiced_flag, voiced_prob = librosa.pyin(
            y_harmonic,
            sr=sr,
            fmin=librosa.note_to_hz('C2'),
            fmax=librosa.note_to_hz('C6'),
            frame_length=2048,
        )
        mask = voiced_flag & (voiced_prob > 0.5) & ~np.isnan(f0)
        voiced_f0 = f0[mask]
        voiced_p = voiced_prob[mask]

        if voiced_f0.size == 0:
            median_f0 = 0.0
            vocal_confidence = 0.0
        else:
            # Frequency bands
            bass_mask = voiced_f0 < 100                            # bass guitar, low instruments
            male_mask = (voiced_f0 >= 100) & (voiced_f0 < 175)     # male vocal range
            female_mask = (voiced_f0 >= 175) & (voiced_f0 < 400)   # female vocal range
            high_mask = voiced_f0 >= 400                           # instruments / harmonics

            # Confidence-weighted score per band
            male_score = float(voiced_p[male_mask].sum())
            female_score = float(voiced_p[female_mask].sum())
            total_score = float(voiced_p.sum())

            vocal_score = male_score + female_score
            if vocal_score == 0:
                # No frames in vocal range — likely instrumental track
                median_f0 = 0.0
                vocal_confidence = 0.0
            else:
                # Decide dominant vocal band (clear winner if ratio >= 1.5,
                # otherwise treat as mixed and use combined median)
                if female_score >= 1.5 * male_score:
                    vocal_frames = voiced_f0[female_mask]
                elif male_score >= 1.5 * female_score:
                    vocal_frames = voiced_f0[male_mask]
                else:
                    vocal_frames = voiced_f0[male_mask | female_mask]

                median_f0 = float(np.median(vocal_frames)) if vocal_frames.size > 0 else 0.0
                # Confidence = how much of the voiced energy is in the
                # vocal range. If most of it is bass / high, confidence
                # drops and the matcher will treat the call as Unclear.
                vocal_confidence = vocal_score / total_score if total_score > 0 else 0.0

    except Exception as e:
        # PYIN can be slow/unstable on some inputs; fall back to piptrack
        # so analysis never hard-fails.
        print(f"PYIN failed, falling back to piptrack: {e}")
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
        median_f0 = float(np.median(pitch_vals)) if pitch_vals else 0.0
        vocal_confidence = 0.0

    chroma = librosa.feature.chroma_stft(y=y_harmonic, sr=sr)
    avg_chroma = np.mean(chroma, axis=1)

    return {
        'median_f0': median_f0,
        'vocal_confidence': float(vocal_confidence),
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
            'vocal_confidence': melody_features.get('vocal_confidence', 0.0),
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