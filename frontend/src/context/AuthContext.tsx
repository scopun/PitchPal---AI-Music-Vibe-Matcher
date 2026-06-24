import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, getStoredToken, setStoredToken } from '../services/api'
import { fetchMe, type UserResponse } from '../services/auth'

interface AuthContextValue {
  user: UserResponse | null
  token: string | null
  initializing: boolean
  loggingOut: boolean
  signIn: (token: string, user: UserResponse) => void
  signOut: () => void
  triggerSignOut: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [user, setUser] = useState<UserResponse | null>(null)
  const [initializing, setInitializing] = useState<boolean>(() => getStoredToken() !== null)
  const [loggingOut, setLoggingOut] = useState(false)
  const logoutTimerRef = useRef<number | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    const existing = getStoredToken()
    if (!existing) {
      setInitializing(false)
      return
    }
    fetchMe()
      .then((me) => {
        if (!cancelled) setUser(me)
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 401) {
          setStoredToken(null)
          setToken(null)
          setUser(null)
        }
      })
      .finally(() => {
        if (!cancelled) setInitializing(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // A 401 from any authenticated request (raised in apiRequest) means the
  // stored token is no longer valid — it expired, or it points at a user that
  // no longer exists after a backend/database change. Clear the session so
  // protected pages (which guard on `user`) bounce to the login/home page
  // instead of leaving the user stuck on a "Not authenticated" error.
  useEffect(() => {
    const onAuthExpired = () => {
      setStoredToken(null)
      setToken(null)
      setUser(null)
    }
    window.addEventListener('pitchpal:auth-expired', onAuthExpired)
    return () => window.removeEventListener('pitchpal:auth-expired', onAuthExpired)
  }, [])

  const signIn = useCallback((nextToken: string, nextUser: UserResponse) => {
    setStoredToken(nextToken)
    setToken(nextToken)
    setUser(nextUser)
  }, [])

  const signOut = useCallback(() => {
    setStoredToken(null)
    setToken(null)
    setUser(null)
  }, [])

  // Show the audio-wave overlay for ~1.6s, then clear the session and
  // bounce to the home page. Any in-progress logout is ignored.
  const triggerSignOut = useCallback(() => {
    if (loggingOut) return
    setLoggingOut(true)
    if (logoutTimerRef.current !== null) {
      window.clearTimeout(logoutTimerRef.current)
    }
    logoutTimerRef.current = window.setTimeout(() => {
      setStoredToken(null)
      setToken(null)
      setUser(null)
      setLoggingOut(false)
      logoutTimerRef.current = null
      navigate('/', { replace: true })
    }, 1600)
  }, [loggingOut, navigate])

  useEffect(() => {
    return () => {
      if (logoutTimerRef.current !== null) {
        window.clearTimeout(logoutTimerRef.current)
      }
    }
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const me = await fetchMe()
      setUser(me)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        signOut()
      }
    }
  }, [signOut])

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, initializing, loggingOut, signIn, signOut, triggerSignOut, refreshUser }),
    [user, token, initializing, loggingOut, signIn, signOut, triggerSignOut, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) {
    throw new Error('useAuth must be used inside an AuthProvider')
  }
  return ctx
}
