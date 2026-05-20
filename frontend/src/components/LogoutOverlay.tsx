interface LogoutOverlayProps {
  isDark: boolean
}

// Audio-wave bars styled after the PitchPal logo's equalizer.
// Reuses the existing `pp-eq-bar` keyframe from index.css.
const BARS = 7
const BAR_DELAYS_MS = [0, 110, 60, 180, 90, 150, 30]

export default function LogoutOverlay({ isDark }: LogoutOverlayProps) {
  const ringBg = isDark
    ? 'linear-gradient(135deg, rgba(129,55,246,0.18) 0%, rgba(0,184,215,0.18) 100%)'
    : 'linear-gradient(135deg, rgba(129,55,246,0.12) 0%, rgba(0,184,215,0.12) 100%)'
  const ringBorder = isDark ? 'rgba(209,182,252,0.32)' : 'rgba(129,55,246,0.32)'
  const overlayBg = isDark ? 'rgba(12,6,35,0.92)' : 'rgba(255,255,255,0.92)'
  const titleColor = isDark ? '#ffffff' : '#26114A'
  const subColor = isDark ? 'rgba(255,255,255,0.62)' : 'rgba(38,17,74,0.62)'

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[1000] flex items-center justify-center pp-logout-fade-in"
      style={{
        background: overlayBg,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      <div className="flex flex-col items-center gap-7 px-6 text-center">
        {/* Wave-bar ring */}
        <div
          className="size-[136px] rounded-full flex items-center justify-center gap-[6px]"
          style={{
            background: ringBg,
            border: `1px solid ${ringBorder}`,
            boxShadow: isDark
              ? '0 0 60px rgba(129,55,246,0.25), 0 0 18px rgba(0,184,215,0.18)'
              : '0 0 50px rgba(129,55,246,0.18), 0 0 16px rgba(0,184,215,0.14)',
          }}
        >
          {Array.from({ length: BARS }).map((_, i) => (
            <span
              key={i}
              className="pp-eq-bar"
              style={{
                display: 'inline-block',
                width: '6px',
                height: '54px',
                borderRadius: '4px',
                background: 'linear-gradient(180deg, #00B8D7 0%, #8137F6 100%)',
                animationDelay: `${BAR_DELAYS_MS[i % BAR_DELAYS_MS.length]}ms`,
              }}
            />
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <p
            className="font-poppins text-[24px] xl:text-[28px] font-semibold tracking-[-0.4px]"
            style={{ color: titleColor }}
          >
            Signing you out…
          </p>
          <p
            className="font-poppins text-[14px] xl:text-[15px] font-light leading-[1.6]"
            style={{ color: subColor }}
          >
            See you again soon
          </p>
        </div>
      </div>
    </div>
  )
}
