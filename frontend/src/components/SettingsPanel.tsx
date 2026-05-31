import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../services/api'
import { changePassword, updateMe } from '../services/auth'

// Sign-out lives in the topbar profile dropdown only — keeping it out of the
// Settings panel avoids putting a destructive action right next to the
// password change form.

interface SettingsPanelProps {
  isDark: boolean
}

// Client-side image resize → keeps avatars small enough to live happily in
// a TEXT column without ballooning the DB. 256×256 covers all current
// avatar render sizes; JPEG at 0.85 keeps the data URL well under 100 KB
// for typical phone photos.
const AVATAR_MAX_DIM = 256
const AVATAR_JPEG_QUALITY = 0.85

async function fileToCompressedDataUrl(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const blob = new Blob([arrayBuffer], { type: file.type })
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = reject
    i.src = URL.createObjectURL(blob)
  })

  const scale = Math.min(1, AVATAR_MAX_DIM / Math.max(img.width, img.height))
  const w = Math.round(img.width * scale)
  const h = Math.round(img.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas unavailable')
  ctx.drawImage(img, 0, 0, w, h)
  URL.revokeObjectURL(img.src)
  return canvas.toDataURL('image/jpeg', AVATAR_JPEG_QUALITY)
}

export default function SettingsPanel({ isDark }: SettingsPanelProps) {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()

  // Profile form state — hydrated from user once it lands.
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [role, setRole] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [soundcloudUrl, setSoundcloudUrl] = useState('')
  const [spotifyUrl, setSpotifyUrl] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSavedAt, setProfileSavedAt] = useState<number | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)

  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarFileRef = useRef<HTMLInputElement | null>(null)

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setDisplayName(user.display_name ?? '')
    setBio(user.bio ?? '')
    setLocation(user.location ?? '')
    setRole(user.role ?? '')
    setWebsiteUrl(user.website_url ?? '')
    setSoundcloudUrl(user.soundcloud_url ?? '')
    setSpotifyUrl(user.spotify_url ?? '')
    setAvatarUrl(user.avatar_url ?? null)
  }, [user])

  const derivedFallbackName = user?.email
    ? user.email.split('@')[0]
        .replace(/[._-]+/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(' ')
    : 'User'

  const handleAvatarPick = async (file: File | undefined) => {
    if (!file) return
    setProfileError(null)
    if (!file.type.startsWith('image/')) {
      setProfileError('Please pick an image file (JPG, PNG, WEBP).')
      return
    }
    setAvatarUploading(true)
    try {
      const dataUrl = await fileToCompressedDataUrl(file)
      setAvatarUrl(dataUrl)
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Could not read this image.')
    } finally {
      setAvatarUploading(false)
    }
  }

  const submitProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError(null)
    setProfileSaving(true)
    try {
      await updateMe({
        display_name: displayName,
        bio,
        location,
        role,
        website_url: websiteUrl,
        soundcloud_url: soundcloudUrl,
        spotify_url: spotifyUrl,
        avatar_url: avatarUrl ?? '',
      })
      await refreshUser()
      setProfileSavedAt(Date.now())
      // Ciara's feedback: after Save, take the user back to the dashboard so
      // it feels like the save actually happened. Brief delay lets the green
      // confirmation banner register first.
      window.setTimeout(() => navigate('/dashboard'), 1400)
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : 'Could not save your profile.')
    } finally {
      setProfileSaving(false)
    }
  }

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordMessage(null)
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.')
      return
    }
    setPasswordSaving(true)
    try {
      const res = await changePassword(currentPassword, newPassword)
      setPasswordMessage(res.message)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : 'Could not change password.')
    } finally {
      setPasswordSaving(false)
    }
  }

  // --- styles ---
  const textPrimary = isDark ? 'text-white' : 'text-pp-navy'
  const textMuted = isDark ? 'text-white/60' : 'text-pp-navy/60'
  const panelBg = isDark
    ? 'bg-[#120936] border border-white/[0.08] shadow-[0_8px_40px_rgba(0,0,0,0.5)]'
    : 'bg-white border border-[rgba(129,55,246,0.15)] shadow-[0_8px_40px_rgba(129,55,246,0.12)]'
  const inputCls = isDark
    ? 'bg-white/[0.04] border border-white/[0.10] text-white placeholder:text-white/40 focus:border-pp-purple/60'
    : 'bg-white border border-[rgba(129,55,246,0.20)] text-pp-navy placeholder:text-pp-navy/40 focus:border-pp-purple/60'
  const labelCls = `flex flex-col gap-1 text-[12px] font-medium font-poppins ${textPrimary}`

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Profile card */}
      <form onSubmit={submitProfile} className={`${panelBg} rounded-[16px] p-5 md:p-7 flex flex-col gap-5`}>
        <div className="flex items-center justify-between gap-4">
          <h2 className={`text-[18px] font-semibold font-manrope ${textPrimary}`}>Your profile</h2>
        </div>

        {/* Avatar + name row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="relative">
            <div className={`size-24 rounded-full overflow-hidden border-2 ${isDark ? 'border-white/[0.10]' : 'border-[rgba(129,55,246,0.20)]'}`}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="size-full object-cover" />
              ) : (
                <div className="size-full bg-gradient-to-br from-pp-purple to-pp-purple-deep flex items-center justify-center text-white font-semibold text-[28px] font-manrope">
                  {(displayName || derivedFallbackName).slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <input
              ref={avatarFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleAvatarPick(e.target.files?.[0])}
            />
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => avatarFileRef.current?.click()}
              disabled={avatarUploading}
              className="gradient-btn border border-white/[0.06] text-white font-medium font-poppins text-[13px] h-[40px] px-4 rounded-[10px] hover:-translate-y-[1px] transition-all disabled:opacity-60"
            >
              {avatarUploading ? 'Resizing…' : avatarUrl ? 'Change photo' : 'Upload photo'}
            </button>
            {avatarUrl && (
              <button
                type="button"
                onClick={() => setAvatarUrl(null)}
                className={`text-[12px] font-medium font-poppins ${textMuted} hover:underline self-start`}
              >
                Remove photo
              </button>
            )}
          </div>
        </div>

        {/* Profile fields grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className={labelCls}>
            Display name
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className={`${inputCls} h-[42px] rounded-[10px] px-3 text-[14px] font-poppins outline-none transition-colors`}
            />
          </label>
          <label className={labelCls}>
            Role
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Songwriter / Producer / Manager"
              className={`${inputCls} h-[42px] rounded-[10px] px-3 text-[14px] font-poppins outline-none transition-colors`}
            />
          </label>
          <label className={labelCls}>
            Location
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="London, UK"
              className={`${inputCls} h-[42px] rounded-[10px] px-3 text-[14px] font-poppins outline-none transition-colors`}
            />
          </label>
          <label className={labelCls}>
            Email
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              className={`${inputCls} h-[42px] rounded-[10px] px-3 text-[14px] font-poppins outline-none opacity-60 cursor-not-allowed`}
            />
          </label>
          <label className={`${labelCls} md:col-span-2`}>
            Bio
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell artists a bit about you and your sound…"
              className={`${inputCls} rounded-[10px] p-3 text-[14px] font-poppins outline-none transition-colors resize-y`}
            />
          </label>
          <label className={labelCls}>
            Website
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://yourdomain.com"
              className={`${inputCls} h-[42px] rounded-[10px] px-3 text-[14px] font-poppins outline-none transition-colors`}
            />
          </label>
          <label className={labelCls}>
            SoundCloud
            <input
              type="url"
              value={soundcloudUrl}
              onChange={(e) => setSoundcloudUrl(e.target.value)}
              placeholder="https://soundcloud.com/your-handle"
              className={`${inputCls} h-[42px] rounded-[10px] px-3 text-[14px] font-poppins outline-none transition-colors`}
            />
          </label>
          <label className={`${labelCls} md:col-span-2`}>
            Spotify
            <input
              type="url"
              value={spotifyUrl}
              onChange={(e) => setSpotifyUrl(e.target.value)}
              placeholder="https://open.spotify.com/artist/…"
              className={`${inputCls} h-[42px] rounded-[10px] px-3 text-[14px] font-poppins outline-none transition-colors`}
            />
          </label>
        </div>

        {profileError && (
          <p className="rounded-[10px] px-4 py-3 text-[13px] font-poppins border border-[rgba(255,123,123,0.35)] bg-[rgba(255,123,123,0.08)] text-[#FF7B7B]">
            {profileError}
          </p>
        )}

        {profileSavedAt && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-medium font-poppins text-[#00BB7B]"
            style={{ background: 'rgba(0,187,123,0.10)', border: '1px solid rgba(0,187,123,0.28)' }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="shrink-0">
              <circle cx="10" cy="10" r="8.5" stroke="#00BB7B" strokeWidth="1.5" />
              <path d="M6.5 10l2.5 2.5 4.5-4.5" stroke="#00BB7B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Profile saved successfully!
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={profileSaving}
            className="gradient-btn border border-white/[0.06] text-white font-medium font-poppins text-[14px] h-[44px] px-6 rounded-[10px] hover:-translate-y-[1px] transition-all disabled:opacity-60"
          >
            {profileSaving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </form>

      {/* Password card */}
      <form onSubmit={submitPassword} className={`${panelBg} rounded-[16px] p-5 md:p-7 flex flex-col gap-5`}>
        <h2 className={`text-[18px] font-semibold font-manrope ${textPrimary}`}>Change password</h2>
        <p className={`text-[12px] font-poppins ${textMuted}`}>
          For security we'll ask for your current password before applying a new one.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className={labelCls}>
            Current password
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={`${inputCls} h-[42px] rounded-[10px] px-3 text-[14px] font-poppins outline-none transition-colors`}
              autoComplete="current-password"
            />
          </label>
          <label className={labelCls}>
            New password
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`${inputCls} h-[42px] rounded-[10px] px-3 text-[14px] font-poppins outline-none transition-colors`}
              autoComplete="new-password"
            />
          </label>
          <label className={labelCls}>
            Confirm new password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`${inputCls} h-[42px] rounded-[10px] px-3 text-[14px] font-poppins outline-none transition-colors`}
              autoComplete="new-password"
            />
          </label>
        </div>

        {passwordMessage && (
          <p className="rounded-[10px] px-4 py-3 text-[13px] font-poppins border border-[rgba(0,187,123,0.35)] bg-[rgba(0,187,123,0.08)] text-[#00BB7B]">
            {passwordMessage}
          </p>
        )}
        {passwordError && (
          <p className="rounded-[10px] px-4 py-3 text-[13px] font-poppins border border-[rgba(255,123,123,0.35)] bg-[rgba(255,123,123,0.08)] text-[#FF7B7B]">
            {passwordError}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
            className="gradient-btn border border-white/[0.06] text-white font-medium font-poppins text-[14px] h-[44px] px-6 rounded-[10px] hover:-translate-y-[1px] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {passwordSaving ? 'Updating…' : 'Update password'}
          </button>
        </div>
      </form>

    </div>
  )
}
