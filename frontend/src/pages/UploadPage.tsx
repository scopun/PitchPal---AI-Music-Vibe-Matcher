import { useState, useRef, useEffect, Fragment } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// Dark icons
import darkLogo from '../assets/icons/dark/upload/Logo.svg'
import darkAvatar from '../assets/icons/dark/upload/Avatar.svg'
import darkSearch from '../assets/icons/dark/upload/searchIcon.svg'
import darkUploadSmall from '../assets/icons/dark/upload/uploadSmallArrow.svg'
import darkUploadBig from '../assets/icons/dark/upload/uploadBigArrow.svg'
import darkTheme from '../assets/icons/dark/upload/themeIcon.svg'
import darkMail from '../assets/icons/dark/upload/mailIcon.svg'
import darkBell from '../assets/icons/dark/upload/bellIcon.svg'
import darkChevron from '../assets/icons/dark/upload/chevronDown.svg'
import darkCheck from '../assets/icons/dark/upload/checkCyan.svg'
import darkHouse from '../assets/icons/dark/upload/houseIcon.svg'
import darkMusic from '../assets/icons/dark/upload/musicIcon.svg'
import darkTarget from '../assets/icons/dark/upload/targetIcon.svg'
import darkMailCheck from '../assets/icons/dark/upload/mailCheckIcon.svg'
import darkCpu from '../assets/icons/dark/upload/cpuIcon.svg'
import darkChartBar from '../assets/icons/dark/upload/chartBarIcon.svg'

// Analysing icons — dark
import darkWaveform from '../assets/icons/dark/analysing/waveform.svg'
import darkStepDone from '../assets/icons/dark/analysing/stepDone.svg'
import darkStepActive from '../assets/icons/dark/analysing/stepActive.svg'
import darkMusicNote from '../assets/icons/dark/analysing/musicNote.svg'

// Result icons — dark
import darkResAvatar1 from '../assets/icons/dark/result/avatar1.svg'
import darkResAvatar2 from '../assets/icons/dark/result/avatar2.svg'
import darkResAvatar3 from '../assets/icons/dark/result/avatar3.svg'
import darkResSend from '../assets/icons/dark/result/sendIcon.svg'
import darkResSparkle from '../assets/icons/dark/result/sparkleIcon.svg'
import darkResChevron from '../assets/icons/dark/result/chevronDown.svg'
import darkResTag from '../assets/icons/dark/result/tagIcon.svg'
import darkResMusicNote from '../assets/icons/dark/result/musicNote.svg'

// Result icons — dark
import darkAvatar1 from '../assets/icons/dark/result/avatar1.svg'
import darkAvatar2 from '../assets/icons/dark/result/avatar2.svg'
import darkAvatar3 from '../assets/icons/dark/result/avatar3.svg'
import darkSendIcon from '../assets/icons/dark/result/sendIcon.svg'
import darkSparkleIcon from '../assets/icons/dark/result/sparkleIcon.svg'
import darkResultChevron from '../assets/icons/dark/result/chevronDown.svg'
import darkTagIcon from '../assets/icons/dark/result/tagIcon.svg'

// Light icons
import lightLogo from '../assets/icons/light/upload/Logo.svg'
import lightAvatar from '../assets/icons/light/upload/Avatar.svg'
import lightSearch from '../assets/icons/light/upload/searchIcon.svg'
import lightUploadSmall from '../assets/icons/light/upload/uploadSmallArrow.svg'
import lightUploadBig from '../assets/icons/light/upload/uploadBigArrow.svg'
import lightTheme from '../assets/icons/light/upload/themeIcon.svg'
import lightMail from '../assets/icons/light/upload/mailIcon.svg'
import lightBell from '../assets/icons/light/upload/bellIcon.svg'
import lightChevron from '../assets/icons/light/upload/chevronDown.svg'
import lightCheck from '../assets/icons/light/upload/checkCyan.svg'
import lightHouse from '../assets/icons/light/upload/houseIcon.svg'
import lightMusic from '../assets/icons/light/upload/musicIcon.svg'
import lightTarget from '../assets/icons/light/upload/targetIcon.svg'
import lightMailCheck from '../assets/icons/light/upload/mailCheckIcon.svg'
import lightCpu from '../assets/icons/light/upload/cpuIcon.svg'
import lightChartBar from '../assets/icons/light/upload/chartBarIcon.svg'

// Analysing icons — light
import lightWaveform from '../assets/icons/light/analysing/waveform.svg'
import lightStepDone from '../assets/icons/light/analysing/stepDone.svg'
import lightStepActive from '../assets/icons/light/analysing/stepActive.svg'
import lightMusicNote from '../assets/icons/light/analysing/musicNote.svg'

// Result icons — light
import lightResAvatar1 from '../assets/icons/light/result/avatar1.svg'
import lightResAvatar2 from '../assets/icons/light/result/avatar2.svg'
import lightResAvatar3 from '../assets/icons/light/result/avatar3.svg'
import lightResSend from '../assets/icons/light/result/sendIcon.svg'
import lightResSparkle from '../assets/icons/light/result/sparkleIcon.svg'
import lightResChevron from '../assets/icons/light/result/chevronDown.svg'
import lightResTag from '../assets/icons/light/result/tagIcon.svg'
import lightResMusicNote from '../assets/icons/light/result/musicNote.svg'

interface UploadPageProps {
  isDark: boolean
  onToggleTheme: () => void
}

type SidebarKey =
  | 'dashboard'
  | 'my-tracks'
  | 'my-matches'
  | 'pitches-sent'
  | 'ai-assistant'
  | 'analytics'
  | 'messages'
  | 'notifications'

// Map between sidebar keys and URL paths. `/upload` is kept as the path for
// the My matches tab so the existing route still works. Messages and
// notifications are reachable from the topbar icons, not the sidebar.
const PATH_BY_KEY: Record<SidebarKey, string> = {
  'dashboard': '/dashboard',
  'my-tracks': '/my-tracks',
  'my-matches': '/upload',
  'pitches-sent': '/pitches-sent',
  'ai-assistant': '/ai-assistant',
  'analytics': '/analytics',
  'messages': '/messages',
  'notifications': '/notifications',
}

const KEY_BY_PATH: Record<string, SidebarKey> = Object.fromEntries(
  Object.entries(PATH_BY_KEY).map(([k, v]) => [v, k as SidebarKey])
) as Record<string, SidebarKey>

const TAB_META: Record<SidebarKey, { eyebrow: string; title: string; gradient: string; subtitle: string; topbarTitle: string; topbarSubtitle: string; bodyParagraphs: string[] }> = {
  'dashboard': {
    eyebrow: 'DASHBOARD',
    title: 'Your',
    gradient: 'command center',
    subtitle: 'A quick overview of your activity, top matches and recent uploads — all in one place.',
    topbarTitle: 'Dashboard',
    topbarSubtitle: 'Overview of your PitchPal activity',
    bodyParagraphs: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.",
    ],
  },
  'my-tracks': {
    eyebrow: 'MY TRACKS',
    title: 'Your music',
    gradient: 'library',
    subtitle: 'Browse every track you have uploaded, revisit the analysis and pick which one to pitch next.',
    topbarTitle: 'My tracks',
    topbarSubtitle: 'All the songs you have uploaded',
    bodyParagraphs: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio, integer in mauris eu nibh euismod gravida.",
      "Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Pellentesque malesuada nulla a mi.",
    ],
  },
  'my-matches': {
    eyebrow: 'MY MATCHES',
    title: 'Find the',
    gradient: 'right artists',
    subtitle: "Upload your song and PitchPal's AI analyses the audio, extracts lyrics, and surfaces the best-matched artists in seconds.",
    topbarTitle: 'Your matches',
    topbarSubtitle: 'Upload a track to find matching artists',
    bodyParagraphs: [],
  },
  'pitches-sent': {
    eyebrow: 'PITCHES SENT',
    title: 'Every pitch',
    gradient: 'you have made',
    subtitle: 'Track the artists you have reached out to and see who is engaging with your music.',
    topbarTitle: 'Pitches sent',
    topbarSubtitle: 'Track all your outgoing pitches',
    bodyParagraphs: [
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
    ],
  },
  'ai-assistant': {
    eyebrow: 'AI ASSISTANT',
    title: 'Your songwriting',
    gradient: 'co-pilot',
    subtitle: 'Ask anything about your tracks, your matches, or your strategy — the assistant is always on.',
    topbarTitle: 'AI assistant',
    topbarSubtitle: 'Your songwriting co-pilot',
    bodyParagraphs: [
      "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
      "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.",
    ],
  },
  'analytics': {
    eyebrow: 'ANALYTICS',
    title: 'Your performance,',
    gradient: 'measured',
    subtitle: 'See how your tracks perform, which pitches land, and where to focus next.',
    topbarTitle: 'Analytics',
    topbarSubtitle: 'How your tracks and pitches perform',
    bodyParagraphs: [
      "Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.",
      "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.",
    ],
  },
  'messages': {
    eyebrow: 'MESSAGES',
    title: 'Your',
    gradient: 'inbox',
    subtitle: 'Conversations with artists, publishers and your team — every reply to a pitch lands here first.',
    topbarTitle: 'Messages',
    topbarSubtitle: 'Conversations from your pitches',
    bodyParagraphs: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. When an artist or publisher replies to one of your pitches the conversation opens here so you can keep the momentum.",
      "Curabitur pretium tincidunt lacus. Threads are organised by track so you always know which song a reply is about, and you can star important conversations to keep them at the top.",
    ],
  },
  'notifications': {
    eyebrow: 'NOTIFICATIONS',
    title: "What's",
    gradient: 'new',
    subtitle: 'Match updates, replies and platform announcements — the moments worth your attention, gathered in one place.',
    topbarTitle: 'Notifications',
    topbarSubtitle: 'Recent activity across your account',
    bodyParagraphs: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. PitchPal pings you when a new match lands, when an artist views your pitch, and when something needs your attention.",
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium. You can mute categories you do not care about and keep only the signal that matters.",
    ],
  },
}

// Hamburger toggle icon — 3 lines with blue notification dot
function HamburgerIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 6L14 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 12L21 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 18L21 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="19" cy="6" r="2.5" fill="#00B8D7" />
    </svg>
  )
}

// Close X icon
function CloseIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M4 20L19.9099 4.0901" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 4L19.9099 19.9099" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default function UploadPage({ isDark, onToggleTheme }: UploadPageProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const activeItem: SidebarKey = KEY_BY_PATH[location.pathname] ?? 'my-matches'
  const goToTab = (key: SidebarKey) => navigate(PATH_BY_KEY[key])
  const tabMeta = TAB_META[activeItem]
  const [drawerOpen, setDrawerOpen] = useState(false)
  // Desktop-only topbar popover: 'messages' | 'notifications' | null
  const [openPopover, setOpenPopover] = useState<'messages' | 'notifications' | null>(null)

  // Close the desktop popover on outside-click, route change, or Escape.
  useEffect(() => {
    if (!openPopover) return
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Element | null
      if (target?.closest('[data-pp-popover]')) return
      if (target?.closest('[data-pp-popover-trigger]')) return
      setOpenPopover(null)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenPopover(null) }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [openPopover])

  useEffect(() => { setOpenPopover(null) }, [location.pathname])
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [analysingStep, setAnalysingStep] = useState(0)
  const [view, setView] = useState<'drop' | 'analysing' | 'results'>('drop')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Animate analysing steps 1-by-1 then show results
  useEffect(() => {
    if (view !== 'analysing') return
    const timers: number[] = []
    timers.push(window.setTimeout(() => setAnalysingStep(1), 900))
    timers.push(window.setTimeout(() => setAnalysingStep(2), 1900))
    timers.push(window.setTimeout(() => setAnalysingStep(3), 2900))
    timers.push(window.setTimeout(() => setAnalysingStep(4), 3900))
    timers.push(window.setTimeout(() => setView('results'), 4700))
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [view])

  const ALLOWED_EXT = ['mp3', 'wav', 'flac', 'aac', 'm4a']

  const handleFile = (file: File | null | undefined) => {
    if (!file) return
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    if (!ALLOWED_EXT.includes(ext)) return
    setUploadedFile(file)
    setAnalysingStep(0)
    setView('analysing')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => setIsDragOver(false)

  const triggerFilePicker = () => fileInputRef.current?.click()

  const icons = isDark
    ? { logo: darkLogo, avatar: darkAvatar, search: darkSearch, uploadSmall: darkUploadSmall, uploadBig: darkUploadBig, theme: darkTheme, mail: darkMail, bell: darkBell, chevron: darkChevron, check: darkCheck, house: darkHouse, music: darkMusic, target: darkTarget, mailCheck: darkMailCheck, cpu: darkCpu, chartBar: darkChartBar, waveform: darkWaveform, stepDone: darkStepDone, stepActive: darkStepActive, musicNote: darkMusicNote, resAvatar1: darkResAvatar1, resAvatar2: darkResAvatar2, resAvatar3: darkResAvatar3, resSend: darkResSend, resSparkle: darkResSparkle, resChevron: darkResChevron, resTag: darkResTag, resMusicNote: darkResMusicNote }
    : { logo: lightLogo, avatar: lightAvatar, search: lightSearch, uploadSmall: lightUploadSmall, uploadBig: lightUploadBig, theme: lightTheme, mail: lightMail, bell: lightBell, chevron: lightChevron, check: lightCheck, house: lightHouse, music: lightMusic, target: lightTarget, mailCheck: lightMailCheck, cpu: lightCpu, chartBar: lightChartBar, waveform: lightWaveform, stepDone: lightStepDone, stepActive: lightStepActive, musicNote: lightMusicNote, resAvatar1: lightResAvatar1, resAvatar2: lightResAvatar2, resAvatar3: lightResAvatar3, resSend: lightResSend, resSparkle: lightResSparkle, resChevron: lightResChevron, resTag: lightResTag, resMusicNote: lightResMusicNote }

  // Backgrounds
  const pageBg = isDark ? 'bg-[#0C0623]' : 'bg-[#F5F0FE]'
  const sidebarBg = isDark ? 'bg-[#120936] border-r border-white/[0.06]' : 'bg-white border-r border-[rgba(129,55,246,0.1)]'
  const topbarBg = isDark ? 'bg-[#120936] border-b border-white/[0.06]' : 'bg-white border-b border-[rgba(129,55,246,0.1)]'
  const panelBg = isDark
    ? 'bg-[#120936] border border-white/[0.08] shadow-[0_8px_40px_rgba(0,0,0,0.5)]'
    : 'bg-white border border-[rgba(129,55,246,0.15)] shadow-[0_8px_40px_rgba(129,55,246,0.12)]'

  // Text
  const textPrimary = isDark ? 'text-white' : 'text-pp-navy'
  const textMuted = isDark ? 'text-white/60' : 'text-pp-navy/60'

  // Sidebar item active vs inactive
  const activeBg = isDark ? 'bg-[rgba(129,55,246,0.15)]' : 'bg-[rgba(129,55,246,0.08)]'
  const itemActiveText = 'text-pp-purple'
  const itemInactiveText = isDark ? 'text-white/70' : 'text-pp-navy/70'

  // Search input
  const searchInputCls = isDark
    ? 'bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/40'
    : 'bg-white border border-[rgba(129,55,246,0.2)] text-pp-navy placeholder:text-pp-navy/40'

  // Upload dashed box
  const dashedBg = 'bg-[rgba(129,55,246,0.04)] border-2 border-dashed border-[rgba(129,55,246,0.4)]'

  // File format chip
  const chipCls = isDark
    ? 'bg-white/[0.04] border border-white/[0.08] text-white/70'
    : 'bg-white border border-[rgba(129,55,246,0.15)] text-pp-navy/70'

  // Action icon button in user panel
  const iconBtnCls = isDark
    ? 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08]'
    : 'bg-white border border-[rgba(129,55,246,0.15)] hover:bg-[rgba(129,55,246,0.04)]'

  const iconColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(38,17,74,0.7)'

  const sidebarItems: { key: SidebarKey; label: string; icon: string; badge?: string }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: icons.house },
    { key: 'my-tracks', label: 'My tracks', icon: icons.music, badge: '5' },
    { key: 'my-matches', label: 'My matches', icon: icons.target },
    { key: 'pitches-sent', label: 'Pitches sent', icon: icons.mailCheck },
  ]

  const sidebarFooterItems: { key: SidebarKey; label: string; icon: string }[] = [
    { key: 'ai-assistant', label: 'AI assistant', icon: icons.cpu },
    { key: 'analytics', label: 'Analytics', icon: icons.chartBar },
  ]

  // Bottom-nav items (mobile only — main 4)
  const bottomNavItems: { key: SidebarKey; label: string; icon: string; badge?: string }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: icons.house },
    { key: 'my-tracks', label: 'My tracks', icon: icons.music, badge: '5' },
    { key: 'my-matches', label: 'My matches', icon: icons.target },
    { key: 'pitches-sent', label: 'Pitches sent', icon: icons.mailCheck },
  ]

  // Reusable sidebar renderer.
  // Tablet (md..xl): narrow sidebar with icon stacked above a small label.
  // Desktop (xl+):    wide sidebar with icon and label side-by-side.
  const renderSidebar = () => (
    <>
      {/* Logo at top of sidebar */}
      <div className="px-3 xl:px-6 py-[18px] h-[80px] flex items-center justify-center xl:justify-start border-b border-white/[0.04]">
        <img
          src={icons.logo}
          alt="PitchPal"
          className="h-7 xl:h-9 w-[88px] xl:w-[124px] object-contain object-center xl:object-left"
        />
      </div>

      {/* Main menu */}
      <nav className="flex-1 flex flex-col gap-1 px-2 xl:px-3 py-6">
        {sidebarItems.map((item) => {
          const isActive = activeItem === item.key
          return (
            <button
              key={item.key}
              onClick={() => goToTab(item.key)}
              className={`flex flex-col xl:flex-row items-center xl:items-center gap-1 xl:gap-3 px-2 xl:px-3 py-3 xl:py-[10px] rounded-[10px] transition-colors text-[11px] xl:text-[14px] font-medium font-poppins ${
                isActive ? `${activeBg} ${itemActiveText}` : `${itemInactiveText} hover:opacity-100`
              }`}
            >
              <span className="relative inline-flex">
                <img src={item.icon} alt="" className="size-5 object-contain" />
                {item.badge && (
                  <span className="xl:hidden absolute -top-[6px] -right-[10px] bg-pp-purple text-white text-[9px] font-medium px-[5px] py-[1px] rounded-full leading-none min-w-[16px] text-center">
                    {item.badge}
                  </span>
                )}
              </span>
              <span className="xl:flex-1 xl:text-left text-center leading-tight">{item.label}</span>
              {item.badge && (
                <span className="hidden xl:inline bg-pp-purple text-white text-[11px] font-medium px-[7px] py-[2px] rounded-full leading-none min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer menu */}
      <div className="flex flex-col gap-1 px-2 xl:px-3 pb-6">
        {sidebarFooterItems.map((item) => {
          const isActive = activeItem === item.key
          return (
            <button
              key={item.key}
              onClick={() => goToTab(item.key)}
              className={`flex flex-col xl:flex-row items-center xl:items-center gap-1 xl:gap-3 px-2 xl:px-3 py-3 xl:py-[10px] rounded-[10px] transition-colors text-[11px] xl:text-[14px] font-medium font-poppins ${
                isActive ? `${activeBg} ${itemActiveText}` : `${itemInactiveText} hover:opacity-100`
              }`}
            >
              <img src={item.icon} alt="" className="size-5 object-contain" />
              <span className="xl:flex-1 xl:text-left text-center leading-tight">{item.label}</span>
            </button>
          )
        })}
      </div>
    </>
  )

  return (
    <div className={`min-h-screen font-poppins flex ${pageBg}`}>
      {/* SIDEBAR — narrow on tablet (md..xl), wide on desktop (xl+) */}
      <aside className={`hidden md:flex flex-col w-[100px] xl:w-[232px] shrink-0 ${sidebarBg}`}>
        {renderSidebar()}
      </aside>

      {/* MOBILE FULL-SCREEN MENU DRAWER (mobile only) */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50"
          style={{
            background: isDark ? 'rgba(0,0,0,0.33)' : 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(34.77px)',
            WebkitBackdropFilter: 'blur(34.77px)',
          }}
        >
          {/* Topbar inside drawer — Logo + Upload Track + X */}
          <div className={`flex items-center gap-3 px-4 h-[64px] border-b ${isDark ? 'border-white/[0.06]' : 'border-[rgba(129,55,246,0.1)]'}`}>
            <img src={icons.logo} alt="PitchPal" className="h-9 w-[124px] object-contain object-left shrink-0" />
            <div className="flex-1" />
            <button
              onClick={() => { triggerFilePicker(); setDrawerOpen(false) }}
              className="gradient-btn border border-white/[0.06] text-white font-medium font-poppins text-[13px] px-4 h-[40px] rounded-[10px] flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0"
            >
              <img src={icons.uploadSmall} alt="" className="size-[16px] object-contain" />
              <span>Upload Track</span>
            </button>
            <button
              onClick={() => setDrawerOpen(false)}
              className="size-10 flex items-center justify-center shrink-0"
              aria-label="Close menu"
            >
              <CloseIcon color={iconColor} />
            </button>
          </div>

          {/* Drawer content */}
          <div className="px-4 py-5 flex flex-col gap-5">
            {/* Search bar — 40px height */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <img src={icons.search} alt="" className="size-[18px] object-contain opacity-70" />
              </div>
              <input
                type="text"
                placeholder="Search music track by name, date, status etc."
                className={`${searchInputCls} w-full h-[40px] rounded-[10px] pl-11 pr-4 text-[14px] font-poppins outline-none focus:border-pp-purple/50 transition-colors`}
              />
            </div>

            {/* User info + 3 icons — ALL IN ONE LINE (user left, icons right) */}
            <div className={`flex items-center gap-3 pb-5 border-b ${isDark ? 'border-white/[0.06]' : 'border-[rgba(129,55,246,0.1)]'}`}>
              {/* Left: Avatar + name */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="size-11 rounded-full overflow-hidden shrink-0">
                  <img src={icons.avatar} alt="John Doe" className="size-full object-cover" />
                </div>
                <div className="flex flex-col min-w-0">
                  <p className={`text-[15px] font-semibold font-poppins leading-tight ${textPrimary}`}>John Doe</p>
                  <p className={`text-[12px] font-light italic font-poppins ${textMuted}`}>Administrator</p>
                </div>
              </div>

              {/* Right: 3 icon buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={onToggleTheme}
                  className={`${iconBtnCls} size-10 rounded-[10px] flex items-center justify-center transition-colors`}
                  aria-label="Toggle theme"
                >
                  <img src={icons.theme} alt="" className="size-[18px] object-contain" />
                </button>

                <button
                  onClick={() => { goToTab('messages'); setDrawerOpen(false) }}
                  className={`${iconBtnCls} size-10 rounded-[10px] flex items-center justify-center relative transition-colors`}
                  aria-label="Messages"
                >
                  <img src={icons.mail} alt="" className="size-[18px] object-contain" />
                  <span className="absolute top-[8px] right-[10px] size-[6px] rounded-full bg-pp-blue" />
                </button>

                <button
                  onClick={() => { goToTab('notifications'); setDrawerOpen(false) }}
                  className={`${iconBtnCls} size-10 rounded-[10px] flex items-center justify-center relative transition-colors`}
                  aria-label="Notifications"
                >
                  <img src={icons.bell} alt="" className="size-[18px] object-contain" />
                  <span className="absolute top-[8px] right-[10px] size-[6px] rounded-full bg-pp-blue" />
                </button>
              </div>
            </div>

            {/* AI assistant + Analytics buttons — font-weight 400 */}
            <div className="flex flex-col gap-3">
              {sidebarFooterItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    goToTab(item.key)
                    setDrawerOpen(false)
                  }}
                  className={`${iconBtnCls} flex items-center justify-center gap-3 px-4 h-[48px] rounded-[12px] transition-colors text-[15px] font-normal font-poppins ${itemInactiveText}`}
                >
                  <img src={item.icon} alt="" className="size-5 object-contain" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RIGHT PANEL: Topbar + Main */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* TOPBAR */}
        <header className={`h-[64px] md:h-[80px] flex items-center gap-3 md:gap-4 px-4 md:px-6 ${topbarBg}`}>
          {/* Mobile only: Logo */}
          <div className="md:hidden h-9 w-[124px] relative shrink-0">
            <img src={icons.logo} alt="PitchPal" className="absolute inset-0 w-full h-full object-contain object-left" />
          </div>

          {/* Desktop only: Title block */}
          <div className="hidden xl:flex flex-col min-w-[200px]">
            <p className={`text-[16px] font-semibold font-poppins leading-tight ${textPrimary}`}>{tabMeta.topbarTitle}</p>
            <p className={`text-[12px] font-light font-poppins ${textMuted}`}>{tabMeta.topbarSubtitle}</p>
          </div>

          {/* Search — from tablet up */}
          <div className="hidden md:block flex-1 max-w-[600px] relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <img src={icons.search} alt="" className="size-[18px] object-contain opacity-70" />
            </div>
            <input
              type="text"
              placeholder="Search music track by name, date, status etc."
              className={`${searchInputCls} w-full h-[44px] rounded-[10px] pl-11 pr-4 text-[14px] font-poppins outline-none focus:border-pp-purple/50 transition-colors`}
            />
          </div>

          {/* Spacer on mobile */}
          <div className="md:hidden flex-1" />

          {/* Upload button — opens file picker */}
          <button
            onClick={triggerFilePicker}
            className="gradient-btn border border-white/[0.06] text-white font-medium font-poppins text-[13px] md:text-[14px] px-4 md:px-5 h-[40px] md:h-[44px] rounded-[10px] flex items-center gap-2 hover:-translate-y-[1px] hover:shadow-[0_10px_24px_rgba(129,55,246,0.45)] active:translate-y-0 transition-all duration-200 ease-out shrink-0"
          >
            <img src={icons.uploadSmall} alt="" className="size-[16px] md:size-[18px] object-contain" />
            <span>Upload Track</span>
          </button>

          {/* Desktop only: Theme/Mail/Bell/User inline */}
          <div className="hidden xl:flex items-center gap-3">
            <button
              onClick={onToggleTheme}
              className="size-9 rounded-[8px] flex items-center justify-center hover:opacity-80 transition-opacity"
              aria-label="Toggle theme"
            >
              <img src={icons.theme} alt="" className="size-[20px] object-contain" />
            </button>

            <div className="relative">
              <button
                data-pp-popover-trigger="messages"
                onClick={() => setOpenPopover(openPopover === 'messages' ? null : 'messages')}
                className={`size-9 rounded-[8px] flex items-center justify-center relative hover:opacity-80 transition-opacity cursor-pointer ${openPopover === 'messages' ? (isDark ? 'bg-white/[0.06]' : 'bg-[rgba(129,55,246,0.08)]') : ''}`}
                aria-label="Messages"
                aria-expanded={openPopover === 'messages'}
              >
                <img src={icons.mail} alt="" className="size-[20px] object-contain" />
                <span className="absolute top-[8px] right-[10px] size-[6px] rounded-full bg-pp-blue" />
              </button>
              {openPopover === 'messages' && (
                <MessagesPopover
                  isDark={isDark}
                  textPrimary={textPrimary}
                  textMuted={textMuted}
                  avatar1={icons.resAvatar1 ?? icons.avatar}
                  avatar2={icons.resAvatar2 ?? icons.avatar}
                  avatar3={icons.resAvatar3 ?? icons.avatar}
                  onViewAll={() => { setOpenPopover(null); goToTab('messages') }}
                />
              )}
            </div>

            <div className="relative">
              <button
                data-pp-popover-trigger="notifications"
                onClick={() => setOpenPopover(openPopover === 'notifications' ? null : 'notifications')}
                className={`size-9 rounded-[8px] flex items-center justify-center relative hover:opacity-80 transition-opacity cursor-pointer ${openPopover === 'notifications' ? (isDark ? 'bg-white/[0.06]' : 'bg-[rgba(129,55,246,0.08)]') : ''}`}
                aria-label="Notifications"
                aria-expanded={openPopover === 'notifications'}
              >
                <img src={icons.bell} alt="" className="size-[20px] object-contain" />
                <span className="absolute top-[8px] right-[10px] size-[6px] rounded-full bg-pp-blue" />
              </button>
              {openPopover === 'notifications' && (
                <NotificationsPopover
                  isDark={isDark}
                  textPrimary={textPrimary}
                  textMuted={textMuted}
                  avatar1={icons.resAvatar1 ?? icons.avatar}
                  avatar2={icons.resAvatar2 ?? icons.avatar}
                  avatar3={icons.resAvatar3 ?? icons.avatar}
                  onViewAll={() => { setOpenPopover(null); goToTab('notifications') }}
                />
              )}
            </div>

            <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="size-11 rounded-full overflow-hidden shrink-0">
                <img src={icons.avatar} alt="John Doe" className="size-full object-cover" />
              </div>
              <div className="flex flex-col text-left">
                <p className={`text-[14px] font-semibold font-poppins leading-tight ${textPrimary}`}>John Doe</p>
                <p className={`text-[12px] font-light italic font-poppins ${textMuted}`}>Administrator</p>
              </div>
              <img src={icons.chevron} alt="" className="size-3 object-contain ml-1" />
            </button>
          </div>

          {/* Mobile + Tablet: Hamburger / Close toggle */}
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="xl:hidden size-10 flex items-center justify-center shrink-0"
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
          >
            {drawerOpen ? <CloseIcon color={iconColor} /> : <HamburgerIcon color={iconColor} />}
          </button>
        </header>

        {/* TABLET USER PANEL — full-height column from top-right (below topbar) */}
        {drawerOpen && (
          <div
            className="hidden md:block xl:hidden fixed top-[80px] right-0 bottom-0 z-40 w-[238px]"
            style={{
              borderLeft: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(38,17,74,0.08)',
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(22px)',
              WebkitBackdropFilter: 'blur(22px)',
            }}
          >
            <div className="p-5">
              {/* User info */}
              <div className="flex items-center gap-3 mb-5">
                <div className="size-11 rounded-full overflow-hidden shrink-0">
                  <img src={icons.avatar} alt="John Doe" className="size-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <p className={`text-[15px] font-semibold font-poppins leading-tight ${textPrimary}`}>John Doe</p>
                  <p className={`text-[12px] font-light italic font-poppins ${textMuted}`}>Administrator</p>
                </div>
              </div>

              {/* 3 action icon buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={onToggleTheme}
                  className={`${iconBtnCls} size-11 rounded-[10px] flex items-center justify-center transition-colors`}
                  aria-label="Toggle theme"
                >
                  <img src={icons.theme} alt="" className="size-[20px] object-contain" />
                </button>

                <button
                  onClick={() => { goToTab('messages'); setDrawerOpen(false) }}
                  className={`${iconBtnCls} size-11 rounded-[10px] flex items-center justify-center relative transition-colors cursor-pointer`}
                  aria-label="Messages"
                >
                  <img src={icons.mail} alt="" className="size-[20px] object-contain" />
                  <span className="absolute top-[10px] right-[12px] size-[6px] rounded-full bg-pp-blue" />
                </button>

                <button
                  onClick={() => { goToTab('notifications'); setDrawerOpen(false) }}
                  className={`${iconBtnCls} size-11 rounded-[10px] flex items-center justify-center relative transition-colors cursor-pointer`}
                  aria-label="Notifications"
                >
                  <img src={icons.bell} alt="" className="size-[20px] object-contain" />
                  <span className="absolute top-[10px] right-[12px] size-[6px] rounded-full bg-pp-blue" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hidden file input — triggered by Upload Track buttons and click-to-browse */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp3,.wav,.flac,.aac,.m4a,audio/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {/* MAIN CONTENT — analysing view top-aligned on mobile, centered on tablet/desktop; results view top-aligned */}
        <main className={`flex-1 flex justify-center px-4 md:px-8 xl:px-6 py-8 md:py-12 xl:py-${view === 'results' ? '8' : '0'} pb-[100px] md:pb-12 xl:pb-${view === 'results' ? '12' : '0'} ${view === 'analysing' ? 'items-start md:items-center' : view === 'results' ? 'items-start' : 'items-center'} overflow-y-auto`}>
          {activeItem !== 'my-matches' ? (
            /* ── DEMO TAB ── Other sidebar items render a centered placeholder.
               Top-aligned on mobile/tablet, vertically centered on desktop. */
            <div key={activeItem} className="card-swap-in w-full xl:w-[860px] max-w-[860px] flex flex-col items-center text-center gap-[14px] md:gap-[16px] self-start xl:self-center xl:my-auto">
              <p className="text-pp-purple text-[13px] font-medium tracking-[0.26px] uppercase font-poppins">
                {tabMeta.eyebrow}
              </p>
              <h1 className={`text-[32px] md:text-[32px] xl:text-[42px] font-semibold leading-[1.2] xl:leading-[1.25] font-poppins ${textPrimary}`}>
                {tabMeta.title} <span className="gradient-text">{tabMeta.gradient}</span>
              </h1>
              <p className={`text-[14px] md:text-[14px] xl:text-[16px] font-normal leading-[1.6] tracking-[0.16px] font-poppins max-w-[700px] ${textMuted}`}>
                {tabMeta.subtitle}
              </p>
              {tabMeta.bodyParagraphs.length > 0 && (
                <div className="mt-4 md:mt-6 flex flex-col gap-4 md:gap-5 max-w-[760px]">
                  {tabMeta.bodyParagraphs.map((p, i) => (
                    <p
                      key={i}
                      className={`text-[13px] md:text-[14px] xl:text-[15px] font-normal leading-[1.7] tracking-[0.14px] font-poppins ${textMuted}`}
                    >
                      {p}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ) : view === 'drop' ? (
            /* ── DROP VIEW ── */
            <div key="drop" className="card-swap-in w-full xl:w-[860px] max-w-[860px] flex flex-col items-stretch gap-[40px] md:gap-[48px] xl:gap-[56px]">
              {/* Header section */}
              <div className="flex flex-col items-center text-center gap-[14px] md:gap-[16px]">
                <p className="text-pp-purple text-[13px] font-medium tracking-[0.26px] uppercase font-poppins">
                  My Matches
                </p>
                <h1 className={`text-[32px] md:text-[32px] xl:text-[42px] font-semibold leading-[1.2] xl:leading-[1.25] font-poppins ${textPrimary}`}>
                  Find the <span className="gradient-text">right artists</span> for your track
                </h1>
                <p className={`text-[14px] md:text-[14px] xl:text-[16px] font-normal leading-[1.6] tracking-[0.16px] font-poppins max-w-[700px] ${textMuted}`}>
                  Upload your song and PitchPal's AI analyses the audio, extracts lyrics, and surfaces the best-matched artists in seconds.
                </p>
              </div>

              {/* Upload dashed box — drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={triggerFilePicker}
                className={`group w-full ${dashedBg} rounded-[20px] py-[40px] md:py-[50px] xl:py-[50px] flex flex-col items-center text-center px-4 md:px-6 cursor-pointer transition-all duration-300 ease-out hover:bg-[rgba(129,55,246,0.07)] hover:border-[rgba(129,55,246,0.75)] hover:shadow-[0_8px_40px_rgba(129,55,246,0.18)] hover:-translate-y-[2px] ${isDragOver ? 'bg-[rgba(129,55,246,0.10)] border-[rgba(129,55,246,0.75)] shadow-[0_8px_40px_rgba(129,55,246,0.28)]' : ''}`}
              >
                <div className="size-[50px] mb-[20px] md:mb-[24px] transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-[3px]">
                  <img src={icons.uploadBig} alt="" className="w-full h-full object-contain" />
                </div>
                <p className={`text-[16px] md:text-[18px] xl:text-[18px] font-medium font-poppins ${textPrimary}`}>
                  <span className="xl:hidden">
                    <span className="text-pp-blue underline underline-offset-2">Click to browse</span> and upload your track here
                  </span>
                  <span className="hidden xl:inline">
                    Drop your track here or <span className="text-pp-blue underline underline-offset-2">click to browse</span>
                  </span>
                </p>
                <p className={`mt-[10px] text-[13px] md:text-[14px] xl:text-[14px] font-light leading-[1.5] font-poppins ${textMuted} max-w-[480px]`}>
                  PitchPal reads your audio and extracts lyrics automatically – no manual input needed.
                </p>

                {/* File format chips */}
                <div className="mt-[24px] flex flex-wrap items-center justify-center gap-[10px]">
                  {['MP3', 'WAV', 'FLAC', 'AAC', 'M4A'].map((fmt) => (
                    <span
                      key={fmt}
                      className={`${chipCls} px-[16px] py-[6px] rounded-full text-[12px] font-medium tracking-[0.5px] font-poppins`}
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>

              {/* Feature checks */}
              <div className="grid grid-cols-2 md:flex md:items-center md:justify-center gap-x-[40px] gap-y-4 md:gap-[40px] xl:gap-[60px]">
                {['Auto lyrics extraction', '100k+ artist database', 'Results in seconds'].map((feat, i) => (
                  <Fragment key={feat}>
                    {i > 0 && <span className={`hidden md:block w-px h-4 ${isDark ? 'bg-white/15' : 'bg-pp-purple/15'}`} />}
                    <div className="flex items-center gap-[10px]">
                      <img src={icons.check} alt="" className="size-[18px] object-contain shrink-0" />
                      <span className={`text-[13px] md:text-[14px] font-normal tracking-[0.14px] whitespace-nowrap font-poppins ${textMuted}`}>{feat}</span>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
          ) : view === 'analysing' ? (
            /* ── ANALYSING VIEW ── */
            <div key="analysing" className="card-swap-in w-full xl:w-[860px] max-w-[860px] flex flex-col items-center gap-[40px] md:gap-[48px] xl:gap-[50px]">
              {/* Live equalizer — pulses while steps are still running. */}
              <EqualizerBars active={analysingStep < 4} />

              {/* File card */}
              <div
                className={`flex items-center gap-3 ${isDark ? 'bg-white/[0.04] border border-white/[0.08]' : 'bg-white border border-[rgba(129,55,246,0.15)]'} rounded-[16px] px-4 py-3 min-w-[280px]`}
              >
                <div className="size-[48px] rounded-[12px] bg-gradient-to-r from-pp-purple to-pp-purple-deep flex items-center justify-center shrink-0">
                  <img src={icons.musicNote} alt="" className="size-[28px] object-contain" />
                </div>
                <div className="flex flex-col">
                  <p className={`text-[15px] font-medium font-poppins leading-tight ${textPrimary}`}>{uploadedFile.name}</p>
                  <p className={`text-[13px] font-light font-poppins ${textMuted}`}>Analysing track…</p>
                </div>
              </div>

              {/* Progress steps — animated based on analysingStep */}
              <div className="flex flex-col gap-5 items-start">
                {[
                  'Reading audio file',
                  'Extracting lyrics & musical features',
                  'Matching against artist database',
                  'Generating AI insights',
                ].map((label, idx) => {
                  const state = idx < analysingStep ? 'done' as const : idx === analysingStep ? 'active' as const : 'pending' as const
                  let stepIcon: React.ReactNode
                  let textCls = textMuted
                  if (state === 'done') {
                    stepIcon = (
                      <span key="done" className="pp-step-done inline-block">
                        <img src={icons.stepDone} alt="" className="size-6 object-contain" />
                      </span>
                    )
                    textCls = 'text-[#00BB7B]'
                  } else if (state === 'active') {
                    stepIcon = (
                      <span key="active" className="pp-step-active inline-block">
                        <img src={icons.stepActive} alt="" className="size-6 object-contain" />
                      </span>
                    )
                    textCls = 'text-pp-purple'
                  } else {
                    stepIcon = (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="11.25" stroke={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(38,17,74,0.25)'} strokeWidth="1.5" />
                      </svg>
                    )
                  }
                  return (
                    <div
                      key={label}
                      className="pp-step-row flex items-center gap-3 transition-colors duration-300"
                      style={{ animationDelay: `${idx * 90}ms` }}
                    >
                      {stepIcon}
                      <span className={`text-[15px] xl:text-[16px] font-normal font-poppins transition-colors duration-300 ${textCls}`}>{label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* ── RESULTS VIEW ── */
            <div key="results" className="card-swap-in w-full">
              <ResultsView isDark={isDark} icons={icons} uploadedFile={uploadedFile} textPrimary={textPrimary} textMuted={textMuted} />
            </div>
          )}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION (mobile only) */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-30 ${topbarBg} border-t ${isDark ? 'border-white/[0.06]' : 'border-[rgba(129,55,246,0.1)]'} px-2 py-2 flex items-center justify-around`}>
        {bottomNavItems.map((item) => {
          const isActive = activeItem === item.key
          return (
            <button
              key={item.key}
              onClick={() => goToTab(item.key)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-[10px] min-w-[64px] relative ${
                isActive ? activeBg : ''
              }`}
            >
              <div className="relative">
                <img src={item.icon} alt="" className="size-5 object-contain" />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 bg-pp-blue text-white text-[10px] font-medium px-[5px] py-[1px] rounded-full leading-tight min-w-[18px] text-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] font-medium font-poppins ${isActive ? itemActiveText : itemInactiveText}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

/* ============================================================
   RESULTS VIEW COMPONENT
   ============================================================ */

interface ResultsViewProps {
  isDark: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icons: any
  uploadedFile: File | null
  textPrimary: string
  textMuted: string
}

interface MatchData {
  id: string
  name: string
  genre: string
  location: string
  match: number
  avatar: string
  topMatch?: boolean
  insight: string
  tags: string[]
  listeners: string
  albums: number
  ringColor: 'cyan' | 'purple'
}

function CircularProgress({ value, color, isDark }: { value: number; color: 'cyan' | 'purple'; isDark: boolean }) {
  const radius = 22
  const circumference = 2 * Math.PI * radius
  const stroke = color === 'cyan' ? '#00B8D7' : '#8137F6'
  const bgStroke = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(129,55,246,0.12)'

  // Animate the ring + number from 0 to `value` when the component mounts.
  const [animated, setAnimated] = useState(0)
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setAnimated(value)
      return
    }
    const duration = 1400
    const start = performance.now()
    let timer: ReturnType<typeof setTimeout> | null = null
    let cancelled = false
    const tick = () => {
      if (cancelled) return
      const progress = Math.min((performance.now() - start) / duration, 1)
      // easeOutCubic — fast take-off, smooth settle
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimated(value * eased)
      if (progress < 1) timer = setTimeout(tick, 16)
    }
    timer = setTimeout(tick, 16)
    return () => { cancelled = true; if (timer) clearTimeout(timer) }
  }, [value])

  const offset = circumference * (1 - animated / 100)

  return (
    <div className="relative size-[52px] shrink-0">
      <svg width="52" height="52" viewBox="0 0 52 52" className="-rotate-90">
        <circle cx="26" cy="26" r={radius} stroke={bgStroke} strokeWidth="3" fill="none" />
        <circle
          cx="26"
          cy="26"
          r={radius}
          stroke={stroke}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {/* % text — Manrope 13px, white in both themes per spec */}
      <span className={`absolute inset-0 flex items-center justify-center text-[13px] font-semibold font-manrope tabular-nums ${isDark ? 'text-white' : 'text-pp-navy'}`}>
        {Math.round(animated)}%
      </span>
    </div>
  )
}

function ResultsView({ isDark, icons, uploadedFile, textPrimary, textMuted }: ResultsViewProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | '90plus' | 'indie' | 'electronic' | 'rnb'>('all')

  // Sort dropdown — local state + outside-click close.
  const sortOptions = [
    { key: 'compat', label: 'Highest compatibility' },
    { key: 'mostListeners', label: 'Most monthly listeners' },
    { key: 'leastListeners', label: 'Lowest monthly listeners' },
    { key: 'newest', label: 'Newest artists' },
    { key: 'mostActive', label: 'Most active artists' },
  ]
  const [sortOpen, setSortOpen] = useState(false)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const sortLabel = sortOptions.find((o) => o.key === sortKey)?.label ?? 'Best match'
  const sortRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!sortOpen) return
    const onDown = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSortOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [sortOpen])

  // Track summary bar — exact CSS from spec
  const summaryStyle: React.CSSProperties = {
    borderRadius: '18px',
    border: '1px solid #8137F6',
    background: 'linear-gradient(90deg, rgba(129, 55, 246, 0.04) 0%, rgba(100, 26, 190, 0.04) 100%)',
    boxShadow: '0 0 24px 0 rgba(85, 16, 203, 0.30)',
    backdropFilter: 'blur(27px)',
    WebkitBackdropFilter: 'blur(27px)',
  }

  const cardBg = isDark
    ? 'bg-white/[0.03] border border-white/[0.06]'
    : 'bg-white border border-[rgba(129,55,246,0.12)]'

  const insightBg = isDark
    ? 'bg-[rgba(129,55,246,0.06)] border-l-2 border-pp-purple'
    : 'bg-[rgba(129,55,246,0.05)] border-l-2 border-pp-purple'

  const pillBaseCls = isDark
    ? 'bg-white/[0.04] border border-white/[0.08] text-white/70'
    : 'bg-white border border-[rgba(129,55,246,0.15)] text-pp-navy/70'

  const cyanPillCls = isDark
    ? 'bg-[rgba(0,184,215,0.10)] border border-[rgba(0,184,215,0.40)] text-pp-blue'
    : 'bg-[rgba(0,184,215,0.08)] border border-[rgba(0,184,215,0.40)] text-pp-blue'

  const matchesBoxCls = isDark
    ? 'bg-[rgba(129,55,246,0.10)] border border-[rgba(129,55,246,0.30)]'
    : 'bg-[rgba(129,55,246,0.08)] border border-[rgba(129,55,246,0.20)]'

  const filterTabBaseCls = isDark
    ? 'bg-white/[0.03] border border-white/[0.08] text-white/60 hover:text-white/80'
    : 'bg-white border border-[rgba(129,55,246,0.15)] text-pp-navy/60 hover:text-pp-navy/80'

  const filterTabActiveCls = isDark
    ? 'bg-transparent border border-pp-purple text-pp-purple'
    : 'bg-[rgba(129,55,246,0.06)] border border-pp-purple text-pp-purple'

  const sortDropdownCls = isDark
    ? 'bg-white/[0.03] border border-white/[0.08] text-white/80'
    : 'bg-white border border-[rgba(129,55,246,0.15)] text-pp-navy/80'

  const tagBtnCls = isDark
    ? 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08]'
    : 'bg-white border border-[rgba(129,55,246,0.15)] hover:bg-[rgba(129,55,246,0.04)]'

  const viewProfileBtnCls = isDark
    ? 'bg-white/[0.04] border border-white/[0.10] text-white/80 hover:bg-white/[0.08]'
    : 'bg-white border border-[rgba(129,55,246,0.20)] text-pp-navy hover:bg-[rgba(129,55,246,0.04)]'

  const matches: MatchData[] = [
    {
      id: 'jamie',
      name: 'Jamie Cole',
      genre: 'Indie Pop',
      location: 'London, UK',
      match: 94,
      avatar: icons.resAvatar1,
      topMatch: true,
      insight: "Strong lyrical and sonic alignment - melancholic tone and cinematic production style closely mirrors Jamie's recent catalogue.",
      tags: ['Indie pop', 'Melancholic', 'Cinematic'],
      listeners: '2.4M',
      albums: 4,
      ringColor: 'cyan',
    },
    {
      id: 'liam',
      name: 'Liam A',
      genre: 'Ambient',
      location: 'Berlin, DE',
      match: 92,
      avatar: icons.resAvatar2,
      insight: 'Ethereal textures and abstract sounds create immersive auditory experiences that captivate the mind.',
      tags: ['Experimental', 'Soundscape', 'Ambient'],
      listeners: '1.6M',
      albums: 2,
      ringColor: 'purple',
    },
    {
      id: 'tina',
      name: 'Tina V',
      genre: 'Dance',
      location: 'New York, NY',
      match: 90,
      avatar: icons.resAvatar3,
      insight: 'Upbeat grooves and vibrant instrumentals create an infectious energy perfect for parties.',
      tags: ['Rhythmic', 'Dancefloor', 'Funky'],
      listeners: '3.2M',
      albums: 5,
      ringColor: 'purple',
    },
  ]

  const filters = [
    { key: 'all' as const, label: 'All (12)' },
    { key: '90plus' as const, label: '90% + matched' },
    { key: 'indie' as const, label: 'Indie' },
    { key: 'electronic' as const, label: 'Electronic' },
    { key: 'rnb' as const, label: 'R&B' },
  ]

  return (
    <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-6 xl:gap-7">
      {/* Track summary card — exact CSS per spec.
          Tablet (md..xl):
            Row 1: [icon] [filename + meta]
            Row 2: [tags  |  Key + BPM]
            Row 3: [Matches found — full width]
          Desktop (xl+): single flex-row with original order (the inner
          `xl:contents` wrappers disappear from layout). */}
      <div style={summaryStyle} className="p-4 md:p-5 xl:p-[18px] flex flex-col xl:flex-row xl:items-center gap-5 xl:gap-6">
        {/* Group A: icon + track info */}
        <div className="flex items-center gap-4 xl:contents">
          {/* Music icon */}
          <div className="size-[56px] md:size-[68px] xl:size-[80px] rounded-[12px] bg-gradient-to-r from-pp-purple to-pp-purple-deep flex items-center justify-center shrink-0">
            <img src={icons.resMusicNote} alt="" className="size-[28px] md:size-[36px] xl:size-[44px] object-contain" />
          </div>

          {/* Track info — Manrope font */}
          <div className="flex-1 min-w-0">
            <p className={`text-[18px] md:text-[20px] font-semibold font-manrope leading-tight truncate ${textPrimary}`}>
              {uploadedFile?.name ?? 'Fray b1.mp3'}
            </p>
            <p className={`mt-1 text-[12px] font-normal font-poppins ${textMuted}`}>
              3:42 <span className="mx-1">•</span> MP3 <span className="mx-1">•</span> Analysed today <span className="mx-1">•</span> Lyrics extracted
            </p>
          </div>
        </div>

        {/* Group B: tags + divider + Key/BPM */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 xl:contents">
          {/* Tag chips */}
          <div className="flex flex-wrap items-center gap-2 xl:gap-3">
            {['Indie pop', 'Melancholic', 'Cinematic'].map((t) => (
              <span key={t} className={`${pillBaseCls} px-3 py-[6px] rounded-full text-[11px] font-normal tracking-[0.13px] font-poppins whitespace-nowrap`}>
                {t}
              </span>
            ))}
          </div>

          {/* Divider — visible on tablet between tags and Key/BPM, and on desktop in the row */}
          <div className={`hidden md:block w-px h-6 xl:h-10 ${isDark ? 'bg-white/10' : 'bg-pp-purple/15'}`} />

          {/* Key + BPM */}
          <div className="flex items-center gap-2 xl:gap-3">
            <span className={`${cyanPillCls} px-3 py-[6px] rounded-full text-[11px] font-medium tracking-[0.13px] font-poppins whitespace-nowrap`}>
              Key: D Minor
            </span>
            <span className={`${cyanPillCls} px-3 py-[6px] rounded-full text-[11px] font-medium tracking-[0.13px] font-poppins whitespace-nowrap`}>
              94 BPM
            </span>
          </div>
        </div>

        {/* Matches found box — full-width on tablet, fixed-width on desktop */}
        <div className={`${matchesBoxCls} rounded-[14px] px-6 py-3 flex flex-col items-center justify-center w-full xl:w-auto xl:min-w-[110px] shrink-0`}>
          <span className={`text-[28px] xl:text-[32px] font-semibold font-poppins leading-none ${isDark ? 'text-white' : 'text-pp-navy'}`}>12</span>
          <span className={`mt-1 text-[12px] font-normal tracking-[1px] uppercase font-poppins ${isDark ? 'text-white/60' : 'text-pp-purple-deep/70'}`}>
            Matches Found
          </span>
        </div>
      </div>

      {/* Filter / sort bar.
          Mobile: sort dropdown on top (full-width), filter pills below.
          Tablet+: filter pills inline, sort dropdown at the end. */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <h2 className={`text-[18px] font-semibold font-manrope ${textPrimary}`}>
          Matched results (12)
        </h2>
        <div className="flex flex-col-reverse md:flex-row md:flex-wrap md:items-center gap-3">
          {/* Filter pills group */}
          <div className="flex flex-wrap items-center gap-3">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`px-4 py-[8px] rounded-full text-[12px] font-medium font-poppins transition-colors whitespace-nowrap ${
                  activeFilter === f.key ? filterTabActiveCls : filterTabBaseCls
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {/* Divider before sort — desktop only */}
          <span className={`hidden xl:block w-px h-6 ${isDark ? 'bg-white/15' : 'bg-pp-purple/15'} mx-1`} />
          {/* Sort dropdown — full-width on mobile, fixed on tablet+ */}
          <div ref={sortRef} className="relative w-full md:w-[230px]">
            <button
              type="button"
              onClick={() => setSortOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={sortOpen}
              className={`w-full flex items-center justify-between gap-2 px-4 py-[10px] text-[12px] font-normal font-poppins whitespace-nowrap cursor-pointer transition-[border-radius] border ${
                isDark
                  ? 'bg-[#160B33] border-white/[0.10] text-white/85'
                  : 'bg-white border-[rgba(129,55,246,0.15)] text-pp-navy/85'
              } ${
                sortOpen ? 'rounded-t-[10px] rounded-b-none' : 'rounded-[10px]'
              }`}
            >
              <span>Sort by: {sortLabel}</span>
              <img
                src={icons.resChevron}
                alt=""
                className={`size-[14px] object-contain transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {sortOpen && (
              <ul
                role="listbox"
                className={`absolute top-full left-0 w-full -mt-px overflow-hidden z-40 card-swap-in rounded-b-[10px] border border-t-0 ${
                  isDark
                    ? 'bg-[#160B33] border-white/[0.10] shadow-[0_18px_50px_rgba(0,0,0,0.45)]'
                    : 'bg-white border-[rgba(129,55,246,0.15)] shadow-[0_18px_50px_rgba(60,30,140,0.16)]'
                }`}
              >
                {sortOptions.map((opt, i) => {
                  const isSelected = sortKey === opt.key
                  return (
                    <li
                      key={opt.key}
                      className={i > 0 ? (isDark ? 'border-t border-white/[0.06]' : 'border-t border-[rgba(129,55,246,0.08)]') : ''}
                    >
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => { setSortKey(opt.key); setSortOpen(false) }}
                        className={`w-full text-left px-4 py-[10px] text-[12px] font-normal font-poppins transition-colors ${
                          isDark
                            ? `${isSelected ? 'text-pp-purple bg-white/[0.04]' : 'text-white/85'} hover:bg-white/[0.06]`
                            : `${isSelected ? 'text-pp-purple bg-[rgba(129,55,246,0.05)]' : 'text-pp-navy/85'} hover:bg-[rgba(129,55,246,0.04)]`
                        }`}
                      >
                        {opt.label}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Match cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-5">
        {matches.map((m, idx) => (
          <div
            key={m.id}
            style={{ animationDelay: `${idx * 110}ms` }}
            className={`pp-card-rise group relative ${cardBg} rounded-[16px] xl:rounded-[18px] p-5 xl:p-6 flex flex-col gap-4 h-full transition-all duration-300 ease-out hover:-translate-y-[3px] ${
              isDark
                ? 'hover:shadow-[0_18px_50px_rgba(129,55,246,0.22)] hover:border-white/[0.10]'
                : 'hover:shadow-[0_18px_50px_rgba(129,55,246,0.16)] hover:border-[rgba(129,55,246,0.25)]'
            }`}
          >
            {/* Top match badge — floating at top center, gently pulsing */}
            {m.topMatch && (
              <span className="pp-badge-pulse absolute -top-[12px] left-1/2 -translate-x-1/2 bg-pp-purple text-white text-[11px] font-medium px-3 py-[4px] rounded-full whitespace-nowrap font-poppins flex items-center gap-1 z-10 shadow-[0_4px_20px_rgba(129,55,246,0.5)]">
                <span>🌟</span><span>Top match</span>
              </span>
            )}

            {/* Header row — avatar + name on left, ring on right */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="size-[44px] rounded-full overflow-hidden shrink-0">
                  <img src={m.avatar} alt={m.name} className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-110" />
                </div>
                <div className="flex flex-col">
                  <p className={`text-[16px] font-semibold font-poppins leading-tight ${textPrimary}`}>{m.name}</p>
                  <p className={`text-[12px] font-normal font-poppins ${textMuted}`}>
                    {m.genre} <span className="mx-1">•</span> {m.location}
                  </p>
                </div>
              </div>
              <CircularProgress value={m.match} color={m.ringColor} isDark={isDark} />
            </div>

            {/* AI Insight */}
            <div className={`${insightBg} rounded-[12px] px-4 py-3`}>
              <div className="flex items-center gap-1 mb-2">
                <span className="text-[14px]">✨</span>
                <p className="text-pp-purple text-[12px] font-medium font-poppins">AI Insight</p>
              </div>
              <p className={`text-[12px] font-light leading-[1.5] font-poppins ${textMuted}`}>{m.insight}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2">
              {m.tags.map((t) => (
                <span key={t} className={`${pillBaseCls} px-3 py-[5px] rounded-full text-[11px] font-normal tracking-[0.11px] font-poppins`}>
                  {t}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-[6px]">
                <p className={`text-[11px] font-normal font-poppins ${textMuted}`}>Monthly listeners</p>
                <p className={`text-[15px] font-semibold font-poppins ${textPrimary}`}>{m.listeners}</p>
              </div>
              <div className="flex flex-col gap-[6px]">
                <p className={`text-[11px] font-normal font-poppins ${textMuted}`}>Albums</p>
                <p className={`text-[15px] font-semibold font-poppins ${textPrimary}`}>{m.albums}</p>
              </div>
              <div className="flex flex-col gap-[6px]">
                <p className={`text-[11px] font-normal font-poppins ${textMuted}`}>Status</p>
                <span className="self-start bg-[rgba(0,187,123,0.10)] border border-[#00BB7B] text-[#00BB7B] px-2 py-[2px] rounded-full text-[11px] font-medium font-poppins">
                  Active
                </span>
              </div>
            </div>

            {/* Actions — pushed to the bottom of the card via mt-auto so every
                card lines up at the same baseline regardless of insight length. */}
            <div className="flex items-center gap-2 mt-auto pt-1">
              <button className="gradient-btn border border-white/[0.06] flex-1 text-white font-medium font-poppins text-[13px] h-[40px] rounded-[10px] flex items-center justify-center gap-2 hover:-translate-y-[1px] hover:shadow-[0_10px_24px_rgba(129,55,246,0.45)] active:translate-y-0 transition-all duration-200 ease-out">
                <img src={icons.resSend} alt="" className="size-4 object-contain" />
                <span>Pitch to {m.name.split(' ')[0]}</span>
              </button>
              <button className={`${viewProfileBtnCls} text-[13px] font-medium font-poppins h-[40px] px-4 rounded-[10px] hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200 ease-out flex items-center justify-center`}>
                View profile
              </button>
              <button
                className={`${tagBtnCls} size-[40px] rounded-[10px] flex items-center justify-center hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200 ease-out shrink-0`}
                aria-label="Tag"
              >
                <img src={icons.resTag} alt="" className="size-[18px] object-contain" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Desktop topbar popovers
//
// These mimic real-world Messages / Notifications dropdowns: a small header,
// a list of demo entries with unread indicators, and a "View all" footer link
// that navigates to the corresponding full-page route.
// ─────────────────────────────────────────────────────────────────────────────

interface PopoverBaseProps {
  isDark: boolean
  textPrimary: string
  textMuted: string
  onViewAll: () => void
}

// Equalizer used in the Analysing view — pulses while the track is "playing"
// (i.e. before all 4 progress steps complete), then settles to a flat line.
function EqualizerBars({ active }: { active: boolean }) {
  const BAR_COUNT = 13
  // Wave-like delay pattern so the bars rise and fall in sequence rather than
  // in lockstep — gives a real audio-meter feel.
  const delays = [0, 90, 170, 250, 340, 430, 510, 430, 340, 250, 170, 90, 0]
  return (
    <div className="w-[200px] h-[56px] flex items-end justify-center gap-[5px]" aria-hidden>
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <span
          key={i}
          className={active ? 'pp-eq-bar' : ''}
          style={{
            display: 'inline-block',
            width: '6px',
            height: '100%',
            borderRadius: '3px',
            background: 'linear-gradient(180deg, #9D6FFA 0%, #5D93EA 60%, #00B4D9 100%)',
            animationDelay: active ? `${delays[i] ?? 0}ms` : undefined,
            transform: active ? undefined : 'scaleY(0.25)',
            transition: 'transform 400ms ease-out',
          }}
        />
      ))}
    </div>
  )
}

function PopoverShell({
  isDark,
  title,
  unreadCount,
  children,
  onViewAll,
  viewAllLabel,
}: {
  isDark: boolean
  title: string
  unreadCount: number
  children: React.ReactNode
  onViewAll: () => void
  viewAllLabel: string
}) {
  const shellCls = isDark
    ? 'bg-[#160B33] border border-white/[0.08] shadow-[0_18px_50px_rgba(0,0,0,0.5)]'
    : 'bg-white border border-[rgba(129,55,246,0.15)] shadow-[0_18px_50px_rgba(60,30,140,0.18)]'
  const headerBorder = isDark ? 'border-white/[0.06]' : 'border-[rgba(129,55,246,0.10)]'
  const titleCls = isDark ? 'text-white' : 'text-pp-navy'
  const subtleCls = isDark ? 'text-white/55' : 'text-pp-navy/55'

  return (
    <div
      data-pp-popover
      className={`absolute top-full right-0 mt-2 w-[360px] rounded-[16px] overflow-hidden z-50 card-swap-in ${shellCls}`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${headerBorder}`}>
        <div className="flex items-center gap-2">
          <p className={`text-[14px] font-semibold font-poppins ${titleCls}`}>{title}</p>
          {unreadCount > 0 && (
            <span className="bg-pp-purple text-white text-[10px] font-medium px-[7px] py-[1px] rounded-full leading-none">
              {unreadCount}
            </span>
          )}
        </div>
        <button className={`text-[12px] font-medium font-poppins ${subtleCls} hover:opacity-80 transition-opacity`}>
          Mark all read
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col max-h-[340px] overflow-y-auto">
        {children}
      </div>

      {/* Footer */}
      <button
        onClick={onViewAll}
        className={`block w-full text-center px-4 py-3 text-[13px] font-medium font-poppins text-pp-blue hover:bg-pp-blue/5 transition-colors border-t ${headerBorder}`}
      >
        {viewAllLabel} →
      </button>
    </div>
  )
}

function MessagesPopover({
  isDark,
  textPrimary,
  textMuted,
  avatar1,
  avatar2,
  avatar3,
  onViewAll,
}: PopoverBaseProps & { avatar1: string; avatar2: string; avatar3: string }) {
  const items = [
    { id: 'm1', avatar: avatar1, name: 'Jamie Cole', preview: 'Loved the demo — can we hop on a call this week?', time: '2m', unread: true },
    { id: 'm2', avatar: avatar2, name: 'Liam A', preview: 'Forwarded your track to our A&R, will get back to you.', time: '34m', unread: true },
    { id: 'm3', avatar: avatar3, name: 'Tina V', preview: 'Great tone! Any chance of an instrumental version?', time: '2h', unread: false },
    { id: 'm4', avatar: avatar1, name: 'Maya Reed', preview: 'Thanks for the pitch — keeping you on our list.', time: '1d', unread: false },
  ]
  const rowHover = isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-[rgba(129,55,246,0.04)]'
  const rowBorder = isDark ? 'border-white/[0.04]' : 'border-[rgba(129,55,246,0.06)]'

  return (
    <PopoverShell
      isDark={isDark}
      title="Messages"
      unreadCount={2}
      onViewAll={onViewAll}
      viewAllLabel="View all messages"
    >
      {items.map((m, idx) => (
        <button
          key={m.id}
          onClick={onViewAll}
          className={`flex items-start gap-3 px-4 py-3 text-left transition-colors ${rowHover} ${idx !== items.length - 1 ? `border-b ${rowBorder}` : ''}`}
        >
          <div className="size-9 rounded-full overflow-hidden shrink-0 relative">
            <img src={m.avatar} alt="" className="size-full object-cover" />
            {m.unread && (
              <span className="absolute -top-[1px] -right-[1px] size-[10px] rounded-full bg-pp-blue border-2 border-[#160B33]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className={`text-[13px] font-semibold font-poppins truncate ${textPrimary}`}>{m.name}</p>
              <span className={`text-[11px] font-normal font-poppins shrink-0 ${textMuted}`}>{m.time}</span>
            </div>
            <p className={`text-[12px] font-normal font-poppins leading-[1.45] line-clamp-2 mt-[2px] ${textMuted}`}>
              {m.preview}
            </p>
          </div>
        </button>
      ))}
    </PopoverShell>
  )
}

function NotificationsPopover({
  isDark,
  textPrimary,
  textMuted,
  avatar1,
  avatar2,
  avatar3,
  onViewAll,
}: PopoverBaseProps & { avatar1: string; avatar2: string; avatar3: string }) {
  const items = [
    { id: 'n1', tone: 'match', title: 'New top match', body: 'Jamie Cole — 94% match for "Fray b1.mp3"', time: '5m', avatar: avatar1, unread: true },
    { id: 'n2', tone: 'reply', title: 'Reply received', body: 'Liam A responded to your pitch.', time: '1h', avatar: avatar2, unread: true },
    { id: 'n3', tone: 'view', title: 'Profile viewed', body: 'Tina V viewed your artist profile.', time: '4h', avatar: avatar3, unread: false },
    { id: 'n4', tone: 'system', title: 'Weekly digest ready', body: 'See how your tracks performed this week.', time: '1d', avatar: null, unread: false },
  ]
  const rowHover = isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-[rgba(129,55,246,0.04)]'
  const rowBorder = isDark ? 'border-white/[0.04]' : 'border-[rgba(129,55,246,0.06)]'

  const toneStyle = (tone: string) => {
    if (tone === 'match') return { bg: 'bg-pp-purple/15', dot: 'bg-pp-purple', emoji: '✨' }
    if (tone === 'reply') return { bg: 'bg-pp-blue/15', dot: 'bg-pp-blue', emoji: '✉️' }
    if (tone === 'view') return { bg: 'bg-[#00BB7B]/15', dot: 'bg-[#00BB7B]', emoji: '👁️' }
    return { bg: isDark ? 'bg-white/[0.06]' : 'bg-pp-navy/5', dot: 'bg-pp-navy/40', emoji: '🔔' }
  }

  return (
    <PopoverShell
      isDark={isDark}
      title="Notifications"
      unreadCount={2}
      onViewAll={onViewAll}
      viewAllLabel="View all notifications"
    >
      {items.map((n, idx) => {
        const style = toneStyle(n.tone)
        return (
          <button
            key={n.id}
            onClick={onViewAll}
            className={`flex items-start gap-3 px-4 py-3 text-left transition-colors ${rowHover} ${idx !== items.length - 1 ? `border-b ${rowBorder}` : ''}`}
          >
            <div className={`size-9 rounded-full shrink-0 flex items-center justify-center text-[14px] ${style.bg}`}>
              <span>{style.emoji}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-[13px] font-semibold font-poppins truncate ${textPrimary}`}>{n.title}</p>
                <span className={`text-[11px] font-normal font-poppins shrink-0 ${textMuted}`}>{n.time}</span>
              </div>
              <p className={`text-[12px] font-normal font-poppins leading-[1.45] line-clamp-2 mt-[2px] ${textMuted}`}>
                {n.body}
              </p>
            </div>
            {n.unread && (
              <span className={`size-[8px] rounded-full mt-[6px] shrink-0 ${style.dot}`} />
            )}
          </button>
        )
      })}
    </PopoverShell>
  )
}
