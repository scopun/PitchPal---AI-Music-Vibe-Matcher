interface InlineAlertProps {
  message: string
  isDark: boolean
}

export default function InlineAlert({ message, isDark }: InlineAlertProps) {
  // Soft red tones — dark mode uses warmer/lighter so it reads on the dark card,
  // light mode uses a deeper red so it reads on the white card.
  const bg = isDark ? 'rgba(255, 107, 107, 0.07)' : 'rgba(220, 38, 38, 0.05)'
  const border = isDark ? 'rgba(255, 107, 107, 0.28)' : 'rgba(220, 38, 38, 0.22)'
  const textColor = isDark ? '#FFB8B8' : '#B42323'
  const iconColor = isDark ? '#FF8A8A' : '#C73030'

  return (
    <div
      role="alert"
      className="flex items-start gap-[10px] px-[14px] py-[12px] rounded-[12px] font-poppins"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-[1px]">
        <path
          d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z"
          stroke={iconColor}
          strokeWidth="1.5"
        />
        <path d="M10 6.25V10.625" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="13.5" r="0.85" fill={iconColor} />
      </svg>
      <p className="text-[13px] font-light leading-[1.5] tracking-[0.1px]" style={{ color: textColor }}>
        {message}
      </p>
    </div>
  )
}
