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
  // Optional Spotify enrichment — populated when SPOTIFY_CLIENT_ID is set.
  artist_image?: string | null
  followers?: number | null
  albums_count?: number | null
  spotify_id?: string | null
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
  // The backend returns a 200 with an `error` field when Claude parsing fails.
  // We surface that as a thrown ApiError below.
  error?: string
}

export const ALLOWED_AUDIO_EXTENSIONS = ['mp3', 'wav', 'flac', 'aac', 'm4a'] as const
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024 // 50MB

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

// Backend chain (librosa → AssemblyAI → Claude) can easily take 30-60s on a
// cold Render instance. Cap at 2 minutes so a stuck request can't hang forever.
const REQUEST_TIMEOUT_MS = 120_000

export async function matchTrack(file: File, externalSignal?: AbortSignal): Promise<MatchResponse> {
  const form = new FormData()
  form.append('audio_file', file)
  form.append('debug', 'false')

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
