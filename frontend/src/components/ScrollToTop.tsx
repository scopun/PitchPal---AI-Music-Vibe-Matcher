import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SCROLL_DURATION_MS = 1200
const FRAME_MS = 16

// Module-scope token so concurrent triggers don't race each other —
// the newest call wins, older closures bail on their next tick.
let activeToken = 0

function smoothScrollToTop() {
  const startY = window.scrollY
  if (startY <= 0) return

  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    window.scrollTo(0, 0)
    return
  }

  const token = ++activeToken
  const start = performance.now()

  const tick = () => {
    if (token !== activeToken) return
    const progress = Math.min((performance.now() - start) / SCROLL_DURATION_MS, 1)
    const eased = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2
    window.scrollTo(0, startY * (1 - eased))
    if (progress < 1) setTimeout(tick, FRAME_MS)
  }

  setTimeout(tick, FRAME_MS)
}

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    smoothScrollToTop()
  }, [pathname])

  return null
}
