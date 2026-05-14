import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { darkImages, lightImages, ThemeImages } from '../assets/images'
import Navbar from './Navbar'
import Footer from './Footer'
import AnimateOnScroll from './AnimateOnScroll'

import darkScrollArrow from '../assets/icons/dark/about/scrollArrow.svg'
import lightScrollArrow from '../assets/icons/light/about/scrollArrow.svg'

interface StaticContentPageProps {
  isDark: boolean
  onToggleTheme: () => void
  /** First word of the heading — rendered in default text color */
  headingPrefix: string
  /** Remainder of the heading — rendered with the purple→cyan gradient */
  headingGradient: string
  /** Sub-tagline shown beneath the heading inside the hero */
  tagline: string
  /** Middle body — a single section heading plus paragraph copy */
  bodyHeading: string
  bodyParagraphs: string[]
  /** Extra arbitrary content to render above the CTA (optional) */
  children?: ReactNode
}

export default function StaticContentPage({
  isDark,
  onToggleTheme,
  headingPrefix,
  headingGradient,
  tagline,
  bodyHeading,
  bodyParagraphs,
  children,
}: StaticContentPageProps) {
  const imgs: ThemeImages = isDark
    ? { ...lightImages, ...darkImages }
    : { ...darkImages, ...lightImages }

  const navigate = useNavigate()

  const scrollArrow = isDark ? darkScrollArrow : lightScrollArrow

  const textMuted = isDark ? 'text-white/60' : 'text-pp-navy/70'
  const textBold = isDark ? 'text-white' : 'text-pp-navy'
  const headingColor = textBold

  const secondaryBtnCls = isDark
    ? 'backdrop-blur-[17px] bg-white/[0.01] border border-pp-purple text-white'
    : 'backdrop-blur-[17px] bg-gradient-to-r from-[rgba(129,55,246,0.06)] to-[rgba(100,26,190,0.06)] border border-[#d1b6fc] text-pp-purple-deep'

  return (
    <div className={`min-h-screen font-poppins ${isDark ? 'hero-bg-dark' : 'hero-bg-light'}`}>
      <Navbar isDark={isDark} imgs={imgs} onToggleTheme={onToggleTheme} />

      {/* HERO HEADER — identical pattern to About Us */}
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
              {headingPrefix} <span className="gradient-text">{headingGradient}</span>
            </h1>

            <p className={`text-[14px] md:text-[16px] xl:text-[18px] font-normal leading-[1.6] tracking-[0.16px] font-poppins max-w-[640px] ${textMuted}`}>
              {tagline}
            </p>
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-30">
          <img src={scrollArrow} alt="" className="size-[66px] object-contain" />
        </div>
      </section>

      {/* BODY — single heading + lorem-style paragraphs, centered */}
      <AnimateOnScroll>
        <section className={`relative overflow-hidden ${isDark ? 'border-y border-white/[0.07]' : 'border-y border-[rgba(129,55,246,0.1)]'}`}>
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[70px] py-[60px] md:py-[80px] xl:py-[120px]">
            <div className="max-w-[900px] mx-auto flex flex-col gap-6 md:gap-8 text-center">
              <h2 className={`text-[32px] md:text-[40px] xl:text-[48px] font-semibold leading-[1.25] font-poppins ${headingColor}`}>
                {bodyHeading}
              </h2>
              <div className="flex flex-col gap-5 md:gap-6 text-left md:text-center">
                {bodyParagraphs.map((p, i) => (
                  <p
                    key={i}
                    className={`text-[14px] md:text-[15px] xl:text-[16px] font-normal leading-[1.7] tracking-[0.16px] font-poppins ${textMuted}`}
                  >
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>
      </AnimateOnScroll>

      {children}

      {/* CTA — identical to About Us */}
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
                  onClick={() => navigate('/')}
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
