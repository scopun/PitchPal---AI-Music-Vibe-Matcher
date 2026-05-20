import { useEffect } from 'react'

interface ConfirmDialogProps {
  isDark: boolean
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  loadingLabel?: string
  danger?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  isDark,
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loadingLabel = 'Working…',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Close on Esc, lock body scroll while open. Esc is ignored while loading
  // so the user can't abandon an in-flight operation halfway.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel()
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open, loading, onCancel])

  if (!open) return null

  const backdropBg = isDark ? 'rgba(12,6,35,0.72)' : 'rgba(38,17,74,0.32)'
  const cardCls = isDark
    ? 'backdrop-blur-[22px] bg-[#160B33] border border-[rgba(209,173,255,0.22)] shadow-[0_24px_80px_rgba(0,0,0,0.6),0_0_60px_rgba(144,0,255,0.15)]'
    : 'bg-white border border-[rgba(129,55,246,0.22)] shadow-[0_24px_80px_rgba(60,30,140,0.18)]'
  const titleColor = isDark ? 'text-white' : 'text-pp-navy'
  const messageColor = isDark ? 'text-white/65' : 'text-pp-navy/65'

  const iconColor = danger ? (isDark ? '#FF8A8A' : '#C73030') : '#8137F6'
  const iconBg = danger
    ? (isDark ? 'rgba(255,107,107,0.10)' : 'rgba(220,38,38,0.06)')
    : (isDark ? 'rgba(129,55,246,0.12)' : 'rgba(129,55,246,0.08)')
  const iconBorder = danger
    ? (isDark ? 'rgba(255,107,107,0.32)' : 'rgba(220,38,38,0.28)')
    : (isDark ? 'rgba(129,55,246,0.32)' : 'rgba(129,55,246,0.24)')

  const cancelBtnCls = isDark
    ? 'bg-white/[0.04] border border-white/[0.12] text-white/85 hover:bg-white/[0.08]'
    : 'bg-white border border-[rgba(129,55,246,0.22)] text-pp-navy hover:bg-[rgba(129,55,246,0.04)]'

  // Confirm button: danger uses a soft red gradient; non-danger reuses the brand gradient.
  const confirmBtnStyle: React.CSSProperties = danger
    ? {
        background: 'linear-gradient(90deg, #E25C5C 0%, #B62E2E 100%)',
        boxShadow: '0 8px 24px rgba(198, 60, 60, 0.32)',
      }
    : {}
  const confirmBtnCls = danger
    ? 'border border-white/[0.06] text-white pp-btn-lift'
    : 'gradient-btn pp-btn-lift border border-white/[0.06] text-white'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-[2000] flex items-center justify-center px-4 pp-confirm-fade-in"
      style={{ background: backdropBg, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={() => { if (!loading) onCancel() }}
    >
      <div
        className={`${cardCls} rounded-[20px] w-full max-w-[440px] p-6 md:p-7 flex flex-col gap-5 font-poppins pp-confirm-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div
          className="size-[56px] rounded-[14px] flex items-center justify-center shrink-0"
          style={{ background: iconBg, border: `1px solid ${iconBorder}` }}
        >
          {danger ? (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M3.33 6h17.34M9.5 11v6.5M14.5 11v6.5M5 6l1 12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2l1-12M9 6V3.5C9 3 9.4 2.5 10 2.5h4c.6 0 1 .5 1 1V6" stroke={iconColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke={iconColor} strokeWidth="1.6" />
              <path d="M12 7.5V13" stroke={iconColor} strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="12" cy="16.5" r="1.05" fill={iconColor} />
            </svg>
          )}
        </div>

        {/* Title + message */}
        <div className="flex flex-col gap-2">
          <h2 id="confirm-dialog-title" className={`text-[20px] md:text-[22px] font-semibold leading-tight ${titleColor}`}>
            {title}
          </h2>
          <p className={`text-[14px] font-light leading-[1.55] ${messageColor}`}>
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse md:flex-row md:justify-end items-stretch md:items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={`${cancelBtnCls} font-medium text-[14px] h-[44px] px-5 rounded-[10px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            autoFocus
            style={confirmBtnStyle}
            className={`${confirmBtnCls} font-medium text-[14px] h-[44px] px-5 rounded-[10px] flex items-center justify-center gap-2 disabled:opacity-80 disabled:pointer-events-none`}
          >
            {loading && (
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="42 14" />
              </svg>
            )}
            <span>{loading ? loadingLabel : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
