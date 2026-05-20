import { apiRequest } from './api'

export interface UserResponse {
  id: number
  email: string
  email_verified: boolean
  created_at: string
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
