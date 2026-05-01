'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Search, Bell, X, Sun, Moon, User, LogOut, Info, ChevronDown, CheckCheck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useTheme } from 'next-themes'
import { AnimatePresence, motion } from 'framer-motion'
import { getUserAvatar } from '@/lib/avatar'
import { NotificationData } from '@/types'
import { subscribeToNotifications, markAsRead, markAllAsRead } from '@/services/notificationService'
import { BulletinAlert } from '@/types/bulletin'

/** Format a Firestore timestamp into a human-readable "time ago" string */
function timeAgo(ts: any): string {
  if (!ts) return ''
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function NavbarTop() {
  const router = useRouter()
  const pathname = usePathname()
  const { profile, logout } = useAuth()
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [localNotifications, setLocalNotifications] = useState<NotificationData[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { setMounted(true) })
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (searchOpen && inputRef.current) inputRef.current.focus()
  }, [searchOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ── Real-time Firestore notifications ──
  useEffect(() => {
    if (!profile?.id) { setNotifications([]); return }
    const unsubscribe = subscribeToNotifications(profile.id, (firestoreNotifs) => {
      setNotifications(firestoreNotifs)
    })
    return () => unsubscribe()
  }, [profile?.id])

  // ── Local / ephemeral notifications ──
  useEffect(() => {
    const cancelled = { current: false }
    const loadLocal = async () => {
      const items: NotificationData[] = []
      if (!profile?.profileComplete) {
        items.push({
          id: 'complete-profile',
          title: 'Complete your profile',
          body: 'Add your skills and location to unlock better event matching.',
          path: '/profile',
          type: 'profile',
          tone: 'info',
          read: false,
          createdAt: null,
        })
      }
      try {
        const res = await fetch('/api/bulletin')
        if (res.ok) {
          const alerts: BulletinAlert[] = await res.json()
          alerts
            .filter((a) => a.severity === 'Extreme' || a.severity === 'Severe')
            .slice(0, 2)
            .forEach((alert) => {
              items.push({
                id: `bulletin-${alert.id}`,
                title: `${alert.severity} ${alert.type.toLowerCase()} bulletin`,
                body: alert.title,
                path: '/dashboard/bulletin',
                type: 'bulletin',
                tone: 'alert',
                read: false,
                createdAt: null,
              })
            })
        }
      } catch { /* sentinel unavailable — skip silently */ }
      if (!cancelled.current) setLocalNotifications(items)
    }
    loadLocal()
    return () => { cancelled.current = true }
  }, [profile?.profileComplete])

  const allNotifications = [...notifications, ...localNotifications]

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/feed?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const navLinks = [
    { label: 'Home', path: '/home' },
    { label: 'Events', path: '/feed' },
    { label: 'Organize', path: '/create' },
    { label: 'Dashboard', path: '/dashboard', exact: true },
    { label: 'Leaderboard', path: '/leaderboard' },
  ]

  const isLinkActive = (link: typeof navLinks[0]) => {
    if (link.exact) return pathname === link.path
    return pathname.startsWith(link.path)
  }

  const unreadCount = allNotifications.filter((n) => !n.read).length

  const handleMarkAllRead = useCallback(async () => {
    if (!profile?.id) return
    await markAllAsRead(profile.id)
    setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [profile?.id])

  const handleNotificationClick = useCallback(async (notification: NotificationData) => {
    setNotificationMenuOpen(false)
    if (profile?.id && !notification.id.startsWith('complete-profile') && !notification.id.startsWith('bulletin-')) {
      markAsRead(profile.id, notification.id)
    }
    router.push(notification.path)
  }, [profile?.id, router])

  const notificationToneStyles: Record<NotificationData['tone'], { bg: string; border: string }> = {
    alert: { bg: 'var(--color-error-container-base)', border: 'var(--color-error-base)' },
    info: { bg: 'var(--color-tertiary-container-base)', border: 'var(--color-tertiary-base)' },
    success: { bg: 'var(--color-secondary-container-base)', border: 'var(--color-secondary-base)' },
  }

  return (
    <div
      className="w-full border-b-4 border-black"
      style={{ background: 'var(--color-surface-container-lowest-base)' }}
    >
      <div className="mx-auto flex items-center justify-between max-w-7xl px-6 py-3">

        {/* Logo */}
        <button
          onClick={() => router.push('/')}
          className="font-headline font-black text-[18px] uppercase tracking-tight text-on-surface transition-all duration-150 hover:translate-x-[2px]"
        >
          <span
            className="px-3 py-1 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-block hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150"
            style={{ background: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' }}
          >
            CampusPulse
          </span>
        </button>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {navLinks.map((link) => {
            const active = isLinkActive(link)
            return (
              <button
                key={link.path}
                onClick={() => router.push(link.path)}
                className={`relative px-4 py-2 text-sm font-label font-bold uppercase tracking-wider transition-all duration-150 border-4 ${
                  active
                    ? 'border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                }`}
                style={active ? {
                  background: 'var(--color-primary-container-base)',
                  color: 'var(--color-on-primary-container-base)',
                } : undefined}
              >
                {link.label}
              </button>
            )
          })}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 text-on-surface">
          {/* Search */}
          {searchOpen ? (
            <div
              className="flex items-center gap-2 px-3.5 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in fade-in duration-200"
              style={{ background: 'var(--color-surface-container-lowest-base)' }}
            >
              <Search size={15} className="text-on-surface-variant" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search events…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="bg-transparent outline-none text-sm w-44 text-on-surface placeholder:text-on-surface-variant/60 font-body"
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                className="hover:scale-110 active:scale-95 transition-all p-0.5 border-2 border-black"
              >
                <X size={14} className="text-on-surface-variant" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 border-4 border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 active:scale-95"
            >
              <Search size={17} />
            </button>
          )}

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setNotificationMenuOpen((open) => !open)}
              className="p-2 border-4 border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 active:scale-95 relative"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span
                  className="absolute top-1 right-1 min-w-[0.6rem] h-[0.6rem] rounded-none border-2 border-black flex items-center justify-center text-[8px] font-bold text-white"
                  style={{ background: 'var(--color-error-base)' }}
                >
                </span>
              )}
            </button>

            <AnimatePresence>
              {notificationMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 mt-3 w-[21rem] overflow-hidden z-50 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                  style={{ background: 'var(--color-surface-container-lowest-base)' }}
                >
                  <div className="p-3">
                    {/* Header */}
                    <div
                      className="p-4 border-2 border-black mb-3"
                      style={{ background: 'var(--color-primary-container-base)' }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-on-primary-container-base)]">Notifications</p>
                          <p className="mt-1 text-base font-bold text-[var(--color-on-primary-container-base)] font-headline uppercase">What's popping</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleMarkAllRead(); }}
                              className="p-1.5 border-2 border-black transition-all duration-150 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                              style={{ background: 'var(--color-secondary-container-base)' }}
                              title="Mark all as read"
                            >
                              <CheckCheck size={14} />
                            </button>
                          )}
                          <span
                            className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] border-2 border-black"
                            style={{ background: 'var(--color-secondary-container-base)', color: 'var(--color-on-secondary-container-base)' }}
                          >
                            {allNotifications.length}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-[320px] overflow-y-auto no-scrollbar">
                      {allNotifications.length === 0 ? (
                        <div
                          className="p-4 text-center border-2 border-black"
                          style={{ background: 'var(--color-surface-container-base)' }}
                        >
                          <p className="text-sm font-bold text-on-surface font-label uppercase">All Clear!</p>
                          <p className="mt-1 text-[11px] text-on-surface-variant">You&apos;re all caught up!</p>
                        </div>
                      ) : (
                        allNotifications.map((notification) => {
                          const tone = notificationToneStyles[notification.tone]
                          return (
                            <button
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification)}
                              className="w-full p-3 text-left transition-all duration-150 hover:translate-x-[2px] border-2 border-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                              style={{
                                background: tone.bg,
                                opacity: notification.read ? 0.65 : 1,
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <span
                                  className="relative mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border-2 border-black"
                                  style={{ background: 'var(--color-surface-container-lowest-base)' }}
                                >
                                  <Bell size={14} />
                                  {!notification.read && (
                                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 border-2 border-black" style={{ background: 'var(--color-error-base)' }} />
                                  )}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-baseline justify-between gap-2">
                                    <p className="text-sm font-bold text-on-surface truncate font-label uppercase">{notification.title}</p>
                                    {notification.createdAt && (
                                      <span className="shrink-0 text-[10px] text-on-surface-variant">{timeAgo(notification.createdAt)}</span>
                                    )}
                                  </div>
                                  <p className="mt-1 text-[11px] leading-relaxed text-on-surface-variant">{notification.body}</p>
                                </div>
                              </div>
                            </button>
                          )
                        })
                      )}
                    </div>

                    <button
                      onClick={() => { setNotificationMenuOpen(false); router.push('/dashboard/bulletin') }}
                      className="mt-3 w-full px-4 py-3 text-sm font-bold text-on-surface font-label uppercase tracking-wider transition-all duration-150 hover:translate-x-[2px] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                      style={{ background: 'var(--color-secondary-container-base)', color: 'var(--color-on-secondary-container-base)' }}
                    >
                      Open Bulletin Board
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="w-9 h-9 overflow-hidden transition-all duration-150 border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none flex items-center justify-center"
            >
              {profileMenuOpen ? (
                <ChevronDown size={18} className="text-on-surface" />
              ) : (
                <img src={getUserAvatar(profile?.avatarUrl, profile?.displayName)} alt="Profile" className="w-full h-full object-cover" />
              )}
            </button>

            <AnimatePresence>
              {profileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 mt-3 w-[17.5rem] overflow-hidden z-50 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                  style={{ background: 'var(--color-surface-container-lowest-base)' }}
                >
                  <div className="relative z-10 p-3">
                    {/* Profile card */}
                    <div
                      className="overflow-hidden p-4 border-2 border-black mb-3"
                      style={{ background: 'var(--color-primary-container-base)' }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden border-2 border-black">
                          <img src={getUserAvatar(profile?.avatarUrl, profile?.displayName)} alt="Profile" className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-on-primary-container-base)]">Signed in</p>
                          <p className="mt-1 truncate text-base font-bold text-[var(--color-on-primary-container-base)] font-headline uppercase">{profile?.displayName || 'User'}</p>
                          <p className="truncate text-xs text-[var(--color-on-primary-container-base)]/80">{profile?.email || ''}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                        className="col-span-2 px-4 py-3 text-left transition-all duration-150 hover:translate-x-[2px] border-2 border-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                        style={{ background: 'var(--color-surface-container-base)' }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center border-2 border-black" style={{ background: 'var(--color-surface-container-highest-base)' }}>
                            {mounted && resolvedTheme === 'dark' ? <Sun size={16} className="text-on-surface" /> : <Moon size={16} className="text-on-surface" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-on-surface font-label uppercase">{mounted && resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}</p>
                            <p className="text-[11px] text-on-surface-variant">Switch the vibe</p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => { setProfileMenuOpen(false); router.push('/profile'); }}
                        className="px-3.5 py-3 text-left transition-all duration-150 hover:translate-x-[2px] border-2 border-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                        style={{ background: 'var(--color-secondary-container-base)' }}
                      >
                        <User size={16} className="text-on-surface mb-2" />
                        <p className="text-sm font-bold text-on-surface font-label uppercase">Profile</p>
                        <p className="mt-0.5 text-[11px] text-on-surface-variant">Your public card</p>
                      </button>

                      <button
                        onClick={() => { setProfileMenuOpen(false); router.push('/about'); }}
                        className="px-3.5 py-3 text-left transition-all duration-150 hover:translate-x-[2px] border-2 border-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                        style={{ background: 'var(--color-tertiary-container-base)' }}
                      >
                        <Info size={16} className="text-on-surface mb-2" />
                        <p className="text-sm font-bold text-on-surface font-label uppercase">About</p>
                        <p className="mt-0.5 text-[11px] text-on-surface-variant">Mission and team</p>
                      </button>
                    </div>

                    <div className="my-3 mx-0 h-1 bg-black" />

                    <button
                      onClick={async () => {
                        setProfileMenuOpen(false);
                        await logout();
                        router.push('/');
                      }}
                      className="w-full px-4 py-3 text-left transition-all duration-150 hover:translate-x-[2px] border-2 border-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                      style={{ background: 'var(--color-error-container-base)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center border-2 border-black" style={{ background: 'var(--color-error-base)' }}>
                          <LogOut size={15} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-on-surface font-label uppercase">Log Out</p>
                          <p className="text-[11px] text-on-surface-variant">End this session</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
