import { ThemeImages } from '../assets/images'

interface WhoItsForProps {
  isDark: boolean
  imgs: ThemeImages
}

const audience = [
  {
    iconKey: 'songwriterIcon' as const,
    iconBgDark: 'bg-[rgba(129,55,246,0.1)] border border-[rgba(209,173,255,0.2)]',
    iconBgLight: 'bg-[rgba(129,55,246,0.06)] border border-[rgba(129,55,246,0.15)]',
    title: 'Songwriters',
    desc: "You wrote it — now get it heard. Upload your demos and discover which established artists are a natural fit for your sound and style.",
  },
  {
    iconKey: 'managerIcon' as const,
    iconBgDark: 'bg-[rgba(255,165,0,0.1)] border border-[rgba(255,200,80,0.25)]',
    iconBgLight: 'bg-[rgba(255,165,0,0.08)] border border-[rgba(255,165,0,0.2)]',
    title: 'Music Managers',
    desc: "Pitch your clients' songs smarter. Get AI-powered match scores and insights that make it easy to make the case to the right A&R contacts.",
  },
  {
    iconKey: 'publisherIcon' as const,
    iconBgDark: 'bg-[rgba(130,144,255,0.1)] border border-[rgba(209,173,255,0.2)]',
    iconBgLight: 'bg-[rgba(130,144,255,0.07)] border border-[rgba(130,144,255,0.2)]',
    title: 'Publishers',
    desc: "Manage a catalogue? PitchPal helps you identify artist opportunities across your entire roster — fast, at scale, and backed by data.",
  },
]

export default function WhoItsForSection({ isDark, imgs }: WhoItsForProps) {
  const sectionBg = isDark
    ? ''
    : 'bg-gradient-to-r from-[rgba(129,55,246,0.03)] to-[rgba(100,26,190,0.03)] border-y border-[rgba(129,55,246,0.1)]'

  const cardCls = isDark
    ? 'bg-white/[0.03] border border-white/[0.07]'
    : 'bg-white border border-[rgba(129,55,246,0.15)] shadow-[0px_2px_20px_0px_rgba(0,0,0,0.04)]'

  const titleCls = isDark ? 'text-white' : 'text-pp-navy'
  const descCls = isDark ? 'text-white/60' : 'text-pp-navy/70'
  const headingCls = isDark ? 'text-white' : 'text-pp-navy'
  const subCls = isDark ? 'text-white/60' : 'text-pp-navy/70'

  return (
    <section className={`py-[60px] md:py-[70px] xl:py-[80px] ${sectionBg} relative overflow-hidden`}>
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[70px]">
        <div className="flex flex-col gap-[40px] md:gap-[50px]">
          {/* Header */}
          <div className="flex flex-col gap-[12px] md:gap-[14px] text-center items-center">
            <p className="font-medium text-[13px] md:text-[13px] xl:text-[15px] tracking-[0.26px] md:tracking-[0.3px] font-poppins text-pp-blue uppercase">
              Who PitchPal Is For
            </p>
            <h2 className={`text-[40px] md:text-[40px] xl:text-[52px] font-semibold leading-[1.3] md:leading-[1.25] font-poppins ${headingCls}`}>
              Built for everyone in the song's journey
            </h2>
            <p className={`text-[14px] md:text-[14px] xl:text-[16px] font-normal leading-[1.5] md:leading-[1.6] tracking-[0.14px] md:tracking-[0.16px] max-w-[560px] font-poppins ${subCls}`}>
              Whether you wrote the track, manage the writer, or represent the catalogue — PitchPal gives you the edge.
            </p>
          </div>

          {/* Cards — 1 col mobile, 2 col tablet (Publishers full-width), 3 col desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
            {audience.map((item, index) => {
              const iconBg = isDark ? item.iconBgDark : item.iconBgLight
              return (
                <div
                  key={item.title}
                  className={`${cardCls} pp-card-hover rounded-[16px] md:rounded-[18px] xl:rounded-[20px] overflow-hidden flex flex-col gap-5 md:gap-6 xl:gap-8 p-6 md:p-7 xl:p-[38px_36px] ${index === 2 ? 'md:col-span-2 xl:col-span-1' : ''}`}
                >
                  <div className={`${iconBg} size-[50px] md:size-[54px] xl:size-[64px] overflow-hidden relative rounded-[12px] md:rounded-[14px] shrink-0 flex items-center justify-center`}>
                    <img
                      src={imgs[item.iconKey]}
                      alt=""
                      className="w-[24px] md:w-[28px] xl:w-[32px] h-[24px] md:h-[28px] xl:h-[32px] object-contain"
                    />
                  </div>
                  <div className="flex flex-col gap-3 md:gap-3 xl:gap-[14px]">
                    <p className={`text-[18px] md:text-[18px] xl:text-[20px] font-medium font-poppins ${titleCls}`}>{item.title}</p>
                    <p className={`text-[13px] md:text-[13px] xl:text-[14px] font-light leading-[1.5] md:leading-[1.6] tracking-[0.13px] md:tracking-[0.14px] font-poppins ${descCls}`}>{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
