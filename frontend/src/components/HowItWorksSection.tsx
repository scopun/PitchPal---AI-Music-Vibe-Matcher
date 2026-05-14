import { ThemeImages } from '../assets/images'

interface HowItWorksProps {
  isDark: boolean
  imgs: ThemeImages
}

const steps = [
  {
    title: 'Upload your track',
    desc: 'Drag and drop any audio file - MP3, WAV, FLAC, AAC, or M4A. No file prep needed.',
    iconKey: 'uploadIcon' as const,
  },
  {
    title: 'AI analyses the audio',
    desc: 'PitchPal extracts lyrics automatically and reads genre, mood, key, BPM, and musical features.',
    iconKey: 'audioIcon' as const,
  },
  {
    title: 'Matches are found',
    desc: 'The AI cross-references 100K+ artists and returns the best-fit matches with a compatibility score.',
    iconKey: 'matchIcon' as const,
  },
  {
    title: 'Pitch with confidence',
    desc: 'Each match includes an AI-written insight and a one-click pitch button personalised to the artist.',
    iconKey: 'pitchIcon' as const,
  },
]

export default function HowItWorksSection({ isDark, imgs }: HowItWorksProps) {
  const sectionBg = isDark
    ? 'bg-gradient-to-r from-[rgba(129,55,246,0.04)] to-[rgba(100,26,190,0.04)] border-white/[0.07]'
    : 'border-[rgba(129,55,246,0.15)]'

  const cardCls = isDark
    ? 'bg-white/[0.03] border border-white/[0.07]'
    : 'border border-[rgba(129,55,246,0.15)] shadow-[inset_0px_0px_14px_0px_rgba(0,0,0,0.03)]'
  const cardBgStyle = isDark
    ? {}
    : { backgroundImage: 'linear-gradient(90deg,rgba(129,55,246,0.03) 0%,rgba(100,26,190,0.03) 100%)' }

  const titleCls = isDark ? 'text-white' : 'text-pp-navy'
  const descCls = isDark ? 'text-white/60' : 'text-pp-navy/70'
  const headingCls = isDark ? 'text-white' : 'text-pp-navy'
  const subCls = isDark ? 'text-white/60' : 'text-pp-navy/70'

  return (
    <section className={`relative overflow-hidden border-b ${sectionBg} py-[60px] md:py-[70px] xl:py-[80px]`}>
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[70px]">
        <div className="flex flex-col gap-[40px] md:gap-[50px]">
          {/* Header */}
          <div className="flex flex-col gap-[12px] md:gap-[14px] text-center items-center">
            <p className="font-medium text-[13px] md:text-[13px] xl:text-[15px] tracking-[0.26px] md:tracking-[0.3px] font-poppins text-pp-blue uppercase">
              How PitchPal Works
            </p>
            <h2 className={`text-[40px] md:text-[40px] xl:text-[52px] font-semibold leading-[1.3] md:leading-[1.25] font-poppins ${headingCls}`}>
              Four steps to the right pitch
            </h2>
            <p className={`text-[14px] md:text-[14px] xl:text-[16px] font-normal leading-[1.5] md:leading-[1.6] tracking-[0.14px] md:tracking-[0.16px] max-w-[540px] font-poppins ${subCls}`}>
              Upload your song and PitchPal's AI analyses the audio, extracts lyrics, and surfaces the best-matched artists in seconds.
            </p>
          </div>

          {/* Cards grid — 1 col mobile, 2 col tablet, 4 col desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
            {steps.map((step) => (
              <div
                key={step.title}
                className={`${cardCls} pp-card-hover rounded-[16px] md:rounded-[18px] xl:rounded-[20px] overflow-hidden flex flex-col gap-5 md:gap-6 xl:gap-8 p-6 md:p-7 xl:p-[38px_36px] relative`}
                style={cardBgStyle}
              >
                <div className="size-[44px] md:size-[44px] xl:size-[50px] overflow-hidden relative shrink-0">
                  <img
                    src={imgs[step.iconKey]}
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col gap-3 md:gap-3 xl:gap-[14px]">
                  <p className={`text-[18px] md:text-[17px] xl:text-[20px] font-medium font-poppins ${titleCls}`}>{step.title}</p>
                  <p className={`text-[13px] md:text-[13px] xl:text-[14px] font-light leading-[1.5] md:leading-[1.6] tracking-[0.13px] md:tracking-[0.14px] font-poppins ${descCls}`}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
