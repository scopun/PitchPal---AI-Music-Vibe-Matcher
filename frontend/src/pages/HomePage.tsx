import { darkImages, lightImages, ThemeImages } from '../assets/images'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import StatsBar from '../components/StatsBar'
import HowItWorksSection from '../components/HowItWorksSection'
import WhoItsForSection from '../components/WhoItsForSection'
import Footer from '../components/Footer'
import AnimateOnScroll from '../components/AnimateOnScroll'

interface HomePageProps {
  isDark: boolean
  onToggleTheme: () => void
}

export default function HomePage({ isDark, onToggleTheme }: HomePageProps) {
  const imgs: ThemeImages = isDark
    ? { ...lightImages, ...darkImages }
    : { ...darkImages, ...lightImages }

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
