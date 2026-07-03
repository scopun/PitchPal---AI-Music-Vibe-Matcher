import { apiRequest, ApiError } from './api'

export interface TrackInfo {
  filename: string
  bpm: number
  energy: number
}

export type ConfidenceLevel = 'Strong Match' | 'Good Match' | 'Worth Considering'

export interface MatchItem {
  artist: string
  label?: string
  territory?: string
  source?: string
  final_score: number
  confidence_level?: ConfidenceLevel | string
  reason?: string
  genre_fit?: string
  brief_match?: string
  // True when the artist predominantly writes their own material and is
  // unlikely to take an outside song (e.g. London Grammar). Still shown as a
  // sonic match, but the card surfaces a "Writes own material" badge.
  writes_own?: boolean
  // Optional Spotify enrichment — populated when SPOTIFY_CLIENT_ID is set.
  artist_image?: string | null
  followers?: number | null
  albums_count?: number | null
  spotify_id?: string | null
  // Verified Spotify artist profile URL — used by the "View Profile" button.
  // Deezer is the source of truth for followers/albums; Spotify is used purely
  // for canonical artist linking because they deprecated those fields in 2024.
  spotify_url?: string | null
  // Scraped from the public Spotify artist page (their API has stopped
  // exposing it on the dev tier). Frontend prefers this over Deezer fans
  // when rendering the "Monthly listeners" stat on a match card.
  monthly_listeners?: number | null
  deezer_id?: number | null
}

export interface MatchSummary {
  strong_matches: number
  good_matches: number
  worth_considering: number
  total: number
}

export interface MatchResponse {
  success: boolean
  track_info: TrackInfo
  lyrics_extracted: boolean
  detected_language: string
  matches: MatchItem[]
  detected_genre?: string
  genre_tags?: string[]
  pitch_angle?: string
  market_fit?: string
  match_summary?: MatchSummary
  track_id?: number
  // Set by the backend when this result was served from the per-user
  // audio-hash cache instead of running the matcher fresh. Frontend uses
  // these to show a subtle "Cached result" indicator on the results page.
  cached?: boolean
  cached_at?: string
  // Auto-generated PitchPal streaming link — set when the audio is stored
  // in R2. Embedded in the pitch modal so the user doesn't have to upload
  // to SoundCloud / Dropbox separately. Null when the streaming-link
  // feature is disabled (R2 not configured) or audio storage failed.
  listening_url?: string | null
  // The backend returns a 200 with an `error` field when Claude parsing fails.
  // We surface that as a thrown ApiError below.
  error?: string
}

export const ALLOWED_AUDIO_EXTENSIONS = ['mp3', 'wav', 'flac', 'aac', 'm4a'] as const
// WAV is uncompressed (~10 MB/min at CD quality, ~16-33 MB/min for studio
// 24-bit/48-96 kHz), so a full studio track easily passes 50MB. Keep generous
// headroom so artists can upload WAVs without converting first.
export const MAX_UPLOAD_BYTES = 200 * 1024 * 1024 // 200MB

export function getFileExtension(file: File): string {
  return file.name.split('.').pop()?.toLowerCase() ?? ''
}

export function validateAudioFile(file: File): string | null {
  const ext = getFileExtension(file)
  if (!ALLOWED_AUDIO_EXTENSIONS.includes(ext as (typeof ALLOWED_AUDIO_EXTENSIONS)[number])) {
    return `Unsupported file type. Please upload MP3, WAV, FLAC, AAC, or M4A.`
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `File is too large. Maximum size is ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))}MB.`
  }
  if (file.size === 0) {
    return 'File appears to be empty. Please try a different file.'
  }
  return null
}

// This timeout covers BOTH the upload AND the backend chain (librosa →
// AssemblyAI → Claude → Deezer + Spotify enrichment). The analysis alone can
// take 60-150s on a cold Render instance; on top of that a large WAV (up to
// MAX_UPLOAD_BYTES / 200MB) can take a few minutes to upload on a slower
// connection — e.g. 200MB at ~5 Mbps is ~5 min just to upload. Cap generously
// at 8 minutes so big WAVs + slow runs still surface results instead of
// bouncing the user to an error screen.
const REQUEST_TIMEOUT_MS = 480_000

export async function matchTrack(
  file: File,
  externalSignal?: AbortSignal,
  vibeHint?: string,
): Promise<MatchResponse> {
  const form = new FormData()
  form.append('audio_file', file)
  form.append('debug', 'false')
  // Optional artist-provided direction (intended genre / reference artists).
  // When supplied it overrides the noisy audio-only genre detection, which is
  // what gets the match to the artist's actual intent.
  if (vibeHint && vibeHint.trim()) {
    form.append('vibe_hint', vibeHint.trim())
  }

  // Compose user-supplied signal + our timeout signal.
  const controller = new AbortController()
  const onExternalAbort = () => controller.abort()
  externalSignal?.addEventListener('abort', onExternalAbort)
  const timeoutId = window.setTimeout(() => {
    controller.abort()
  }, REQUEST_TIMEOUT_MS)

  try {
    const result = await apiRequest<MatchResponse>('/api/v1/match', {
      method: 'POST',
      body: form,
      auth: true,
      signal: controller.signal,
    })

    // The backend sometimes returns 200 OK with `{ error, matches: [] }` when
    // Claude can't parse its own response. Treat that as a real failure.
    if (result?.error) {
      throw new ApiError(result.error, 500)
    }

    return result
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      // Distinguish "user cancelled" from "client-side timeout".
      if (externalSignal?.aborted) throw err
      throw new ApiError('Analysis took longer than expected. Please try again.', 408)
    }
    throw err
  } finally {
    window.clearTimeout(timeoutId)
    externalSignal?.removeEventListener('abort', onExternalAbort)
  }
}
