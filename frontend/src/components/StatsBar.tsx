import { useEffect, useRef, useState } from 'react'

interface StatsBarProps {
  isDark: boolean
}

interface StatItem {
  target: number
  prefix: string
  suffix: string
  label: string
}

const stats: StatItem[] = [
  { target: 100, prefix: '', suffix: 'k+', label: 'Artists\nin database' },
  { target: 12, prefix: '', suffix: '', label: 'Matches per\ntrack, average' },
  { target: 10, prefix: '<', suffix: 's', label: 'Time\nto results' },
]

const COUNT_DURATION_MS = 1600

export default function StatsBar({ isDark }: StatsBarProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [started, setStarted] = useState(false)
  const [values, setValues] = useState<number[]>(() => stats.map(() => 0))

  // Trigger the count-up the first time the bar enters the viewport.
  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setStarted(true)
      setValues(stats.map((s) => s.target))
      return
    }

    let pollTimer: ReturnType<typeof setInterval> | null = null

    const teardown = () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
      if (pollTimer) clearInterval(pollTimer)
    }

    function check() {
      const rect = node.getBoundingClientRect()
      if (rect.top < window.innerHeight - 60) {
        setStarted(true)
        teardown()
      }
    }

    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    pollTimer = setInterval(check, 150)
    return teardown
  }, [])

  // Animate each stat from 0 to its target value with an ease-out curve.
  useEffect(() => {
    if (!started) return
    const start = performance.now()
    let timer: ReturnType<typeof setTimeout> | null = null
    let cancelled = false

    const tick = () => {
      if (cancelled) return
      const progress = Math.min((performance.now() - start) / COUNT_DURATION_MS, 1)
      const eased = 1 - (1 - progress) ** 3
      setValues(stats.map((s) => Math.round(s.target * eased)))
      if (progress < 1) timer = setTimeout(tick, 16)
    }

    timer = setTimeout(tick, 16)
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [started])

  const barBg = isDark
    ? 'backdrop-blur-[27px] bg-gradient-to-r from-[rgba(129,55,246,0.07)] to-[rgba(100,26,190,0.07)] border-white/[0.07]'
    : 'bg-white border-[rgba(129,55,246,0.1)]'

  const dividerCls = isDark ? 'bg-white/[0.07]' : 'bg-[rgba(129,55,246,0.1)]'
  const labelCls = isDark ? 'text-white/60' : 'text-pp-navy/60'

  return (
    <div ref={containerRef} className={`w-full border-y px-6 md:px-8 xl:px-[68px] py-5 md:py-[40px] xl:py-[44px] ${barBg}`}>
      <div className="max-w-[1440px] mx-auto flex items-stretch justify-between">
        {stats.map((stat, index) => (
          <div key={`${stat.prefix}${stat.target}${stat.suffix}`} className="flex items-stretch flex-1">
            {index > 0 && <div className={`hidden md:block w-px self-stretch shrink-0 ${dividerCls}`} />}
            <div className="flex flex-col items-center justify-center text-center flex-1 px-2 md:px-6 xl:px-8 py-1">
              <p className="gradient-text text-[30px] md:text-[52px] xl:text-[60px] font-semibold leading-[1.3] xl:leading-[1.2] font-poppins tabular-nums">
                {stat.prefix}{values[index]}{stat.suffix}
              </p>
              <p className={`whitespace-pre-line md:whitespace-normal text-[11px] md:text-[15px] xl:text-[16px] font-normal leading-[1.4] tracking-[0.11px] md:tracking-[0.15px] font-poppins mt-[4px] md:mt-[6px] ${labelCls}`}>
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
