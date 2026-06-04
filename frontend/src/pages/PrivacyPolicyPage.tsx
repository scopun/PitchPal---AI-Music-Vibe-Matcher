import { useNavigate } from 'react-router-dom'
import { darkImages, lightImages, ThemeImages } from '../assets/images'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AnimateOnScroll from '../components/AnimateOnScroll'

import darkScrollArrow from '../assets/icons/dark/about/scrollArrow.svg'
import lightScrollArrow from '../assets/icons/light/about/scrollArrow.svg'

interface PageProps {
  isDark: boolean
  onToggleTheme: () => void
}

interface PolicySection {
  num: number
  title: string
  paragraphs?: string[]
  bullets?: { label: string; text: string }[]
}

const SECTIONS: PolicySection[] = [
  {
    num: 1,
    title: 'Who we are',
    paragraphs: [
      'PitchPal operates the platform at pitchpal.co.uk. This policy explains what personal data we collect, why, and your rights over it. By using PitchPal, you agree to this policy.',
    ],
  },
  {
    num: 2,
    title: 'What we collect',
    bullets: [
      { label: 'Account information', text: 'Name, email address, and password (stored as a secure hash).' },
      { label: 'Profile information', text: 'Company name, job title, and any details you add to your profile.' },
      { label: 'Audio files', text: 'Tracks you upload for analysis. See section 4 for full details.' },
      { label: 'Usage data', text: 'Features used, matches viewed, and timestamps of activity.' },
      { label: 'Technical data', text: 'IP address, browser type, and device identifiers collected automatically.' },
      { label: 'Communications', text: 'Messages you send to us via email or support channels.' },
    ],
  },
  {
    num: 3,
    title: 'How we use it',
    paragraphs: [
      'We use your data to provide and improve the PitchPal service, manage your account, send transactional emails, and comply with legal obligations. Where we send marketing updates, you can opt out at any time.',
      'We may also use AI tools to help review and process certain data as part of operating and improving the platform. Where this occurs, it is subject to the same confidentiality and security standards as all other data handling.',
    ],
  },
  {
    num: 4,
    title: 'Your audio files',
    paragraphs: [
      'Audio files are uploaded securely and stored in encrypted cloud storage. They are processed by our AI engine to extract acoustic features and generate match results. The original audio is never shared with any third party. We do not use your audio to train AI models on behalf of others, and we do not sell audio data in any form.',
      'You retain full ownership of your music. Uploading to PitchPal transfers no rights to us.',
    ],
  },
  {
    num: 5,
    title: 'Who we share data with',
    paragraphs: [
      'We do not sell your personal data. We share data only with trusted service providers who help operate the platform (cloud hosting, email delivery, analytics) — they act on our instructions only. We may also disclose data if required by law or court order.',
    ],
  },
  {
    num: 6,
    title: 'How long we keep it',
    paragraphs: [
      'We retain your data for as long as your account is active. If you close your account, we delete or anonymise your personal data within 90 days, except where we must keep it for legal purposes. You can delete individual tracks and match records from your dashboard at any time.',
    ],
  },
  {
    num: 7,
    title: 'Your rights',
    paragraphs: [
      'Under UK GDPR you have the right to access, correct, delete, or export your data, and to object to or restrict certain processing. To exercise any right, email us at help@pitchpal.co.uk. You also have the right to complain to the ICO at ico.org.uk.',
    ],
  },
  {
    num: 8,
    title: 'Cookies',
    paragraphs: [
      'We use essential cookies (required for login and security) and optional analytics cookies to understand how the platform is used. You can manage cookie preferences through your browser settings.',
    ],
  },
  {
    num: 9,
    title: 'Security',
    paragraphs: [
      'We use encryption and access controls to protect your data. If you believe your account has been compromised, contact us immediately at help@pitchpal.co.uk.',
    ],
  },
  {
    num: 10,
    title: 'Contact',
    paragraphs: [
      'Questions about this policy? Get in touch at help@pitchpal.co.uk or visit pitchpal.co.uk. We may update this policy from time to time and will notify you of significant changes before they take effect.',
    ],
  },
]

export default function PrivacyPolicyPage({ isDark, onToggleTheme }: PageProps) {
  const imgs: ThemeImages = isDark
    ? { ...lightImages, ...darkImages }
    : { ...darkImages, ...lightImages }

  const navigate = useNavigate()
  const scrollArrow = isDark ? darkScrollArrow : lightScrollArrow

  const textMuted = isDark ? 'text-white/60' : 'text-pp-navy/70'
  const textBold = isDark ? 'text-white' : 'text-pp-navy'
  const headingColor = textBold

  const cardCls = isDark
    ? 'bg-white/[0.03] border border-white/[0.07]'
    : 'bg-white border border-[rgba(129,55,246,0.15)] shadow-[0px_2px_20px_0px_rgba(0,0,0,0.04)]'

  const secondaryBtnCls = isDark
    ? 'backdrop-blur-[17px] bg-white/[0.01] border border-pp-purple text-white'
    : 'backdrop-blur-[17px] bg-gradient-to-r from-[rgba(129,55,246,0.06)] to-[rgba(100,26,190,0.06)] border border-[#d1b6fc] text-pp-purple-deep'

  // Inline link colour for emails / external links inside the legal copy
  const linkCls = isDark ? 'text-pp-blue hover:underline' : 'text-pp-purple-deep hover:underline'

  // Helper that auto-links email addresses and ico.org.uk so users can act
  // on them. Keeps the source paragraphs readable as plain strings.
  const linkify = (text: string) => {
    const parts = text.split(/(help@pitchpal\.co\.uk|ico\.org\.uk|pitchpal\.co\.uk)/g)
    return parts.map((part, i) => {
      if (part === 'help@pitchpal.co.uk') {
        return <a key={i} href="mailto:help@pitchpal.co.uk" className={linkCls}>{part}</a>
      }
      if (part === 'ico.org.uk') {
        return <a key={i} href="https://ico.org.uk" target="_blank" rel="noreferrer" className={linkCls}>{part}</a>
      }
      if (part === 'pitchpal.co.uk') {
        return <a key={i} href="https://pitchpal.co.uk" target="_blank" rel="noreferrer" className={linkCls}>{part}</a>
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <div className={`min-h-screen font-poppins ${isDark ? 'hero-bg-dark' : 'hero-bg-light'}`}>
      <Navbar isDark={isDark} imgs={imgs} onToggleTheme={onToggleTheme} />

      {/* HERO HEADER */}
      <section className="relative overflow-visible h-[385px] xl:h-[450px]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {isDark ? (
            <>
              <div className="absolute" style={{ height: '700px', left: '-200px', top: '-100px', width: '700px', zIndex: 0, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(144,0,255,0.20) 0%,transparent 65%)', filter: 'blur(80px)' }} />
              <div className="absolute" style={{ height: '600px', right: '-100px', top: '-50px', width: '600px', zIndex: 0, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(144,0,255,0.10) 0%,transparent 70%)', filter: 'blur(60px)' }} />
            </>
          ) : (
            <>
              <div className="absolute" style={{ height: '700px', left: '-150px', top: '-300px', width: '700px', zIndex: 0, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(129,55,246,0.20) 0%,transparent 60%)', filter: 'blur(90px)' }} />
              <div className="absolute" style={{ height: '600px', right: '-80px', top: '0%', width: '600px', zIndex: 0, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(0,184,215,0.16) 0%,transparent 60%)', filter: 'blur(80px)' }} />
            </>
          )}
        </div>

        <div className="relative z-10 max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[70px] h-full flex flex-col items-center justify-center">
          <div className="flex flex-col items-center text-center gap-5 md:gap-6 xl:gap-7">
            <p className="text-pp-blue text-[13px] md:text-[14px] xl:text-[15px] font-medium tracking-[0.3px] uppercase font-poppins">
              AI-powered song matching
            </p>
            <h1 className={`text-[44px] md:text-[60px] xl:text-[64px] font-semibold leading-[1.2] font-poppins ${headingColor}`}>
              Privacy <span className="gradient-text">Policy</span>
            </h1>
            <p className={`text-[14px] md:text-[16px] xl:text-[18px] font-normal leading-[1.6] tracking-[0.16px] font-poppins max-w-[640px] ${textMuted}`}>
              Last updated: 1 June 2026
            </p>
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-30">
          <img src={scrollArrow} alt="" className="size-[66px] object-contain" />
        </div>
      </section>

      {/* PLAIN ENGLISH CALLOUT */}
      <AnimateOnScroll>
        <section className={`relative overflow-hidden ${isDark ? 'border-y border-white/[0.07]' : 'border-y border-[rgba(129,55,246,0.1)]'}`}>
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[70px] py-[60px] md:py-[70px] xl:py-[80px]">
            <div className="max-w-[920px] mx-auto">
              <div
                className="rounded-[16px] md:rounded-[18px] xl:rounded-[20px] p-6 md:p-7 xl:p-[34px] flex flex-col md:flex-row items-start gap-4 md:gap-5"
                style={{
                  background: isDark ? 'rgba(129,55,246,0.08)' : 'rgba(129,55,246,0.04)',
                  border: `1px solid ${isDark ? 'rgba(129,55,246,0.30)' : 'rgba(129,55,246,0.22)'}`,
                }}
              >
                <div className="size-[44px] xl:size-[48px] rounded-[10px] bg-gradient-to-br from-pp-purple to-pp-purple-deep flex items-center justify-center shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className={`text-[14px] md:text-[15px] xl:text-[16px] font-medium leading-[1.6] tracking-[0.16px] font-poppins ${textBold}`}>
                    <span className="text-pp-purple">In plain English:</span> We collect only what we need to run PitchPal. We don't sell your data. Your audio files are used solely to generate matches and are never shared with third parties for their own purposes. You can delete your data at any time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimateOnScroll>

      {/* NUMBERED SECTIONS */}
      <AnimateOnScroll>
        <section className="relative overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[70px] py-[60px] md:py-[80px] xl:py-[100px]">
            <div className="max-w-[920px] mx-auto flex flex-col gap-6 md:gap-7 xl:gap-8">
              {SECTIONS.map((section) => (
                <div
                  key={section.num}
                  className={`${cardCls} rounded-[16px] md:rounded-[18px] xl:rounded-[20px] p-6 md:p-7 xl:p-[34px] flex flex-col gap-4 md:gap-5`}
                >
                  <div className="flex items-center gap-4">
                    <div className="size-[44px] xl:size-[48px] rounded-[10px] bg-gradient-to-br from-pp-purple to-pp-purple-deep flex items-center justify-center shrink-0">
                      <span className="text-white text-[16px] xl:text-[18px] font-semibold font-manrope">{section.num}</span>
                    </div>
                    <h3 className={`text-[20px] md:text-[22px] xl:text-[26px] font-semibold leading-[1.25] font-poppins ${textBold}`}>
                      {section.title}
                    </h3>
                  </div>

                  {section.paragraphs && (
                    <div className="flex flex-col gap-3">
                      {section.paragraphs.map((para, i) => (
                        <p
                          key={i}
                          className={`text-[14px] md:text-[15px] xl:text-[16px] font-normal leading-[1.7] tracking-[0.16px] font-poppins ${textMuted}`}
                        >
                          {linkify(para)}
                        </p>
                      ))}
                    </div>
                  )}

                  {section.bullets && (
                    <ul className="flex flex-col gap-3">
                      {section.bullets.map((b) => (
                        <li key={b.label} className="flex items-start gap-3">
                          <span className="size-1.5 rounded-full bg-pp-purple shrink-0 mt-[10px]" />
                          <span className={`text-[14px] md:text-[15px] xl:text-[16px] font-normal leading-[1.6] font-poppins ${textMuted}`}>
                            <span className={`font-medium ${textBold}`}>{b.label}:</span> {b.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimateOnScroll>

      {/* CTA */}
      <AnimateOnScroll>
        <section className="relative overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[70px] py-[60px] md:py-[80px] xl:py-[120px]">
            <div className="flex flex-col items-center text-center gap-8 md:gap-10">
              <h2 className={`text-[44px] md:text-[44px] xl:text-[52px] font-semibold leading-[1.2] xl:leading-[1.2] font-poppins ${headingColor} max-w-[1100px]`}>
                <span className="gradient-text">PitchPal</span> — Find the right artists for your track.
              </h2>
              <div className="flex flex-col md:flex-row gap-[14px] md:gap-5 w-full md:max-w-[720px]">
                <button
                  onClick={() => navigate('/')}
                  className="gradient-btn pp-btn-lift border border-white/[0.06] text-white font-medium font-poppins text-[16px] md:text-[18px] xl:text-[16px] flex items-center justify-center px-[30px] py-[14px] xl:py-4 xl:h-[54px] rounded-[12px] w-full md:flex-1"
                >
                  Get started free
                </button>
                <button
                  onClick={() => navigate('/how-it-works')}
                  className={`${secondaryBtnCls} pp-btn-lift-soft font-medium font-poppins text-[16px] md:text-[18px] xl:text-[16px] flex items-center justify-center px-[30px] py-[14px] xl:py-4 xl:h-[54px] rounded-[12px] w-full md:flex-1`}
                >
                  See how it works
                </button>
              </div>
            </div>
          </div>
        </section>
      </AnimateOnScroll>

      <Footer isDark={isDark} imgs={imgs} />
    </div>
  )
}
