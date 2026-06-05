import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useGoogleLogin, type CodeResponse, type TokenResponse as GoogleTokenResponse } from '@react-oauth/google'
import { ThemeImages } from '../assets/images'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../services/api'
import { forgotPassword, login as loginRequest, loginWithGoogle, signup as signupRequest } from '../services/auth'
import InlineAlert from './InlineAlert'
import EyeIcon from './EyeIcon'

const GOOGLE_ENABLED = !!((import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? '').trim()

// Wraps the existing custom-styled Google button with the useGoogleLogin hook.
// Rendered only when a Google client id is configured (see App.tsx) so the
// hook's internal effect doesn't crash on empty client_id.
function GoogleSignInButton({
  disabled,
  className,
  onSuccess,
  onError,
  children,
}: {
  disabled: boolean
  className: string
  onSuccess: (token: Omit<GoogleTokenResponse, 'error' | 'error_description' | 'error_uri'>) => void
  onError: (err?: Pick<CodeResponse, 'error' | 'error_description' | 'error_uri'>) => void
  children: React.ReactNode
}) {
  const trigger = useGoogleLogin({ onSuccess, onError })
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => { if (!disabled) trigger() }}
      className={className}
    >
      {children}
    </button>
  )
}

interface HeroSectionProps {
  isDark: boolean
  imgs: ThemeImages
}

type CardView = 'login' | 'signup' | 'forgot' | 'linkSent'

function Checkbox({ checked, onChange, isDark }: { checked: boolean; onChange: () => void; isDark: boolean }) {
  return (
    <button
      onClick={onChange}
      className={`size-[20px] rounded-[5px] shrink-0 flex items-center justify-center border transition-all ${
        checked
          ? 'bg-pp-blue border-pp-blue'
          : isDark
          ? 'bg-transparent border-white/30'
          : 'bg-transparent border-pp-navy/30'
      }`}
      aria-checked={checked}
      role="checkbox"
    >
      {checked && (
        <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
          <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

function Divider({ isDark, label }: { isDark: boolean; label: string }) {
  const lineColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(129,55,246,0.2)'
  const textCls = isDark ? 'text-white/40' : 'text-pp-navy/50'
  return (
    <div className="flex items-center gap-4 w-full">
      <div className="flex-1 h-px" style={{ background: lineColor }} />
      <p className={`text-[13px] font-light tracking-[0.14px] whitespace-nowrap font-poppins ${textCls}`}>{label}</p>
      <div className="flex-1 h-px" style={{ background: lineColor }} />
    </div>
  )
}

function LoginCard({ isDark, imgs }: { isDark: boolean; imgs: ThemeImages }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const initialView: CardView =
    (location.state as { initialView?: CardView } | null)?.initialView === 'signup' ? 'signup' : 'login'
  const [view, setView] = useState<CardView>(initialView)

  // If we land here via "Create account" from another page, switch to signup
  // even when the LoginCard was already mounted (e.g. user clicked the navbar
  // CTA while on the home page).
  useEffect(() => {
    const next = (location.state as { initialView?: CardView } | null)?.initialView
    if (next && next !== view) {
      setView(next)
      // Clear the marker so reloading or navigating back doesn't re-trigger.
      navigate(location.pathname, { replace: true, state: null })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])
  const [rememberMe, setRememberMe] = useState(true)
  const [agreeTerms, setAgreeTerms] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [forgotEmail, setForgotEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Clear error/loading state whenever the view changes.
  useEffect(() => {
    setError(null)
    setSubmitting(false)
  }, [view])

  // Clear stale error as soon as the user edits an input.
  useEffect(() => {
    if (error) setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password, forgotEmail])

  async function handleLogin() {
    if (submitting) return
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const result = await loginRequest(email.trim(), password)
      signIn(result.access_token, result.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSignup() {
    if (submitting) return
    if (!email.trim() || !password) {
      setError('Please enter your email and a password.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (!agreeTerms) {
      setError('Please agree to the Terms & Conditions to continue.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const result = await signupRequest(email.trim(), password)
      signIn(result.access_token, result.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sign up failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleForgot() {
    if (submitting) return
    if (!forgotEmail.trim()) {
      setError('Please enter your email address.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await forgotPassword(forgotEmail.trim())
      setView('linkSent')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send reset email. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Google OAuth success — exchange access token with our backend for a
  // PitchPal JWT, then sign in. Same handler is used for both Login and
  // Sign up flows (Google itself handles the distinction).
  async function handleGoogleSuccess(tokenResponse: { access_token: string }) {
    setError(null)
    setSubmitting(true)
    try {
      const result = await loginWithGoogle(tokenResponse.access_token)
      signIn(result.access_token, result.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Google sign-in failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleGoogleError() {
    setSubmitting(false)
    setError('Google sign-in was cancelled or failed. Please try again.')
  }

  // Click handler for the no-op fallback button when Google isn't configured
  // (e.g. missing VITE_GOOGLE_CLIENT_ID in this environment).
  function handleGoogleDisabled() {
    setError('Google sign-in is not configured for this environment yet. Please use email instead.')
  }

  const handleAppleClick = () => {
    // Apple Sign In requires a paid Apple Developer account ($99/year). Not
    // wired up in Phase 1 — surface a clear message instead of failing silently.
    setError('Apple sign-in is coming soon. Please use Google or email for now.')
  }

  const inputCls = isDark
    ? 'bg-white/[0.06] border border-white/[0.1] text-white placeholder:text-white/40'
    : 'border border-[rgba(129,55,246,0.3)] text-pp-navy placeholder:text-pp-navy/50'
  const inputBg = isDark ? {} : { background: 'linear-gradient(90deg,rgba(129,55,246,0.02) 0%,rgba(100,26,190,0.02) 100%)' }
  const focusBorder = isDark
    ? 'focus:border-[rgba(0,184,215,0.6)]'
    : 'focus:border-[rgba(129,55,246,0.6)]'

  const cardCls = isDark
    ? 'backdrop-blur-[22px] bg-white/[0.02] border border-[rgba(209,173,255,0.3)] shadow-[0px_0px_34px_0px_rgba(144,0,255,0.08),0px_4px_144px_0px_rgba(0,0,0,0.45)]'
    : 'bg-white border border-[rgba(209,173,255,0.5)] shadow-[0px_0px_60px_0px_rgba(129,55,246,0.10),0px_8px_60px_0px_rgba(0,0,0,0.06)]'

  const titleCls = isDark ? 'text-white' : 'text-pp-navy'
  const subtitleCls = isDark ? 'text-white/60' : 'text-pp-navy/60'
  const rememberCls = isDark ? 'text-white/70' : 'text-pp-navy/70'

  const googleBtnCls = isDark
    ? 'bg-white/[0.06] border border-white/[0.15] text-white'
    : 'bg-gradient-to-r from-[rgba(129,55,246,0.06)] to-[rgba(100,26,190,0.06)] border border-[rgba(129,55,246,0.3)] text-pp-navy'

  const socialLabel = view === 'login' ? 'Login' : 'Sign up'
  const dividerLabel = view === 'login' ? 'or Sign In with Email' : 'or Sign up with Email'

  // Reusable input styles
  const textInputCls = `${inputCls} ${focusBorder} rounded-[12px] h-[52px] w-full px-[18px] font-poppins text-[14px] tracking-[0.14px] outline-none transition-colors`
  const pwdInputCls = `${inputCls} ${focusBorder} rounded-[12px] h-[52px] w-full pl-[18px] pr-[48px] font-poppins text-[14px] tracking-[0.14px] outline-none transition-colors`

  return (
    <div className={`${cardCls} rounded-[24px] xl:rounded-[30px] overflow-hidden flex flex-col px-7 md:px-9 xl:px-[50px] py-8 xl:py-10 w-full`}>
    <div key={view} className="card-swap-in flex flex-col">

      {/* ── LINK HAS BEEN SENT VIEW ── */}
      {view === 'linkSent' && (
        <div className="flex flex-col gap-7">
          {/* Check icon */}
          <div className={`size-[72px] rounded-[18px] flex items-center justify-center shrink-0 ${isDark ? 'bg-white/[0.07] border border-white/[0.12]' : 'bg-pp-purple/[0.07] border border-pp-purple/20'}`}>
            <svg width="30" height="30" viewBox="0 0 25 25" fill="none">
              <path
                d="M3.875 13.9501L9.3 19.3751L21.7 6.9751"
                stroke={isDark ? 'white' : '#26114A'}
                strokeOpacity={isDark ? 1 : 0.7}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-3">
            <p className={`text-[32px] xl:text-[40px] font-medium font-poppins ${titleCls}`}>Link has been sent</p>
            <p className={`text-[14px] xl:text-[16px] font-light leading-[1.6] font-poppins ${subtitleCls}`}>
              Please check your email and open the link to reset the password
            </p>
          </div>

          {/* Back to login */}
          <button
            onClick={() => setView('login')}
            className="flex items-center gap-2 text-pp-blue text-[14px] font-medium font-poppins hover:opacity-80 transition-opacity self-start"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M15.1875 9H2.8125" stroke="#00B8D7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7.875 3.9375L2.8125 9L7.875 14.0625" stroke="#00B8D7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Login
          </button>
        </div>
      )}

      {/* ── FORGOT PASSWORD VIEW ── */}
      {view === 'forgot' && (
        <div className="flex flex-col gap-7">
          {/* Lock icon */}
          <div className={`size-[72px] rounded-[18px] flex items-center justify-center shrink-0 ${isDark ? 'bg-white/[0.07] border border-white/[0.12]' : 'bg-pp-purple/[0.07] border border-pp-purple/20'}`}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="4" y="14" width="24" height="16" rx="3" stroke={isDark ? 'white' : '#26114A'} strokeWidth="1.6" />
              <path d="M9 14V10a7 7 0 0114 0v4" stroke={isDark ? 'white' : '#26114A'} strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="16" cy="22" r="2" fill={isDark ? 'white' : '#26114A'} />
            </svg>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-3">
            <p className={`text-[32px] xl:text-[40px] font-medium font-poppins ${titleCls}`}>Forgot Password?</p>
            <p className={`text-[14px] xl:text-[16px] font-light leading-[1.6] font-poppins ${subtitleCls}`}>
              A link will be sent to your email to help you reset password
            </p>
          </div>

          {/* Email field */}
          <input
            type="email"
            placeholder="Email address"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            className={`${textInputCls} xl:h-[56px]`}
            style={inputBg}
          />

          {/* Reset button */}
          <div className="flex flex-col gap-3">
            {error && view === 'forgot' && <InlineAlert message={error} isDark={isDark} />}
            <button
              type="button"
              onClick={handleForgot}
              disabled={submitting}
              className="gradient-btn pp-btn-lift border border-white/[0.06] text-white font-medium font-poppins text-[16px] flex items-center justify-center px-[30px] py-[14px] xl:py-4 xl:h-[54px] rounded-[12px] w-full disabled:opacity-60 disabled:pointer-events-none"
            >
              {submitting ? 'Sending…' : 'Reset Password'}
            </button>
          </div>

          {/* Back to login */}
          <button
            onClick={() => setView('login')}
            className="flex items-center gap-2 text-pp-blue text-[14px] font-medium font-poppins hover:opacity-80 transition-opacity self-start"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M15.1875 9H2.8125" stroke="#00B8D7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7.875 3.9375L2.8125 9L7.875 14.0625" stroke="#00B8D7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Login
          </button>
        </div>
      )}

      {/* ── SIGN UP VIEW ── */}
      {view === 'signup' && (
        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-[6px] md:items-center xl:items-start md:text-center xl:text-left">
            <p className={`text-[32px] md:text-[40px] xl:text-[40px] font-medium font-poppins ${titleCls}`}>Welcome</p>
            <p className={`text-[14px] md:text-[16px] xl:text-[16px] font-light tracking-[0.16px] font-poppins ${subtitleCls}`}>
              Sign up to start pitching your songs
            </p>
          </div>

          {/* Social buttons */}
          <div className="flex flex-col md:flex-row gap-[14px] w-full">
            {GOOGLE_ENABLED ? (
              <GoogleSignInButton
                disabled={submitting}
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                className={`${googleBtnCls} pp-btn-lift-soft flex items-center justify-center gap-2 py-[14px] xl:py-4 xl:h-[54px] flex-1 min-w-0 rounded-[12px] px-3 font-medium font-poppins text-[14px] whitespace-nowrap disabled:opacity-60 disabled:pointer-events-none`}
              >
                <div className="size-5 relative shrink-0">
                  <img src={imgs.googleLogo} alt="Google" className="absolute inset-0 w-full h-full object-contain" />
                </div>
                <span>{socialLabel} with Google</span>
              </GoogleSignInButton>
            ) : (
              <button
                type="button"
                onClick={handleGoogleDisabled}
                disabled={submitting}
                className={`${googleBtnCls} pp-btn-lift-soft flex items-center justify-center gap-2 py-[14px] xl:py-4 xl:h-[54px] flex-1 min-w-0 rounded-[12px] px-3 font-medium font-poppins text-[14px] whitespace-nowrap disabled:opacity-60 disabled:pointer-events-none`}
              >
                <div className="size-5 relative shrink-0">
                  <img src={imgs.googleLogo} alt="Google" className="absolute inset-0 w-full h-full object-contain" />
                </div>
                <span>{socialLabel} with Google</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleAppleClick}
              disabled={submitting}
              className={`${googleBtnCls} pp-btn-lift-soft flex items-center justify-center gap-2 py-[14px] xl:py-4 xl:h-[54px] flex-1 min-w-0 rounded-[12px] px-3 font-medium font-poppins text-[14px] whitespace-nowrap disabled:opacity-60 disabled:pointer-events-none`}
            >
              <div className="h-5 w-4 relative shrink-0">
                <img src={imgs.appleLogo} alt="Apple" className="absolute inset-0 w-full h-full object-contain" />
              </div>
              <span>{socialLabel} with Apple</span>
            </button>
          </div>

          <Divider isDark={isDark} label={dividerLabel} />

          {/* Fields */}
          <div className="flex flex-col gap-[14px]">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={textInputCls}
              style={inputBg}
            />
            <div className="relative w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={pwdInputCls}
                style={inputBg}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-[18px] top-1/2 -translate-y-1/2 size-5 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showPassword} color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(38,17,74,0.6)'} />
              </button>
            </div>
          </div>

          {/* Agree terms */}
          <div className="flex items-center gap-[10px]">
            <Checkbox checked={agreeTerms} onChange={() => setAgreeTerms(!agreeTerms)} isDark={isDark} />
            <span className={`text-[13px] xl:text-[14px] font-light tracking-[0.14px] font-poppins ${rememberCls}`}>
              I agree to the{' '}
              <button className="text-pp-blue hover:opacity-80 transition-opacity">Terms &amp; Conditions</button>
            </span>
          </div>

          {/* Sign up button */}
          <div className="flex flex-col gap-3">
            {error && view === 'signup' && <InlineAlert message={error} isDark={isDark} />}
            <button
              type="button"
              onClick={handleSignup}
              disabled={submitting}
              className="gradient-btn pp-btn-lift border border-white/[0.06] text-white font-medium font-poppins text-[16px] flex items-center justify-center px-[30px] py-[14px] xl:py-4 xl:h-[54px] rounded-[12px] w-full disabled:opacity-60 disabled:pointer-events-none"
            >
              {submitting ? 'Signing up…' : 'Sign up to PitchPal'}
            </button>
          </div>

          {/* Already have account */}
          <div className="flex items-center gap-2">
            <span className={`text-[14px] font-normal font-poppins ${subtitleCls}`}>Already have an Account?</span>
            <button onClick={() => setView('login')} className="text-pp-blue text-[14px] font-medium font-poppins hover:opacity-80 transition-opacity">
              Login
            </button>
          </div>
        </div>
      )}

      {/* ── LOGIN VIEW ── */}
      {view === 'login' && (
        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-[6px] md:items-center xl:items-start md:text-center xl:text-left">
            <p className={`text-[32px] md:text-[40px] xl:text-[40px] font-medium font-poppins ${titleCls}`}>Welcome back</p>
            <p className={`text-[14px] md:text-[16px] xl:text-[16px] font-light tracking-[0.16px] font-poppins ${subtitleCls}`}>
              Sign in to start pitching your songs
            </p>
          </div>

          {/* Social buttons */}
          <div className="flex flex-col md:flex-row gap-[14px] w-full">
            {GOOGLE_ENABLED ? (
              <GoogleSignInButton
                disabled={submitting}
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                className={`${googleBtnCls} pp-btn-lift-soft flex items-center justify-center gap-2 py-[14px] xl:py-4 xl:h-[54px] flex-1 min-w-0 rounded-[12px] px-3 font-medium font-poppins text-[14px] whitespace-nowrap disabled:opacity-60 disabled:pointer-events-none`}
              >
                <div className="size-5 relative shrink-0">
                  <img src={imgs.googleLogo} alt="Google" className="absolute inset-0 w-full h-full object-contain" />
                </div>
                <span>Login with Google</span>
              </GoogleSignInButton>
            ) : (
              <button
                type="button"
                onClick={handleGoogleDisabled}
                disabled={submitting}
                className={`${googleBtnCls} pp-btn-lift-soft flex items-center justify-center gap-2 py-[14px] xl:py-4 xl:h-[54px] flex-1 min-w-0 rounded-[12px] px-3 font-medium font-poppins text-[14px] whitespace-nowrap disabled:opacity-60 disabled:pointer-events-none`}
              >
                <div className="size-5 relative shrink-0">
                  <img src={imgs.googleLogo} alt="Google" className="absolute inset-0 w-full h-full object-contain" />
                </div>
                <span>Login with Google</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleAppleClick}
              disabled={submitting}
              className={`${googleBtnCls} pp-btn-lift-soft flex items-center justify-center gap-2 py-[14px] xl:py-4 xl:h-[54px] flex-1 min-w-0 rounded-[12px] px-3 font-medium font-poppins text-[14px] whitespace-nowrap disabled:opacity-60 disabled:pointer-events-none`}
            >
              <div className="h-5 w-4 relative shrink-0">
                <img src={imgs.appleLogo} alt="Apple" className="absolute inset-0 w-full h-full object-contain" />
              </div>
              <span>Login with Apple</span>
            </button>
          </div>

          <Divider isDark={isDark} label="or Sign In with Email" />

          {/* Fields */}
          <div className="flex flex-col gap-[14px]">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={textInputCls}
              style={inputBg}
            />
            <div className="relative w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={pwdInputCls}
                style={inputBg}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-[18px] top-1/2 -translate-y-1/2 size-5 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showPassword} color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(38,17,74,0.6)'} />
              </button>
            </div>
          </div>

          {/* Remember me + Forgot */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[10px]">
              <Checkbox checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} isDark={isDark} />
              <span className={`text-[13px] xl:text-[14px] font-light tracking-[0.14px] font-poppins ${rememberCls}`}>Remember me</span>
            </div>
            <button
              onClick={() => setView('forgot')}
              className="text-pp-blue text-[13px] xl:text-[14px] font-medium tracking-[0.14px] font-poppins hover:opacity-80 transition-opacity"
            >
              Forgot Password?
            </button>
          </div>

          {/* Sign in button */}
          <div className="flex flex-col gap-3">
            {error && view === 'login' && <InlineAlert message={error} isDark={isDark} />}
            <button
              type="button"
              onClick={handleLogin}
              disabled={submitting}
              className="gradient-btn pp-btn-lift border border-white/[0.06] text-white font-medium font-poppins text-[16px] flex items-center justify-center px-[30px] py-[14px] xl:py-4 xl:h-[54px] rounded-[12px] w-full disabled:opacity-60 disabled:pointer-events-none"
            >
              {submitting ? 'Signing in…' : 'Sign in to PitchPal'}
            </button>
          </div>

          {/* Register */}
          <div className="flex items-center gap-2">
            <span className={`text-[14px] font-normal font-poppins ${subtitleCls}`}>Not registered yet?</span>
            <button onClick={() => setView('signup')} className="text-pp-blue text-[14px] font-medium tracking-[0.14px] font-poppins hover:opacity-80 transition-opacity">
              Create an Account
            </button>
          </div>
        </div>
      )}

    </div>
    </div>
  )
}

export default function HeroSection({ isDark, imgs }: HeroSectionProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const textMuted = isDark ? 'text-white/60' : 'text-pp-navy/70'
  const textBold = isDark ? 'text-white' : 'text-pp-navy'
  const headingColor = textBold
  /* Chip: dark = #00B8D7 · 7% bg, #00B8D7 border; light = white bg + #00B8D7 · 20% border */
  const chipBg = isDark
    ? 'bg-[rgba(0,184,215,0.07)] border border-[rgba(0,184,215,0.8)] backdrop-blur-[27px]'
    : 'border border-[rgba(0,184,215,0.6)] backdrop-blur-[27px]'
  const chipBgStyle = isDark
    ? {}
    : { backgroundImage: 'linear-gradient(90deg,rgba(255,255,255,0.7) 0%,rgba(255,255,255,0.7) 100%),linear-gradient(90deg,rgba(0,184,215,0.14) 0%,rgba(0,184,215,0.14) 100%)' }
  const checkDivider = isDark
    ? 'bg-white/[0.06]'
    : 'bg-gradient-to-r from-[rgba(129,55,246,0.2)] to-[rgba(100,26,190,0.2)]'
  const secondaryBtnCls = isDark
    ? 'backdrop-blur-[17px] bg-white/[0.01] border border-pp-purple text-white'
    : 'backdrop-blur-[17px] bg-gradient-to-r from-[rgba(129,55,246,0.06)] to-[rgba(100,26,190,0.06)] border border-[#d1b6fc] text-pp-purple-deep'

  return (
    <section className={`relative overflow-hidden ${isDark ? 'hero-bg-dark' : 'hero-bg-light'}`}>
      {/* Background blobs — exact Figma colors */}
      {isDark ? (
        <>
          <div className="absolute pointer-events-none" style={{ height: '900px', left: '-250px', top: '-150px', width: '900px', zIndex: 0, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(144,0,255,0.18) 0%,transparent 65%)', filter: 'blur(80px)' }} />
          <div className="absolute pointer-events-none" style={{ height: '600px', right: '-100px', top: '10%', width: '700px', zIndex: 0, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(144,0,255,0.08) 0%,transparent 70%)', filter: 'blur(60px)' }} />
        </>
      ) : (
        <>
          {/* Light: purple blob top-left, teal blob right */}
          <div className="absolute pointer-events-none" style={{ height: '900px', left: '-150px', top: '-350px', width: '900px', zIndex: 0, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(129,55,246,0.22) 0%,transparent 60%)', filter: 'blur(90px)' }} />
          <div className="absolute pointer-events-none" style={{ height: '700px', right: '-80px', top: '5%', width: '750px', zIndex: 0, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(0,184,215,0.18) 0%,transparent 60%)', filter: 'blur(80px)' }} />
        </>
      )}

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[70px] py-10 md:py-12 xl:py-0" style={{ minHeight: 'inherit' }}>
        <div className="flex flex-col xl:flex-row xl:items-center gap-8 md:gap-10 xl:gap-0 xl:min-h-[787px]">

          {/* Left: Hero content */}
          <div className="flex flex-col gap-7 xl:w-[601px] xl:pt-[109px] xl:pb-[100px] text-left items-start md:text-center md:items-center xl:text-left xl:items-start">
            <div className="flex flex-col gap-4 items-start md:items-center xl:items-start w-full">
              <div className={`inline-flex items-center gap-[10px] px-4 py-2 rounded-[60px] ${chipBg}`} style={chipBgStyle}>
                <div className="size-[10px] relative shrink-0">
                  <img src={imgs.chipDot} alt="" className="absolute inset-0 w-full h-full object-contain" />
                </div>
                <span className="text-pp-blue text-[11px] md:text-[12px] xl:text-[13px] font-medium tracking-[0.3px] uppercase font-poppins">
                  AI-powered song matching
                </span>
              </div>
              <h1 className={`text-[38px] md:text-[60px] xl:text-[52px] font-semibold leading-[1.25] md:leading-[1.2] font-poppins ${headingColor}`}>
                Pitch the right songs to the{' '}
                <span className="gradient-text">right artists</span>
              </h1>
            </div>

            <p className={`text-[14px] md:text-[16px] xl:text-[16px] font-normal leading-[1.6] tracking-[0.16px] font-poppins ${textMuted}`}>
              PitchPal uses AI to match your tracks to artists who are actively looking for songs like yours. Built for{' '}
              <span className={`font-semibold ${textBold}`}>songwriters, music managers,</span>
              {' '}and{' '}
              <span className={`font-semibold ${textBold}`}>publishers</span>
              {' '}who want their music heard by the right people — faster.
            </p>

            <div className="flex flex-col md:flex-row md:justify-center xl:justify-start gap-[14px] md:gap-5 w-full xl:w-auto">
              <button
                onClick={() => {
                  // Switch the right-side auth card to signup via location state
                  // (LoginCard watches this) and scroll the card into view on
                  // mobile / tablet where it sits below the hero copy.
                  navigate(location.pathname, { state: { initialView: 'signup' } })
                  document.getElementById('pp-auth-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }}
                className="gradient-btn pp-btn-lift border border-white/[0.06] text-white font-medium font-poppins text-[14px] md:text-[16px] xl:text-[16px] flex items-center justify-center px-[30px] py-[14px] xl:py-4 xl:h-[54px] rounded-[10px] md:rounded-[12px]"
              >
                Get started free
              </button>
              <button
                onClick={() => navigate('/how-it-works')}
                className={`${secondaryBtnCls} pp-btn-lift-soft font-medium font-poppins text-[14px] md:text-[16px] xl:text-[15px] flex items-center justify-center px-[30px] py-[14px] xl:py-4 xl:h-[54px] rounded-[12px]`}
              >
                See how it works
              </button>
            </div>

            <div className="flex flex-col md:flex-row md:flex-wrap xl:flex-nowrap items-start md:items-center md:justify-center xl:justify-between gap-3 xl:gap-0 w-full xl:w-[601px]">
              {['Auto lyrics extraction', '100k+ artist database', 'Results in seconds'].map((feat, i) => (
                <div key={feat} className="flex items-center gap-[6px]">
                  {i > 0 && <div className={`hidden md:block h-[18px] w-px mr-3 ${checkDivider}`} />}
                  <div className="size-[18px] relative shrink-0">
                    <img src={imgs.checkIcon} alt="" className="absolute inset-0 w-full h-full object-contain" />
                  </div>
                  <span className={`text-[13px] xl:text-[14px] font-normal tracking-[0.14px] whitespace-nowrap font-poppins ${textMuted}`}>
                    {feat}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Login / Signup / Forgot card */}
          <div id="pp-auth-card" className="xl:ml-auto xl:w-[550px] xl:self-center w-full md:max-w-[556px] md:mx-auto scroll-mt-[80px]">
            <LoginCard isDark={isDark} imgs={imgs} />
          </div>
        </div>
      </div>
    </section>
  )
}
