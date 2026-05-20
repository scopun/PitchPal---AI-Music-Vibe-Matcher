import { apiRequest } from './api'
import type { MatchResponse } from './match'

export interface TrackSummary {
  id: number
  filename: string
  bpm: number | null
  energy: number | null
  detected_genre: string | null
  detected_language: string | null
  lyrics_extracted: boolean
  genre_tags: string[] | null
  matches_count: number
  pitches_count: number
  created_at: string
}

export interface TrackDetail {
  id: number
  filename: string
  bpm: number | null
  energy: number | null
  detected_genre: string | null
  detected_language: string | null
  lyrics_extracted: boolean
  genre_tags: string[] | null
  match_data: MatchResponse | null
  created_at: string
}

export function listTracks(): Promise<TrackSummary[]> {
  return apiRequest<TrackSummary[]>('/api/v1/tracks', { auth: true })
}

export function getTrack(id: number): Promise<TrackDetail> {
  return apiRequest<TrackDetail>(`/api/v1/tracks/${id}`, { auth: true })
}

export function deleteTrack(id: number): Promise<void> {
  return apiRequest<void>(`/api/v1/tracks/${id}`, { method: 'DELETE', auth: true })
}
