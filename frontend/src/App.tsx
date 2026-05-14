import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import AboutUsPage from './pages/AboutUsPage'
import UploadPage from './pages/UploadPage'
import HowItWorksPage from './pages/HowItWorksPage'
import WhoItsForPage from './pages/WhoItsForPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'
import ContactPage from './pages/ContactPage'
import ScrollToTop from './components/ScrollToTop'

export default function App() {
  const [isDark, setIsDark] = useState(true)
  const onToggleTheme = () => setIsDark(!isDark)

  return (
    <BrowserRouter>
      <div className={isDark ? 'dark' : ''}>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage isDark={isDark} onToggleTheme={onToggleTheme} />} />
          <Route path="/reset-password" element={<ResetPasswordPage isDark={isDark} onToggleTheme={onToggleTheme} />} />
          <Route path="/about-us" element={<AboutUsPage isDark={isDark} onToggleTheme={onToggleTheme} />} />
          <Route path="/upload" element={<UploadPage isDark={isDark} onToggleTheme={onToggleTheme} />} />
          <Route path="/dashboard" element={<UploadPage isDark={isDark} onToggleTheme={onToggleTheme} />} />
          <Route path="/my-tracks" element={<UploadPage isDark={isDark} onToggleTheme={onToggleTheme} />} />
          <Route path="/pitches-sent" element={<UploadPage isDark={isDark} onToggleTheme={onToggleTheme} />} />
          <Route path="/ai-assistant" element={<UploadPage isDark={isDark} onToggleTheme={onToggleTheme} />} />
          <Route path="/analytics" element={<UploadPage isDark={isDark} onToggleTheme={onToggleTheme} />} />
          <Route path="/messages" element={<UploadPage isDark={isDark} onToggleTheme={onToggleTheme} />} />
          <Route path="/notifications" element={<UploadPage isDark={isDark} onToggleTheme={onToggleTheme} />} />
          <Route path="/how-it-works" element={<HowItWorksPage isDark={isDark} onToggleTheme={onToggleTheme} />} />
          <Route path="/who-its-for" element={<WhoItsForPage isDark={isDark} onToggleTheme={onToggleTheme} />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage isDark={isDark} onToggleTheme={onToggleTheme} />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage isDark={isDark} onToggleTheme={onToggleTheme} />} />
          <Route path="/contact" element={<ContactPage isDark={isDark} onToggleTheme={onToggleTheme} />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
