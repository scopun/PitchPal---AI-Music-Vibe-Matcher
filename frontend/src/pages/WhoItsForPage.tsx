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

interface Audience {
  eyebrow: string
  title: string
  description: string
  highlights: string[]
}

const AUDIENCES: Audience[] = [
  {
    eyebrow: 'For Music Publishers',
    title: 'Surface every song in your catalogue',
    description:
      'Your catalogue is full of songs waiting for the right artist. PitchPal analyses every track and surfaces the artists most likely to connect with it — across your entire roster, in seconds. More songs placed. More writers discovered.',
    highlights: ['Catalogue-wide scanning', 'AI-ranked artist matches', 'More placements, faster'],
  },
  {
    eyebrow: 'For Managers',
    title: 'Cut through the noise',
    description:
      "PitchPal gives managers the edge — AI-powered artist matches that cut through the noise and get your writers' songs in front of the right people, faster.",
    highlights: ['Find the right A&R fast', 'Stronger pitches with rationale', "Champion your writers' work"],
  },
  {
    eyebrow: 'For Songwriters',
    title: 'A level playing field',
    description:
      "Great songs don't always find their artist. PitchPal levels the playing field — giving independent writers the same matching power as the biggest publishers in the business. Upload your track and find out exactly who should be recording it.",
    highlights: ['No publisher needed to use', 'Same tech as the majors', 'Take control of your pitch'],
  },
]

export default function WhoItsForPage({ isDark, onToggleTheme }: PageProps) {
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

  const sectionEyebrow =
    'font-medium text-[13px] md:text-[13px] xl:text-[15px] tracking-[0.26px] md:tracking-[0.3px] font-poppins text-pp-blue uppercase'
  const sectionHeading = `text-[40px] md:text-[40px] xl:text-[52px] font-semibold leading-[1.3] md:leading-[1.25] font-poppins ${headingColor}`

  const secondaryBtnCls = isDark
    ? 'backdrop-blur-[17px] bg-white/[0.01] border border-pp-purple text-white'
    : 'backdrop-blur-[17px] bg-gradient-to-r from-[rgba(129,55,246,0.06)] to-[rgba(100,26,190,0.06)] border border-[#d1b6fc] text-pp-purple-deep'

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
              Who it's <span className="gradient-text">for</span>
            </h1>
            <p className={`text-[14px] md:text-[16px] xl:text-[18px] font-normal leading-[1.6] tracking-[0.16px] font-poppins max-w-[640px] ${textMuted}`}>
              Built for the people who move songs forward — publishers, managers and songwriters
            </p>
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-30">
          <img src={scrollArrow} alt="" className="size-[66px] object-contain" />
        </div>
      </section>

      {/* INTRO */}
      <AnimateOnScroll>
        <section className={`relative overflow-hidden ${isDark ? 'border-y border-white/[0.07]' : 'border-y border-[rgba(129,55,246,0.1)]'}`}>
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[70px] py-[60px] md:py-[80px] xl:py-[100px]">
            <div className="max-w-[820px] mx-auto flex flex-col items-center text-center gap-4 md:gap-5">
              <p className={sectionEyebrow}>Who PitchPal is for</p>
              <h2 className={sectionHeading}>Three audiences, one matching engine</h2>
              <p className={`mt-2 text-[14px] md:text-[15px] xl:text-[16px] font-normal leading-[1.7] tracking-[0.16px] font-poppins ${textMuted}`}>
                Whether you have a single track or a catalogue of thousands, PitchPal connects songs to the artists most likely to record them.
              </p>
            </div>
          </div>
        </section>
      </AnimateOnScroll>

      {/* AUDIENCE CARDS */}
      <AnimateOnScroll>
        <section className="relative overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[70px] py-[60px] md:py-[80px] xl:py-[100px]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 xl:gap-6">
              {AUDIENCES.map((aud, idx) => (
                <div
                  key={aud.title}
                  className={`${cardCls} pp-card-hover rounded-[16px] md:rounded-[18px] xl:rounded-[20px] p-6 md:p-7 xl:p-[34px] flex flex-col gap-5`}
                >
                  {/* Icon — different per audience */}
                  <div className="size-[52px] xl:size-[56px] rounded-[14px] bg-gradient-to-br from-pp-purple to-pp-purple-deep flex items-center justify-center shrink-0">
                    {idx === 0 && (
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                        <path d="M3 7L12 3L21 7V17L12 21L3 17V7Z" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
                        <path d="M3 7L12 11L21 7M12 11V21" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
                      </svg>
                    )}
                    {idx === 1 && (
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                        <circle cx="9" cy="8" r="3" stroke="white" strokeWidth="1.6" />
                        <path d="M3 20C3 16.7 5.7 14 9 14C12.3 14 15 16.7 15 20" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                        <circle cx="17" cy="9" r="2.4" stroke="white" strokeWidth="1.6" />
                        <path d="M14 19.5C14 17.1 15.6 15 18 15C20.2 15 22 16.8 22 19.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    )}
                    {idx === 2 && (
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18V6L20 4V16" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="6" cy="18" r="3" stroke="white" strokeWidth="1.6" />
                        <circle cx="17" cy="16" r="3" stroke="white" strokeWidth="1.6" />
                      </svg>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className={sectionEyebrow}>{aud.eyebrow}</p>
                    <h3 className={`text-[22px] md:text-[24px] xl:text-[26px] font-semibold leading-[1.25] font-poppins ${textBold}`}>
                      {aud.title}
                    </h3>
                  </div>

                  <p className={`text-[13px] md:text-[14px] xl:text-[15px] font-light leading-[1.7] tracking-[0.14px] font-poppins ${textMuted}`}>
                    {aud.description}
                  </p>

                  <ul className="flex flex-col gap-2 mt-auto">
                    {aud.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
                          <path d="M20 6L9 17L4 12" stroke="#8137F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className={`text-[13px] md:text-[13px] xl:text-[14px] font-normal font-poppins ${textMuted}`}>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimateOnScroll>

      {/* WHY PITCHPAL — short reinforcement strip */}
      <AnimateOnScroll>
        <section className={`relative overflow-hidden ${isDark ? 'border-y border-white/[0.07] bg-gradient-to-r from-[rgba(129,55,246,0.04)] to-[rgba(100,26,190,0.04)]' : 'border-y border-[rgba(129,55,246,0.1)] bg-gradient-to-r from-[rgba(129,55,246,0.03)] to-[rgba(100,26,190,0.03)]'}`}>
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[70px] py-[60px] md:py-[70px] xl:py-[90px]">
            <div className="max-w-[1000px] mx-auto flex flex-col items-center text-center gap-5">
              <p className={sectionEyebrow}>Why PitchPal</p>
              <h2 className={`text-[28px] md:text-[34px] xl:text-[40px] font-semibold leading-[1.3] font-poppins ${headingColor}`}>
                Built by a songwriter, used by the industry
              </h2>
              <p className={`text-[14px] md:text-[15px] xl:text-[16px] font-normal leading-[1.7] tracking-[0.16px] font-poppins ${textMuted}`}>
                The same matching engine. The same insight. Whether you're managing a roster of writers, sitting on a publisher's full catalogue, or pitching your own demos — PitchPal puts the right artist in front of every track.
              </p>
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
