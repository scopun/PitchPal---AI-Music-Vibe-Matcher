import { useNavigate } from 'react-router-dom'
import { ThemeImages } from '../assets/images'

interface FooterProps {
  isDark: boolean
  imgs: ThemeImages
}

export default function Footer({ isDark, imgs }: FooterProps) {
  const navigate = useNavigate()
  /* Dark footer: #FFFFFF · 3% bg, #FFFFFF · 7% border */
  /* Light footer: white bg, #8137F6 · 10% border */
  const footerBg = isDark
    ? 'bg-white/[0.03] border-t border-white/[0.07]'
    : 'bg-white border-t border-[rgba(129,55,246,0.1)]'

  const linkCls = isDark ? 'text-white/30' : 'text-pp-navy/50'

  return (
    <footer className={`${footerBg} overflow-hidden`}>
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-9 py-[38px] flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 xl:gap-0">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="h-9 w-[124px] relative shrink-0 cursor-pointer bg-transparent border-0 p-0"
          aria-label="Go to home"
        >
          <img src={imgs.footerLogo} alt="PitchPal" className="absolute inset-0 w-full h-full object-contain object-left" />
        </button>
        <div className={`flex flex-wrap md:flex-nowrap w-full xl:w-auto justify-between md:justify-between items-center gap-4 md:gap-0 xl:gap-[40px] font-light text-[13px] md:text-[14px] tracking-[0.14px] font-poppins ${linkCls}`}>
          <button
            type="button"
            onClick={() => navigate('/privacy-policy')}
            className="hover:opacity-70 transition-opacity bg-transparent border-0 p-0 font-light text-inherit cursor-pointer"
          >
            Privacy Policy
          </button>
          <button
            type="button"
            onClick={() => navigate('/contact')}
            className="hover:opacity-70 transition-opacity bg-transparent border-0 p-0 font-light text-inherit cursor-pointer"
          >
            Contact
          </button>
          <span>© 2026 PitchPal. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}
