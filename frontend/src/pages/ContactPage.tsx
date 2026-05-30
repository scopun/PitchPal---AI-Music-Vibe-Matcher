import { useState } from 'react'
import StaticContentPage from '../components/StaticContentPage'
import { apiRequest, ApiError } from '../services/api'

interface PageProps {
  isDark: boolean
  onToggleTheme: () => void
}

interface ContactResponse {
  success: boolean
  message: string
}

export default function ContactPage({ isDark, onToggleTheme }: PageProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resultMessage, setResultMessage] = useState<string | null>(null)
  const [resultError, setResultError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      setResultError('Please fill in all fields.')
      return
    }
    setSubmitting(true)
    setResultError(null)
    setResultMessage(null)
    try {
      const res = await apiRequest<ContactResponse>('/api/v1/contact', {
        method: 'POST',
        body: { name, email, message },
      })
      setResultMessage(res.message)
      setName('')
      setEmail('')
      setMessage('')
    } catch (err) {
      setResultError(err instanceof ApiError ? err.message : 'Could not send your message.')
    } finally {
      setSubmitting(false)
    }
  }

  // Reuse the existing static page shell for the heading + tagline. Inject
  // the form as a custom child via the bodyParagraphs slot replaced by a
  // form rendered below it.
  const inputCls = isDark
    ? 'bg-white/[0.04] border border-white/[0.10] text-white placeholder:text-white/40 focus:border-pp-purple/60'
    : 'bg-white border border-[rgba(129,55,246,0.20)] text-pp-navy placeholder:text-pp-navy/40 focus:border-pp-purple/60'

  return (
    <>
      <StaticContentPage
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        headingPrefix="Contact"
        headingGradient="us"
        tagline="Questions, feedback, or partnership ideas? We'd love to hear from you."
        bodyHeading="Get in touch with the PitchPal team"
        bodyParagraphs={[
          "Use the form below to send us a message. Whether it's a feature request, a partnership idea, or a question about how the matching works, we read every submission and reply within two working days.",
        ]}
      >
        <form onSubmit={submit} className="mt-8 flex flex-col gap-4 max-w-[640px] mx-auto w-full">
          <label className={`flex flex-col gap-1 text-[12px] font-medium font-poppins ${isDark ? 'text-white' : 'text-pp-navy'}`}>
            Your name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              placeholder="Jane Smith"
              className={`${inputCls} h-[44px] rounded-[10px] px-3 text-[14px] font-poppins outline-none transition-colors`}
              required
            />
          </label>
          <label className={`flex flex-col gap-1 text-[12px] font-medium font-poppins ${isDark ? 'text-white' : 'text-pp-navy'}`}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              placeholder="you@example.com"
              className={`${inputCls} h-[44px] rounded-[10px] px-3 text-[14px] font-poppins outline-none transition-colors`}
              required
            />
          </label>
          <label className={`flex flex-col gap-1 text-[12px] font-medium font-poppins ${isDark ? 'text-white' : 'text-pp-navy'}`}>
            Message
            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={submitting}
              placeholder="Tell us what's on your mind…"
              className={`${inputCls} rounded-[10px] p-3 text-[14px] font-poppins outline-none transition-colors resize-y`}
              required
            />
          </label>

          {resultMessage && (
            <p className="rounded-[10px] px-4 py-3 text-[13px] font-poppins border border-[rgba(0,187,123,0.35)] bg-[rgba(0,187,123,0.08)] text-[#00BB7B]">
              {resultMessage}
            </p>
          )}
          {resultError && (
            <p className="rounded-[10px] px-4 py-3 text-[13px] font-poppins border border-[rgba(255,123,123,0.35)] bg-[rgba(255,123,123,0.08)] text-[#FF7B7B]">
              {resultError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="gradient-btn self-start border border-white/[0.06] text-white font-medium font-poppins text-[14px] h-[46px] px-6 rounded-[10px] hover:-translate-y-[1px] hover:shadow-[0_10px_24px_rgba(129,55,246,0.45)] transition-all disabled:opacity-60 disabled:cursor-wait"
          >
            {submitting ? 'Sending…' : 'Send message'}
          </button>
        </form>
      </StaticContentPage>
    </>
  )
}
