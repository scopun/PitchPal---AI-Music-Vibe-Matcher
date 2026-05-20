import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { darkImages, lightImages, ThemeImages } from '../assets/images'
import Navbar from '../components/Navbar'
import { ApiError } from '../services/api'
import { verifyEmail } from '../services/auth'
import { useAuth } from '../context/AuthContext'

interface VerifyEmailPageProps {
  isDark: boolean
  onToggleTheme: () => void
}

type Status = 'verifying' | 'success' | 'already' | 'error'

function ArrowLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M15.1875 9H2.8125" stroke="#00B8D7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.875 3.9375L2.8125 9L7.875 14.0625" stroke="#00B8D7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function VerifyEmailPage({ isDark, onToggleTheme }: VerifyEmailPageProps) {
  const imgs: ThemeImages = isDark
    ? { ...lightImages, ...darkImages }
    : { ...darkImages, ...lightImages }

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const { refreshUser } = useAuth()

  const [status, setStatus] = useState<Status>('verifying')
  const [message, setMessage] = useState<string>('Verifying your email…')
  // Guard against React StrictMode firing this effect twice in dev — we only
  // want one verify request per page load.
  const calledRef = useRef(false)

  useEffect(() => {
    if (calledRef.current) return
    calledRef.current = true
    if (!token) {
      setStatus('error')
      setMessage('This verification link is missing or invalid.')
      return
    }
    verifyEmail(token)
      .then((response) => {
        if (response.already_verified) {
          setStatus('already')
          setMessage('This email has already been verified. You can sign in to continue.')
        } else {
          setStatus('success')
          setMessage('Your email is verified. You can now use PitchPal.')
        }
        refreshUser().catch(() => {
          /* not signed in is fine */
        })
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err instanceof ApiError ? err.message : 'We could not verify this link.')
      })
  }, [token, refreshUser])

  const cardCls = isDark
    ? 'backdrop-blur-[22px] bg-white/[0.02] border border-[rgba(209,173,255,0.3)] shadow-[0px_0px_34px_0px_rgba(144,0,255,0.08),0px_4px_144px_0px_rgba(0,0,0,0.45)]'
    : 'bg-white border border-[rgba(209,173,255,0.5)] shadow-[0px_0px_60px_0px_rgba(129,55,246,0.10),0px_8px_60px_0px_rgba(0,0,0,0.06)]'

  const titleCls = isDark ? 'text-white' : 'text-pp-navy'
  const subtitleCls = isDark ? 'text-white/60' : 'text-pp-navy/60'

  const title =
    status === 'verifying'
      ? 'Verifying email…'
      : status === 'success'
        ? 'Email verified'
        : status === 'already'
          ? 'Already verified'
          : 'Verification failed'

  const showCheckIcon = status === 'success' || status === 'already'

  return (
    <div className={`min-h-screen font-poppins flex flex-col ${isDark ? 'hero-bg-dark' : 'hero-bg-light'}`}>
      <Navbar isDark={isDark} imgs={imgs} onToggleTheme={onToggleTheme} />

      <div className="flex-1 relative overflow-hidden flex items-start xl:items-center justify-center px-4 md:px-8 pt-8 md:pt-16 xl:pt-0 pb-8 xl:pb-0">
        {/* Background blobs — same as ResetPasswordPage */}
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

        <div className={`${cardCls} rounded-[24px] xl:rounded-[30px] overflow-hidden flex flex-col px-7 md:px-9 xl:px-[50px] py-8 md:py-10 xl:py-[50px] w-full max-w-[600px] md:max-w-[556px] xl:max-w-[550px] relative z-10`}>
          <div className="flex flex-col gap-7">
            {showCheckIcon && (
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
            )}

            <div className="flex flex-col gap-3">
              <p className={`text-[32px] md:text-[32px] xl:text-[40px] xl:max-w-[500px] font-medium xl:font-semibold leading-[1.2] font-poppins ${titleCls}`}>{title}</p>
              <p className={`text-[14px] md:text-[16px] xl:text-[16px] font-light leading-[1.6] font-poppins ${subtitleCls}`}>{message}</p>
            </div>

            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-pp-blue text-[14px] font-normal font-poppins hover:opacity-80 transition-opacity self-start"
            >
              <ArrowLeftIcon />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
