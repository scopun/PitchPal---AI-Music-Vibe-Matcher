import { useState, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeImages } from '../assets/images'
import { useAuth } from '../context/AuthContext'

interface NavbarProps {
  isDark: boolean
  imgs: ThemeImages
  onToggleTheme: () => void
}

const baseNavLinks = ['About Us', 'How it works', "Who it's for"] as const

export default function Navbar({ isDark, imgs, onToggleTheme }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const { user, triggerSignOut } = useAuth()
  const isLoggedIn = user !== null

  // Guest sees Sign in; signed-in user sees Dashboard in the same slot.
  const navLinks = isLoggedIn ? [...baseNavLinks, 'Dashboard'] : [...baseNavLinks, 'Sign in']

  const handleNavClick = (link: string) => {
    if (link === 'About Us') navigate('/about-us')
    else if (link === 'How it works') navigate('/how-it-works')
    else if (link === "Who it's for") navigate('/who-its-for')
    else if (link === 'Dashboard') navigate('/upload')
    else if (link === 'Sign in') navigate('/')
    else navigate('/')
    setMobileOpen(false)
  }

  const handleSignupCta = () => {
    navigate('/', { state: { initialView: 'signup' } })
    setMobileOpen(false)
  }

  const handleGoToDashboard = () => {
    navigate('/upload')
    setMobileOpen(false)
  }

  const handleLogout = () => {
    setMobileOpen(false)
    triggerSignOut()
  }

  const linkCls = isDark
    ? 'text-white/60 hover:text-white text-[14px] font-light tracking-[0.14px] transition-colors duration-200'
    : 'text-pp-navy/70 hover:text-pp-navy text-[14px] font-light tracking-[0.14px] transition-colors duration-200'

  const navBg = isDark
    ? 'bg-white/[0.03] border-white/[0.07]'
    : 'bg-white border-[rgba(129,55,246,0.2)]'

  const dividerCls = isDark
    ? 'bg-white/[0.15]'
    : 'bg-[rgba(129,55,246,0.1)]'

  const closeStroke = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(38,17,74,0.6)'

  const logoutBtnCls = isDark
    ? 'bg-white/[0.04] border border-white/[0.15] text-white/85 hover:bg-white/[0.08]'
    : 'bg-white border border-[rgba(129,55,246,0.2)] text-pp-navy hover:bg-[rgba(129,55,246,0.04)]'

  return (
    <div className="sticky top-0 z-50 w-full">
      {/* Main nav bar */}
      <nav className={`w-full relative z-50 backdrop-blur-[35px] border-b px-4 md:px-8 xl:px-[70px] py-[14px] flex items-center justify-between ${navBg}`}>
        {/* Logo */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="h-[36px] w-[124px] relative shrink-0 cursor-pointer bg-transparent border-0 p-0"
          aria-label="Go to home"
        >
          <img src={imgs.navLogo} alt="PitchPal" className="absolute inset-0 w-full h-full object-contain object-left" />
        </button>

        {/* Tablet nav links — absolutely centered (md only, hidden at xl) */}
        <div className="hidden md:flex xl:hidden absolute left-1/2 -translate-x-1/2 items-center gap-5">
          {navLinks.map((link) => (
            <button
              key={`tab-${link}`}
              type="button"
              onClick={() => handleNavClick(link)}
              className={`${linkCls} hover:opacity-100 transition-opacity whitespace-nowrap font-poppins cursor-pointer bg-transparent border-0 p-0`}
            >
              {link}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Desktop nav links — grouped with CTA on the right */}
          <div className="hidden xl:flex items-center gap-[60px] mr-[14px]">
            {navLinks.map((link) => (
              <button
                key={`desk-${link}`}
                type="button"
                onClick={() => handleNavClick(link)}
                className={`${linkCls} hover:opacity-100 transition-opacity whitespace-nowrap font-poppins cursor-pointer bg-transparent border-0 p-0`}
              >
                {link}
              </button>
            ))}
          </div>

          {isLoggedIn ? (
            <>
              <button
                type="button"
                onClick={handleGoToDashboard}
                className="gradient-btn pp-btn-lift border border-white/[0.06] text-white text-[11px] md:text-[13px] font-medium font-poppins px-4 md:px-5 py-[8px] md:py-[9px] rounded-[10px] whitespace-nowrap cursor-pointer"
              >
                Go to Dashboard
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className={`${logoutBtnCls} pp-btn-lift-soft text-[11px] md:text-[13px] font-medium font-poppins px-3 md:px-4 py-[8px] md:py-[9px] rounded-[10px] whitespace-nowrap cursor-pointer hidden md:inline-flex items-center`}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleSignupCta}
              className="gradient-btn pp-btn-lift border border-white/[0.06] text-white text-[11px] md:text-[13px] font-medium font-poppins px-4 md:px-5 py-[8px] md:py-[9px] rounded-[10px] whitespace-nowrap cursor-pointer"
            >
              Create account
            </button>
          )}

          {/* Theme toggle — hidden on mobile */}
          <button
            onClick={onToggleTheme}
            className="relative size-5 shrink-0 cursor-pointer hidden md:block"
            aria-label="Toggle theme"
          >
            <img src={imgs.themeIcon} alt="theme" className="absolute inset-0 w-full h-full object-contain" />
          </button>

          {/* Hamburger / Close — only on mobile */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="relative size-6 shrink-0 cursor-pointer md:hidden flex items-center justify-center"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 20L19.9099 4.0901" stroke={closeStroke} strokeWidth="1.5" strokeLinecap="round" />
                <path d="M4 4L19.9099 19.9099" stroke={closeStroke} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              <img src={imgs.hamburger} alt="menu" className="absolute inset-0 w-full h-full object-contain" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile full-screen overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{
            background: isDark ? 'rgba(0,0,0,0.33)' : 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(34.77px)',
            WebkitBackdropFilter: 'blur(34.77px)',
          }}
        >
          {/* Spacer matching navbar height with bottom separator */}
          <div className={`h-16 border-b ${isDark ? 'border-white/[0.15]' : 'border-[rgba(129,55,246,0.15)]'}`} />
          <div className="px-4 pt-5 pb-6 flex flex-col gap-5">
            {navLinks.map((link) => (
              <Fragment key={link}>
                <button
                  type="button"
                  onClick={() => handleNavClick(link)}
                  className={`${linkCls} font-poppins hover:opacity-100 transition-opacity text-left bg-transparent border-0 p-0 cursor-pointer`}
                >
                  {link}
                </button>
                <div className={`h-px w-full ${dividerCls}`} />
              </Fragment>
            ))}
            {/* Logout — mobile only, when signed in */}
            {isLoggedIn && (
              <Fragment>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`font-poppins font-medium text-[14px] tracking-[0.14px] text-left bg-transparent border-0 p-0 cursor-pointer`}
                  style={{ color: isDark ? '#FF8A8A' : '#C73030' }}
                >
                  Logout
                </button>
                <div className={`h-px w-full ${dividerCls}`} />
              </Fragment>
            )}
            {/* Theme toggle button */}
            <button
              onClick={() => { onToggleTheme(); setMobileOpen(false) }}
              className={`backdrop-blur-[5px] border ${isDark ? 'border-white/[0.15]' : 'border-[rgba(129,55,246,0.2)]'} size-[40px] rounded-[10px] flex items-center justify-center cursor-pointer shrink-0`}
              aria-label="Toggle theme"
            >
              <div className="relative size-5">
                <img src={imgs.themeIcon} alt="theme" className="absolute inset-0 w-full h-full object-contain" />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
