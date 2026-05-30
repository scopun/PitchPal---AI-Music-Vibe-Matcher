import { apiRequest } from './api'

export interface TopPitchedArtist {
  artist: string
  count: number
}

export interface AnalyticsResponse {
  songs_processed: number
  songs_pitched: number
  artists_covered: number
  top_genre: string | null
  top_genre_count: number
  top_pitched_artists: TopPitchedArtist[]
}

export function fetchAnalytics(): Promise<AnalyticsResponse> {
  return apiRequest<AnalyticsResponse>('/api/v1/analytics', { auth: true })
}
