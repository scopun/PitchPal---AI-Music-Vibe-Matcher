import { ReactNode, useEffect, useRef, useState } from 'react'

interface AnimateOnScrollProps {
  children: ReactNode
  /** Delay before the animation starts after the element enters the viewport (ms). */
  delay?: number
  /** Total length of the fade/slide animation (ms). */
  duration?: number
  /** Vertical offset the element starts from (px). Positive = comes up from below. */
  offsetY?: number
  /** Pixels of the element that must be visible before triggering. */
  triggerMargin?: number
  /** Optional className passed through to the wrapping div. */
  className?: string
}

export default function AnimateOnScroll({
  children,
  delay = 0,
  duration = 700,
  offsetY = 40,
  triggerMargin = 60,
  className = '',
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setVisible(true)
      return
    }

    let pollTimer: ReturnType<typeof setInterval> | null = null

    const teardown = () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
      if (pollTimer) clearInterval(pollTimer)
    }

    function check() {
      if (!node) return
      const rect = node.getBoundingClientRect()
      // Trigger once the section's top has crossed the trigger line — including
      // if the user has already scrolled past it (rect.top < 0).
      if (rect.top < window.innerHeight - triggerMargin) {
        setVisible(true)
        teardown()
      }
    }

    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    // Polling backup — covers environments where scroll events are throttled
    // or suppressed (CDP-controlled headless browsers, embedded webviews).
    pollTimer = setInterval(check, 150)

    return teardown
  }, [triggerMargin])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : `translateY(${offsetY}px)`,
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  )
}
