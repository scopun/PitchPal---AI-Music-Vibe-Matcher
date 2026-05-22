import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { darkImages, lightImages, ThemeImages } from '../assets/images'
import Navbar from '../components/Navbar'
import InlineAlert from '../components/InlineAlert'
import EyeIcon from '../components/EyeIcon'
import { ApiError } from '../services/api'
import { resetPassword as resetPasswordRequest } from '../services/auth'

interface ResetPasswordPageProps {
  isDark: boolean
  onToggleTheme: () => void
}

type View = 'reset' | 'success'

function ValidationCheck({ isValid, text, isDark }: { isValid: boolean; text: string; isDark: boolean }) {
  const textCls = isDark ? 'text-white/70' : 'text-pp-navy/70'
  const activeColor = '#00B8D7'
  const inactiveColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(38,17,74,0.3)'
  const color = isValid ? activeColor : inactiveColor

  return (
    <div className="flex items-center gap-2">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M6.875 10.625L8.75 12.5L13.125 8.125"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={`text-[14px] font-poppins font-light tracking-[0.14px] ${textCls}`}>{text}</span>
    </div>
  )
}

function ArrowLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M15.1875 9H2.8125" stroke="#00B8D7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.875 3.9375L2.8125 9L7.875 14.0625" stroke="#00B8D7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ResetPasswordPage({ isDark, onToggleTheme }: ResetPasswordPageProps) {
  const imgs: ThemeImages = isDark
    ? { ...lightImages, ...darkImages }
    : { ...darkImages, ...lightImages }

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [view, setView] = useState<View>('reset')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Clear stale error as soon as the user edits a password input.
  useEffect(() => {
    if (error) setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newPassword, confirmPassword])

  // Styles — exactly matching LoginCard
  const inputCls = isDark
    ? 'bg-white/[0.06] border border-white/[0.1] text-white placeholder:text-white/40'
    : 'border border-[rgba(129,55,246,0.3)] text-pp-navy placeholder:text-pp-navy/50'
  const inputBg = isDark ? {} : { background: 'linear-gradient(90deg,rgba(129,55,246,0.02) 0%,rgba(100,26,190,0.02) 100%)' }
  const focusBorder = isDark
    ? 'focus:border-[rgba(0,184,215,0.6)]'
    : 'focus:border-[rgba(129,55,246,0.6)]'
  const pwdInputCls = `${inputCls} ${focusBorder} rounded-[12px] h-[52px] w-full pl-[18px] pr-[48px] font-poppins text-[14px] tracking-[0.14px] outline-none transition-colors`

  const cardCls = isDark
    ? 'backdrop-blur-[22px] bg-white/[0.02] border border-[rgba(209,173,255,0.3)] shadow-[0px_0px_34px_0px_rgba(144,0,255,0.08),0px_4px_144px_0px_rgba(0,0,0,0.45)]'
    : 'bg-white border border-[rgba(209,173,255,0.5)] shadow-[0px_0px_60px_0px_rgba(129,55,246,0.10),0px_8px_60px_0px_rgba(0,0,0,0.06)]'

  const titleCls = isDark ? 'text-white' : 'text-pp-navy'
  const subtitleCls = isDark ? 'text-white/60' : 'text-pp-navy/60'

  // Password validation
  const isLongEnough = newPassword.length >= 8
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(newPassword)

  const eyeColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(38,17,74,0.6)'

  async function handleReset() {
    if (submitting) return
    if (!token) {
      setError('This reset link is missing or invalid. Please request a new one.')
      return
    }
    if (!isLongEnough || !hasSpecialChar) {
      setError('Password does not meet the requirements below.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await resetPasswordRequest(token, newPassword)
      setView('success')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reset password. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`min-h-screen font-poppins flex flex-col ${isDark ? 'hero-bg-dark' : 'hero-bg-light'}`}>
      <Navbar isDark={isDark} imgs={imgs} onToggleTheme={onToggleTheme} />

      {/* Main content area with background blobs — top-aligned on mobile/tablet, vertically centered on desktop */}
      <div className="flex-1 relative overflow-hidden flex items-start xl:items-center justify-center px-4 md:px-8 pt-8 md:pt-16 xl:pt-0 pb-8 xl:pb-0">
        {/* Background blobs — same as HeroSection */}
        {isDark ? (
          <>
            <div className="absolute pointer-events-none" style={{ height: '900px', left: '-250px', top: '-150px', width: '900px', zIndex: 0, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(144,0,255,0.18) 0%,transparent 65%)', filter: 'blur(80px)' }} />
            <div className="absolute pointer-events-none" style={{ height: '600px', right: '-100px', top: '10%', width: '700px', zIndex: 0, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(144,0,255,0.08) 0%,transparent 70%)', filter: 'blur(60px)' }} />
          </>
        ) : (
          <>
            <div className="absolute pointer-events-none" style={{ height: '900px', left: '-150px', top: '-350px', width: '900px', zIndex: 0, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(129,55,246,0.22) 0%,transparent 60%)', filter: 'blur(90px)' }} />
            <div className="absolute pointer-events-none" style={{ height: '700px', right: '-80px', top: '5%', width: '750px', zIndex: 0, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(0,184,215,0.18) 0%,transparent 60%)', filter: 'blur(80px)' }} />
          </>
        )}

        {/* Card */}
        <div className={`${cardCls} rounded-[24px] xl:rounded-[30px] overflow-hidden flex flex-col px-7 md:px-9 xl:px-[50px] py-8 md:py-10 xl:py-[50px] w-full max-w-[600px] md:max-w-[556px] xl:max-w-[550px] relative z-10`}>
        <div key={view} className="card-swap-in flex flex-col">

          {/* ── SET NEW PASSWORD VIEW ── */}
          {view === 'reset' && (
            <div className="flex flex-col gap-7">
              {/* Title */}
              <div className="flex flex-col gap-3">
                <p className={`text-[32px] md:text-[32px] xl:text-[40px] xl:max-w-[500px] font-medium xl:font-semibold leading-[1.2] font-poppins ${titleCls}`}>Set a new password</p>
                <p className={`text-[14px] md:text-[16px] xl:text-[16px] font-light leading-[1.6] font-poppins ${subtitleCls}`}>
                  Your new password should be different from previously used passwords
                </p>
              </div>

              {/* Password fields */}
              <div className="flex flex-col gap-[14px]">
                <div className="relative w-full">
                  <input
                    type={showNew ? 'text' : 'password'}
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={pwdInputCls}
                    style={inputBg}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-[18px] top-1/2 -translate-y-1/2 size-5 cursor-pointer"
                    aria-label={showNew ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon open={showNew} color={eyeColor} />
                  </button>
                </div>
                <div className="relative w-full">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={pwdInputCls}
                    style={inputBg}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-[18px] top-1/2 -translate-y-1/2 size-5 cursor-pointer"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon open={showConfirm} color={eyeColor} />
                  </button>
                </div>
              </div>

              {/* Validation rules */}
              <div className="flex flex-col gap-2">
                <ValidationCheck isDark={isDark} isValid={isLongEnough} text="Must be at least 8 characters" />
                <ValidationCheck isDark={isDark} isValid={hasSpecialChar} text="Must contain one special character" />
              </div>

              {/* Reset button */}
              <div className="flex flex-col gap-3">
                {error && <InlineAlert message={error} isDark={isDark} />}
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={submitting}
                  className="gradient-btn pp-btn-lift border border-white/[0.06] text-white font-medium font-poppins text-[16px] flex items-center justify-center px-[30px] py-[14px] xl:py-4 xl:h-[54px] rounded-[12px] w-full disabled:opacity-60 disabled:pointer-events-none"
                >
                  {submitting ? 'Resetting…' : 'Reset Password'}
                </button>
              </div>

              {/* Back to login */}
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-pp-blue text-[14px] font-normal font-poppins hover:opacity-80 transition-opacity self-start"
              >
                <ArrowLeftIcon />
                Back to Login
              </button>
            </div>
          )}

          {/* ── PASSWORD CHANGED VIEW ── */}
          {view === 'success' && (
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
                <p className={`text-[32px] md:text-[32px] xl:text-[40px] xl:max-w-[500px] font-medium xl:font-semibold leading-[1.2] font-poppins ${titleCls}`}>Password changed</p>
                <p className={`text-[14px] md:text-[16px] xl:text-[16px] font-light leading-[1.6] font-poppins ${subtitleCls}`}>
                  Your password has been successfully changed
                </p>
              </div>

              {/* Back to login */}
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-pp-blue text-[14px] font-normal font-poppins hover:opacity-80 transition-opacity self-start"
              >
                <ArrowLeftIcon />
                Back to Login
              </button>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}
