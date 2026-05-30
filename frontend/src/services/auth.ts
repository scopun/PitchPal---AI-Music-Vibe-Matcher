import { apiRequest } from './api'

export interface UserResponse {
  id: number
  email: string
  email_verified: boolean
  created_at: string
  display_name?: string | null
  bio?: string | null
  avatar_url?: string | null
  location?: string | null
  role?: string | null
  website_url?: string | null
  soundcloud_url?: string | null
  spotify_url?: string | null
}

export interface UserUpdatePayload {
  display_name?: string
  bio?: string
  avatar_url?: string
  location?: string
  role?: string
  website_url?: string
  soundcloud_url?: string
  spotify_url?: string
}

export function updateMe(payload: UserUpdatePayload): Promise<UserResponse> {
  return apiRequest<UserResponse>('/api/v1/auth/me', {
    method: 'PATCH',
    body: payload,
    auth: true,
  })
}

export function changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>('/api/v1/auth/me/change-password', {
    method: 'POST',
    body: { current_password: currentPassword, new_password: newPassword },
    auth: true,
  })
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: UserResponse
}

export interface MessageResponse {
  message: string
}

export interface VerifyEmailResponse {
  message: string
  already_verified: boolean
}

export function signup(email: string, password: string): Promise<TokenResponse> {
  return apiRequest<TokenResponse>('/api/v1/auth/signup', {
    method: 'POST',
    body: { email, password },
  })
}

export function login(email: string, password: string): Promise<TokenResponse> {
  return apiRequest<TokenResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

export function forgotPassword(email: string): Promise<MessageResponse> {
  return apiRequest<MessageResponse>('/api/v1/auth/forgot-password', {
    method: 'POST',
    body: { email },
  })
}

export function resetPassword(token: string, newPassword: string): Promise<MessageResponse> {
  return apiRequest<MessageResponse>('/api/v1/auth/reset-password', {
    method: 'POST',
    body: { token, new_password: newPassword },
  })
}

export function verifyEmail(token: string): Promise<VerifyEmailResponse> {
  return apiRequest<VerifyEmailResponse>(`/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`)
}

export function fetchMe(): Promise<UserResponse> {
  return apiRequest<UserResponse>('/api/v1/auth/me', { auth: true })
}

export function loginWithGoogle(accessToken: string): Promise<TokenResponse> {
  return apiRequest<TokenResponse>('/api/v1/auth/google', {
    method: 'POST',
    body: { access_token: accessToken },
  })
}
