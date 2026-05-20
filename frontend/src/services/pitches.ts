import { apiRequest } from './api'

export interface Pitch {
  id: number
  track_id: number
  track_filename: string | null
  artist_name: string
  artist_image: string | null
  label: string | null
  territory: string | null
  source: string | null
  final_score: number
  confidence_level: string | null
  status: string
  created_at: string
}

export interface CreatePitchPayload {
  track_id: number
  artist_name: string
  artist_image?: string | null
  label?: string | null
  territory?: string | null
  source?: string | null
  final_score: number
  confidence_level?: string | null
}

export function listPitches(): Promise<Pitch[]> {
  return apiRequest<Pitch[]>('/api/v1/pitches', { auth: true })
}

export function createPitch(payload: CreatePitchPayload): Promise<Pitch> {
  return apiRequest<Pitch>('/api/v1/pitches', {
    method: 'POST',
    body: payload,
    auth: true,
  })
}

export function deletePitch(id: number): Promise<void> {
  return apiRequest<void>(`/api/v1/pitches/${id}`, { method: 'DELETE', auth: true })
}
