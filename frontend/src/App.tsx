import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import AboutUsPage from './pages/AboutUsPage'
import UploadPage from './pages/UploadPage'
import HowItWorksPage from './pages/HowItWorksPage'
import WhoItsForPage from './pages/WhoItsForPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'
import ContactPage from './pages/ContactPage'
import { GoogleOAuthProvider } from '@react-oauth/google'
import ScrollToTop from './components/ScrollToTop'
import LogoutOverlay from './components/LogoutOverlay'
import { AuthProvider, useAuth } from './context/AuthContext'
import type { ReactNode } from 'react'

function GlobalLogoutOverlay({ isDark }: { isDark: boolean }) {
  const { loggingOut } = useAuth()
  return loggingOut ? <LogoutOverlay isDark={isDark} /> : null
}

// Only mount the Google OAuth provider when a real client id is set. Mounting
// it with an empty/whitespace id triggers Google's GIS script to throw
// "Missing required parameter client_id" during component mount which would
// blank the whole page. With no id we skip the provider entirely — the Google
// button in LoginCard renders an inert fallback in that case.
const GOOGLE_CLIENT_ID = ((import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? '').trim()

function GoogleAuthShell({ children }: { children: ReactNode }) {
  if (!GOOGLE_CLIENT_ID) return <>{children}</>
  return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{children}</GoogleOAuthProvider>
}

export default function App() {
  const [isDark, setIsDark] = useState(true)
  const onToggleTheme = () => setIsDark(!isDark)

  return (
    <GoogleAuthShell>
    <BrowserRouter>
      <AuthProvider>
      <div className={isDark ? 'dark' : ''}>
        <ScrollToTop />
        <GlobalLogoutOverlay isDark={isDark} />
        <Routes>
          <Route path="/" element={<HomePage isDark={isDark} onToggleTheme={onToggleTheme} />} />
          <Route path="/reset-password" element={<ResetPasswordPage isDark={isDark} onToggleTheme={onToggleTheme} />} />
          <Route path="/verify-email" element={<VerifyEmailPage isDark={isDark} onToggleTheme={onToggleTheme} />} />
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
      </AuthProvider>
    </BrowserRouter>
    </GoogleAuthShell>
  )
}
