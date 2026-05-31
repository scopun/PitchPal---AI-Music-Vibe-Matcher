import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { darkImages, lightImages, ThemeImages } from '../assets/images'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import StatsBar from '../components/StatsBar'
import HowItWorksSection from '../components/HowItWorksSection'
import WhoItsForSection from '../components/WhoItsForSection'
import Footer from '../components/Footer'
import AnimateOnScroll from '../components/AnimateOnScroll'
import { useAuth } from '../context/AuthContext'

interface HomePageProps {
  isDark: boolean
  onToggleTheme: () => void
}

export default function HomePage({ isDark, onToggleTheme }: HomePageProps) {
  const imgs: ThemeImages = isDark
    ? { ...lightImages, ...darkImages }
    : { ...darkImages, ...lightImages }

  const { user, initializing, loggingOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // If a logged-in user lands on the home page directly (typed URL, navbar logo
  // click, etc), bounce them to the dashboard. Skip while we're still
  // restoring the session or in the middle of a sign-out animation, and
  // respect explicit signup-redirect state.
  useEffect(() => {
    if (initializing || loggingOut) return
    const initialView = (location.state as { initialView?: string } | null)?.initialView
    if (initialView === 'signup' || initialView === 'login') return
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, initializing, loggingOut, navigate, location.state])

  return (
    <div className={`min-h-screen font-poppins ${isDark ? 'hero-bg-dark' : 'hero-bg-light'}`}>
      <Navbar isDark={isDark} imgs={imgs} onToggleTheme={onToggleTheme} />
      <HeroSection isDark={isDark} imgs={imgs} />
      <AnimateOnScroll>
        <StatsBar isDark={isDark} />
      </AnimateOnScroll>
      <AnimateOnScroll>
        <HowItWorksSection isDark={isDark} imgs={imgs} />
      </AnimateOnScroll>
      <AnimateOnScroll>
        <WhoItsForSection isDark={isDark} imgs={imgs} />
      </AnimateOnScroll>
      <Footer isDark={isDark} imgs={imgs} />
    </div>
  )
}
