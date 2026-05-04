'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Search, Bell, Sun, Moon, User, LogOut, Info, Zap, CheckCheck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react'
import { useTheme } from 'next-themes'
import { AnimatePresence, motion } from 'framer-motion'
import { getUserAvatar } from '@/lib/avatar'
import { NotificationData } from '@/types'
import { subscribeToNotifications, markAsRead, markAllAsRead } from '@/services/notificationService'
import { BulletinAlert } from '@/types/bulletin'
import { gsap } from 'gsap'

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

export default function StaggeredNav() {
  const router = useRouter()
  const pathname = usePathname()
  const { profile, logout } = useAuth()
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [localNotifications, setLocalNotifications] = useState<NotificationData[]>([])

  // GSAP refs
  const panelRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<HTMLAnchorElement[]>([])
  const openRef = useRef(false)
  const busyRef = useRef(false)
  const plusHRef = useRef<HTMLSpanElement>(null)
  const plusVRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  // Notification subscriptions (same as old navbar)
  useEffect(() => {
    if (!profile?.id) return
    const unsub = subscribeToNotifications(profile.id, setNotifications)
    return () => unsub()
  }, [profile?.id])

  useEffect(() => {
    const cancelled = { current: false }
    async function loadLocal() {
      const items: NotificationData[] = []
      if (!profile?.profileComplete) {
        items.push({
          id: 'complete-profile',
          title: 'Complete Your Profile',
          body: 'Fill in your details to unlock all features.',
          path: '/profile',
          type: 'system',
          tone: 'info',
          read: false,
          createdAt: null,
        })
      }
      try {
        const res = await fetch('/api/bulletin')
        if (res.ok) {
          const data = await res.json()
          if (data.alerts)
            data.alerts.forEach((alert: BulletinAlert) => {
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
      } catch {}
      if (!cancelled.current) setLocalNotifications(items)
    }
    loadLocal()
    return () => { cancelled.current = true }
  }, [profile?.profileComplete])

  const allNotifications = [...notifications, ...localNotifications]
  const unreadCount = allNotifications.filter((n) => !n.read).length

  const navLinks = [
    { label: 'Home', path: '/home' },
    { label: 'Events', path: '/feed' },
    { label: 'Organize', path: '/create' },
    { label: 'Dashboard', path: '/dashboard', exact: true },
    { label: 'Leaderboard', path: '/leaderboard' },
    { label: 'Noticeboard', path: '/bulletin' },
    { label: 'Profile', path: '/profile' },
  ]

  const isLinkActive = (link: typeof navLinks[0]) => {
    if ((link as any).exact) return pathname === link.path
    return pathname.startsWith(link.path)
  }

  const handleMarkAllRead = useCallback(async () => {
    if (!profile?.id) return
    await markAllAsRead(profile.id)
    setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [profile?.id])

  const handleNotificationClick = useCallback(async (notification: NotificationData) => {
    if (profile?.id && !notification.id.startsWith('complete-profile') && !notification.id.startsWith('bulletin-')) {
      markAsRead(profile.id, notification.id)
    }
    closeMenu()
    router.push(notification.path)
  }, [profile?.id, router])

  // ── GSAP animations ──
  useLayoutEffect(() => {
    const h = plusHRef.current
    const v = plusVRef.current
    const panel = panelRef.current
    if (h) gsap.set(h, { rotate: 0, transformOrigin: '50% 50%' })
    if (v) gsap.set(v, { rotate: 90, transformOrigin: '50% 50%' })
    if (panel) gsap.set(panel, { xPercent: 100 })
  }, [])

  const playOpen = useCallback(() => {
    const panel = panelRef.current
    const overlay = overlayRef.current
    if (!panel || busyRef.current) return
    busyRef.current = true

    const items = itemsRef.current.filter(Boolean)
    gsap.set(items, { yPercent: 120, rotate: 8 })

    const tl = gsap.timeline({
      onComplete: () => { busyRef.current = false },
    })

    if (overlay) tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' }, 0)
    tl.fromTo(panel, { xPercent: 100 }, { xPercent: 0, duration: 0.55, ease: 'power4.out' }, 0.05)
    if (items.length) {
      tl.to(items, { yPercent: 0, rotate: 0, duration: 0.8, ease: 'power4.out', stagger: 0.07 }, 0.2)
    }

    // icon → X
    const h = plusHRef.current, v = plusVRef.current
    if (h && v) {
      tl.to(h, { rotate: 45, duration: 0.4, ease: 'power4.out' }, 0)
      tl.to(v, { rotate: -45, duration: 0.4, ease: 'power4.out' }, 0)
    }
  }, [])

  const playClose = useCallback(() => {
    const panel = panelRef.current
    const overlay = overlayRef.current
    if (!panel) return

    const tl = gsap.timeline({
      onComplete: () => { busyRef.current = false },
    })

    tl.to(panel, { xPercent: 100, duration: 0.35, ease: 'power3.in' }, 0)
    if (overlay) tl.to(overlay, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.05)

    const h = plusHRef.current, v = plusVRef.current
    if (h && v) {
      tl.to(h, { rotate: 0, duration: 0.3, ease: 'power3.inOut' }, 0)
      tl.to(v, { rotate: 90, duration: 0.3, ease: 'power3.inOut' }, 0)
    }
  }, [])

  const toggleMenu = useCallback(() => {
    const target = !openRef.current
    openRef.current = target
    setOpen(target)
    if (target) playOpen()
    else playClose()
  }, [playOpen, playClose])

  const closeMenu = useCallback(() => {
    if (openRef.current) {
      openRef.current = false
      setOpen(false)
      playClose()
    }
  }, [playClose])

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      closeMenu()
      router.push(`/feed?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const navigate = (path: string) => {
    closeMenu()
    router.push(path)
  }

  return (
    <>
      {/* ── Fixed top bar: logo + toggle ── */}
      <div className="fixed top-0 left-0 w-full z-[60] flex items-center justify-between px-5 sm:px-8 h-16 pointer-events-none">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="pointer-events-auto group flex items-center gap-2 focus:outline-none"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
            <Zap size={20} className="animate-pulse" fill="currentColor" />
          </div>
          <span className="font-headline text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
            W.Y.A
          </span>
        </button>

        {/* Right side: notification badge + hamburger */}
        <div className="pointer-events-auto flex items-center gap-3">
          {/* Notification dot indicator */}
          {unreadCount > 0 && (
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={toggleMenu}>
              <Bell size={18} />
              <span className="absolute top-2 right-2 flex h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background" />
            </div>
          )}

          {/* Hamburger toggle */}
          <button
            onClick={toggleMenu}
            className="relative inline-flex items-center gap-2 bg-transparent border-0 cursor-pointer text-foreground font-medium text-sm"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <span className="hidden sm:inline">{open ? 'Close' : 'Menu'}</span>
            <span className="relative w-[18px] h-[18px] inline-flex items-center justify-center">
              <span ref={plusHRef} className="absolute left-1/2 top-1/2 w-full h-[2px] bg-current rounded-full -translate-x-1/2 -translate-y-1/2" />
              <span ref={plusVRef} className="absolute left-1/2 top-1/2 w-full h-[2px] bg-current rounded-full -translate-x-1/2 -translate-y-1/2" />
            </span>
          </button>
        </div>
      </div>

      {/* ── Overlay ── */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm"
        style={{ opacity: 0, pointerEvents: open ? 'auto' : 'none' }}
        onClick={closeMenu}
      />

      {/* ── Slide-out panel ── */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full z-[58] flex flex-col overflow-y-auto"
        style={{
          width: 'clamp(300px, 40vw, 440px)',
          background: 'var(--cp-surface, #fff)',
          borderLeft: '1px solid var(--cp-border, #e5e5e5)',
          boxShadow: '-8px 0 40px rgba(0,0,0,.12)',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {/* Panel header spacer */}
        <div className="h-20 shrink-0" />

        {/* Search */}
        <div className="px-6 mb-6">
          <div className="flex items-center gap-2 px-4 h-11 rounded-xl border border-border/50 bg-muted/30 focus-within:border-primary/50 transition-colors">
            <Search size={16} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search events…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="bg-transparent outline-none text-sm w-full text-foreground placeholder:text-muted-foreground font-body"
            />
          </div>
        </div>

        {/* Nav links */}
        <nav className="px-6 flex flex-col gap-1">
          {navLinks.map((link, i) => {
            const active = isLinkActive(link)
            return (
              <a
                key={link.path}
                ref={(el) => { if (el) itemsRef.current[i] = el }}
                onClick={(e) => { e.preventDefault(); navigate(link.path) }}
                href={link.path}
                className={`relative block text-[2rem] sm:text-[2.5rem] font-bold uppercase tracking-tight leading-tight cursor-pointer transition-colors overflow-hidden py-1 ${
                  active ? 'text-primary' : 'text-foreground hover:text-primary'
                }`}
                style={{ transformOrigin: '50% 100%' }}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-primary" />
                )}
                <span className={active ? 'pl-4' : ''}>{link.label}</span>
              </a>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="mx-6 my-5 h-px bg-border/50" />

        {/* Notifications summary */}
        <div className="px-6 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Notifications {unreadCount > 0 && <span className="text-primary">({unreadCount})</span>}
            </h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-primary hover:underline flex items-center gap-1">
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {allNotifications.length === 0 ? (
              <p className="text-xs text-muted-foreground">All caught up!</p>
            ) : (
              allNotifications.slice(0, 5).map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs ${
                    n.read
                      ? 'border-transparent opacity-60 hover:opacity-100'
                      : 'border-primary/20 bg-primary/5'
                  }`}
                >
                  <p className="font-medium text-foreground truncate">{n.title}</p>
                  <p className="text-muted-foreground mt-0.5 line-clamp-1">{n.body}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Bottom actions */}
        <div className="mt-auto px-6 py-6 border-t border-border/50 space-y-2">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
              {mounted && resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </div>
            {mounted && resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>

          {/* About */}
          <button
            onClick={() => navigate('/about')}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/10 text-blue-500">
              <Info size={16} />
            </div>
            About
          </button>

          {/* Logout */}
          <button
            onClick={async () => { closeMenu(); await logout(); router.push('/') }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-destructive/10">
              <LogOut size={16} />
            </div>
            Log Out
          </button>
        </div>
      </div>
    </>
  )
}
