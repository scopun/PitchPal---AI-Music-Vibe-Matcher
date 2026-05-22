/**
 * Eye / eye-slash toggle icon for password show/hide buttons.
 * Same visual treatment used across HeroSection LoginCard and ResetPasswordPage.
 *   open=true  → eye with diagonal slash (password is visible)
 *   open=false → regular eye (password is hidden)
 */
export default function EyeIcon({ open, color }: { open: boolean; color: string }) {
  if (open) {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M1.667 10S4.167 4.583 10 4.583 18.333 10 18.333 10 15.833 15.417 10 15.417 1.667 10 1.667 10z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="10" r="2.5" stroke={color} strokeWidth="1.5" />
        <line x1="3" y1="3" x2="17" y2="17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M1.667 10S4.167 4.583 10 4.583 18.333 10 18.333 10 15.833 15.417 10 15.417 1.667 10 1.667 10z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.5" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}
