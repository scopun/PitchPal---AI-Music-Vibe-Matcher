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

const STEPS = [
  {
    num: '01',
    title: 'Upload a track from your roster',
    desc: 'Drop any audio file from your catalogue. PitchPal reads it automatically — no tagging, genre selection, or metadata entry needed.',
    chips: ['MP3', 'WAV', 'FLAC', 'No metadata required'],
  },
  {
    num: '02',
    title: 'Deep audio & lyric analysis',
    desc: 'The AI engine extracts BPM, key, mood, lyrical themes, genre signals and production style directly from the raw audio — building a precise sonic fingerprint with 40+ acoustic features.',
    chips: ['BPM & Key', 'Mood analysis', 'Auto lyric transcription', '40+ acoustic features'],
  },
  {
    num: '03',
    title: 'Ranked artist matches',
    desc: 'A match score is calculated against every artist in the database, ranked by sonic and audience alignment. Each result includes a plain-language AI rationale so you know not just who — but why.',
    chips: ['100K+ artist profiles', 'Percentage match score', 'AI rationale', 'Audience data'],
  },
  {
    num: '04',
    title: 'Explore your ranked matches',
    desc: 'Review your results, filter by genre or match score, and save or export the artists that are the right fit for your track.',
    chips: ['Ranked results', 'Filter & sort', 'Match history'],
  },
]

const TECH_FEATURES = [
  {
    title: 'Audio Signal Analysis',
    desc: 'Extracts over 40 acoustic features per track — including spectral texture, rhythmic complexity, harmonic content, and dynamic range — to build a precise sonic fingerprint unique to every submission.',
  },
  {
    title: 'Lyric & Theme Extraction',
    desc: 'Lyrics are transcribed automatically from audio and parsed for emotional tone, narrative theme, and vocabulary style — adding lyrical compatibility as a layer of the match model.',
  },
  {
    title: 'Artist Catalogue Modelling',
    desc: 'Every artist in the database has a continuously updated sonic profile, built from their full release history — not just genre labels or manually entered tags. 100K+ artist profiles and counting.',
  },
  {
    title: 'AI Match Scoring',
    desc: "A trained model compares the submitted track's fingerprint against each artist profile and returns a percentage match with a plain-language rationale for every result.",
  },
  {
    title: 'Audience Alignment',
    desc: "Match scores factor in audience demographics and streaming behaviour — ensuring the song will resonate with the artist's actual listeners, not just their genre classification.",
  },
  {
    title: 'Continuous Learning',
    desc: 'As matches are reviewed and outcomes tracked, the model refines its scoring — improving accuracy over time based on real-world signals and feedback.',
  },
]

const PROBLEM = [
  'Publishers rely on gut feel and personal contacts to place songs',
  'Manual research across hundreds of artists takes weeks',
  'Great songs miss placement opportunities simply due to bandwidth',
  'Smaller writers without industry connections are hardest hit',
]

const SOLUTION = [
  'Surface artist fits across your full catalogue instantly',
  'Give every writer a real shot at placement',
  'Scale outreach without adding headcount',
  'Full transparency — know why every match was made',
]

export default function HowItWorksPage({ isDark, onToggleTheme }: PageProps) {
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

  const chipCls = isDark
    ? 'bg-white/[0.04] border border-white/[0.08] text-white/70'
    : 'bg-white border border-[rgba(129,55,246,0.15)] text-pp-navy/70'

  const sectionEyebrow = 'font-medium text-[13px] md:text-[13px] xl:text-[15px] tracking-[0.26px] md:tracking-[0.3px] font-poppins text-pp-blue uppercase'
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
              How it <span className="gradient-text">works</span>
            </h1>
            <p className={`text-[14px] md:text-[16px] xl:text-[18px] font-normal leading-[1.6] tracking-[0.16px] font-poppins max-w-[640px] ${textMuted}`}>
              From catalogue to ranked artist matches in four steps
            </p>
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-30">
          <img src={scrollArrow} alt="" className="size-[66px] object-contain" />
        </div>
      </section>

      {/* THE OPPORTUNITY */}
      <AnimateOnScroll>
        <section className={`relative overflow-hidden ${isDark ? 'border-y border-white/[0.07]' : 'border-y border-[rgba(129,55,246,0.1)]'}`}>
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[70px] py-[60px] md:py-[70px] xl:py-[100px]">
            <div className="flex flex-col gap-8 md:gap-10">
              <div className="flex flex-col gap-3">
                <p className={sectionEyebrow}>The Opportunity</p>
                <h2 className={sectionHeading}>A $34B market, transformed by AI</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 xl:gap-6">
                {[
                  { num: '$34B', label: 'Global music publishing market' },
                  { num: '100K+', label: 'Artists in the database' },
                  { num: '10×', label: 'Faster than traditional outreach' },
                ].map((stat) => (
                  <div
                    key={stat.num}
                    className={`${cardCls} pp-card-hover rounded-[16px] md:rounded-[18px] xl:rounded-[20px] p-6 md:p-7 xl:p-[34px] flex flex-col items-center text-center gap-3`}
                  >
                    <p className="text-[44px] md:text-[52px] xl:text-[64px] font-semibold leading-[1.1] font-poppins gradient-text">
                      {stat.num}
                    </p>
                    <p className={`text-[13px] md:text-[14px] xl:text-[15px] font-normal leading-[1.5] tracking-[0.14px] font-poppins ${textMuted} max-w-[200px]`}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </AnimateOnScroll>

      {/* THE PROCESS */}
      <AnimateOnScroll>
        <section className="relative overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[70px] py-[60px] md:py-[80px] xl:py-[100px]">
            <div className="flex flex-col gap-8 md:gap-10">
              <div className="flex flex-col gap-3 md:max-w-[820px]">
                <p className={sectionEyebrow}>The Process</p>
                <h2 className={sectionHeading}>Four steps from upload to ranked matches</h2>
                <p className={`mt-2 text-[14px] md:text-[15px] xl:text-[16px] font-normal leading-[1.7] tracking-[0.16px] font-poppins ${textMuted}`}>
                  From any track in your roster to ranked artist matches — without weeks of manual research.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 xl:gap-6">
                {STEPS.map((step) => (
                  <div
                    key={step.num}
                    className={`${cardCls} pp-card-hover rounded-[16px] md:rounded-[18px] xl:rounded-[20px] p-6 md:p-7 xl:p-[30px] flex flex-col gap-4 md:gap-5`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="size-[52px] xl:size-[56px] rounded-[12px] bg-gradient-to-br from-pp-purple to-pp-purple-deep flex items-center justify-center shrink-0">
                        <span className="text-white text-[18px] xl:text-[20px] font-semibold font-manrope">{step.num}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[18px] md:text-[19px] xl:text-[22px] font-medium leading-[1.3] font-poppins ${textBold}`}>
                          {step.title}
                        </p>
                      </div>
                    </div>
                    <p className={`text-[13px] md:text-[14px] xl:text-[15px] font-light leading-[1.7] tracking-[0.14px] font-poppins ${textMuted}`}>
                      {step.desc}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {step.chips.map((chip) => (
                        <span
                          key={chip}
                          className={`${chipCls} px-3 py-[6px] rounded-full text-[11px] md:text-[12px] font-normal tracking-[0.13px] font-poppins whitespace-nowrap`}
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </AnimateOnScroll>

      {/* THE TECHNOLOGY */}
      <AnimateOnScroll>
        <section className={`relative overflow-hidden ${isDark ? 'border-y border-white/[0.07] bg-gradient-to-r from-[rgba(129,55,246,0.04)] to-[rgba(100,26,190,0.04)]' : 'border-y border-[rgba(129,55,246,0.1)] bg-gradient-to-r from-[rgba(129,55,246,0.03)] to-[rgba(100,26,190,0.03)]'}`}>
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[70px] py-[60px] md:py-[70px] xl:py-[100px]">
            <div className="flex flex-col gap-8 md:gap-10">
              <div className="flex flex-col gap-3 md:max-w-[820px]">
                <p className={sectionEyebrow}>The Technology</p>
                <h2 className={sectionHeading}>What makes the matching engine work</h2>
                <p className={`mt-2 text-[14px] md:text-[15px] xl:text-[16px] font-normal leading-[1.7] tracking-[0.16px] font-poppins ${textMuted}`}>
                  Beyond genre tags — built on audio signal processing and large-scale artist catalogue analysis.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 xl:gap-6">
                {TECH_FEATURES.map((feat) => (
                  <div
                    key={feat.title}
                    className={`${cardCls} pp-card-hover rounded-[16px] md:rounded-[18px] xl:rounded-[20px] p-6 md:p-7 xl:p-[28px] flex flex-col gap-3 md:gap-4`}
                  >
                    <div className="size-[44px] xl:size-[48px] rounded-[10px] bg-gradient-to-br from-pp-purple/15 to-pp-blue/15 border border-pp-purple/30 flex items-center justify-center shrink-0">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L14.39 8.25L21 9.27L16.5 13.97L17.77 20.5L12 17.27L6.23 20.5L7.5 13.97L3 9.27L9.61 8.25L12 2Z" stroke={isDark ? '#A678FF' : '#8137F6'} strokeWidth="1.5" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className={`text-[17px] md:text-[18px] xl:text-[20px] font-medium leading-[1.3] font-poppins ${textBold}`}>
                      {feat.title}
                    </p>
                    <p className={`text-[13px] md:text-[13px] xl:text-[14px] font-light leading-[1.6] tracking-[0.14px] font-poppins ${textMuted}`}>
                      {feat.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </AnimateOnScroll>

      {/* MARKET CONTEXT */}
      <AnimateOnScroll>
        <section className="relative overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[70px] py-[60px] md:py-[80px] xl:py-[100px]">
            <div className="flex flex-col gap-8 md:gap-10">
              <div className="flex flex-col gap-3">
                <p className={sectionEyebrow}>Market Context</p>
                <h2 className={sectionHeading}>Why now</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 xl:gap-6">
                {/* Problem card */}
                <div
                  className={`pp-card-hover rounded-[16px] md:rounded-[18px] xl:rounded-[20px] p-6 md:p-7 xl:p-[34px] flex flex-col gap-5`}
                  style={{
                    background: isDark ? 'rgba(255,107,107,0.04)' : 'rgba(220,38,38,0.03)',
                    border: `1px solid ${isDark ? 'rgba(255,107,107,0.20)' : 'rgba(220,38,38,0.16)'}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-[40px] rounded-[10px] flex items-center justify-center" style={{ background: isDark ? 'rgba(255,107,107,0.10)' : 'rgba(220,38,38,0.08)' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 9V13" stroke={isDark ? '#FF8A8A' : '#C73030'} strokeWidth="1.8" strokeLinecap="round" />
                        <circle cx="12" cy="16.5" r="1" fill={isDark ? '#FF8A8A' : '#C73030'} />
                        <circle cx="12" cy="12" r="9" stroke={isDark ? '#FF8A8A' : '#C73030'} strokeWidth="1.5" />
                      </svg>
                    </div>
                    <p className={`text-[18px] md:text-[20px] xl:text-[22px] font-semibold font-poppins ${textBold}`}>The problem today</p>
                  </div>
                  <ul className="flex flex-col gap-3">
                    {PROBLEM.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="size-1.5 rounded-full shrink-0 mt-[10px]" style={{ background: isDark ? '#FF8A8A' : '#C73030' }} />
                        <span className={`text-[14px] md:text-[15px] font-normal leading-[1.6] font-poppins ${textMuted}`}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Solution card */}
                <div
                  className={`pp-card-hover rounded-[16px] md:rounded-[18px] xl:rounded-[20px] p-6 md:p-7 xl:p-[34px] flex flex-col gap-5`}
                  style={{
                    background: isDark ? 'rgba(129,55,246,0.06)' : 'rgba(129,55,246,0.04)',
                    border: `1px solid ${isDark ? 'rgba(129,55,246,0.30)' : 'rgba(129,55,246,0.22)'}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-[40px] rounded-[10px] flex items-center justify-center" style={{ background: 'rgba(129,55,246,0.12)' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="#8137F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className={`text-[18px] md:text-[20px] xl:text-[22px] font-semibold font-poppins ${textBold}`}>What PitchPal changes</p>
                  </div>
                  <ul className="flex flex-col gap-3">
                    {SOLUTION.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="size-1.5 rounded-full bg-pp-purple shrink-0 mt-[10px]" />
                        <span className={`text-[14px] md:text-[15px] font-normal leading-[1.6] font-poppins ${textMuted}`}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
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
                  onClick={() => navigate('/about-us')}
                  className={`${secondaryBtnCls} pp-btn-lift-soft font-medium font-poppins text-[16px] md:text-[18px] xl:text-[16px] flex items-center justify-center px-[30px] py-[14px] xl:py-4 xl:h-[54px] rounded-[12px] w-full md:flex-1`}
                >
                  About PitchPal
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
