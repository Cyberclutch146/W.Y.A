'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Search, Bell, X, Sun, Moon, User, LogOut, Info, ChevronDown, CheckCheck, Zap } from 'lucide-react'
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
      } catch { /* bulletin unavailable — skip silently */ }
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
    { label: 'Noticeboard', path: '/bulletin' },
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

  const notificationToneStyles: Record<NotificationData['tone'], { bg: string; border: string; text: string }> = {
    alert: { bg: 'bg-destructive/10', border: 'border-destructive/20', text: 'text-destructive' },
    info: { bg: 'bg-primary/10', border: 'border-primary/20', text: 'text-primary' },
    success: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-500' },
  }

  return (
    <div className="sticky top-0 z-50 w-full border-b border-border/40 backdrop-blur-xl" style={{ background: 'color-mix(in srgb, var(--cp-bg) 70%, transparent)' }}>
      <div className="mx-auto flex h-16 items-center justify-between max-w-7xl px-4 sm:px-6">

        {/* Logo */}
        <button
          onClick={() => router.push('/')}
          className="group flex items-center gap-2 focus:outline-none"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
            <Zap size={20} className="animate-pulse" fill="currentColor" />
          </div>
          <span className="font-headline text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
            W.Y.A
          </span>
        </button>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const active = isLinkActive(link)
            return (
              <button
                key={link.path}
                onClick={() => router.push(link.path)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-full ${
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 rounded-full bg-primary/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </button>
            )
          })}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search */}
          <div className="relative">
            <AnimatePresence>
              {searchOpen ? (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="flex items-center gap-2 px-3 h-10 rounded-full border border-border/50 bg-muted/30 focus-within:bg-background focus-within:border-primary/50 transition-colors overflow-hidden"
                >
                  <Search size={16} className="text-muted-foreground shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search events…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    className="bg-transparent outline-none text-sm w-full text-foreground placeholder:text-muted-foreground font-body"
                  />
                  <button
                    onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                    className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="search-btn"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setSearchOpen(true)}
                  className="h-10 w-10 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Search size={18} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setNotificationMenuOpen((open) => !open)}
              className="h-10 w-10 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors relative"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-destructive ring-2 ring-background" />
              )}
            </button>

            <AnimatePresence>
              {notificationMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="card-elevated absolute right-0 mt-2 w-80 sm:w-96 overflow-hidden z-50 origin-top-right"
                >
                  <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
                    <div>
                      <h3 className="font-semibold text-foreground">Notifications</h3>
                      <p className="text-xs text-muted-foreground">You have {unreadCount} unread</p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMarkAllRead(); }}
                        className="p-2 rounded-full text-primary hover:bg-primary/10 transition-colors"
                        title="Mark all as read"
                      >
                        <CheckCheck size={18} />
                      </button>
                    )}
                  </div>

                  <div className="max-h-[350px] overflow-y-auto no-scrollbar p-2 space-y-1">
                    {allNotifications.length === 0 ? (
                      <div className="py-8 text-center px-4">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-3">
                          <Bell size={20} className="text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-foreground">All caught up!</p>
                        <p className="mt-1 text-xs text-muted-foreground">Check back later for new updates.</p>
                      </div>
                    ) : (
                      allNotifications.map((notification) => {
                        const tone = notificationToneStyles[notification.tone]
                        return (
                          <button
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`w-full p-3 text-left transition-all duration-200 rounded-xl border border-transparent hover:border-border/50 ${
                              notification.read ? 'opacity-60 hover:opacity-100' : 'bg-muted/30 hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${tone.bg} ${tone.border} ${tone.text}`}>
                                <Bell size={14} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-medium text-foreground truncate">{notification.title}</p>
                                  {notification.createdAt && (
                                    <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(notification.createdAt)}</span>
                                  )}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{notification.body}</p>
                              </div>
                              {!notification.read && (
                                <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                              )}
                            </div>
                          </button>
                        )
                      })
                    )}
                  </div>

                  <div className="p-2 border-t border-border/50 bg-muted/10">
                    <button
                      onClick={() => { setNotificationMenuOpen(false); router.push('/dashboard/bulletin') }}
                      className="w-full py-2.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      View All Bulletins
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
              className="group flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-transparent hover:border-border/50 hover:bg-muted/30 transition-all"
            >
              <div className="h-8 w-8 overflow-hidden rounded-full ring-2 ring-background border border-border/50">
                <img src={getUserAvatar(profile?.avatarUrl, profile?.displayName)} alt="Profile" className="h-full w-full object-cover" />
              </div>
              <ChevronDown size={14} className="text-muted-foreground group-hover:text-foreground transition-colors mr-1" />
            </button>

            <AnimatePresence>
              {profileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="card-elevated absolute right-0 mt-2 w-64 overflow-hidden z-50 origin-top-right p-2"
                >
                  <div className="p-3 mb-2 rounded-xl bg-muted/30 flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-background border border-border/50">
                      <img src={getUserAvatar(profile?.avatarUrl, profile?.displayName)} alt="Profile" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{profile?.displayName || 'User'}</p>
                      <p className="truncate text-xs text-muted-foreground">{profile?.email || ''}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        {mounted && resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                      </div>
                      <div className="text-left">
                        <p>{mounted && resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}</p>
                      </div>
                    </button>

                    <button
                      onClick={() => { setProfileMenuOpen(false); router.push('/profile'); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <User size={16} />
                      </div>
                      <div className="text-left">
                        <p>Profile</p>
                      </div>
                    </button>

                    <button
                      onClick={() => { setProfileMenuOpen(false); router.push('/about'); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/10 text-blue-500">
                        <Info size={16} />
                      </div>
                      <div className="text-left">
                        <p>About</p>
                      </div>
                    </button>
                  </div>

                  <div className="my-2 h-px bg-border/50" />

                  <button
                    onClick={async () => {
                      setProfileMenuOpen(false);
                      await logout();
                      router.push('/');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-destructive/10">
                      <LogOut size={16} />
                    </div>
                    <div className="text-left">
                      <p>Log Out</p>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
