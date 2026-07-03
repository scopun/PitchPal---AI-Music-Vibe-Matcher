import { useState, useRef, useEffect, Fragment } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API_BASE_URL, ApiError } from '../services/api'
import ListenPreviewPlayer from '../components/ListenPreviewPlayer'
import ConfirmDialog from '../components/ConfirmDialog'
import {
  matchTrack,
  validateAudioFile,
  type MatchResponse,
  type MatchItem,
} from '../services/match'
import {
  deleteTrack as apiDeleteTrack,
  getTrack as apiGetTrack,
  listTracks as apiListTracks,
  type TrackSummary,
} from '../services/tracks'
import {
  createPitch as apiCreatePitch,
  deletePitch as apiDeletePitch,
  listPitches as apiListPitches,
  type Pitch,
} from '../services/pitches'
import { fetchAnalytics, type AnalyticsResponse } from '../services/analytics'
import SettingsPanel from '../components/SettingsPanel'

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
  | 'settings'
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
  'settings': '/settings',
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
  'settings': {
    eyebrow: 'ACCOUNT',
    title: 'Your',
    gradient: 'profile & settings',
    subtitle: 'Manage how you appear inside PitchPal — your photo, name, social links, and password.',
    topbarTitle: 'Account settings',
    topbarSubtitle: 'Profile, security and preferences',
    bodyParagraphs: [],
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
    eyebrow: 'SONGS PITCHED',
    title: 'Every song',
    gradient: 'you have pitched',
    subtitle: 'Track the artists you have reached out to and see who is engaging with your music.',
    topbarTitle: 'Songs pitched',
    topbarSubtitle: 'Track all your outgoing pitches',
    bodyParagraphs: [
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
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
  // Desktop-only topbar popover: 'messages' | 'notifications' | 'profile' | null
  const [openPopover, setOpenPopover] = useState<'messages' | 'notifications' | 'profile' | null>(null)
  const { triggerSignOut, user, initializing, token } = useAuth()

  // Protected page guard: once auth has finished initialising, the absence of a
  // token means there's no valid session — none was stored, or it was cleared
  // after a 401 (stale/expired). Bounce to the public home page so we never
  // render the dashboard shell with a blank "User", and so a fresh device is
  // always asked to log in. We key off the token (not `user`) so a transient
  // /me network blip on a still-valid token doesn't wrongly eject the user.
  useEffect(() => {
    if (!initializing && !token) {
      navigate('/', { replace: true })
    }
  }, [initializing, token, navigate])

  // Prefer the user's saved display_name. Fall back to a name derived
  // from the email's local part (splits on dots / underscores / hyphens,
  // capitalises each word) so the topbar still looks right before the
  // user has filled in Settings.
  const derivedName = user?.email
    ? user.email.split('@')[0]
        .replace(/[._-]+/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(' ')
    : 'User'
  const displayName = (user?.display_name && user.display_name.trim()) || derivedName
  const displayEmail = user?.email ?? '—'
  const userAvatarUrl = user?.avatar_url || null

  // Small helper — used in the 3 topbar/drawer avatar slots. When the user
  // has uploaded a photo we show it; otherwise we render the same gradient
  // initial circle that the Dashboard hero uses, so the avatar style stays
  // consistent across the whole shell instead of falling back to a generic
  // person SVG.
  const renderTopbarAvatar = () => userAvatarUrl
    ? <img src={userAvatarUrl} alt={displayName} className="size-full object-cover" />
    : (
      <div className="size-full bg-gradient-to-br from-pp-purple to-pp-purple-deep flex items-center justify-center text-white font-semibold text-[16px] font-poppins">
        {displayName.slice(0, 1).toUpperCase()}
      </div>
    )

  const handleLogout = () => {
    setOpenPopover(null)
    setDrawerOpen(false)
    triggerSignOut()
  }

  // My Tracks + Pitches Sent: per-user lists fetched from the backend.
  const [myTracks, setMyTracks] = useState<TrackSummary[]>([])
  const [loadingMyTracks, setLoadingMyTracks] = useState(false)
  const [myTracksError, setMyTracksError] = useState<string | null>(null)
  const [tracksLoadedOnce, setTracksLoadedOnce] = useState(false)
  const [pitches, setPitches] = useState<Pitch[]>([])
  const [loadingPitches, setLoadingPitches] = useState(false)
  const [pitchesError, setPitchesError] = useState<string | null>(null)
  // Track which match cards have already been pitched in the current session
  // so we can flip the Pitch button to a "Pitched" state instantly.
  const [pitchedArtistKeys, setPitchedArtistKeys] = useState<Set<string>>(new Set())

  // Themed confirm dialog state — replaces browser window.confirm.
  type ConfirmRequest = {
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    loadingLabel?: string
    danger?: boolean
    onConfirm: () => void | Promise<void>
  }
  const [pendingConfirm, setPendingConfirm] = useState<ConfirmRequest | null>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)

  const refreshMyTracks = async () => {
    setLoadingMyTracks(true)
    setMyTracksError(null)
    try {
      const data = await apiListTracks()
      setMyTracks(data)
      setTracksLoadedOnce(true)
    } catch (err) {
      setMyTracksError(err instanceof ApiError ? err.message : 'Could not load your tracks.')
    } finally {
      setLoadingMyTracks(false)
    }
  }

  const refreshPitches = async () => {
    setLoadingPitches(true)
    setPitchesError(null)
    try {
      const data = await apiListPitches()
      setPitches(data)
      // Hydrate the pitched-artist set so the Pitch buttons stay disabled
      // across page navigations.
      setPitchedArtistKeys(new Set(data.map((p) => `${p.track_id}:${p.artist_name.toLowerCase()}`)))
    } catch (err) {
      setPitchesError(err instanceof ApiError ? err.message : 'Could not load your pitches.')
    } finally {
      setLoadingPitches(false)
    }
  }

  useEffect(() => {
    if (activeItem === 'my-tracks') void refreshMyTracks()
  }, [activeItem])

  useEffect(() => {
    if (activeItem === 'pitches-sent') void refreshPitches()
  }, [activeItem])

  // Analytics tab — fetch fresh stats every time the user lands on it so the
  // numbers reflect any tracks/pitches added since the last visit.
  // Top search bar — types filters the user's My Tracks list and the
  // matching results show up in a dropdown. Clicking a result opens that
  // track's saved match view (same as clicking it in the My Tracks tab).
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchResults = (() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return [] as TrackSummary[]
    return myTracks
      .filter((t) => {
        const haystack = [t.filename, t.detected_genre, t.detected_language]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return haystack.includes(q)
      })
      // Newest first — so re-uploads of the same track from a different day
      // group together with the latest upload at the top.
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8)
  })()

  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)
  useEffect(() => {
    // Dashboard reuses the same analytics payload so we don't double-load.
    if (activeItem !== 'analytics' && activeItem !== 'dashboard') return
    let cancelled = false
    setAnalyticsLoading(true)
    setAnalyticsError(null)
    fetchAnalytics()
      .then((data) => { if (!cancelled) setAnalytics(data) })
      .catch((err) => {
        if (cancelled) return
        setAnalyticsError(err instanceof ApiError ? err.message : 'Could not load analytics.')
      })
      .finally(() => { if (!cancelled) setAnalyticsLoading(false) })
    return () => { cancelled = true }
  }, [activeItem])

  // Hydrate tracks + pitches once on mount so the sidebar badges and the
  // Pitch buttons in the results view reflect reality from the moment the
  // dashboard loads — even if the user hasn't opened those tabs yet.
  useEffect(() => {
    void refreshMyTracks()
    void refreshPitches()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openSavedTrack = async (trackId: number) => {
    try {
      const detail = await apiGetTrack(trackId)
      if (detail.match_data) {
        // Inject track_id so Pitch buttons can save against this track.
        // Also surface this as a "cached/saved" view so the user knows
        // they're looking at the previously-saved AI analysis (not a
        // fresh run) — same indicator the cache hit path uses, sourced
        // from the track's original created_at timestamp.
        const result: MatchResponse = {
          ...detail.match_data,
          track_id: detail.id,
          cached: true,
          cached_at: detail.created_at,
        }
        setUploadedFile(null)
        setMatchResult(result)
        setMatchError(null)
        setValidationError(null)
        setView('results')
        goToTab('my-matches')
      }
    } catch (err) {
      setMyTracksError(err instanceof ApiError ? err.message : 'Could not open this track.')
    }
  }

  const removeTrack = (trackId: number) => {
    const track = myTracks.find((t) => t.id === trackId)
    const nameLine = track ? ` "${track.filename}"` : ''
    setPendingConfirm({
      title: 'Delete this track?',
      message: `This track${nameLine} and all its pitches will be permanently deleted. This cannot be undone.`,
      confirmLabel: 'Delete track',
      loadingLabel: 'Deleting…',
      danger: true,
      onConfirm: async () => {
        setConfirmLoading(true)
        try {
          await apiDeleteTrack(trackId)
          setMyTracks((prev) => prev.filter((t) => t.id !== trackId))
          // Backend cascade-deletes pitches for this track — clean local state
          // too so the sidebar badge + Pitches Sent list stay in sync.
          setPitches((prev) => prev.filter((p) => p.track_id !== trackId))
          setPitchedArtistKeys((prev) => {
            const next = new Set<string>()
            prev.forEach((key) => {
              if (!key.startsWith(`${trackId}:`)) next.add(key)
            })
            return next
          })
          setPendingConfirm(null)
        } catch (err) {
          setMyTracksError(err instanceof ApiError ? err.message : 'Could not delete this track.')
          setPendingConfirm(null)
        } finally {
          setConfirmLoading(false)
        }
      },
    })
  }

  const removePitch = (pitchId: number) => {
    const pitch = pitches.find((p) => p.id === pitchId)
    const artistLine = pitch ? ` to ${pitch.artist_name}` : ''
    setPendingConfirm({
      title: 'Delete this pitch?',
      message: `Remove this pitch${artistLine} from your list. The artist won't be notified — this just clears the record from PitchPal.`,
      confirmLabel: 'Delete pitch',
      loadingLabel: 'Deleting…',
      danger: true,
      onConfirm: async () => {
        setConfirmLoading(true)
        try {
          await apiDeletePitch(pitchId)
          setPitches((prev) => prev.filter((p) => p.id !== pitchId))
          setPendingConfirm(null)
        } catch (err) {
          setPitchesError(err instanceof ApiError ? err.message : 'Could not delete this pitch.')
          setPendingConfirm(null)
        } finally {
          setConfirmLoading(false)
        }
      },
    })
  }

  // Used by the "Upload new" / "New match" buttons in My Tracks / Pitches Sent.
  // We reset the matching flow first so the My Matches tab shows the drop view
  // instead of stale results from a previous track.
  const goToMatchesForUpload = () => {
    cancelMatch()
    goToTab('my-matches')
  }

  // Used by the secondary "Upload new" / "Upload another track" / "New match"
  // buttons across My Tracks, Songs Pitched, and the Results view. Takes the
  // user to the upload (My Matches) drop view but does NOT open the file
  // picker — so they can fill in the optional "Target vibe / genre" field
  // first. File selection happens only when they click the drop zone itself.
  const goToUploadAndPick = () => {
    goToMatchesForUpload()
  }

  // Direct click on the "My Matches" sidebar / nav / dashboard link should
  // give a fresh drop view when the user previously had results showing —
  // they expect to be able to upload a new track, not stare at stale
  // matches from earlier. Mid-analysis we leave state alone so an accidental
  // tab nudge doesn't kill an in-flight request. `openSavedTrack` doesn't
  // use this helper, so opening a track from My Tracks / search still
  // shows its cached results.
  const openMatchesTab = () => {
    if (view === 'results' || view === 'error') {
      setUploadedFile(null)
      setMatchResult(null)
      setMatchError(null)
      setValidationError(null)
      setView('drop')
    }
    goToTab('my-matches')
  }

  // Pitch flow — Ciara's request: clicking "Pitch" opens a modal with an
  // auto-generated email + a streaming link the user can paste into their
  // own email client. Confirming the modal commits the pitch to the backend
  // so it shows up in "Songs Pitched".
  type PitchDraft = {
    artist: MatchItem
    trackId: number
    displayArtistName: string
    trackName: string
    body: string
    streamingLink: string
    // True when the streaming link was auto-filled by PitchPal (R2). UI
    // shows an "Auto-generated by PitchPal" indicator next to the input
    // so the user knows they don't have to paste anything.
    autoGeneratedLink?: boolean
  }
  const [pitchDraft, setPitchDraft] = useState<PitchDraft | null>(null)
  const [pitchSending, setPitchSending] = useState(false)
  const [pitchCopied, setPitchCopied] = useState(false)
  // Post-pitch success toast — Ciara wanted a more obvious "next track / back
  // to dashboard" affordance after confirming a pitch. We surface a fixed
  // toast at the top with explicit CTAs that auto-dismisses after 8s.
  const [lastPitch, setLastPitch] = useState<{ artistName: string } | null>(null)
  const lastPitchTimerRef = useRef<number | null>(null)

  // Owner-only listen preview popup. Triggered from the "Listen" button
  // on a My Tracks card. Renders the full themed player UI inline in
  // React (no iframe) and hits /api/v1/audio/<token> for the stream —
  // that endpoint doesn't touch the listen counter, so the uploader's
  // own previews don't inflate the analytics.
  const [listenPreview, setListenPreview] = useState<{
    trackId: number
    filename: string
    detected_genre: string | null
    bpm: number | null
    audioUrl: string
    audio_expires_at: string | null
  } | null>(null)

  const openListenPreview = (t: TrackSummary) => {
    if (!t.listening_url) return
    const m = t.listening_url.match(/\/listen\/([^/?#]+)/)
    const token = m ? m[1] : null
    if (!token) return
    setListenPreview({
      trackId: t.id,
      filename: t.filename,
      detected_genre: t.detected_genre,
      bpm: t.bpm,
      audioUrl: `${API_BASE_URL}/api/v1/audio/${token}`,
      audio_expires_at: t.audio_expires_at ?? null,
    })
  }

  const buildPitchBody = (artist: MatchItem, trackName: string, listeningUrl?: string | null): string => {
    const firstName = (artist.artist || '').split(' ')[0] || 'there'
    const reason = (artist.brief_match || artist.reason || '').trim()
    // When PitchPal generated a streaming link, embed it directly in the
    // body so the user has zero copy-paste work. Otherwise leave the
    // [PASTE YOUR STREAMING LINK] placeholder so the legacy flow still
    // works in environments where R2 isn't configured.
    const listenLine = listeningUrl
      ? `Have a listen here: ${listeningUrl}`
      : 'Have a listen here: [PASTE YOUR STREAMING LINK]'
    return [
      `Hi ${firstName} team,`,
      '',
      `I'm reaching out via PitchPal — your AI matching surfaced ${artist.artist} as a strong creative fit for my new track "${trackName}".`,
      '',
      reason ? `Why I think this works for ${firstName}:` : '',
      reason,
      '',
      listenLine,
      '',
      'Would love to hear your thoughts.',
      '',
      `Best,`,
    ].filter((line, i, arr) => !(line === '' && arr[i - 1] === '')).join('\n')
  }

  const openPitchModal = async (artist: MatchItem, trackId: number): Promise<boolean> => {
    const trackName = matchResult?.track_info?.filename?.replace(/\.[^.]+$/, '') || uploadedFile?.name || 'Track'
    // Streaming link is auto-generated by the backend (R2 storage). When
    // present, pre-fill BOTH the input field AND the pitch body so the
    // user has nothing to paste. They can still override the link if they
    // prefer their own SoundCloud / Spotify URL.
    const autoLink = matchResult?.listening_url || ''
    setPitchCopied(false)
    setPitchDraft({
      artist,
      trackId,
      displayArtistName: artist.artist || 'this artist',
      trackName,
      body: buildPitchBody(artist, trackName, autoLink || null),
      streamingLink: autoLink,
      autoGeneratedLink: !!autoLink,
    })
    return true // signals the caller (Pitch button) to clear its "sending" spinner — actual save happens on modal confirm
  }

  const confirmPitchSend = async () => {
    if (!pitchDraft) return
    const { artist, trackId } = pitchDraft
    setPitchSending(true)
    try {
      const created = await apiCreatePitch({
        track_id: trackId,
        artist_name: artist.artist,
        artist_image: artist.artist_image ?? null,
        label: artist.label ?? null,
        territory: artist.territory ?? null,
        source: artist.source ?? null,
        final_score: artist.final_score,
        confidence_level: artist.confidence_level ?? null,
      })
      setPitches((prev) => [created, ...prev])
      setPitchedArtistKeys((prev) => {
        const next = new Set(prev)
        next.add(`${trackId}:${artist.artist.toLowerCase()}`)
        return next
      })
      setPitchDraft(null)
      // Trigger the post-pitch toast with CTAs.
      if (lastPitchTimerRef.current !== null) window.clearTimeout(lastPitchTimerRef.current)
      setLastPitch({ artistName: artist.artist })
      lastPitchTimerRef.current = window.setTimeout(() => setLastPitch(null), 8000)
    } catch (err) {
      // Treat duplicates as success — the artist was already pitched.
      if (err instanceof ApiError && err.status === 409) {
        setPitchedArtistKeys((prev) => {
          const next = new Set(prev)
          next.add(`${trackId}:${artist.artist.toLowerCase()}`)
          return next
        })
        setPitchDraft(null)
        if (lastPitchTimerRef.current !== null) window.clearTimeout(lastPitchTimerRef.current)
        setLastPitch({ artistName: artist.artist })
        lastPitchTimerRef.current = window.setTimeout(() => setLastPitch(null), 8000)
      } else {
        const message = err instanceof ApiError ? err.message : 'Could not save this pitch.'
        window.alert(message)
      }
    } finally {
      setPitchSending(false)
    }
  }

  // Keep the old name so the ResultsView prop wiring stays simple.
  const sendPitch = openPitchModal

  const copyPitchToClipboard = async () => {
    if (!pitchDraft) return
    // Splice the user's streaming link into the body before copying so they
    // can paste straight into Gmail/Outlook without extra editing.
    const filled = pitchDraft.streamingLink.trim()
      ? pitchDraft.body.replace('[PASTE YOUR STREAMING LINK]', pitchDraft.streamingLink.trim())
      : pitchDraft.body
    try {
      await navigator.clipboard.writeText(filled)
      setPitchCopied(true)
      window.setTimeout(() => setPitchCopied(false), 1800)
    } catch {
      // Fallback for older browsers / non-secure contexts.
      window.prompt('Copy the pitch text below:', filled)
    }
  }

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
  const [view, setView] = useState<'drop' | 'analysing' | 'results' | 'error'>('drop')
  const [matchResult, setMatchResult] = useState<MatchResponse | null>(null)

  // Cache indicator — true both for re-uploads that hit the 7-day audio-hash
  // cache and for tracks opened from My Tracks (we mark those cached too so
  // the user knows they're looking at a saved analysis, not a fresh run).
  // Computed at the UploadPage level so the fixed toast (rendered outside
  // the inner ResultsView) can read it.
  const isCached = matchResult?.cached === true
  const cachedRelativeLabel = (() => {
    if (!isCached || !matchResult?.cached_at) return null
    const then = new Date(matchResult.cached_at).getTime()
    if (!Number.isFinite(then)) return null
    const diffMs = Date.now() - then
    const minutes = Math.floor(diffMs / 60_000)
    if (minutes < 60) return `${Math.max(1, minutes)}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  })()
  const [matchError, setMatchError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  // Optional artist-provided direction (intended genre / reference artists).
  // A rough demo often doesn't yet sound like its intended final genre, so this
  // hint lets the matcher target the artist's actual intent instead of guessing
  // from the audio alone. Read at submit time and passed to matchTrack.
  const [vibeHint, setVibeHint] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const completeTimerRef = useRef<number | null>(null)

  // Step progress while the real API request is in flight.
  // We advance through steps 1-3 on a timer (so the user always sees motion),
  // but step 4 + transition to the results view are gated on the actual
  // backend response. If the request finishes before the timer reaches step 3,
  // we hold there until the timer catches up; if the timer reaches step 3
  // before the request finishes, we wait for the request.
  useEffect(() => {
    if (view !== 'analysing') return
    const timers: number[] = []
    timers.push(window.setTimeout(() => setAnalysingStep(1), 800))
    timers.push(window.setTimeout(() => setAnalysingStep(2), 1800))
    timers.push(window.setTimeout(() => setAnalysingStep(3), 3200))
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [view])

  const clearAbort = () => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    if (completeTimerRef.current !== null) {
      window.clearTimeout(completeTimerRef.current)
      completeTimerRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      clearAbort()
    }
  }, [])

  // If the user is viewing results for a track that no longer exists (e.g. they
  // deleted it from My Tracks, or had stale state from another session), reset
  // the My Matches view back to the upload drop zone. Guarded by
  // `tracksLoadedOnce` so we don't reset before we've actually fetched the
  // list.
  useEffect(() => {
    if (
      view === 'results' &&
      tracksLoadedOnce &&
      matchResult?.track_id !== undefined &&
      !myTracks.some((t) => t.id === matchResult.track_id)
    ) {
      setMatchResult(null)
      setUploadedFile(null)
      setMatchError(null)
      setValidationError(null)
      setView('drop')
    }
  }, [view, matchResult, myTracks, tracksLoadedOnce])

  const handleFile = async (file: File | null | undefined) => {
    if (!file) return

    const validation = validateAudioFile(file)
    if (validation) {
      setValidationError(validation)
      return
    }
    setValidationError(null)

    // Abort any in-flight request before starting a new one.
    clearAbort()

    setMatchError(null)
    setMatchResult(null)
    setUploadedFile(file)
    setAnalysingStep(0)
    setView('analysing')

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const result = await matchTrack(file, controller.signal, vibeHint)
      if (controller.signal.aborted) return
      setMatchResult(result)
      // Clear the hint so the next track lookup starts with an empty field
      // (Ciara: the description shouldn't carry over to the next track).
      setVibeHint('')
      setAnalysingStep(4)
      // Optimistically insert the new/cached track into the My Tracks list
      // so the "track still exists?" guard further down doesn't race with
      // the upcoming setView('results') and bounce the user back to drop.
      // This was the root cause of the bug where the second upload of the
      // same file would show the drop view instead of the matches.
      if (result.track_id !== undefined) {
        const newTrackId = result.track_id
        setMyTracks((prev) => {
          if (prev.some((t) => t.id === newTrackId)) return prev
          const summary: TrackSummary = {
            id: newTrackId,
            filename: result.track_info?.filename || file.name,
            bpm: result.track_info?.bpm ?? null,
            energy: result.track_info?.energy ?? null,
            detected_genre: result.detected_genre ?? null,
            detected_language: result.detected_language ?? null,
            lyrics_extracted: result.lyrics_extracted ?? false,
            genre_tags: result.genre_tags ?? null,
            matches_count: result.matches?.length ?? 0,
            pitches_count: 0,
            created_at: new Date().toISOString(),
          }
          return [summary, ...prev]
        })
      }
      // Background refresh so the sidebar badge / list reflect the real
      // server-side state without blocking the transition.
      void refreshMyTracks()
      // Brief beat so the user actually sees the "all steps done" state
      // before the results view appears.
      completeTimerRef.current = window.setTimeout(() => {
        setView('results')
        completeTimerRef.current = null
      }, 650)
    } catch (err) {
      if (controller.signal.aborted) return
      if (err instanceof DOMException && err.name === 'AbortError') return
      const message =
        err instanceof ApiError
          ? err.message
          : 'Could not analyse this track. Please try again.'
      setMatchError(message)
      setView('error')
    } finally {
      if (abortRef.current === controller) abortRef.current = null
    }
  }

  const cancelMatch = () => {
    clearAbort()
    setUploadedFile(null)
    setMatchResult(null)
    setMatchError(null)
    setAnalysingStep(0)
    setView('drop')
  }

  const retryMatch = () => {
    setMatchError(null)
    if (uploadedFile) {
      void handleFile(uploadedFile)
    } else {
      setView('drop')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    void handleFile(e.dataTransfer.files?.[0])
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

  const tracksBadge = myTracks.length > 0 ? String(myTracks.length) : undefined
  const pitchesBadge = pitches.length > 0 ? String(pitches.length) : undefined

  const sidebarItems: { key: SidebarKey; label: string; icon: string; badge?: string }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: icons.house },
    { key: 'my-tracks', label: 'My tracks', icon: icons.music, badge: tracksBadge },
    { key: 'my-matches', label: 'My matches', icon: icons.target },
    { key: 'pitches-sent', label: 'Songs pitched', icon: icons.mailCheck, badge: pitchesBadge },
  ]

  const sidebarFooterItems: { key: SidebarKey; label: string; icon: string }[] = [
    { key: 'settings', label: 'Settings', icon: icons.cpu },
    { key: 'analytics', label: 'Analytics', icon: icons.chartBar },
  ]

  // Bottom-nav items (mobile only — main 4)
  const bottomNavItems: { key: SidebarKey; label: string; icon: string; badge?: string }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: icons.house },
    { key: 'my-tracks', label: 'My tracks', icon: icons.music, badge: tracksBadge },
    { key: 'my-matches', label: 'My matches', icon: icons.target },
    { key: 'pitches-sent', label: 'Songs pitched', icon: icons.mailCheck, badge: pitchesBadge },
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

      {/* Upload New Track CTA — always visible, prominent. On the narrow
          tablet sidebar (md..xl, 100px wide) we render an icon-only square
          button so the label can't wrap onto three ugly lines. From xl up
          the sidebar opens up to 232px and the full label fits comfortably. */}
      <div className="px-2 xl:px-3 pt-4 pb-2">
        <button
          onClick={() => { goToMatchesForUpload() }}
          title="Upload new track"
          aria-label="Upload new track"
          className="gradient-btn w-full border border-white/[0.06] text-white font-medium font-poppins text-[14px] px-0 xl:px-4 h-[48px] rounded-[10px] flex items-center justify-center gap-2 hover:-translate-y-[1px] hover:shadow-[0_10px_24px_rgba(129,55,246,0.45)] active:translate-y-0 transition-all duration-200 ease-out"
        >
          <img src={icons.uploadSmall} alt="" className="size-[20px] xl:size-[18px] object-contain shrink-0" />
          <span className="hidden xl:inline leading-none">Upload New Track</span>
        </button>
      </div>

      {/* Main menu */}
      <nav className="flex-1 flex flex-col gap-1 px-2 xl:px-3 py-6">
        {sidebarItems.map((item) => {
          const isActive = activeItem === item.key
          return (
            <button
              key={item.key}
              onClick={() => item.key === 'my-matches' ? openMatchesTab() : goToTab(item.key)}
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
      <ConfirmDialog
        isDark={isDark}
        open={pendingConfirm !== null}
        title={pendingConfirm?.title ?? ''}
        message={pendingConfirm?.message ?? ''}
        confirmLabel={pendingConfirm?.confirmLabel}
        cancelLabel={pendingConfirm?.cancelLabel}
        loadingLabel={pendingConfirm?.loadingLabel}
        danger={pendingConfirm?.danger}
        loading={confirmLoading}
        onConfirm={() => {
          if (pendingConfirm) void pendingConfirm.onConfirm()
        }}
        onCancel={() => {
          if (confirmLoading) return
          setPendingConfirm(null)
        }}
      />

      {/* OWNER-ONLY LISTEN PREVIEW MODAL — opens from the "Listen" button
          on a My Tracks card. Plays the track via the same R2 audio
          endpoint, but in a modal popup so the uploader doesn't leave
          the dashboard. Hits /api/v1/audio/<token> (no counter touch),
          so previewing your own track won't inflate listen analytics. */}
      {listenPreview && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
          onClick={() => setListenPreview(null)}
          onKeyDown={(e) => { if (e.key === 'Escape') setListenPreview(null) }}
          tabIndex={-1}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[640px] pp-confirm-scale-in"
          >
            {/* Close X — sits just above the player so it doesn't overlap
                the modal content. */}
            <button
              onClick={() => setListenPreview(null)}
              aria-label="Close preview"
              className="absolute -top-12 right-0 size-10 rounded-full flex items-center justify-center bg-white/[0.08] border border-white/[0.20] text-white hover:bg-white/[0.14] transition-colors"
              title="Close (Esc)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 19L19 5M5 5L19 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>

            {/* Full themed player rendered inline in React — same look as
                the public /listen/<token> page (custom controls, equaliser,
                background orbs, web-audio visualiser), minus the public
                page's "What is PitchPal?" footer. Audio is streamed from
                /api/v1/audio/<token>, which proxies the R2 object and does
                NOT touch the listen counter. */}
            <ListenPreviewPlayer
              audioUrl={listenPreview.audioUrl}
              filename={listenPreview.filename}
              trackIdLabel={formatTrackId(listenPreview.trackId)}
              detectedGenre={listenPreview.detected_genre}
              bpm={listenPreview.bpm}
              audioExpiresAt={listenPreview.audio_expires_at}
            />

            <p className="mt-3 text-[11px] font-poppins text-white/60 text-center">
              Preview mode — this play won't count toward your listen analytics.
            </p>
          </div>
        </div>
      )}

      {/* POST-PITCH SUCCESS TOAST — Ciara's #3: after confirming a pitch,
          give the user obvious paths to upload another track or jump back to
          the dashboard. Fixed at the bottom-right with a brighter border so
          it stands out against the dark dashboard background. On mobile we
          lift it above the bottom nav so it doesn't get clipped. */}
      {lastPitch && (
        <div
          className={`fixed bottom-[88px] md:bottom-6 right-4 md:right-6 z-[55] w-[calc(100%-32px)] max-w-[380px] rounded-[16px] px-5 py-4 flex flex-col gap-3 pp-confirm-scale-in ${
            isDark
              ? 'bg-[#1F1145] border-2 border-pp-purple shadow-[0_24px_60px_rgba(0,0,0,0.7)]'
              : 'bg-white border-2 border-pp-purple/50 shadow-[0_24px_60px_rgba(129,55,246,0.30)]'
          }`}
        >
          <button
            onClick={() => setLastPitch(null)}
            aria-label="Dismiss"
            className={`absolute top-2 right-2 size-7 rounded-[8px] flex items-center justify-center ${isDark ? 'hover:bg-white/[0.06] text-white/70' : 'hover:bg-[rgba(129,55,246,0.06)] text-pp-navy/70'}`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M5 19L19 5M5 5L19 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <div className="flex items-center gap-3 pr-6">
            <div className="size-10 rounded-full bg-[rgba(0,187,123,0.18)] flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8.5" stroke="#00BB7B" strokeWidth="1.8" />
                <path d="M6.5 10l2.5 2.5 4.5-4.5" stroke="#00BB7B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-[14px] font-semibold font-poppins leading-tight ${textPrimary}`}>
                Pitch sent to {lastPitch.artistName}!
              </p>
              <p className={`text-[12px] font-normal font-poppins ${textMuted}`}>
                Logged in Songs Pitched.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setLastPitch(null); goToTab('dashboard') }}
              className={`flex-1 ${isDark ? 'bg-white/[0.06] border border-white/[0.12] text-white' : 'bg-white border border-[rgba(129,55,246,0.25)] text-pp-navy'} font-medium font-poppins text-[12px] h-[36px] px-3 rounded-[10px] whitespace-nowrap hover:-translate-y-[1px] transition-all`}
            >
              Dashboard
            </button>
            <button
              onClick={() => { setLastPitch(null); goToUploadAndPick() }}
              className="flex-1 gradient-btn border border-white/[0.06] text-white font-medium font-poppins text-[12px] h-[36px] px-3 rounded-[10px] whitespace-nowrap hover:-translate-y-[1px] hover:shadow-[0_10px_24px_rgba(129,55,246,0.45)] transition-all"
            >
              New track
            </button>
          </div>
        </div>
      )}

      {/* PITCH EMAIL MODAL — Ciara's flow: shows an auto-generated pitch the
          user can edit, paste their streaming link into, copy to clipboard,
          then confirm to log the pitch in "Songs Pitched". */}
      {pitchDraft && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(38,17,74,0.35)', backdropFilter: 'blur(6px)' }}
          onClick={() => { if (!pitchSending) setPitchDraft(null) }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-[640px] rounded-[18px] p-6 md:p-7 flex flex-col gap-4 max-h-[90vh] overflow-y-auto ${
              isDark
                ? 'bg-[#120936] border border-white/[0.10] shadow-[0_30px_80px_rgba(0,0,0,0.6)]'
                : 'bg-white border border-[rgba(129,55,246,0.15)] shadow-[0_30px_80px_rgba(129,55,246,0.25)]'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={`text-[11px] font-medium tracking-[1.5px] uppercase font-poppins ${isDark ? 'text-pp-purple/80' : 'text-pp-purple-deep/70'}`}>
                  Pitch draft
                </p>
                <h3 className={`mt-1 text-[20px] md:text-[22px] font-semibold font-manrope leading-tight ${textPrimary}`}>
                  Pitch &quot;{pitchDraft.trackName}&quot; to {pitchDraft.displayArtistName}
                </h3>
                <p className={`mt-1 text-[12px] font-poppins ${textMuted}`}>
                  Edit the draft, paste your streaming link, copy it into your own email, and confirm to log this in Songs Pitched.
                </p>
              </div>
              <button
                onClick={() => { if (!pitchSending) setPitchDraft(null) }}
                disabled={pitchSending}
                aria-label="Close"
                className={`shrink-0 size-9 rounded-[10px] flex items-center justify-center ${
                  isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-[rgba(129,55,246,0.06)]'
                } disabled:opacity-40`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 19L19 5M5 5L19 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Streaming link input */}
            <label className={`flex flex-col gap-1 text-[12px] font-medium font-poppins ${textPrimary}`}>
              <span className="flex items-center justify-between gap-2 flex-wrap">
                <span>
                  Streaming link{' '}
                  <span className={`font-normal ${textMuted}`}>
                    {pitchDraft.autoGeneratedLink
                      ? '(auto-generated by PitchPal — editable if you prefer your own URL)'
                      : '(SoundCloud, Spotify, Dropbox — anywhere they can listen)'}
                  </span>
                </span>
                {pitchDraft.autoGeneratedLink && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-[2px] rounded-full text-[10px] font-semibold tracking-[0.4px] uppercase font-poppins"
                    style={{
                      background: 'rgba(0,184,215,0.12)',
                      border: '1px solid rgba(0,184,215,0.40)',
                      color: '#00B8D7',
                    }}
                    title="PitchPal generated a 30-day streaming link for this track — no need to paste your own."
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                    Auto-generated
                  </span>
                )}
              </span>
              <input
                type="url"
                placeholder="https://"
                value={pitchDraft.streamingLink}
                onChange={(e) => setPitchDraft({ ...pitchDraft, streamingLink: e.target.value, autoGeneratedLink: false })}
                className={`h-[42px] rounded-[10px] px-3 text-[14px] font-poppins outline-none transition-colors ${
                  isDark
                    ? 'bg-white/[0.04] border border-white/[0.10] text-white placeholder:text-white/40 focus:border-pp-purple/60'
                    : 'bg-white border border-[rgba(129,55,246,0.20)] text-pp-navy placeholder:text-pp-navy/40 focus:border-pp-purple/60'
                }`}
              />
            </label>

            {/* Editable email body */}
            <label className={`flex flex-col gap-1 text-[12px] font-medium font-poppins ${textPrimary}`}>
              Pitch email
              <textarea
                rows={11}
                value={pitchDraft.body}
                onChange={(e) => setPitchDraft({ ...pitchDraft, body: e.target.value })}
                className={`rounded-[10px] p-3 text-[13px] font-poppins leading-relaxed outline-none transition-colors resize-y ${
                  isDark
                    ? 'bg-white/[0.04] border border-white/[0.10] text-white/90 placeholder:text-white/40 focus:border-pp-purple/60'
                    : 'bg-white border border-[rgba(129,55,246,0.20)] text-pp-navy placeholder:text-pp-navy/40 focus:border-pp-purple/60'
                }`}
              />
            </label>

            {/* Actions */}
            <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-3">
              <button
                onClick={() => { if (!pitchSending) setPitchDraft(null) }}
                disabled={pitchSending}
                className={`${
                  isDark ? 'bg-white/[0.04] border border-white/[0.10] text-white/85' : 'bg-white border border-[rgba(129,55,246,0.20)] text-pp-navy'
                } font-medium font-poppins text-[13px] h-[42px] px-4 rounded-[10px] hover:opacity-90 disabled:opacity-40`}
              >
                Cancel
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => void copyPitchToClipboard()}
                  disabled={pitchSending}
                  className={`${
                    isDark ? 'bg-white/[0.04] border border-white/[0.10] text-white/85' : 'bg-white border border-[rgba(129,55,246,0.20)] text-pp-navy'
                  } font-medium font-poppins text-[13px] h-[42px] px-4 rounded-[10px] flex items-center gap-2 hover:-translate-y-[1px] transition-transform disabled:opacity-40`}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <rect x="4" y="4" width="9" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M11.5 4V3a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h.5" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                  {pitchCopied ? 'Copied!' : 'Copy pitch'}
                </button>
                <button
                  onClick={() => void confirmPitchSend()}
                  disabled={pitchSending}
                  className="gradient-btn border border-white/[0.06] text-white font-medium font-poppins text-[13px] h-[42px] px-5 rounded-[10px] flex items-center gap-2 hover:-translate-y-[1px] hover:shadow-[0_10px_24px_rgba(129,55,246,0.45)] transition-all disabled:opacity-60 disabled:cursor-wait"
                >
                  {pitchSending ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" className="animate-spin" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.4" strokeDasharray="56" strokeDashoffset="42" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <img src={icons.resSend} alt="" className="size-4 object-contain" />
                  )}
                  <span>{pitchSending ? 'Logging…' : 'Confirm pitch'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              onClick={() => { goToMatchesForUpload(); setDrawerOpen(false) }}
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
                  {renderTopbarAvatar()}
                </div>
                <div className="flex flex-col min-w-0">
                  <p className={`text-[15px] font-semibold font-poppins leading-tight ${textPrimary}`}>{displayName}</p>
                  <p className={`text-[12px] font-light italic font-poppins ${textMuted}`}>{displayEmail}</p>
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

              {/* Logout — mobile/tablet drawer */}
              <button
                onClick={handleLogout}
                className={`${iconBtnCls} flex items-center justify-center gap-3 px-4 h-[48px] rounded-[12px] transition-colors text-[15px] font-medium font-poppins`}
                style={{ color: isDark ? '#FF8A8A' : '#C73030' }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                  <path
                    d="M12.5 14.1667L16.6667 10L12.5 5.83333"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M16.6667 10H7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path
                    d="M9.16667 17.5H5C4.55797 17.5 4.13405 17.3244 3.82149 17.0118C3.50893 16.6993 3.33333 16.2754 3.33333 15.8333V4.16667C3.33333 3.72464 3.50893 3.30072 3.82149 2.98816C4.13405 2.67559 4.55797 2.5 5 2.5H9.16667"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Logout</span>
              </button>
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
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true) }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => window.setTimeout(() => setSearchOpen(false), 150)}
              placeholder="Search your tracks by name, genre, language…"
              className={`${searchInputCls} w-full h-[44px] rounded-[10px] pl-11 pr-4 text-[14px] font-poppins outline-none focus:border-pp-purple/50 transition-colors`}
            />
            {/* Results dropdown */}
            {searchOpen && searchQuery.trim() && (
              <div className={`absolute top-[52px] left-0 right-0 z-40 rounded-[12px] py-2 max-h-[360px] overflow-y-auto ${panelBg}`}>
                {searchResults.length === 0 ? (
                  <p className={`px-4 py-3 text-[13px] font-poppins ${textMuted}`}>
                    No tracks match "{searchQuery.trim()}". Try a filename, genre or language.
                  </p>
                ) : (
                  searchResults.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onMouseDown={(e) => {
                        // mousedown fires before blur — keep the dropdown open long enough to act.
                        e.preventDefault()
                        setSearchQuery('')
                        setSearchOpen(false)
                        void openSavedTrack(t.id)
                      }}
                      className={`w-full text-left px-4 py-2 flex items-center gap-3 ${
                        isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-[rgba(129,55,246,0.06)]'
                      }`}
                    >
                      <div className="size-9 rounded-[8px] bg-gradient-to-r from-pp-purple to-pp-purple-deep flex items-center justify-center shrink-0">
                        <img src={icons.resMusicNote} alt="" className="size-[18px] object-contain" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-[13px] font-medium font-poppins truncate ${textPrimary}`}>{t.filename}</p>
                        <p className={`text-[11px] font-normal font-poppins ${textMuted}`}>
                          <span className="font-medium text-pp-purple">{formatTrackId(t.id)}</span>
                          {t.detected_genre && <> · {t.detected_genre}</>}
                          {t.matches_count > 0 && <> · {t.matches_count} match{t.matches_count === 1 ? '' : 'es'}</>}
                        </p>
                      </div>
                      <span className={`text-[11px] font-medium font-poppins ${textMuted} shrink-0`}>
                        {formatRelativeDate(t.created_at)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Spacer on mobile */}
          <div className="md:hidden flex-1" />

          {/* Upload button — opens file picker after navigating to My Matches */}
          <button
            onClick={() => { goToMatchesForUpload() }}
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

            <div className="relative">
              <button
                data-pp-popover-trigger="profile"
                onClick={() => setOpenPopover(openPopover === 'profile' ? null : 'profile')}
                aria-haspopup="menu"
                aria-expanded={openPopover === 'profile'}
                className={`flex items-center gap-3 rounded-[10px] px-2 py-1 -mx-2 -my-1 hover:opacity-80 transition-opacity cursor-pointer ${openPopover === 'profile' ? (isDark ? 'bg-white/[0.06]' : 'bg-[rgba(129,55,246,0.08)]') : ''}`}
              >
                <div className="size-11 rounded-full overflow-hidden shrink-0">
                  {renderTopbarAvatar()}
                </div>
                <div className="flex flex-col text-left">
                  <p className={`text-[14px] font-semibold font-poppins leading-tight ${textPrimary}`}>{displayName}</p>
                  <p className={`text-[12px] font-light italic font-poppins ${textMuted}`}>{displayEmail}</p>
                </div>
                <img
                  src={icons.chevron}
                  alt=""
                  className={`size-3 object-contain ml-1 transition-transform ${openPopover === 'profile' ? 'rotate-180' : ''}`}
                />
              </button>

              {openPopover === 'profile' && (
                <ProfileDropdown
                  isDark={isDark}
                  onLogout={handleLogout}
                  onSettings={() => { setOpenPopover(null); navigate('/settings') }}
                  email={user?.email ?? ''}
                  displayName={displayName}
                />
              )}
            </div>
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
                  {renderTopbarAvatar()}
                </div>
                <div className="flex flex-col">
                  <p className={`text-[15px] font-semibold font-poppins leading-tight ${textPrimary}`}>{displayName}</p>
                  <p className={`text-[12px] font-light italic font-poppins ${textMuted}`}>{displayEmail}</p>
                </div>
              </div>

              {/* 4 action icon buttons — theme / messages / notifications /
                  settings. The settings icon opens the Account Settings tab
                  inside the dashboard shell so the user can edit their
                  profile directly from the tablet drawer. */}
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

                <button
                  onClick={() => { goToTab('settings'); setDrawerOpen(false) }}
                  className={`${iconBtnCls} size-11 rounded-[10px] flex items-center justify-center transition-colors cursor-pointer ${textPrimary}`}
                  aria-label="Account settings"
                  title="Account settings"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="7" r="3.2" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M4.5 16.5c.5-3 2.6-4.6 5.5-4.6s5 1.6 5.5 4.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Divider */}
              <div className={`mt-5 mb-4 h-px ${isDark ? 'bg-white/[0.06]' : 'bg-[rgba(38,17,74,0.08)]'}`} />

              {/* Logout — tablet drawer */}
              <button
                onClick={handleLogout}
                className={`${iconBtnCls} w-full flex items-center justify-center gap-3 px-4 h-[48px] rounded-[12px] transition-colors text-[14px] font-medium font-poppins cursor-pointer`}
                style={{ color: isDark ? '#FF8A8A' : '#C73030' }}
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="shrink-0">
                  <path
                    d="M12.5 14.1667L16.6667 10L12.5 5.83333"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M16.6667 10H7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path
                    d="M9.16667 17.5H5C4.55797 17.5 4.13405 17.3244 3.82149 17.0118C3.50893 16.6993 3.33333 16.2754 3.33333 15.8333V4.16667C3.33333 3.72464 3.50893 3.30072 3.82149 2.98816C4.13405 2.67559 4.55797 2.5 5 2.5H9.16667"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* Hidden file input — triggered by Upload Track buttons and click-to-browse */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp3,.wav,.flac,.aac,.m4a,audio/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            // Reset the input so picking the same file twice re-triggers onChange.
            e.target.value = ''
            void handleFile(file)
          }}
        />

        {/* MAIN CONTENT — analysing view top-aligned on mobile, centered on tablet/desktop; results view top-aligned */}
        <main className={`flex-1 flex justify-center px-4 md:px-8 xl:px-6 py-8 md:py-12 xl:py-8 pb-[100px] md:pb-12 xl:pb-12 ${view === 'analysing' ? 'items-start md:items-center' : view === 'results' ? 'items-start' : 'items-center'} overflow-y-auto`}>
          {activeItem === 'my-tracks' ? (
            <MyTracksTab
              isDark={isDark}
              icons={icons}
              textPrimary={textPrimary}
              textMuted={textMuted}
              tracks={myTracks}
              loading={loadingMyTracks}
              error={myTracksError}
              onOpen={openSavedTrack}
              onDelete={removeTrack}
              onUploadNew={goToUploadAndPick}
              onListen={openListenPreview}
            />
          ) : activeItem === 'pitches-sent' ? (
            <PitchesSentTab
              isDark={isDark}
              textPrimary={textPrimary}
              textMuted={textMuted}
              pitches={pitches}
              loading={loadingPitches}
              error={pitchesError}
              onDelete={removePitch}
              onUploadNew={goToUploadAndPick}
            />
          ) : activeItem === 'settings' ? (
            /* ── ACCOUNT SETTINGS ── Full profile form rendered inside the
               dashboard shell so the sidebar stays visible. Both sidebar
               Settings click and the topbar profile dropdown's "Account
               settings" route here. */
            <div key="settings" className="card-swap-in w-full max-w-[920px] mx-auto flex flex-col gap-6 self-start">
              {/* Heading — same style as default demo tabs so the visual
                  rhythm stays consistent across the dashboard. */}
              <div className="flex flex-col items-start gap-[14px] md:gap-[16px]">
                <p className="text-pp-purple text-[13px] font-medium tracking-[0.26px] uppercase font-poppins">
                  {tabMeta.eyebrow}
                </p>
                <h1 className={`text-[32px] md:text-[32px] xl:text-[42px] font-semibold leading-[1.2] xl:leading-[1.25] font-poppins ${textPrimary}`}>
                  {tabMeta.title} <span className="gradient-text">{tabMeta.gradient}</span>
                </h1>
                <p className={`text-[14px] md:text-[14px] xl:text-[16px] font-normal leading-[1.6] tracking-[0.16px] font-poppins max-w-[700px] ${textMuted}`}>
                  {tabMeta.subtitle}
                </p>
              </div>
              <SettingsPanel isDark={isDark} />
            </div>
          ) : activeItem === 'dashboard' ? (
            /* ── DASHBOARD / COMMAND CENTRE ── Real overview built from the
               user's actual data: KPIs, recent tracks, recent pitches, top
               genre + most-pitched artists, plus quick actions. */
            <div key="dashboard" className="card-swap-in w-full max-w-[1200px] mx-auto flex flex-col gap-6 self-start">
              {/* Hero greeting — same heading sizes/fonts as default demo
                  tabs (32/32/42 poppins, 13px tracked eyebrow, 14/14/16
                  subtitle) so all tabs feel uniform. */}
              <div className={`${panelBg} rounded-[18px] p-6 md:p-8 flex flex-col gap-5 relative overflow-hidden`}>
                <div className="absolute -top-12 -right-12 size-[220px] rounded-full opacity-30 blur-3xl bg-gradient-to-r from-pp-purple to-pp-blue pointer-events-none" />
                {/* Avatar + greeting row */}
                <div className="flex items-center gap-5 relative">
                  <div className="size-16 rounded-full overflow-hidden border-2 border-pp-purple/40 shrink-0">
                    {userAvatarUrl
                      ? <img src={userAvatarUrl} alt={displayName} className="size-full object-cover" />
                      : <div className="size-full bg-gradient-to-br from-pp-purple to-pp-purple-deep flex items-center justify-center text-white font-semibold text-[22px] font-poppins">
                          {displayName.slice(0, 1).toUpperCase()}
                        </div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-pp-purple text-[13px] font-medium tracking-[0.26px] uppercase font-poppins">Welcome back</p>
                    <h1 className={`mt-[6px] text-[28px] md:text-[32px] xl:text-[38px] font-semibold leading-[1.2] font-poppins ${textPrimary}`}>
                      Hi {displayName.split(' ')[0]} — <span className="gradient-text">ready to pitch?</span>
                    </h1>
                    <p className={`mt-[8px] text-[13px] md:text-[14px] font-normal leading-[1.6] tracking-[0.16px] font-poppins max-w-[680px] ${textMuted}`}>
                      {myTracks.length === 0
                        ? 'Upload your first track and PitchPal will surface the best-fit artists in seconds.'
                        : `You've processed ${myTracks.length} track${myTracks.length === 1 ? '' : 's'} and pitched ${pitches.length} time${pitches.length === 1 ? '' : 's'} so far.`}
                    </p>
                  </div>
                </div>
                {/* CTA row — upload prominent full-width, view matches secondary */}
                <div className="flex gap-3 relative">
                  <button
                    onClick={() => { goToMatchesForUpload() }}
                    className="gradient-btn flex-1 border border-white/[0.06] text-white font-semibold font-poppins text-[15px] h-[52px] rounded-[12px] flex items-center justify-center gap-2 hover:-translate-y-[1px] hover:shadow-[0_12px_28px_rgba(129,55,246,0.50)] transition-all"
                  >
                    <img src={icons.uploadSmall} alt="" className="size-[18px] object-contain" />
                    Upload New Track
                  </button>
                  <button
                    onClick={openMatchesTab}
                    className={`${isDark ? 'bg-white/[0.04] border border-white/[0.10] text-white/85' : 'bg-white border border-[rgba(129,55,246,0.20)] text-pp-navy'} font-medium font-poppins text-[14px] h-[52px] px-5 rounded-[12px] flex items-center justify-center gap-2 hover:-translate-y-[1px] transition-all whitespace-nowrap`}
                  >
                    View matches
                  </button>
                </div>
              </div>

              {/* KPI cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Songs processed', value: analytics?.songs_processed ?? myTracks.length, accent: 'from-pp-purple to-pp-purple-deep', tab: 'my-tracks' as SidebarKey },
                  { label: 'Songs pitched', value: analytics?.songs_pitched ?? 0, accent: 'from-pp-blue to-pp-purple', tab: 'pitches-sent' as SidebarKey },
                  { label: 'Artists covered', value: analytics?.artists_covered ?? 0, accent: 'from-pp-purple to-pp-blue', tab: 'analytics' as SidebarKey },
                  { label: 'Top genre', value: analytics?.top_genre ?? '—', accent: 'from-pp-blue to-[#5ED9F0]', tab: 'analytics' as SidebarKey, isText: true },
                ].map((kpi) => (
                  <button
                    key={kpi.label}
                    onClick={() => goToTab(kpi.tab)}
                    className={`${panelBg} rounded-[16px] p-5 text-left transition-transform hover:-translate-y-[2px]`}
                  >
                    <div className={`h-[3px] w-10 rounded-full bg-gradient-to-r ${kpi.accent} mb-3`} />
                    <p className={`text-[11px] font-medium tracking-[1.2px] uppercase font-poppins ${textMuted}`}>{kpi.label}</p>
                    {kpi.isText
                      ? <p className={`mt-2 text-[15px] font-semibold font-manrope leading-tight line-clamp-2 ${textPrimary}`}>{kpi.value}</p>
                      : <p className={`mt-2 text-[32px] font-semibold font-manrope leading-none ${textPrimary}`}>{kpi.value}</p>}
                  </button>
                ))}
              </div>

              {/* 2-col area: recent tracks + recent pitches */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent tracks */}
                <div className={`${panelBg} rounded-[16px] p-5`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-[16px] font-semibold font-manrope ${textPrimary}`}>Recent tracks</h3>
                    <button onClick={() => goToTab('my-tracks')} className="text-pp-purple text-[12px] font-medium font-poppins hover:underline">View all →</button>
                  </div>
                  {myTracks.length === 0 ? (
                    <p className={`text-[13px] font-poppins ${textMuted}`}>No tracks yet. Upload one to get started.</p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {myTracks.slice(0, 4).map((t) => (
                        <li key={t.id}>
                          <button
                            onClick={() => void openSavedTrack(t.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-[10px] text-left transition-colors ${isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-[rgba(129,55,246,0.05)]'}`}
                          >
                            <div className="size-9 rounded-[10px] bg-gradient-to-r from-pp-purple to-pp-purple-deep flex items-center justify-center shrink-0">
                              <img src={icons.resMusicNote} alt="" className="size-[18px] object-contain" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`text-[13px] font-medium font-poppins truncate ${textPrimary}`}>{t.filename}</p>
                              <p className={`text-[11px] font-poppins ${textMuted}`}>
                                <span className="font-medium text-pp-purple">{formatTrackId(t.id)}</span>
                                {t.detected_genre && <> · {t.detected_genre}</>}
                                {t.matches_count > 0 && <> · {t.matches_count} matches</>}
                              </p>
                            </div>
                            <span className={`text-[10px] font-medium font-poppins ${textMuted} shrink-0`}>
                              {new Date(t.created_at).toLocaleDateString()}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Recent pitches */}
                <div className={`${panelBg} rounded-[16px] p-5`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-[16px] font-semibold font-manrope ${textPrimary}`}>Recent pitches</h3>
                    <button onClick={() => goToTab('pitches-sent')} className="text-pp-purple text-[12px] font-medium font-poppins hover:underline">View all →</button>
                  </div>
                  {pitches.length === 0 ? (
                    <p className={`text-[13px] font-poppins ${textMuted}`}>You haven't pitched yet. Pick a strong match on My matches to send your first pitch.</p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {pitches.slice(0, 4).map((p) => (
                        <li key={p.id} className={`flex items-center gap-3 px-3 py-2 rounded-[10px] ${isDark ? 'bg-white/[0.02]' : 'bg-[rgba(129,55,246,0.04)]'}`}>
                          <div className="size-9 rounded-full overflow-hidden bg-pp-purple/15 shrink-0">
                            {p.artist_image
                              ? <img src={p.artist_image} alt={p.artist_name} className="size-full object-cover" />
                              : <div className="size-full flex items-center justify-center text-pp-purple font-semibold text-[14px] font-manrope">{p.artist_name.slice(0,1).toUpperCase()}</div>}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-[13px] font-medium font-poppins truncate ${textPrimary}`}>{p.artist_name}</p>
                            <p className={`text-[11px] font-poppins truncate ${textMuted}`}>{p.label || p.source || 'Industry match'}</p>
                          </div>
                          <span className="text-[10px] font-medium font-poppins px-2 py-[2px] rounded-full bg-[rgba(0,187,123,0.12)] text-[#00BB7B] shrink-0">
                            {p.status || 'Sent'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Insight strip — most pitched artists */}
              {analytics && analytics.top_pitched_artists.length > 0 && (
                <div className={`${panelBg} rounded-[16px] p-5`}>
                  <h3 className={`text-[16px] font-semibold font-manrope mb-3 ${textPrimary}`}>Your most pitched artists</h3>
                  <div className="flex flex-wrap gap-2">
                    {analytics.top_pitched_artists.map((a) => (
                      <span
                        key={a.artist}
                        className={`px-3 py-[6px] rounded-full text-[12px] font-medium font-poppins ${
                          isDark ? 'bg-pp-purple/15 text-white border border-pp-purple/30' : 'bg-pp-purple/10 text-pp-purple-deep border border-pp-purple/25'
                        }`}
                      >
                        {a.artist} · {a.count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : activeItem === 'analytics' ? (
            /* ── ANALYTICS DASHBOARD ── Real per-user stats from the backend. */
            <div key="analytics" className="card-swap-in w-full max-w-[1120px] mx-auto flex flex-col gap-6 self-start">
              <div className="flex flex-col items-start gap-[14px] md:gap-[16px]">
                <p className="text-pp-purple text-[13px] font-medium tracking-[0.26px] uppercase font-poppins">
                  {tabMeta.eyebrow}
                </p>
                <h1 className={`text-[32px] md:text-[32px] xl:text-[42px] font-semibold leading-[1.2] xl:leading-[1.25] font-poppins ${textPrimary}`}>
                  {tabMeta.title} <span className="gradient-text">{tabMeta.gradient}</span>
                </h1>
                <p className={`text-[14px] md:text-[14px] xl:text-[16px] font-normal leading-[1.6] tracking-[0.16px] font-poppins max-w-[700px] ${textMuted}`}>
                  {tabMeta.subtitle}
                </p>
              </div>

              {analyticsLoading && (
                <div className={`rounded-[14px] px-5 py-8 text-center text-[13px] font-poppins ${textMuted} ${panelBg}`}>Loading your stats…</div>
              )}
              {analyticsError && !analyticsLoading && (
                <div className={`rounded-[14px] px-5 py-8 text-center text-[13px] font-poppins text-[#FF7B7B] ${panelBg}`}>{analyticsError}</div>
              )}
              {!analyticsLoading && !analyticsError && analytics && (
                <>
                  {/* 3 headline KPI cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: 'Songs processed', value: analytics.songs_processed, hint: 'Tracks you uploaded' },
                      { label: 'Songs pitched', value: analytics.songs_pitched, hint: 'Tracks sent at least once' },
                      { label: 'Artists covered', value: analytics.artists_covered, hint: 'Unique artists surfaced' },
                    ].map((kpi) => (
                      <div key={kpi.label} className={`rounded-[16px] p-5 ${panelBg}`}>
                        <p className={`text-[11px] font-medium tracking-[1.4px] uppercase font-poppins ${textMuted}`}>{kpi.label}</p>
                        <p className={`mt-2 text-[36px] font-semibold font-manrope leading-none ${textPrimary}`}>{kpi.value}</p>
                        <p className={`mt-2 text-[12px] font-normal font-poppins ${textMuted}`}>{kpi.hint}</p>
                      </div>
                    ))}
                  </div>

                  {/* 2 detail panels — top genre + top pitched artists */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Top genre */}
                    <div className={`rounded-[16px] p-5 ${panelBg}`}>
                      <p className={`text-[11px] font-medium tracking-[1.4px] uppercase font-poppins ${textMuted}`}>Most popular genre</p>
                      {analytics.top_genre ? (
                        <>
                          <p className={`mt-3 text-[20px] font-semibold font-manrope leading-tight ${textPrimary}`}>{analytics.top_genre}</p>
                          <p className={`mt-2 text-[12px] font-normal font-poppins ${textMuted}`}>
                            Detected on {analytics.top_genre_count} track{analytics.top_genre_count === 1 ? '' : 's'} you uploaded.
                          </p>
                        </>
                      ) : (
                        <p className={`mt-3 text-[13px] font-normal font-poppins ${textMuted}`}>
                          Upload a track to see your most common genre here.
                        </p>
                      )}
                    </div>

                    {/* Top pitched artists */}
                    <div className={`rounded-[16px] p-5 ${panelBg}`}>
                      <p className={`text-[11px] font-medium tracking-[1.4px] uppercase font-poppins ${textMuted}`}>Most pitched artists</p>
                      {analytics.top_pitched_artists.length === 0 ? (
                        <p className={`mt-3 text-[13px] font-normal font-poppins ${textMuted}`}>
                          You haven't pitched any artists yet. Once you do, your top targets will appear here.
                        </p>
                      ) : (
                        <ul className="mt-3 flex flex-col gap-2">
                          {analytics.top_pitched_artists.map((a, idx) => (
                            <li key={a.artist} className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <span className={`size-7 rounded-full flex items-center justify-center text-[11px] font-semibold font-poppins ${
                                  isDark ? 'bg-pp-purple/25 text-white' : 'bg-pp-purple/15 text-pp-purple-deep'
                                }`}>
                                  {idx + 1}
                                </span>
                                <span className={`text-[14px] font-medium font-poppins truncate ${textPrimary}`}>{a.artist}</span>
                              </div>
                              <span className={`text-[12px] font-normal font-poppins ${textMuted} shrink-0`}>
                                {a.count} pitch{a.count === 1 ? '' : 'es'}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : activeItem !== 'my-matches' ? (
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

              {/* Validation error — invalid format / too large */}
              {validationError && (
                <div
                  role="alert"
                  className="flex items-start gap-[10px] px-[14px] py-[12px] rounded-[12px] font-poppins -mb-3"
                  style={{
                    background: isDark ? 'rgba(255,107,107,0.07)' : 'rgba(220,38,38,0.05)',
                    border: `1px solid ${isDark ? 'rgba(255,107,107,0.28)' : 'rgba(220,38,38,0.22)'}`,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-[1px]">
                    <path
                      d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z"
                      stroke={isDark ? '#FF8A8A' : '#C73030'}
                      strokeWidth="1.5"
                    />
                    <path d="M10 6.25V10.625" stroke={isDark ? '#FF8A8A' : '#C73030'} strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="10" cy="13.5" r="0.85" fill={isDark ? '#FF8A8A' : '#C73030'} />
                  </svg>
                  <p
                    className="text-[13px] font-light leading-[1.5]"
                    style={{ color: isDark ? '#FFB8B8' : '#B42323' }}
                  >
                    {validationError}
                  </p>
                </div>
              )}

              {/* Optional vibe / genre / reference hint. Filled BEFORE picking
                  a file — a rough demo often doesn't sound like its intended
                  final genre, so this steers the match to the real intent. */}
              <div className="flex flex-col gap-[8px] -mb-2">
                <label
                  htmlFor="vibe-hint"
                  className={`text-[13px] md:text-[14px] font-medium font-poppins ${textPrimary}`}
                >
                  Target vibe / genre <span className={`font-normal ${textMuted}`}>(optional — boosts accuracy)</span>
                </label>
                <input
                  id="vibe-hint"
                  type="text"
                  value={vibeHint}
                  onChange={(e) => setVibeHint(e.target.value)}
                  placeholder="e.g. tech house, or “theatrical alt-pop like Raye / Marina”"
                  className={`${searchInputCls} w-full rounded-[10px] px-[16px] py-[13px] text-[14px] font-poppins outline-none focus:border-pp-purple/50 transition-colors`}
                />
                <p className={`text-[12px] font-light leading-[1.5] font-poppins ${textMuted}`}>
                  Tell us the intended genre and a couple of reference artists. Leave blank to let the AI detect it from the audio.
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

              {/* Animated progress bar — keeps the user anchored while the 40-60s pipeline runs */}
              <div className={`w-full max-w-[360px] h-[3px] rounded-full overflow-hidden relative ${isDark ? 'bg-white/[0.08]' : 'bg-pp-purple/[0.10]'}`}>
                {analysingStep < 4
                  ? <div className="pp-progress-bar" />
                  : <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pp-purple to-pp-blue" />}
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
                  // Show "done" check on the active step too once the API has
                  // returned — `matchResult` arriving means matching + insights
                  // are both finished even if we haven't bumped `analysingStep`
                  // yet.
                  const effectiveState =
                    matchResult && state !== 'done' ? 'done' as const : state
                  let stepIcon: React.ReactNode
                  let textCls = textMuted
                  if (effectiveState === 'done') {
                    stepIcon = (
                      <span key="done" className="pp-step-done inline-block">
                        <img src={icons.stepDone} alt="" className="size-6 object-contain" />
                      </span>
                    )
                    textCls = 'text-[#00BB7B]'
                  } else if (effectiveState === 'active') {
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

              {/* Cancel — let the user abort a long-running analysis. */}
              <button
                onClick={cancelMatch}
                className={`text-[13px] font-medium font-poppins underline underline-offset-4 transition-opacity hover:opacity-80 ${textMuted}`}
              >
                Cancel and upload a different track
              </button>
            </div>
          ) : view === 'error' ? (
            /* ── ERROR VIEW ── */
            <div key="error" className="card-swap-in w-full xl:w-[640px] max-w-[640px] flex flex-col items-center text-center gap-[28px]">
              <div
                className="size-[80px] rounded-[20px] flex items-center justify-center shrink-0"
                style={{
                  background: isDark ? 'rgba(255,107,107,0.08)' : 'rgba(220,38,38,0.06)',
                  border: `1px solid ${isDark ? 'rgba(255,107,107,0.3)' : 'rgba(220,38,38,0.25)'}`,
                }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke={isDark ? '#FF8A8A' : '#C73030'} strokeWidth="1.6" />
                  <path d="M12 7.5V13" stroke={isDark ? '#FF8A8A' : '#C73030'} strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="12" cy="16.25" r="1.05" fill={isDark ? '#FF8A8A' : '#C73030'} />
                </svg>
              </div>

              <div className="flex flex-col gap-3">
                <h2 className={`text-[26px] xl:text-[30px] font-semibold font-poppins leading-tight ${textPrimary}`}>
                  We couldn't analyse this track
                </h2>
                <p className={`text-[14px] xl:text-[15px] font-light leading-[1.6] font-poppins ${textMuted}`}>
                  {matchError ?? 'Something went wrong while analysing your track. Please try again.'}
                </p>
              </div>

              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
                <button
                  onClick={retryMatch}
                  className="gradient-btn pp-btn-lift border border-white/[0.06] text-white font-medium font-poppins text-[14px] px-5 py-[12px] xl:h-[48px] rounded-[10px] flex items-center justify-center gap-2"
                >
                  Try again
                </button>
                <button
                  onClick={cancelMatch}
                  className={`${isDark ? 'bg-white/[0.04] border border-white/[0.10] text-white/85' : 'bg-white border border-[rgba(129,55,246,0.20)] text-pp-navy'} pp-btn-lift-soft font-medium font-poppins text-[14px] px-5 py-[12px] xl:h-[48px] rounded-[10px] flex items-center justify-center`}
                >
                  Upload a different track
                </button>
              </div>
            </div>
          ) : (
            /* ── RESULTS VIEW ── */
            <div key="results" className="card-swap-in w-full">
              <ResultsView
                isDark={isDark}
                icons={icons}
                uploadedFile={uploadedFile}
                textPrimary={textPrimary}
                textMuted={textMuted}
                matchResult={matchResult}
                onUploadAnother={goToUploadAndPick}
                onDashboard={() => goToTab('dashboard')}
                onPitch={sendPitch}
                pitchedKeys={pitchedArtistKeys}
              />
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
              onClick={() => item.key === 'my-matches' ? openMatchesTab() : goToTab(item.key)}
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
  matchResult: MatchResponse | null
  onUploadAnother: () => void
  onDashboard: () => void
  onPitch: (artist: MatchItem, trackId: number) => Promise<boolean>
  pitchedKeys: Set<string>
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
  albums: string
  ringColor: 'cyan' | 'purple'
  confidence: string
  source: string
  writesOwn?: boolean
  raw: MatchItem
}

function formatLargeCount(n: number | null | undefined): string {
  if (n == null || n <= 0) return '—'
  if (n >= 1_000_000) {
    const v = n / 1_000_000
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, '')}M`
  }
  if (n >= 1_000) {
    const v = n / 1_000
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, '')}K`
  }
  return String(n)
}

function buildMatchData(matches: MatchItem[], icons: { resAvatar1?: string; resAvatar2?: string; resAvatar3?: string; avatar: string }, detectedGenre: string | undefined, genreTags: string[]): MatchData[] {
  const avatarFallback = [icons.resAvatar1, icons.resAvatar2, icons.resAvatar3].filter(Boolean) as string[]
  if (avatarFallback.length === 0) avatarFallback.push(icons.avatar)

  return matches.map((m, idx) => {
    const score = Math.round((m.final_score ?? 0) * 100)
    const isStrong = (m.confidence_level ?? '') === 'Strong Match' || (m.final_score ?? 0) >= 0.92
    // Per-match tags: pick a 3-tag mix from the artist's genre_fit + top-level
    // detected genre + the shared genre_tags so each card still feels distinct.
    const tagPool: string[] = []
    if (m.genre_fit) {
      m.genre_fit.split(/[,/]|\s+\bor\b\s+/i).map((s) => s.trim()).filter(Boolean).forEach((t) => tagPool.push(t))
    }
    if (detectedGenre) tagPool.push(detectedGenre)
    genreTags.forEach((t) => tagPool.push(t))
    const tags = Array.from(new Set(tagPool.map((t) => t.trim()).filter(Boolean))).slice(0, 3)
    const territory = m.territory?.trim() || 'International'
    // Prefer the real Spotify artist photo; fall back to cycling the demo
    // avatars only when Spotify hasn't enriched this match.
    const avatar = m.artist_image || avatarFallback[idx % avatarFallback.length]
    return {
      id: `${idx}-${(m.artist || 'artist').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: m.artist || 'Unnamed artist',
      genre: m.genre_fit || detectedGenre || '—',
      location: m.label ? `${territory} • ${m.label}` : territory,
      match: score,
      avatar,
      topMatch: idx === 0 && isStrong,
      insight: m.brief_match || m.reason || 'No insight provided for this match.',
      tags: tags.length > 0 ? tags : ['Match'],
      // Prefer Spotify monthly listeners when available — it's the metric
      // clients/A&Rs actually recognise. Fall back to Deezer fans count
      // when the scrape miss or the artist isn't on Spotify.
      listeners: formatLargeCount(m.monthly_listeners ?? m.followers),
      albums: m.albums_count != null && m.albums_count > 0 ? String(m.albums_count) : '—',
      ringColor: idx % 2 === 0 ? 'cyan' : 'purple',
      confidence: m.confidence_level || (score >= 92 ? 'Strong Match' : score >= 85 ? 'Good Match' : 'Worth Considering'),
      source: m.source || 'Industry Match',
      writesOwn: m.writes_own === true,
      raw: m,
    }
  })
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

function ResultsView({ isDark, icons, uploadedFile, textPrimary, textMuted, matchResult, onUploadAnother, onDashboard, onPitch, pitchedKeys }: ResultsViewProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | '90plus' | 'whoslooking' | 'industry'>('all')
  const [pitchingArtist, setPitchingArtist] = useState<string | null>(null)

  // Sort dropdown — local state + outside-click close.
  const sortOptions = [
    { key: 'compat', label: 'Highest compatibility' },
    { key: 'leastCompat', label: 'Lowest compatibility' },
    { key: 'whoslooking', label: 'Who\'s Looking first' },
    { key: 'industry', label: 'Industry matches first' },
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

  // Build match cards from real API data
  const allMatches: MatchData[] = matchResult
    ? buildMatchData(matchResult.matches ?? [], icons, matchResult.detected_genre, matchResult.genre_tags ?? [])
    : []

  // Apply filter
  const filteredMatches = allMatches.filter((m) => {
    switch (activeFilter) {
      case '90plus':
        return m.match >= 90
      case 'whoslooking':
        return /who.?s looking/i.test(m.source)
      case 'industry':
        return /industry/i.test(m.source)
      case 'all':
      default:
        return true
    }
  })

  // Apply sort
  const sortedMatches = [...filteredMatches].sort((a, b) => {
    switch (sortKey) {
      case 'leastCompat':
        return a.match - b.match
      case 'whoslooking':
        return (/who.?s looking/i.test(b.source) ? 1 : 0) - (/who.?s looking/i.test(a.source) ? 1 : 0)
      case 'industry':
        return (/industry/i.test(b.source) ? 1 : 0) - (/industry/i.test(a.source) ? 1 : 0)
      case 'compat':
      default:
        return b.match - a.match
    }
  })

  const matches = sortedMatches
  const totalMatches = allMatches.length
  const summary = matchResult?.match_summary
  const strongOnly = allMatches.filter((m) => m.match >= 90).length

  // Derive track meta line
  const fileExt = (uploadedFile?.name || matchResult?.track_info?.filename || '').split('.').pop()?.toUpperCase() || ''
  const bpm = matchResult?.track_info?.bpm
  const trackFilename = matchResult?.track_info?.filename || uploadedFile?.name || 'Track'
  const detectedGenre = matchResult?.detected_genre
  const lyricsExtracted = matchResult?.lyrics_extracted ?? false
  const genreTags = matchResult?.genre_tags?.slice(0, 3) ?? []
  const language = matchResult?.detected_language

  // Cache indicator — show a "Cached" badge + a friendly relative time when
  // the backend returns a cached match instead of running the matcher fresh.
  const isCached = matchResult?.cached === true
  const cachedRelativeLabel = (() => {
    if (!isCached || !matchResult?.cached_at) return null
    const then = new Date(matchResult.cached_at).getTime()
    if (!Number.isFinite(then)) return null
    const diffMs = Date.now() - then
    const minutes = Math.floor(diffMs / 60_000)
    if (minutes < 60) return `${Math.max(1, minutes)}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  })()

  const filters = [
    { key: 'all' as const, label: `All (${totalMatches})` },
    { key: '90plus' as const, label: `90%+ matched${strongOnly > 0 ? ` (${strongOnly})` : ''}` },
    { key: 'whoslooking' as const, label: 'Who\'s Looking' },
    { key: 'industry' as const, label: 'Industry' },
  ]

  return (
    <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-6 xl:gap-7">
      {/* Cached result badge — in-flow at the top-right of the results page.
          Scrolls with the content (not fixed) so it only appears here, on
          the Matched results view, and not on any other tab. */}
      {isCached && (
        <div className="flex justify-end -mb-2">
          <span
            className="inline-flex items-center gap-2 px-4 py-[8px] rounded-full text-[12px] font-semibold font-poppins tracking-[0.5px] uppercase bg-gradient-to-r from-[#FFB547] to-[#FF8A4C] text-white shadow-[0_8px_24px_rgba(255,138,76,0.45)] border border-[rgba(255,255,255,0.20)]"
            title="Same audio file was matched before. Results returned from cache to keep them consistent across uploads."
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M8 2v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            Cached result{cachedRelativeLabel ? <> · {cachedRelativeLabel}</> : null}
          </span>
        </div>
      )}

      {/* Track summary card — exact CSS per spec.
          Tablet (md..xl):
            Row 1: [icon] [filename + meta]
            Row 2: [tags  |  Key + BPM]
            Row 3: [Matches found — full width]
          Desktop (xl+): single flex-row with original order (the inner
          `xl:contents` wrappers disappear from layout). */}
      <div style={summaryStyle} className="p-4 md:p-5 xl:p-[18px] flex flex-col xl:flex-row xl:items-center gap-5 xl:gap-6">
        {/* Group A: icon + track info — stays grouped on desktop too so a long
            filename has guaranteed room (flex-1 ensures it shares the row). */}
        <div className="flex items-center gap-4 xl:flex-1 xl:min-w-[260px]">
          {/* Music icon */}
          <div className="size-[56px] md:size-[68px] xl:size-[80px] rounded-[12px] bg-gradient-to-r from-pp-purple to-pp-purple-deep flex items-center justify-center shrink-0">
            <img src={icons.resMusicNote} alt="" className="size-[28px] md:size-[36px] xl:size-[44px] object-contain" />
          </div>

          {/* Track info — Manrope font */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`text-[18px] md:text-[20px] font-semibold font-manrope leading-tight truncate ${textPrimary}`} title={trackFilename}>
                {trackFilename}
              </p>
              {matchResult?.track_id != null && (
                <span
                  className="px-2 py-[3px] rounded-full text-[11px] font-semibold font-mono tracking-[0.5px] shrink-0"
                  style={{
                    background: isDark ? 'rgba(129,55,246,0.18)' : 'rgba(129,55,246,0.12)',
                    border: `1px solid ${isDark ? 'rgba(129,55,246,0.45)' : 'rgba(129,55,246,0.32)'}`,
                    color: isDark ? '#C4A4FF' : '#641ABE',
                  }}
                  title="Track reference ID — quote this when reporting bugs"
                >
                  {formatTrackId(matchResult.track_id)}
                </span>
              )}
            </div>
            <p className={`mt-1 text-[12px] font-normal font-poppins ${textMuted}`}>
              {fileExt && <span>{fileExt}<span className="mx-1">•</span></span>}
              {isCached
                ? <>Cached result{cachedRelativeLabel ? <> · matched {cachedRelativeLabel}</> : null}</>
                : <>Analysed just now</>}
              {lyricsExtracted && (<><span className="mx-1">•</span>Lyrics extracted</>)}
              {language && language !== 'en' && (<><span className="mx-1">•</span>{language.toUpperCase()}</>)}
            </p>
          </div>
        </div>

        {/* Group B: tags + divider + Key/BPM */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 xl:contents">
          {/* Tag chips — top-level genre tags from the AI analysis */}
          {genreTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 xl:gap-3">
              {genreTags.map((t) => (
                <span key={t} className={`${pillBaseCls} px-3 py-[6px] rounded-full text-[11px] font-normal tracking-[0.13px] font-poppins whitespace-nowrap`}>
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Divider — only when both tags and detected genre/BPM are visible */}
          {genreTags.length > 0 && (detectedGenre || bpm) && (
            <div className={`hidden md:block w-px h-6 xl:h-10 ${isDark ? 'bg-white/10' : 'bg-pp-purple/15'}`} />
          )}

          {/* Genre + BPM */}
          {(detectedGenre || bpm) && (
            <div className="flex items-center gap-2 xl:gap-3">
              {detectedGenre && (
                <span className={`${cyanPillCls} px-3 py-[6px] rounded-full text-[11px] font-medium tracking-[0.13px] font-poppins whitespace-nowrap`}>
                  {detectedGenre}
                </span>
              )}
              {bpm !== undefined && bpm > 0 && (
                <span className={`${cyanPillCls} px-3 py-[6px] rounded-full text-[11px] font-medium tracking-[0.13px] font-poppins whitespace-nowrap`}>
                  {bpm} BPM
                </span>
              )}
            </div>
          )}
        </div>

        {/* Matches found box — full-width on tablet, fixed-width on desktop */}
        <div className={`${matchesBoxCls} rounded-[14px] px-6 py-3 flex flex-col items-center justify-center w-full xl:w-auto xl:min-w-[110px] shrink-0`}>
          <span className={`text-[28px] xl:text-[32px] font-semibold font-poppins leading-none ${isDark ? 'text-white' : 'text-pp-navy'}`}>{totalMatches}</span>
          <span className={`mt-1 text-[12px] font-normal tracking-[1px] uppercase font-poppins ${isDark ? 'text-white/60' : 'text-pp-purple-deep/70'}`}>
            Matches Found
          </span>
        </div>
      </div>

      {/* Filter / sort bar.
          Mobile: sort dropdown on top (full-width), filter pills below.
          Tablet+: filter pills inline, sort dropdown at the end. */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className={`text-[18px] font-semibold font-manrope ${textPrimary}`}>
            Matched results ({matches.length}{matches.length !== totalMatches ? ` of ${totalMatches}` : ''})
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onDashboard}
              className={`${isDark ? 'bg-white/[0.04] border border-white/[0.10] text-white/85' : 'bg-white border border-[rgba(129,55,246,0.20)] text-pp-navy'} font-medium font-poppins text-[12px] h-[36px] px-4 rounded-[10px] flex items-center gap-2 hover:-translate-y-[1px] transition-all duration-200 ease-out whitespace-nowrap`}
              aria-label="Go to dashboard"
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="shrink-0">
                <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span className="hidden md:inline">Dashboard</span>
            </button>
            <button
              onClick={onUploadAnother}
              className={`${isDark ? 'bg-white/[0.04] border border-white/[0.10] text-white/85' : 'bg-white border border-[rgba(129,55,246,0.20)] text-pp-navy'} font-medium font-poppins text-[12px] h-[36px] px-4 rounded-[10px] flex items-center gap-2 hover:-translate-y-[1px] transition-all duration-200 ease-out whitespace-nowrap`}
              aria-label="Upload another track"
            >
              <img src={icons.uploadSmall} alt="" className="size-[14px] object-contain" />
              <span className="hidden md:inline">Upload another track</span>
              <span className="md:hidden">New track</span>
            </button>
          </div>
        </div>
        <div className="flex flex-col-reverse md:flex-row md:items-center gap-3">
          {/* Filter pills group — takes available space, wraps internally if needed */}
          <div className="flex flex-wrap items-center gap-3 md:flex-1 md:min-w-0">
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
          {/* Divider before sort — md+ */}
          <span className={`hidden md:block w-px h-6 ${isDark ? 'bg-white/15' : 'bg-pp-purple/15'} mx-1 shrink-0`} />
          {/* Sort dropdown — full-width on mobile, fixed on tablet+, stays inline with pills */}
          <div ref={sortRef} className="relative w-full md:w-[210px] md:shrink-0">
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

      {/* Empty state — no matches at all, or filter narrowed everything out */}
      {matches.length === 0 && (
        <div
          className={`${cardBg} rounded-[16px] xl:rounded-[18px] p-8 xl:p-10 flex flex-col items-center text-center gap-4`}
        >
          <div className="size-[64px] rounded-[16px] flex items-center justify-center" style={{
            background: isDark ? 'rgba(129,55,246,0.10)' : 'rgba(129,55,246,0.08)',
            border: `1px solid ${isDark ? 'rgba(129,55,246,0.30)' : 'rgba(129,55,246,0.20)'}`,
          }}>
            <img src={icons.target} alt="" className="size-7 object-contain" />
          </div>
          <div className="flex flex-col gap-2">
            <p className={`text-[18px] font-semibold font-manrope ${textPrimary}`}>
              {totalMatches === 0 ? 'No strong matches yet' : 'No matches for this filter'}
            </p>
            <p className={`text-[13px] xl:text-[14px] font-light leading-[1.6] font-poppins max-w-[440px] ${textMuted}`}>
              {totalMatches === 0
                ? "Our AI couldn't find artists confidently aligned with this track right now. Try a different track or check back as our database grows."
                : 'Try clearing the filter to see all matches.'}
            </p>
          </div>
          {totalMatches > 0 && (
            <button
              onClick={() => setActiveFilter('all')}
              className={`${isDark ? 'bg-white/[0.04] border border-white/[0.10] text-white/85' : 'bg-white border border-[rgba(129,55,246,0.20)] text-pp-navy'} font-medium font-poppins text-[13px] h-[40px] px-5 rounded-[10px] hover:-translate-y-[1px] transition-all duration-200 ease-out`}
            >
              Show all matches
            </button>
          )}
        </div>
      )}

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
                  {m.writesOwn && (
                    <span
                      className="self-start mt-[6px] inline-flex items-center gap-1 bg-[rgba(245,158,11,0.10)] border border-[#F59E0B]/60 text-[#F59E0B] px-2 py-[2px] rounded-full text-[10.5px] font-medium font-poppins"
                      title="This artist predominantly writes their own material and is unlikely to take an outside song."
                    >
                      ✎ Writes own material
                    </span>
                  )}
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
                {m.writesOwn ? (
                  <span className="self-start bg-[rgba(245,158,11,0.10)] border border-[#F59E0B] text-[#F59E0B] px-2 py-[2px] rounded-full text-[11px] font-medium font-poppins">
                    Writes own
                  </span>
                ) : (
                  <span className="self-start bg-[rgba(0,187,123,0.10)] border border-[#00BB7B] text-[#00BB7B] px-2 py-[2px] rounded-full text-[11px] font-medium font-poppins">
                    Active
                  </span>
                )}
              </div>
            </div>

            {/* Actions — pushed to the bottom of the card via mt-auto so every
                card lines up at the same baseline regardless of insight length. */}
            <div className="flex items-center gap-2 mt-auto pt-1">
              {(() => {
                const trackId = matchResult?.track_id
                const pitchKey = trackId !== undefined
                  ? `${trackId}:${m.name.toLowerCase()}`
                  : null
                const alreadyPitched = pitchKey !== null && pitchedKeys.has(pitchKey)
                const isPitching = pitchingArtist === m.id
                const disabled = alreadyPitched || isPitching || trackId === undefined
                const label = alreadyPitched
                  ? 'Pitched'
                  : isPitching
                    ? 'Sending…'
                    : `Pitch to ${m.name.split(' ')[0]}`
                const baseCls = alreadyPitched
                  ? `${isDark ? 'bg-white/[0.06] border border-[#00BB7B]/40 text-[#00BB7B]' : 'bg-[rgba(0,187,123,0.08)] border border-[#00BB7B] text-[#00BB7B]'} font-medium font-poppins text-[13px] h-[40px] rounded-[10px] flex-1 flex items-center justify-center gap-2`
                  : 'gradient-btn border border-white/[0.06] flex-1 text-white font-medium font-poppins text-[13px] h-[40px] rounded-[10px] flex items-center justify-center gap-2 hover:-translate-y-[1px] hover:shadow-[0_10px_24px_rgba(129,55,246,0.45)] active:translate-y-0 transition-all duration-200 ease-out disabled:opacity-60 disabled:pointer-events-none'
                return (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={async () => {
                      if (disabled || trackId === undefined) return
                      setPitchingArtist(m.id)
                      try {
                        await onPitch(m.raw, trackId)
                      } finally {
                        setPitchingArtist(null)
                      }
                    }}
                    className={baseCls}
                  >
                    {alreadyPitched ? (
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                        <path d="M5 10.5L8.5 14L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <img src={icons.resSend} alt="" className="size-4 object-contain" />
                    )}
                    <span>{label}</span>
                  </button>
                )
              })()}
              {(() => {
                // Prefer the verified Spotify profile URL (set by backend
                // enrichment). Fall back to the Deezer artist page so the
                // button is still useful when Spotify isn't configured or
                // the artist isn't found there.
                const profileUrl = m.raw.spotify_url
                  || (m.raw.deezer_id ? `https://www.deezer.com/artist/${m.raw.deezer_id}` : null)
                const disabled = !profileUrl
                return (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (!profileUrl) return
                      window.open(profileUrl, '_blank', 'noopener,noreferrer')
                    }}
                    className={`${viewProfileBtnCls} text-[13px] font-medium font-poppins h-[40px] px-4 rounded-[10px] hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200 ease-out flex items-center justify-center ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={profileUrl ? `Open ${m.name} on ${m.raw.spotify_url ? 'Spotify' : 'Deezer'}` : 'No profile link available'}
                  >
                    View profile
                  </button>
                )
              })()}
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

function ProfileDropdown({
  isDark,
  onLogout,
  onSettings,
  email,
  displayName,
}: {
  isDark: boolean
  onLogout: () => void
  onSettings: () => void
  email: string
  displayName: string
}) {
  const shellCls = isDark
    ? 'bg-[#160B33] border border-white/[0.08] shadow-[0_18px_50px_rgba(0,0,0,0.5)]'
    : 'bg-white border border-[rgba(129,55,246,0.15)] shadow-[0_18px_50px_rgba(60,30,140,0.18)]'
  const itemHover = isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-[rgba(129,55,246,0.06)]'
  const itemText = isDark ? 'text-white/85' : 'text-pp-navy'
  const dividerCls = isDark ? 'border-white/[0.08]' : 'border-[rgba(129,55,246,0.12)]'
  const textMuted = isDark ? 'text-white/55' : 'text-pp-navy/55'
  const dangerColor = isDark ? '#FF8A8A' : '#C73030'

  return (
    <div
      data-pp-popover
      role="menu"
      className={`absolute top-full right-0 mt-2 w-[240px] rounded-[14px] overflow-hidden z-50 card-swap-in ${shellCls}`}
    >
      {/* Header — current account */}
      <div className={`px-4 py-3 border-b ${dividerCls}`}>
        <p className={`text-[13px] font-semibold font-poppins truncate ${itemText}`}>{displayName}</p>
        <p className={`text-[11px] font-poppins truncate ${textMuted}`}>{email}</p>
      </div>

      {/* Account settings — the button gets itemText so the SVG's
          currentColor inherits the right theme tint (white-ish in dark,
          navy in light). Without this the icon went invisible in dark mode. */}
      <button
        role="menuitem"
        onClick={onSettings}
        className={`w-full flex items-center gap-3 px-4 py-[10px] text-left transition-colors ${itemHover} ${itemText}`}
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="shrink-0">
          <circle cx="10" cy="7" r="3.2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M4.5 16.5c.5-3 2.6-4.6 5.5-4.6s5 1.6 5.5 4.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span className={`text-[14px] font-medium font-poppins ${itemText}`}>Account settings</span>
      </button>

      {/* Logout */}
      <button
        role="menuitem"
        onClick={onLogout}
        className={`w-full flex items-center gap-3 px-4 py-[10px] text-left transition-colors border-t ${dividerCls} ${itemHover}`}
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="shrink-0">
          <path d="M12.5 14.1667L16.6667 10L12.5 5.83333" stroke={dangerColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16.6667 10H7.5" stroke={dangerColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.16667 17.5H5C4.55797 17.5 4.13405 17.3244 3.82149 17.0118C3.50893 16.6993 3.33333 16.2754 3.33333 15.8333V4.16667C3.33333 3.72464 3.50893 3.30072 3.82149 2.98816C4.13405 2.67559 4.55797 2.5 5 2.5H9.16667" stroke={dangerColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[14px] font-medium font-poppins" style={{ color: dangerColor }}>Logout</span>
      </button>
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

/* ============================================================
   MY TRACKS TAB
   ============================================================ */

interface MyTracksTabProps {
  isDark: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icons: any
  textPrimary: string
  textMuted: string
  tracks: TrackSummary[]
  loading: boolean
  error: string | null
  onOpen: (id: number) => void
  onDelete: (id: number) => void
  onUploadNew: () => void
  onListen: (track: TrackSummary) => void
}

// Format a track's database id as a user-visible reference Ciara can quote
// in bug reports / emails ("PP-247 isn't matching properly"). Zero-padded
// to 3 chars so low IDs look intentional (PP-001 not PP-1); IDs above 999
// just show their full digits.
function formatTrackId(id: number | null | undefined): string {
  if (id == null || !Number.isFinite(id)) return ''
  return `PP-${String(id).padStart(3, '0')}`
}

function formatRelativeDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const diffMs = Date.now() - date.getTime()
  const day = 24 * 60 * 60 * 1000
  if (diffMs < day) return 'Today'
  if (diffMs < 2 * day) return 'Yesterday'
  if (diffMs < 7 * day) return `${Math.floor(diffMs / day)} days ago`
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

function MyTracksTab({ isDark, icons, textPrimary, textMuted, tracks, loading, error, onOpen, onDelete, onUploadNew, onListen }: MyTracksTabProps) {
  const meta = TAB_META['my-tracks']
  const cardBg = isDark
    ? 'bg-white/[0.03] border border-white/[0.06]'
    : 'bg-white border border-[rgba(129,55,246,0.12)]'
  const pillBaseCls = isDark
    ? 'bg-white/[0.04] border border-white/[0.08] text-white/70'
    : 'bg-white border border-[rgba(129,55,246,0.15)] text-pp-navy/70'
  const cyanPillCls = isDark
    ? 'bg-[rgba(0,184,215,0.10)] border border-[rgba(0,184,215,0.40)] text-pp-blue'
    : 'bg-[rgba(0,184,215,0.08)] border border-[rgba(0,184,215,0.40)] text-pp-blue'

  return (
    <div className="w-full xl:w-[1100px] max-w-[1100px] mx-auto flex flex-col gap-[40px] md:gap-[48px] xl:gap-[56px] self-start">
      {/* Centered hero heading — matches the My Matches layout */}
      <div className="flex flex-col items-center text-center gap-[14px] md:gap-[16px]">
        <p className="text-pp-purple text-[13px] font-medium tracking-[0.26px] uppercase font-poppins">
          {meta.eyebrow}
        </p>
        <h1 className={`text-[32px] md:text-[32px] xl:text-[42px] font-semibold leading-[1.2] xl:leading-[1.25] font-poppins ${textPrimary}`}>
          {meta.title} <span className="gradient-text">{meta.gradient}</span>
        </h1>
        <p className={`text-[14px] md:text-[14px] xl:text-[16px] font-normal leading-[1.6] tracking-[0.16px] font-poppins max-w-[700px] ${textMuted}`}>
          {meta.subtitle}
        </p>
      </div>

      {/* Section action — sits above the list, right-aligned */}
      {tracks.length > 0 && !loading && (
        <div className="flex items-center justify-between gap-3 -mb-2">
          <h2 className={`text-[18px] font-semibold font-manrope ${textPrimary}`}>
            {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
          </h2>
          <button
            onClick={onUploadNew}
            className="gradient-btn pp-btn-lift border border-white/[0.06] text-white font-medium font-poppins text-[13px] md:text-[14px] h-[44px] px-4 md:px-5 rounded-[10px] flex items-center gap-2"
          >
            <img src={icons.uploadSmall} alt="" className="size-[16px] object-contain" />
            <span>Upload new</span>
          </button>
        </div>
      )}

      {/* States */}
      {loading && (
        <div className={`${cardBg} rounded-[16px] p-10 text-center`}>
          <p className={`text-[14px] font-poppins ${textMuted}`}>Loading your tracks…</p>
        </div>
      )}

      {!loading && error && (
        <div
          role="alert"
          className="flex items-start gap-[10px] px-[14px] py-[12px] rounded-[12px] font-poppins"
          style={{
            background: isDark ? 'rgba(255,107,107,0.07)' : 'rgba(220,38,38,0.05)',
            border: `1px solid ${isDark ? 'rgba(255,107,107,0.28)' : 'rgba(220,38,38,0.22)'}`,
          }}
        >
          <p className="text-[13px] font-light leading-[1.5]" style={{ color: isDark ? '#FFB8B8' : '#B42323' }}>{error}</p>
        </div>
      )}

      {!loading && !error && tracks.length === 0 && (
        <div className={`${cardBg} rounded-[16px] xl:rounded-[18px] p-8 xl:p-10 flex flex-col items-center text-center gap-4`}>
          <div className="size-[64px] rounded-[16px] flex items-center justify-center" style={{
            background: isDark ? 'rgba(129,55,246,0.10)' : 'rgba(129,55,246,0.08)',
            border: `1px solid ${isDark ? 'rgba(129,55,246,0.30)' : 'rgba(129,55,246,0.20)'}`,
          }}>
            <img src={icons.music} alt="" className="size-7 object-contain" />
          </div>
          <div className="flex flex-col gap-2">
            <p className={`text-[18px] font-semibold font-manrope ${textPrimary}`}>No tracks yet</p>
            <p className={`text-[13px] xl:text-[14px] font-light leading-[1.6] font-poppins max-w-[440px] ${textMuted}`}>
              Upload a song from the My Matches tab and it'll appear here so you can revisit the matches later.
            </p>
          </div>
          <button
            onClick={onUploadNew}
            className="gradient-btn pp-btn-lift border border-white/[0.06] text-white font-medium font-poppins text-[13px] h-[40px] px-5 rounded-[10px]"
          >
            Upload your first track
          </button>
        </div>
      )}

      {/* List */}
      {!loading && tracks.length > 0 && (
        <div className="flex flex-col gap-3">
          {tracks.map((t) => (
            <div
              key={t.id}
              className={`${cardBg} rounded-[16px] p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4`}
            >
              {/* Icon + filename + meta */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="size-[48px] rounded-[12px] bg-gradient-to-r from-pp-purple to-pp-purple-deep flex items-center justify-center shrink-0">
                  <img src={icons.musicNote} alt="" className="size-[24px] object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-[15px] font-semibold font-manrope leading-tight truncate ${textPrimary}`}>{t.filename}</p>
                    <span
                      className="px-2 py-[2px] rounded-full text-[10px] font-semibold font-mono tracking-[0.5px] shrink-0"
                      style={{
                        background: isDark ? 'rgba(129,55,246,0.15)' : 'rgba(129,55,246,0.10)',
                        border: `1px solid ${isDark ? 'rgba(129,55,246,0.40)' : 'rgba(129,55,246,0.30)'}`,
                        color: isDark ? '#C4A4FF' : '#641ABE',
                      }}
                      title="Track reference ID — quote this when reporting bugs"
                    >
                      {formatTrackId(t.id)}
                    </span>
                  </div>
                  <p className={`mt-1 text-[12px] font-normal font-poppins ${textMuted}`}>
                    {formatRelativeDate(t.created_at)}
                    {t.detected_genre && (<><span className="mx-1">•</span>{t.detected_genre}</>)}
                    {t.bpm ? (<><span className="mx-1">•</span>{t.bpm} BPM</>) : null}
                    {t.lyrics_extracted && (<><span className="mx-1">•</span>Lyrics</>)}
                  </p>
                </div>
              </div>

              {/* Counts */}
              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                <span className={`${cyanPillCls} px-3 py-[6px] rounded-full text-[11px] font-medium font-poppins whitespace-nowrap`}>
                  {t.matches_count} {t.matches_count === 1 ? 'match' : 'matches'}
                </span>
                <span className={`${pillBaseCls} px-3 py-[6px] rounded-full text-[11px] font-normal font-poppins whitespace-nowrap`}>
                  {t.pitches_count} pitched
                </span>
                {t.listening_url && (
                  <span
                    className="px-3 py-[6px] rounded-full text-[11px] font-medium font-poppins whitespace-nowrap inline-flex items-center gap-1"
                    style={{
                      background: 'rgba(0,184,215,0.10)',
                      border: '1px solid rgba(0,184,215,0.35)',
                      color: '#00B8D7',
                    }}
                    title={(t.listen_count ?? 0) > 0 ? `Streaming link opened ${t.listen_count} time${t.listen_count === 1 ? '' : 's'}` : 'Streaming link active — share with artists'}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18V6L21 12L9 18Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                      <path d="M3 8V16M6 6V18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    {(t.listen_count ?? 0)} listen{(t.listen_count ?? 0) === 1 ? '' : 's'}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {t.listening_url && (
                  <button
                    onClick={() => onListen(t)}
                    className={`${isDark ? 'bg-white/[0.04] border border-white/[0.10] text-white/85 hover:bg-white/[0.08]' : 'bg-white border border-[rgba(129,55,246,0.20)] text-pp-navy hover:bg-[rgba(129,55,246,0.04)]'} font-medium font-poppins text-[13px] h-[40px] px-3 rounded-[10px] flex items-center gap-2 whitespace-nowrap`}
                    aria-label="Listen to track"
                    title="Preview your track in a quick popup (no counter increment)"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7L8 5z" />
                    </svg>
                    <span className="hidden md:inline">Listen</span>
                  </button>
                )}
                <button
                  onClick={() => onOpen(t.id)}
                  className="gradient-btn pp-btn-lift border border-white/[0.06] text-white font-medium font-poppins text-[13px] h-[40px] px-4 rounded-[10px] whitespace-nowrap"
                >
                  View matches
                </button>
                <button
                  onClick={() => onDelete(t.id)}
                  className={`${isDark ? 'bg-white/[0.04] border border-white/[0.10] text-white/70 hover:bg-white/[0.08]' : 'bg-white border border-[rgba(129,55,246,0.20)] text-pp-navy/70 hover:bg-[rgba(129,55,246,0.04)]'} font-medium font-poppins text-[13px] h-[40px] px-3 rounded-[10px]`}
                  aria-label="Delete track"
                  title="Delete track"
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M3.33 5h13.34M8.33 9.17v5M11.67 9.17v5M4.17 5l.83 10c0 .92.75 1.67 1.67 1.67h6.67c.92 0 1.67-.75 1.67-1.67L15.83 5M7.5 5V3.33c0-.46.37-.83.83-.83h3.34c.46 0 .83.37.83.83V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ============================================================
   PITCHES SENT TAB
   ============================================================ */

interface PitchesSentTabProps {
  isDark: boolean
  textPrimary: string
  textMuted: string
  pitches: Pitch[]
  loading: boolean
  error: string | null
  onDelete: (id: number) => void
  onUploadNew: () => void
}

function PitchesSentTab({ isDark, textPrimary, textMuted, pitches, loading, error, onDelete, onUploadNew }: PitchesSentTabProps) {
  const meta = TAB_META['pitches-sent']
  const cardBg = isDark
    ? 'bg-white/[0.03] border border-white/[0.06]'
    : 'bg-white border border-[rgba(129,55,246,0.12)]'

  const confidenceStyle = (level: string | null) => {
    if (!level) return { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.10)', color: isDark ? 'rgba(255,255,255,0.7)' : '#26114A' }
    const lower = level.toLowerCase()
    if (lower.includes('strong')) return { bg: 'rgba(0,187,123,0.10)', border: '#00BB7B', color: '#00BB7B' }
    if (lower.includes('good')) return { bg: 'rgba(0,184,215,0.10)', border: '#00B8D7', color: '#00B8D7' }
    return { bg: 'rgba(129,55,246,0.10)', border: '#8137F6', color: '#8137F6' }
  }

  return (
    <div className="w-full xl:w-[1100px] max-w-[1100px] mx-auto flex flex-col gap-[40px] md:gap-[48px] xl:gap-[56px] self-start">
      {/* Centered hero heading — matches the My Matches layout */}
      <div className="flex flex-col items-center text-center gap-[14px] md:gap-[16px]">
        <p className="text-pp-purple text-[13px] font-medium tracking-[0.26px] uppercase font-poppins">
          {meta.eyebrow}
        </p>
        <h1 className={`text-[32px] md:text-[32px] xl:text-[42px] font-semibold leading-[1.2] xl:leading-[1.25] font-poppins ${textPrimary}`}>
          {meta.title} <span className="gradient-text">{meta.gradient}</span>
        </h1>
        <p className={`text-[14px] md:text-[14px] xl:text-[16px] font-normal leading-[1.6] tracking-[0.16px] font-poppins max-w-[700px] ${textMuted}`}>
          {meta.subtitle}
        </p>
      </div>

      {/* Section action — sits above the list, right-aligned */}
      {pitches.length > 0 && !loading && (
        <div className="flex items-center justify-between gap-3 -mb-2">
          <h2 className={`text-[18px] font-semibold font-manrope ${textPrimary}`}>
            {pitches.length} {pitches.length === 1 ? 'pitch' : 'pitches'}
          </h2>
          <button
            onClick={onUploadNew}
            className="gradient-btn border border-white/[0.06] text-white font-medium font-poppins text-[13px] md:text-[14px] h-[44px] px-4 md:px-5 rounded-[10px] flex items-center gap-2 hover:-translate-y-[1px] hover:shadow-[0_10px_24px_rgba(129,55,246,0.45)] transition-all whitespace-nowrap"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="shrink-0">
              <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>New match</span>
          </button>
        </div>
      )}

      {/* States */}
      {loading && (
        <div className={`${cardBg} rounded-[16px] p-10 text-center`}>
          <p className={`text-[14px] font-poppins ${textMuted}`}>Loading your pitches…</p>
        </div>
      )}

      {!loading && error && (
        <div
          role="alert"
          className="flex items-start gap-[10px] px-[14px] py-[12px] rounded-[12px] font-poppins"
          style={{
            background: isDark ? 'rgba(255,107,107,0.07)' : 'rgba(220,38,38,0.05)',
            border: `1px solid ${isDark ? 'rgba(255,107,107,0.28)' : 'rgba(220,38,38,0.22)'}`,
          }}
        >
          <p className="text-[13px] font-light leading-[1.5]" style={{ color: isDark ? '#FFB8B8' : '#B42323' }}>{error}</p>
        </div>
      )}

      {!loading && !error && pitches.length === 0 && (
        <div className={`${cardBg} rounded-[16px] xl:rounded-[18px] p-8 xl:p-10 flex flex-col items-center text-center gap-4`}>
          <div className="size-[64px] rounded-[16px] flex items-center justify-center" style={{
            background: isDark ? 'rgba(129,55,246,0.10)' : 'rgba(129,55,246,0.08)',
            border: `1px solid ${isDark ? 'rgba(129,55,246,0.30)' : 'rgba(129,55,246,0.20)'}`,
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" stroke={isDark ? 'white' : '#26114A'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex flex-col gap-2">
            <p className={`text-[18px] font-semibold font-manrope ${textPrimary}`}>No pitches sent yet</p>
            <p className={`text-[13px] xl:text-[14px] font-light leading-[1.6] font-poppins max-w-[440px] ${textMuted}`}>
              When you tap "Pitch to artist" on a match, it'll appear here so you can track who you've reached out to.
            </p>
          </div>
        </div>
      )}

      {/* List */}
      {!loading && pitches.length > 0 && (
        <div className="flex flex-col gap-3">
          {pitches.map((p) => {
            const cs = confidenceStyle(p.confidence_level)
            return (
              <div
                key={p.id}
                className={`${cardBg} rounded-[16px] p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {p.artist_image ? (
                    <div className="size-[44px] rounded-full overflow-hidden shrink-0 bg-gradient-to-r from-pp-purple to-pp-purple-deep">
                      <img
                        src={p.artist_image}
                        alt={p.artist_name}
                        className="size-full object-cover"
                        onError={(e) => {
                          // If the image URL is broken, hide it so the gradient
                          // circle behind shows through as a graceful fallback.
                          ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  ) : (
                    <div className="size-[44px] rounded-full bg-gradient-to-r from-pp-purple to-pp-purple-deep flex items-center justify-center shrink-0 text-white font-semibold font-poppins text-[15px]">
                      {p.artist_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[15px] font-semibold font-manrope leading-tight truncate ${textPrimary}`}>{p.artist_name}</p>
                    <p className={`mt-1 text-[12px] font-normal font-poppins ${textMuted}`}>
                      <span className="font-semibold text-pp-purple font-mono tracking-[0.5px]">{formatTrackId(p.track_id)}</span>
                      <span className="mx-1">·</span>
                      {p.track_filename ?? 'Unknown track'}
                      {p.label && (<><span className="mx-1">•</span>{p.label}</>)}
                      <span className="mx-1">•</span>
                      {formatRelativeDate(p.created_at)}
                    </p>
                  </div>
                </div>

                {/* Confidence */}
                <div className="flex items-center gap-2 md:gap-3">
                  {p.confidence_level && (
                    <span
                      className="px-3 py-[6px] rounded-full text-[11px] font-medium font-poppins whitespace-nowrap"
                      style={{ background: cs.bg, border: `1px solid ${cs.border}`, color: cs.color }}
                    >
                      {p.confidence_level}
                    </span>
                  )}
                  <span
                    className={`${isDark ? 'bg-white/[0.04] border border-white/[0.08] text-white/70' : 'bg-white border border-[rgba(129,55,246,0.15)] text-pp-navy/70'} px-3 py-[6px] rounded-full text-[11px] font-normal font-poppins whitespace-nowrap`}
                  >
                    {Math.round(p.final_score * 100)}% match
                  </span>
                </div>

                {/* Status pill */}
                <span className="bg-[rgba(0,187,123,0.10)] border border-[#00BB7B] text-[#00BB7B] px-3 py-[6px] rounded-full text-[11px] font-medium font-poppins whitespace-nowrap shrink-0">
                  {p.status}
                </span>

                <button
                  onClick={() => onDelete(p.id)}
                  className={`${isDark ? 'bg-white/[0.04] border border-white/[0.10] text-white/70 hover:bg-white/[0.08]' : 'bg-white border border-[rgba(129,55,246,0.20)] text-pp-navy/70 hover:bg-[rgba(129,55,246,0.04)]'} font-medium font-poppins text-[13px] h-[40px] px-3 rounded-[10px] shrink-0`}
                  aria-label="Delete pitch"
                  title="Delete pitch"
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M3.33 5h13.34M8.33 9.17v5M11.67 9.17v5M4.17 5l.83 10c0 .92.75 1.67 1.67 1.67h6.67c.92 0 1.67-.75 1.67-1.67L15.83 5M7.5 5V3.33c0-.46.37-.83.83-.83h3.34c.46 0 .83.37.83.83V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
