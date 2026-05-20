const RAW_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://127.0.0.1:8000'
export const API_BASE_URL = RAW_BASE.replace(/\/$/, '')

const TOKEN_STORAGE_KEY = 'pitchpal_token'

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token === null) {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    } else {
      localStorage.setItem(TOKEN_STORAGE_KEY, token)
    }
  } catch {
    /* storage unavailable — no-op */
  }
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: unknown
  auth?: boolean
  signal?: AbortSignal
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object' && 'detail' in payload) {
    const detail = (payload as { detail: unknown }).detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0]
      if (first && typeof first === 'object' && 'msg' in first && typeof (first as { msg: unknown }).msg === 'string') {
        return (first as { msg: string }).msg
      }
    }
  }
  return fallback
}

export async function apiRequest<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false, signal } = opts
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData

  const headers: Record<string, string> = { Accept: 'application/json' }
  // For FormData, let the browser set Content-Type (it adds the multipart boundary).
  if (body !== undefined && !isFormData) {
    headers['Content-Type'] = 'application/json'
  }
  if (auth) {
    const token = getStoredToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  let requestBody: BodyInit | undefined
  if (body === undefined) {
    requestBody = undefined
  } else if (isFormData) {
    requestBody = body as FormData
  } else {
    requestBody = JSON.stringify(body)
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: requestBody,
      signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err
    }
    throw new ApiError('Network error. Please check your connection and try again.', 0)
  }

  const contentType = response.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')
  const payload: unknown = isJson ? await response.json().catch(() => null) : null

  if (!response.ok) {
    const fallback = response.status === 401
      ? 'Not authorized.'
      : response.status >= 500
        ? 'Something went wrong on our end. Please try again.'
        : 'Request failed.'
    throw new ApiError(extractErrorMessage(payload, fallback), response.status)
  }

  return payload as T
}
