import { useNavigate } from 'react-router-dom'
import { darkImages, lightImages, ThemeImages } from '../assets/images'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AnimateOnScroll from '../components/AnimateOnScroll'

// About icons — dark
import darkValueMusic from '../assets/icons/dark/about/valueMusic.svg'
import darkValuePie from '../assets/icons/dark/about/valuePie.svg'
import darkValuePeople from '../assets/icons/dark/about/valuePeople.svg'
import darkValueSparkle from '../assets/icons/dark/about/valueSparkle.svg'
import darkValueGlobe from '../assets/icons/dark/about/valueGlobe.svg'
import darkQuoteLeft from '../assets/icons/dark/about/quoteLeft.svg'
import darkQuoteRight from '../assets/icons/dark/about/quoteRight.svg'
import darkScrollArrow from '../assets/icons/dark/about/scrollArrow.svg'

// About icons — light
import lightValueMusic from '../assets/icons/light/about/valueMusic.svg'
import lightValuePie from '../assets/icons/light/about/valuePie.svg'
import lightValuePeople from '../assets/icons/light/about/valuePeople.svg'
import lightValueSparkle from '../assets/icons/light/about/valueSparkle.svg'
import lightValueGlobe from '../assets/icons/light/about/valueGlobe.svg'
import lightQuoteLeft from '../assets/icons/light/about/quoteLeft.svg'
import lightQuoteRight from '../assets/icons/light/about/quoteRight.svg'
import lightScrollArrow from '../assets/icons/light/about/scrollArrow.svg'

interface AboutUsPageProps {
  isDark: boolean
  onToggleTheme: () => void
}

export default function AboutUsPage({ isDark, onToggleTheme }: AboutUsPageProps) {
  const imgs: ThemeImages = isDark
    ? { ...lightImages, ...darkImages }
    : { ...darkImages, ...lightImages }

  const navigate = useNavigate()

  const aboutIcons = isDark
    ? { music: darkValueMusic, pie: darkValuePie, people: darkValuePeople, sparkle: darkValueSparkle, globe: darkValueGlobe, quoteLeft: darkQuoteLeft, quoteRight: darkQuoteRight, scrollArrow: darkScrollArrow }
    : { music: lightValueMusic, pie: lightValuePie, people: lightValuePeople, sparkle: lightValueSparkle, globe: lightValueGlobe, quoteLeft: lightQuoteLeft, quoteRight: lightQuoteRight, scrollArrow: lightScrollArrow }

  const textMuted = isDark ? 'text-white/60' : 'text-pp-navy/70'
  const textBold = isDark ? 'text-white' : 'text-pp-navy'
  const headingColor = textBold

  // Chip
  const chipBg = isDark
    ? 'bg-[rgba(0,184,215,0.07)] border border-[rgba(0,184,215,0.8)] backdrop-blur-[27px]'
    : 'border border-[rgba(0,184,215,0.6)] backdrop-blur-[27px]'
  const chipBgStyle = isDark
    ? {}
    : { backgroundImage: 'linear-gradient(90deg,rgba(255,255,255,0.7) 0%,rgba(255,255,255,0.7) 100%),linear-gradient(90deg,rgba(0,184,215,0.14) 0%,rgba(0,184,215,0.14) 100%)' }

  // Cards
  const cardCls = isDark
    ? 'bg-white/[0.03] border border-white/[0.07]'
    : 'bg-white border border-[rgba(129,55,246,0.15)] shadow-[0px_2px_20px_0px_rgba(0,0,0,0.04)]'

  const sectionEyebrow = 'font-medium text-[13px] md:text-[13px] xl:text-[15px] tracking-[0.26px] md:tracking-[0.3px] font-poppins text-pp-blue uppercase'
  const sectionHeading = `text-[40px] md:text-[40px] xl:text-[52px] font-semibold leading-[1.3] md:leading-[1.25] font-poppins ${headingColor}`

  // Secondary button
  const secondaryBtnCls = isDark
    ? 'backdrop-blur-[17px] bg-white/[0.01] border border-pp-purple text-white'
    : 'backdrop-blur-[17px] bg-gradient-to-r from-[rgba(129,55,246,0.06)] to-[rgba(100,26,190,0.06)] border border-[#d1b6fc] text-pp-purple-deep'

  // Bold text in story
  const storyBoldCls = textBold

  return (
    <div className={`min-h-screen font-poppins ${isDark ? 'hero-bg-dark' : 'hero-bg-light'}`}>
      <Navbar isDark={isDark} imgs={imgs} onToggleTheme={onToggleTheme} />

      {/* HERO HEADER */}
      <section className="relative overflow-visible h-[385px] xl:h-[450px]">
        {/* Background blobs — clipped via inner wrapper so they stay inside hero */}
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
            {/* Eyebrow — plain cyan text only (no pill, no dot) */}
            <p className="text-pp-blue text-[13px] md:text-[14px] xl:text-[15px] font-medium tracking-[0.3px] uppercase font-poppins">
              AI-powered song matching
            </p>

            {/* Heading */}
            <h1 className={`text-[44px] md:text-[60px] xl:text-[64px] font-semibold leading-[1.2] font-poppins ${headingColor}`}>
              About <span className="gradient-text">PitchPal</span>
            </h1>

            {/* Tagline */}
            <p className={`text-[14px] md:text-[16px] xl:text-[18px] font-normal leading-[1.6] tracking-[0.16px] font-poppins max-w-[640px] ${textMuted}`}>
              Built by a songwriter, for songwriters — and everyone who champions them
            </p>
          </div>
        </div>

        {/* Arrow at bottom boundary — half inside, half below — on all viewports */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-30">
          <img src={aboutIcons.scrollArrow} alt="" className="size-[66px] object-contain" />
        </div>
      </section>

      {/* OUR STORY */}
      <AnimateOnScroll>
      <section className={`relative overflow-hidden ${isDark ? 'border-y border-white/[0.07]' : 'border-y border-[rgba(129,55,246,0.1)]'}`}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[70px] py-[60px] md:py-[70px] xl:py-[100px]">
          <div className="flex flex-col gap-8 md:gap-10">
            <div className="flex flex-col gap-3">
              <p className={sectionEyebrow}>Our Story</p>
              <h2 className={sectionHeading}>Built by a songwriter, for songwriters</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 xl:gap-12">
              <p className={`text-[14px] md:text-[15px] xl:text-[16px] font-normal leading-[1.7] tracking-[0.16px] font-poppins ${textMuted}`}>
                Ciara Newell-Bailey didn't start her career in publishing. She started it on stage. As a member of Bellefire — <span className={storyBoldCls}>signed to Virgin Records and Atlantic Records</span>, <span className={storyBoldCls}>touring with Boyzone, Westlife and Destiny's Child</span>, achieving platinum singles and performing on <span className={storyBoldCls}>Top of the Pops</span> — she understood firsthand what it meant to have music that deserved to be heard, and how hard it was to get it to the right people.
              </p>
              <p className={`text-[14px] md:text-[15px] xl:text-[16px] font-normal leading-[1.7] tracking-[0.16px] font-poppins ${textMuted}`}>
                That experience shaped everything that followed. Through Atlantic Records, Universal Music Publishing and over a decade as Senior Director of Creative at BMG — working with the likes of <span className={storyBoldCls}>Jay-Z, Chris Martin, Ed Sheeran</span>, and writers including <span className={storyBoldCls}>Gez O'Connell, Tom Mann and Mojam</span> — the songwriter's perspective has always driven her work. PitchPal is the tool she wished had existed all along.
              </p>
            </div>

            {/* Career Highlights card */}
            <div className={`${cardCls} rounded-[16px] md:rounded-[18px] xl:rounded-[20px] p-6 md:p-7 xl:p-[34px]`}>
              <p className={`${sectionEyebrow} mb-4 md:mb-5`}>Career Highlights</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {[
                  'Bellefire — signed to Virgin Records & Atlantic Records',
                  "Toured with Boyzone, Westlife and Destiny's Child",
                  'Platinum singles, Top of the Pops performances',
                  'Atlantic Records · Universal Music Publishing · BMG (Senior Director of Creative)',
                  'Worked with Jay-Z, Chris Martin, Ed Sheeran and many more',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="size-1.5 rounded-full bg-pp-blue shrink-0 mt-[10px]" />
                    <span className={`text-[14px] md:text-[15px] font-normal leading-[1.6] font-poppins ${textMuted}`}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
      </AnimateOnScroll>

      {/* QUOTE */}
      <AnimateOnScroll>
      <section className="relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[70px] py-[60px] md:py-[80px] xl:py-[120px] relative">
          {/* Decorative big quotes */}
          <img
            src={aboutIcons.quoteLeft}
            alt=""
            aria-hidden
            className="absolute top-[20px] md:top-[30px] xl:top-[40px] left-4 md:left-8 xl:left-[100px] w-[60px] md:w-[100px] xl:w-[134px] opacity-60"
          />
          <img
            src={aboutIcons.quoteRight}
            alt=""
            aria-hidden
            className="absolute bottom-[20px] md:bottom-[30px] xl:bottom-[40px] right-4 md:right-8 xl:right-[100px] w-[60px] md:w-[100px] xl:w-[134px] opacity-60"
          />

          <div className="flex flex-col items-center text-center gap-5 relative z-10 max-w-[1100px] mx-auto">
            <p className={`text-[22px] md:text-[28px] xl:text-[40px] font-light italic leading-[1.4] tracking-[0.2px] font-poppins ${headingColor}`}>
              &ldquo;The writer is <span className="italic">always at the forefront</span> of what I do.&rdquo;
            </p>
            <p className={`text-[14px] md:text-[15px] xl:text-[16px] font-normal tracking-[0.16px] font-poppins ${textMuted}`}>
              — Ciara Newell-Bailey, Founder
            </p>
          </div>
        </div>
      </section>
      </AnimateOnScroll>

      {/* OUR MISSION */}
      <AnimateOnScroll>
      <section className={`relative overflow-hidden ${isDark ? 'border-y border-white/[0.07]' : 'border-y border-[rgba(129,55,246,0.1)]'}`}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[70px] py-[60px] md:py-[70px] xl:py-[100px]">
          <div className="flex flex-col gap-8 md:gap-10">
            <div className="flex flex-col gap-3">
              <p className={sectionEyebrow}>Our Mission</p>
              <h2 className={sectionHeading}>Every great song deserves to find its artist</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 xl:gap-12">
              <p className={`text-[14px] md:text-[15px] xl:text-[16px] font-normal leading-[1.7] tracking-[0.16px] font-poppins ${textMuted}`}>
                PitchPal uses AI to analyse audio, extract lyrics and understand musical nuance — then surfaces the artists most likely to connect with a track, fast.
              </p>
              <p className={`text-[14px] md:text-[15px] xl:text-[16px] font-normal leading-[1.7] tracking-[0.16px] font-poppins ${textMuted}`}>
                We give songwriters, managers and publishers the edge that the best A&R professionals have spent careers building, and make it available to everyone.
              </p>
            </div>
          </div>
        </div>
      </section>
      </AnimateOnScroll>

      {/* OUR VALUES */}
      <AnimateOnScroll>
      <section className={`relative overflow-hidden ${isDark ? 'border-y border-white/[0.07] bg-gradient-to-r from-[rgba(129,55,246,0.04)] to-[rgba(100,26,190,0.04)]' : 'border-y border-[rgba(129,55,246,0.1)] bg-gradient-to-r from-[rgba(129,55,246,0.03)] to-[rgba(100,26,190,0.03)]'}`}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[70px] py-[60px] md:py-[70px] xl:py-[100px]">
          <div className="flex flex-col gap-8 md:gap-10">
            <div className="flex flex-col gap-3">
              <p className={sectionEyebrow}>Our Values</p>
              <h2 className={sectionHeading}>What we stand for</h2>
            </div>

            {/* 5 cards — mobile: 1 col stack | tablet: 2 cols + last full-width (with order swap) | desktop: row1 = 3 cards (col-span-2 of 6), row2 = 2 wider cards (col-span-3 of 6) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 md:gap-5 xl:gap-6">
              {/* 1. The writer comes first */}
              <ValueCard
                cardCls={cardCls}
                titleCls={textBold}
                descCls={textMuted}
                icon={aboutIcons.music}
                title="The writer comes first"
                desc="The technology serves the music — never the other way around."
                extraCls="md:order-1 xl:col-span-2 xl:order-none"
              />
              {/* 2. Transparency */}
              <ValueCard
                cardCls={cardCls}
                titleCls={textBold}
                descCls={textMuted}
                icon={aboutIcons.pie}
                title="Transparency"
                desc="Every match includes a score and insight — so you know not just who, but why."
                extraCls="md:order-2 xl:col-span-2 xl:order-none"
              />
              {/* 3. Relationships (DOM = pos 3; tablet swaps with Earned via order-4) */}
              <ValueCard
                cardCls={cardCls}
                titleCls={textBold}
                descCls={textMuted}
                icon={aboutIcons.people}
                title="Relationships, not just results"
                desc="PitchPal opens the door. What happens next is still human."
                extraCls="md:order-4 xl:col-span-2 xl:order-none"
              />
              {/* 4. Earned from experience (DOM = pos 4; tablet displays before Relations via order-3) */}
              <ValueCard
                cardCls={cardCls}
                titleCls={textBold}
                descCls={textMuted}
                icon={aboutIcons.sparkle}
                title="Earned from experience"
                desc="Built by someone who has been the artist, the promoter and the publisher. Every feature reflects that."
                extraCls="md:order-3 xl:col-span-3 xl:order-none"
              />
              {/* 5. Access for everyone — full-width on tablet, half-width on desktop */}
              <ValueCard
                cardCls={cardCls}
                titleCls={textBold}
                descCls={textMuted}
                icon={aboutIcons.globe}
                title="Access for everyone"
                desc="A great song without connections deserves the same shot as one written in a major's session."
                extraCls="md:order-5 md:col-span-2 xl:col-span-3 xl:order-none"
              />
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

function ValueCard({
  cardCls, titleCls, descCls, icon, title, desc, extraCls = '',
}: {
  cardCls: string
  titleCls: string
  descCls: string
  icon: string
  title: string
  desc: string
  extraCls?: string
}) {
  return (
    <div className={`${cardCls} ${extraCls} pp-card-hover rounded-[16px] md:rounded-[18px] xl:rounded-[20px] flex flex-col gap-5 md:gap-6 xl:gap-7 p-6 md:p-7 xl:p-[34px]`}>
      <div className="size-[44px] md:size-[48px] xl:size-[50px] relative shrink-0">
        <img src={icon} alt="" className="absolute inset-0 w-full h-full object-contain" />
      </div>
      <div className="flex flex-col gap-2 md:gap-3 xl:gap-[14px]">
        <p className={`text-[18px] md:text-[18px] xl:text-[20px] font-medium font-poppins ${titleCls}`}>{title}</p>
        <p className={`text-[13px] md:text-[13px] xl:text-[14px] font-light leading-[1.5] md:leading-[1.6] tracking-[0.13px] md:tracking-[0.14px] font-poppins ${descCls}`}>{desc}</p>
      </div>
    </div>
  )
}
