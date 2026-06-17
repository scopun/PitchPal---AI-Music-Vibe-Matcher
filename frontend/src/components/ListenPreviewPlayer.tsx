import { useEffect, useRef, useState } from 'react'

interface ListenPreviewPlayerProps {
  audioUrl: string
  filename: string
  trackIdLabel: string // e.g. "PP-001"
  detectedGenre?: string | null
  bpm?: number | null
  audioExpiresAt?: string | null
}

// PitchPal logo as inline SVG so the modal player matches the listening page
// without an extra network request. Source: /assets/icons/dark/upload/Logo.svg.
const PITCHPAL_LOGO = (
  <svg width="110" height="32" viewBox="0 0 125 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="PitchPal">
    <path fillRule="evenodd" clipRule="evenodd" d="M18.1929 0.000955049C25.6609 0.0778808 32.3066 4.75485 34.897 11.7568C37.4872 18.7589 35.4842 26.6327 29.8628 31.5478C28.8201 32.4595 27.6753 33.249 26.4517 33.8984C21.6844 36.4282 16.0329 36.6869 11.0542 34.6035C9.15166 33.8073 7.39958 32.6899 5.87548 31.3008C0.356778 26.2709 -1.48329 18.3572 1.25048 11.4101C3.98455 4.46327 10.7252 -0.0756585 18.1929 0.000955049ZM17.2036 10.8301C16.785 11.0036 16.4191 11.1959 16.2309 11.6367C16.0008 12.1834 15.9977 24.3038 16.2085 24.8213C16.3507 25.1691 16.599 25.4567 16.9546 25.5918C17.2117 25.6894 17.4883 25.6807 17.7573 25.6455C18.146 25.4914 18.5641 25.2931 18.7368 24.8818C18.8783 24.5393 18.8796 13.9018 18.8413 12.6709C18.8311 12.3419 18.8346 11.8527 18.6977 11.5517C18.5503 11.2279 18.2137 11.0157 17.8882 10.9053C17.6607 10.8282 17.4414 10.8241 17.2036 10.8301ZM13.5249 12.7021C13.0169 12.8631 12.7759 13.0107 12.4839 13.4785C12.2874 14.6772 12.4026 16.808 12.3999 18.0693C12.3978 19.0454 12.2501 22.6931 12.6167 23.2226C12.8329 23.5367 13.1727 23.744 13.5513 23.791C13.6879 23.8091 13.8875 23.8108 14.0278 23.8076C14.4111 23.6314 14.931 23.3334 15.0073 22.9394C15.2395 21.7369 15.2568 14.012 14.9643 13.4316C14.8022 13.1065 14.5117 12.864 14.1626 12.7627C13.9714 12.7053 13.7248 12.687 13.5249 12.7021ZM20.9985 12.6953C19.7755 13.0073 19.8298 13.8476 19.8296 14.9179C19.8292 17.3299 19.829 19.7425 19.8413 22.1543C19.8471 23.2774 20.3054 23.8434 21.4839 23.8037C21.8935 23.6346 22.2924 23.3969 22.4634 22.9638C22.7311 22.2851 22.6651 15.4777 22.6001 14.3945C22.5819 14.0911 22.5686 13.7647 22.4399 13.4853C22.2795 13.1371 21.9892 12.8981 21.6304 12.7724C21.4294 12.7021 21.2103 12.689 20.9985 12.6953ZM9.81884 15.4922C9.45296 15.6244 8.95429 15.8227 8.81982 16.2246C8.52266 17.1129 8.58249 18.2297 8.604 19.1719C8.63091 20.3476 9.08526 21.0318 10.272 21.0049C11.4458 20.6561 11.4326 19.644 11.4458 18.6123C11.4616 17.383 11.6407 15.3628 9.81884 15.4922ZM24.645 15.4941C23.2717 16.0705 23.4959 17.2179 23.4643 18.4726C23.4321 19.7506 23.5758 21.0673 25.1684 20.998C26.7525 20.5307 26.2419 18.6794 26.3296 17.375C26.4056 16.2446 25.8472 15.4586 24.645 15.4941Z" fill="#00B8D7"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M94.535 10.0358C97.443 10.0571 100.879 9.83645 103.703 10.2839C107.224 10.842 108.092 16.3509 105.817 18.6647C104.464 20.0417 102.782 20.1913 100.948 20.2419L98.1376 20.2487C98.0695 22.1725 98.1132 24.3456 98.1132 26.2888H94.5399C94.4546 20.9667 94.5135 15.369 94.535 10.0358ZM98.1317 13.0642C98.111 14.4519 98.1096 15.8404 98.1268 17.2282C99.6546 17.2381 101.491 17.4719 102.7 16.5241C103.484 15.6747 103.744 14.5777 102.787 13.7341C101.638 12.7211 99.5516 13.1988 98.1317 13.0642Z" fill="#00B8D7"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M45.4941 10.0189C47.6674 10.0709 50.0259 9.84966 52.1552 10.3383C55.5562 11.1189 56.2672 16.3115 54.1347 18.6351C52.8544 20.0297 50.9772 20.1665 49.2119 20.2416C48.2844 20.2584 47.3284 20.2502 46.3984 20.2533C46.3031 22.1584 46.352 24.3531 46.3564 26.2865C45.1797 26.2964 44.0028 26.2974 42.8261 26.2894C42.743 24.2161 42.8011 21.8307 42.7998 19.726C42.786 16.4973 42.7887 13.2681 42.8085 10.0394C43.6769 10.0101 44.6105 9.99937 45.4941 10.0189ZM51.0556 13.7514C50.0341 12.8472 47.6834 13.0554 46.3857 13.0599C46.3362 14.2971 46.3201 15.9824 46.3681 17.2338C47.8723 17.241 49.6636 17.426 50.9277 16.5717C51.7586 15.7143 52.0194 14.6048 51.0556 13.7514Z" fill="#FEFEFE"/>
    <path d="M81.5718 10.0407C82.6064 10.0097 83.6409 10.0185 84.6747 10.067C84.7005 11.3055 84.7626 14.3878 84.6134 15.4561C85.6635 14.6369 86.7852 14.2292 88.1086 14.232C92.5608 14.2412 92.1685 17.94 92.1616 21.1772C92.1676 22.8821 92.1512 24.5871 92.1133 26.2915C91.0166 26.3009 89.9002 26.2853 88.8018 26.2807C88.7768 24.6439 88.7699 23.007 88.7811 21.3702C88.7828 20.3816 88.9466 18.038 88.2457 17.4027C86.868 16.176 85.0075 17.3613 84.8255 19.0323C84.5729 21.3628 84.6833 23.9262 84.6695 26.2833C83.5573 26.2932 82.4451 26.2934 81.3321 26.2837C81.2717 22.6571 81.3355 18.9573 81.3097 15.3238C81.3036 14.4589 81.2528 10.7934 81.3571 10.1121L81.5718 10.0407Z" fill="#FEFEFE"/>
    <path d="M113.53 14.1718C119.979 14.2735 118.081 18.279 118.423 23.0126C118.507 24.1853 118.735 25.1663 119.076 26.2743C117.963 26.3047 116.848 26.3071 115.735 26.2811L115.298 25.1776C113.285 26.9755 109.843 27.1829 108.302 24.66C108.165 24.3035 108.078 23.9411 108.015 23.5653C107.168 18.5382 114.089 19.6277 114.979 18.2792C115.059 18.1585 115.085 17.9826 115.053 17.8397C114.994 17.5811 114.778 17.2907 114.559 17.1464C114.083 16.8341 113.4 16.7642 112.856 16.8973C112.067 17.0908 111.611 17.5755 111.201 18.2362C110.202 18.1203 109.208 17.9577 108.225 17.7499C108.8 14.7486 110.934 14.2942 113.53 14.1718ZM114.715 20.9608C113.447 21.2052 109.63 21.9285 112.058 23.8241C113.852 24.7301 115.331 22.7099 115.084 21.1132L114.973 20.9608H114.715Z" fill="#00B8D7"/>
    <path d="M74.7737 14.2557C77.8136 14.1106 79.1456 15.4098 80.1078 18.1124C79.1137 18.3806 77.8093 18.5286 76.7747 18.6709C76.5066 18.0272 76.2393 17.3201 75.5324 17.0598C74.3331 16.6183 73.0968 17.3544 72.7252 18.5291C72.3493 19.7181 72.3838 21.218 72.8726 22.3649C73.352 23.4881 74.5762 23.9899 75.6876 23.4993C76.4135 23.1638 76.7221 22.2473 76.9446 21.508L79.0577 21.8866L80.2414 22.1014C79.5233 24.9887 78.2904 26.1944 75.1703 26.4993C69.2223 27.0802 67.4014 19.9295 70.4914 15.9304C71.4785 14.652 73.1658 14.3337 74.7737 14.2557Z" fill="#FEFEFE"/>
    <path d="M65.984 10.3534C66.172 10.5929 66.0961 13.8498 66.0952 14.3929C66.8401 14.3993 67.4462 14.4104 68.1937 14.4765L68.2032 17.1492L66.1392 17.1785C66.1177 18.1423 65.9056 23.0397 66.4203 23.5175C67.0367 23.6787 67.5807 23.5318 68.198 23.4102C68.317 24.3364 68.3817 25.2687 68.3911 26.2025C67.529 26.4196 66.8712 26.4844 65.9909 26.5371C65.1262 26.5176 64.1442 26.3912 63.5019 25.7557C62.3328 24.5987 62.6897 19.0209 62.6897 17.1768L61.2818 17.1466C61.2758 16.2454 61.2775 15.3441 61.287 14.4429L62.6716 14.4087L62.7259 12.1814C63.7157 11.446 64.871 10.8749 65.984 10.3534Z" fill="#FEFEFE"/>
    <path d="M120.902 10.0228C122.017 10.0225 123.132 10.0352 124.247 10.0609C124.29 15.4702 124.291 20.8797 124.25 26.2889L120.908 26.2927C120.842 20.9252 120.88 15.3931 120.902 10.0228Z" fill="#00B8D7"/>
    <path d="M58.4295 14.4339C59.0951 14.4228 59.7003 14.4406 60.3651 14.4658C60.4297 18.3304 60.3763 22.4172 60.3349 26.2851L58.9675 26.2934L57.0139 26.2869C56.9035 22.5121 56.9958 18.2742 57.0018 14.4715C57.4398 14.4409 57.9838 14.443 58.4295 14.4339Z" fill="#FEFEFE"/>
    <path d="M57.3071 10.038C58.3615 10.0211 59.2943 10.0192 60.3479 10.0609C60.3556 10.6256 60.466 12.7869 60.2324 13.1056L60.0022 13.1409C59.0038 13.1529 58.0054 13.1479 57.0071 13.126C56.9924 12.5482 56.9036 10.5384 57.0795 10.1081L57.3071 10.038Z" fill="#FEFEFE"/>
  </svg>
)

const fmt = (s: number): string => {
  if (!isFinite(s)) return '—'
  const m = Math.floor(s / 60)
  const ss = Math.floor(s % 60).toString().padStart(2, '0')
  return `${m}:${ss}`
}

export default function ListenPreviewPlayer({
  audioUrl,
  filename,
  trackIdLabel,
  detectedGenre,
  bpm,
  audioExpiresAt,
}: ListenPreviewPlayerProps) {
  // "Available for X more days" — quick relative-days calc the same way
  // the public listening page renders it.
  const expiresLabel = (() => {
    if (!audioExpiresAt) return ''
    const then = new Date(audioExpiresAt).getTime()
    if (!Number.isFinite(then)) return ''
    const diffMs = then - Date.now()
    const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
    return `Available for ${days} more day${days === 1 ? '' : 's'}`
  })()
  const audioRef = useRef<HTMLAudioElement>(null)
  const eqRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const freqDataRef = useRef<Uint8Array | null>(null)
  const rafRef = useRef<number | null>(null)
  const barsRef = useRef<HTMLSpanElement[]>([])
  // If the visualiser receives all-zero frames for a while, the R2 audio
  // is CORS-tainted (bucket CORS not yet applied) and Web Audio can't
  // analyse it. We count consecutive zero frames and, once we're sure,
  // tear down the visualiser so the CSS bounce fallback takes over.
  const zeroFramesRef = useRef(0)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  // Volume is currently driven directly by the audio element via the
  // mute button. We don't render a slider here, so volume state isn't
  // surfaced — but we still set the audio.volume to 0.8 on mount below.
  const [muted, setMuted] = useState(false)
  // Track Web Audio activity in React state so the className survives
  // re-renders. Adding the class via classList.add() was getting wiped
  // every time the component re-rendered (e.g. on every timeupdate),
  // which left the CSS bounce animation fighting with the JS-driven
  // transform and the bars stuck at full height.
  const [webAudioActive, setWebAudioActive] = useState(false)

  // Populate equaliser bars based on width
  useEffect(() => {
    const eq = eqRef.current
    if (!eq) return
    const width = eq.clientWidth || 480
    const barCount = Math.max(24, Math.min(48, Math.floor(width / 14)))
    const frag = document.createDocumentFragment()
    for (let i = 0; i < barCount; i++) {
      const span = document.createElement('span')
      const delay = ((i / barCount) * 1.2).toFixed(2)
      const dur = (0.75 + ((i % 5) * 0.06)).toFixed(2)
      span.style.setProperty('--eq-delay', `${delay}s`)
      span.style.setProperty('--eq-dur', `${dur}s`)
      frag.appendChild(span)
    }
    eq.innerHTML = ''
    eq.appendChild(frag)
    barsRef.current = Array.from(eq.children) as HTMLSpanElement[]
  }, [])

  // Initial volume — fixed at 80% so we don't have to wire a slider here.
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = 0.8
  }, [])

  // Stop and cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (audioRef.current) {
        audioRef.current.pause()
      }
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close() } catch { /* ignore */ }
      }
    }
  }, [])

  // Auto-play on mount — the user clicked "Listen" so we're inside their
  // gesture window and the browser autoplay policy allows it. We also
  // initialise the audio graph here so the visualiser is connected before
  // the first frame plays.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const tryPlay = async () => {
      const ok = initAudioGraph()
      if (audioCtxRef.current?.state === 'suspended') {
        try { await audioCtxRef.current.resume() } catch { /* ignore */ }
      }
      try {
        await audio.play()
        if (ok && !rafRef.current) rafRef.current = requestAnimationFrame(tick)
      } catch {
        // Autoplay blocked (rare since we're inside a user gesture window) —
        // user can still hit the play button.
      }
    }
    // Wait until metadata is loaded so duration/buffer probes are safe.
    if (audio.readyState >= 1) {
      void tryPlay()
    } else {
      const onReady = () => { audio.removeEventListener('loadedmetadata', onReady); void tryPlay() }
      audio.addEventListener('loadedmetadata', onReady)
      return () => audio.removeEventListener('loadedmetadata', onReady)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initAudioGraph = (): boolean => {
    if (audioCtxRef.current) return true
    type Win = Window & {
      webkitAudioContext?: typeof AudioContext
    }
    const w = window as Win
    const Ctx: typeof AudioContext | undefined = window.AudioContext || w.webkitAudioContext
    if (!Ctx) return false
    if (!audioRef.current) return false
    try {
      const ctx = new Ctx()
      const source = ctx.createMediaElementSource(audioRef.current)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 128
      analyser.smoothingTimeConstant = 0.78
      source.connect(analyser)
      analyser.connect(ctx.destination)
      audioCtxRef.current = ctx
      analyserRef.current = analyser
      // Construct via ArrayBuffer to satisfy stricter Uint8Array generics in
      // newer TS lib types (getByteFrequencyData wants Uint8Array<ArrayBuffer>,
      // not Uint8Array<ArrayBufferLike>).
      freqDataRef.current = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount))
      setWebAudioActive(true)
      zeroFramesRef.current = 0
      return true
    } catch {
      return false
    }
  }

  const tick = () => {
    const audio = audioRef.current
    const analyser = analyserRef.current
    const freqData = freqDataRef.current
    const bars = barsRef.current
    if (!audio || audio.paused || !analyser || !freqData) {
      rafRef.current = null
      return
    }
    // Cast to satisfy strict Uint8Array<ArrayBuffer> generic — runtime fine.
    analyser.getByteFrequencyData(freqData as unknown as Uint8Array<ArrayBuffer>)

    // CORS-taint detection: if R2 isn't returning Access-Control-Allow-Origin
    // headers, the audio element is "tainted" and getByteFrequencyData
    // returns all zeros. After ~30 consecutive zero frames (~500ms), we
    // give up on Web Audio and hand control back to the CSS bounce
    // animation so the bars still feel alive.
    let sum = 0
    for (let i = 0; i < freqData.length; i++) sum += freqData[i]
    if (sum === 0) {
      zeroFramesRef.current += 1
      if (zeroFramesRef.current > 30) {
        setWebAudioActive(false)
        bars.forEach((b) => { b.style.transform = '' })
        rafRef.current = null
        return
      }
    } else {
      zeroFramesRef.current = 0
    }

    const binCount = freqData.length
    for (let i = 0; i < bars.length; i++) {
      const t = i / bars.length
      let idx = Math.floor(Math.pow(t, 1.4) * (binCount - 1))
      if (idx < 0) idx = 0
      if (idx >= binCount) idx = binCount - 1
      const v = freqData[idx] / 255
      const scale = 0.08 + v * 0.92
      bars[i].style.transform = `scaleY(${scale.toFixed(3)})`
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      const ok = initAudioGraph()
      if (audioCtxRef.current?.state === 'suspended') {
        try { await audioCtxRef.current.resume() } catch { /* ignore */ }
      }
      try {
        await audio.play()
        if (ok && !rafRef.current) rafRef.current = requestAnimationFrame(tick)
      } catch { /* autoplay blocked or other */ }
    } else {
      audio.pause()
    }
  }

  const onTimeUpdate = () => {
    const audio = audioRef.current
    if (!audio) return
    setCurrentTime(audio.currentTime)
    if (isFinite(audio.duration)) setDuration(audio.duration)
    try {
      if (audio.buffered.length > 0 && audio.duration) {
        const end = audio.buffered.end(audio.buffered.length - 1)
        setBuffered(end / audio.duration)
      }
    } catch { /* ignore */ }
  }

  const seek = (clientX: number) => {
    const audio = audioRef.current
    const el = progressRef.current
    if (!audio || !el || !audio.duration) return
    const rect = el.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    audio.currentTime = ratio * audio.duration
  }

  const onProgressPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    seek(e.clientX)
    const move = (ev: PointerEvent) => seek(ev.clientX)
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !audio.muted
    setMuted(audio.muted)
  }

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0
  const bufferedPct = buffered * 100

  return (
    <div ref={cardRef} className={`pp-lp-card ${isPlaying ? 'playing' : ''} ${webAudioActive ? 'web-audio' : ''}`.trim()}>
      <span className="pp-lp-orb purple" />
      <span className="pp-lp-orb cyan" />
      <span className="pp-lp-orb violet" />

      <div className="pp-lp-content">
        <div className="flex items-center gap-2 mb-4">{PITCHPAL_LOGO}</div>

        <h1 className="text-white font-semibold font-manrope leading-tight" style={{ fontSize: '22px', wordBreak: 'break-word', margin: 0 }}>
          {filename}
          <span
            className="inline-block ml-2 align-middle font-mono"
            style={{
              padding: '2px 9px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#C4A4FF',
              background: 'rgba(129,55,246,0.18)',
              border: '1px solid rgba(129,55,246,0.45)',
            }}
          >
            {trackIdLabel}
          </span>
        </h1>

        {(detectedGenre || bpm) && (
          <div className="flex flex-wrap gap-2 mt-3">
            {detectedGenre && (
              <span
                style={{
                  padding: '5px 12px',
                  borderRadius: '999px',
                  background: 'rgba(0,184,215,0.10)',
                  border: '1px solid rgba(0,184,215,0.4)',
                  color: '#00B8D7',
                  fontSize: '12px',
                  fontWeight: 500,
                }}
              >
                {detectedGenre}
              </span>
            )}
            {bpm ? (
              <span
                style={{
                  padding: '5px 12px',
                  borderRadius: '999px',
                  background: 'rgba(0,184,215,0.10)',
                  border: '1px solid rgba(0,184,215,0.4)',
                  color: '#00B8D7',
                  fontSize: '12px',
                  fontWeight: 500,
                }}
              >
                {bpm} BPM
              </span>
            ) : null}
          </div>
        )}

        <div className="pp-lp-eq" ref={eqRef} aria-hidden="true" />

        <audio
          ref={audioRef}
          src={audioUrl}
          crossOrigin="anonymous"
          preload="metadata"
          controlsList="nodownload noplaybackrate noremoteplayback"
          onContextMenu={(e) => e.preventDefault()}
          onPlay={() => setIsPlaying(true)}
          onPause={() => {
            setIsPlaying(false)
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
            rafRef.current = null
            // Reset transforms so bars return to idle full-height grey state
            barsRef.current.forEach((b) => { b.style.transform = '' })
          }}
          onEnded={() => {
            setIsPlaying(false)
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
            rafRef.current = null
            barsRef.current.forEach((b) => { b.style.transform = '' })
          }}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onTimeUpdate}
          onDurationChange={onTimeUpdate}
          onProgress={onTimeUpdate}
        />

        <div className="pp-lp-player">
          <button className="pp-lp-play" onClick={togglePlay} type="button" aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="7" y="5" width="4" height="14" rx="1" />
                <rect x="13" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
            )}
          </button>

          <div className="pp-lp-main">
            <div className="pp-lp-time">
              <span className="pp-lp-time-current">{fmt(currentTime)}</span>
              <span className="pp-lp-time-total">{fmt(duration)}</span>
            </div>
            <div className="pp-lp-progress" ref={progressRef} onPointerDown={onProgressPointerDown} role="slider" aria-label="Seek">
              <div className="pp-lp-progress-track">
                <div className="pp-lp-progress-buffered" style={{ width: `${bufferedPct}%` }} />
                <div className="pp-lp-progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="pp-lp-progress-thumb" style={{ left: `${pct}%` }} />
            </div>
          </div>

          <button className={`pp-lp-vol-btn${muted ? ' muted' : ''}`} onClick={toggleMute} type="button" aria-label={muted ? 'Unmute' : 'Mute'}>
            {muted ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            )}
          </button>
        </div>

        {expiresLabel && (
          <p className="mt-4 text-[11px] font-poppins text-white/60 text-center">
            {expiresLabel}
          </p>
        )}
      </div>
    </div>
  )
}
