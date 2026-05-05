'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { gsap } from 'gsap'
import { Bell, Search, Sun, Moon, LogOut, Zap, CheckCheck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from 'next-themes'
import { getUserAvatar } from '@/lib/avatar'
import { NotificationData } from '@/types'
import { subscribeToNotifications, markAsRead, markAllAsRead } from '@/services/notificationService'
import { BulletinAlert } from '@/types/bulletin'
import { AnimatePresence, motion } from 'framer-motion'

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

type PillNavItem = { label: string; href: string }

export default function PillNavbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { profile, logout } = useAuth()
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [localNotifications, setLocalNotifications] = useState<NotificationData[]>([])
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // PillNav GSAP refs
  const circleRefs = useRef<Array<HTMLSpanElement | null>>([])
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([])
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([])
  const navItemsRef = useRef<HTMLDivElement | null>(null)
  const logoRef = useRef<HTMLButtonElement | null>(null)
  const hamburgerRef = useRef<HTMLButtonElement | null>(null)
  const mobileMenuRef = useRef<HTMLDivElement | null>(null)
  const profileMenuRef = useRef<HTMLDivElement | null>(null)
  const notificationRef = useRef<HTMLDivElement | null>(null)

  const ease = 'power3.out'

  const items: PillNavItem[] = [
    { label: 'Home', href: '/home' },
    { label: 'Events', href: '/feed' },
    { label: 'Organize', href: '/create' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Board', href: '/bulletin' },
  ]

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  // Notifications
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
        items.push({ id: 'complete-profile', title: 'Complete Your Profile', body: 'Fill in your details to unlock all features.', path: '/profile', type: 'system', tone: 'info', read: false, createdAt: null })
      }
      try {
        const res = await fetch('/api/bulletin')
        if (res.ok) {
          const data = await res.json()
          if (data.alerts) data.alerts.forEach((alert: BulletinAlert) => {
            items.push({ id: `bulletin-${alert.id}`, title: `${alert.severity} ${alert.type.toLowerCase()} bulletin`, body: alert.title, path: '/bulletin', type: 'bulletin', tone: 'alert', read: false, createdAt: null })
          })
        }
      } catch {}
      if (!cancelled.current) setLocalNotifications(items)
    }
    loadLocal()
    return () => { cancelled.current = true }
  }, [profile?.profileComplete])

  const allNotifications = [...notifications, ...localNotifications]
  const unreadCount = allNotifications.filter(n => !n.read).length

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileOpen && profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
      if (notificationMenuOpen && notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setNotificationMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [profileOpen, notificationMenuOpen])

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

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href
    return pathname.startsWith(href)
  }

  // ── GSAP pill animations ──
  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return
        const pill = circle.parentElement as HTMLElement
        const rect = pill.getBoundingClientRect()
        const { width: w, height: h } = rect
        const R = ((w * w) / 4 + h * h) / (2 * h)
        const D = Math.ceil(2 * R) + 2
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1
        const originY = D - delta

        circle.style.width = `${D}px`
        circle.style.height = `${D}px`
        circle.style.bottom = `-${delta}px`

        gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${originY}px` })

        const label = pill.querySelector<HTMLElement>('.pill-label')
        const white = pill.querySelector<HTMLElement>('.pill-label-hover')
        if (label) gsap.set(label, { y: 0 })
        if (white) gsap.set(white, { y: h + 12, opacity: 0 })

        tlRefs.current[index]?.kill()
        const tl = gsap.timeline({ paused: true })
        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0)
        if (label) tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0)
        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 })
          tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0)
        }
        tlRefs.current[index] = tl
      })
    }

    layout()
    window.addEventListener('resize', layout)
    if (document.fonts) document.fonts.ready.then(layout).catch(() => {})

    // Initial load animation
    const logo = logoRef.current
    const navItems = navItemsRef.current
    if (logo) { gsap.set(logo, { scale: 0 }); gsap.to(logo, { scale: 1, duration: 0.6, ease }) }
    if (navItems) { gsap.set(navItems, { width: 0, overflow: 'hidden' }); gsap.to(navItems, { width: 'auto', duration: 0.6, ease }) }

    const menu = mobileMenuRef.current
    if (menu) gsap.set(menu, { visibility: 'hidden', opacity: 0 })

    return () => window.removeEventListener('resize', layout)
  }, [])

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i]
    if (!tl) return
    activeTweenRefs.current[i]?.kill()
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), { duration: 0.3, ease, overwrite: 'auto' })
  }
  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i]
    if (!tl) return
    activeTweenRefs.current[i]?.kill()
    activeTweenRefs.current[i] = tl.tweenTo(0, { duration: 0.2, ease, overwrite: 'auto' })
  }

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen
    setIsMobileMenuOpen(newState)
    const hamburger = hamburgerRef.current
    const menu = mobileMenuRef.current
    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line')
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease })
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease })
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease })
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease })
      }
    }
    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: 'visible' })
        gsap.fromTo(menu, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease, transformOrigin: 'top center' })
      } else {
        gsap.to(menu, { opacity: 0, y: 10, duration: 0.2, ease, onComplete: () => gsap.set(menu, { visibility: 'hidden' }) })
      }
    }
  }

  const navigate = (href: string) => {
    setIsMobileMenuOpen(false)
    setProfileOpen(false)
    setNotificationMenuOpen(false)
    router.push(href)
  }

  // Theme-aware colors pulled from the design system
  const isDark = mounted && resolvedTheme === 'dark'
  const pillColor = isDark ? 'hsl(240, 20%, 18%)' : 'hsl(258, 30%, 22%)'
  const baseColor = isDark ? 'hsl(240, 20%, 10%)' : 'hsl(258, 20%, 95%)'
  const pillText  = isDark ? 'hsl(0, 0%, 88%)'    : 'hsl(0, 0%, 100%)'
  const hoverText = isDark ? 'hsl(0, 0%, 92%)'    : 'hsl(258, 30%, 22%)'

  const cssVars = {
    ['--base']: baseColor,
    ['--pill-bg']: pillColor,
    ['--hover-text']: hoverText,
    ['--pill-text']: pillText,
    ['--nav-h']: '42px',
    ['--pill-pad-x']: '16px',
    ['--pill-gap']: '3px',
  } as React.CSSProperties

  return (
    <div className="fixed top-4 left-0 right-0 z-[60] px-6 md:px-10 pointer-events-none">
      <div className="relative flex items-center justify-center w-full mx-auto max-w-[1600px]" style={cssVars}>
        <nav
          className="flex items-center justify-center gap-2 pointer-events-auto"
          aria-label="Primary"
        >
          {/* Logo */}
        <button
          ref={logoRef}
          onClick={() => navigate('/')}
          className="rounded-full p-1.5 inline-flex items-center justify-center overflow-hidden shrink-0"
          style={{ width: 'var(--nav-h)', height: 'var(--nav-h)', background: 'var(--base)' }}
        >
          <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
            <Zap size={18} fill="currentColor" />
          </div>
        </button>

        {/* Desktop pill items */}
        <div
          ref={navItemsRef}
          className="relative items-center rounded-full hidden md:flex ml-1"
          style={{ height: 'var(--nav-h)', background: 'var(--base)' }}
        >
          <ul role="menubar" className="list-none flex items-stretch m-0 p-[3px] h-full" style={{ gap: 'var(--pill-gap)' }}>
            {items.map((item, i) => {
              const active = isActive(item.href)
              return (
                <li key={item.href} role="none" className="flex h-full">
                  <button
                    role="menuitem"
                    onClick={() => navigate(item.href)}
                    className="relative overflow-hidden inline-flex items-center justify-center h-full no-underline rounded-full box-border font-semibold text-[14px] leading-[0] uppercase tracking-[0.3px] whitespace-nowrap cursor-pointer"
                    style={{ background: 'var(--pill-bg)', color: 'var(--pill-text)', paddingLeft: 'var(--pill-pad-x)', paddingRight: 'var(--pill-pad-x)' }}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                    aria-label={item.label}
                  >
                    <span
                      className="hover-circle absolute left-1/2 bottom-0 rounded-full z-[1] block pointer-events-none"
                      style={{ background: 'var(--base)', willChange: 'transform' }}
                      aria-hidden="true"
                      ref={el => { circleRefs.current[i] = el }}
                    />
                    <span className="label-stack relative inline-block leading-[1] z-[2]">
                      <span className="pill-label relative z-[2] inline-block leading-[1]" style={{ willChange: 'transform' }}>{item.label}</span>
                      <span className="pill-label-hover absolute left-0 top-0 z-[3] inline-block" style={{ color: 'var(--hover-text)', willChange: 'transform, opacity' }} aria-hidden="true">{item.label}</span>
                    </span>
                    {active && (
                      <span className="absolute left-1/2 -bottom-[6px] -translate-x-1/2 w-2.5 h-2.5 rounded-full z-[4]" style={{ background: 'var(--base)' }} aria-hidden="true" />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        </nav>

        {/* Right actions cluster */}
        <div className="hidden md:flex absolute right-0 top-0 items-center gap-1 rounded-full px-1 pointer-events-auto" style={{ height: 'var(--nav-h)', background: 'var(--base)' }}>
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => {
                setNotificationMenuOpen(!notificationMenuOpen)
                setProfileOpen(false)
              }}
              className="relative rounded-full inline-flex items-center justify-center w-9 h-9 transition-colors"
              style={{ background: 'var(--pill-bg)', color: 'var(--pill-text)' }}
            >
              <Bell size={15} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>

            <AnimatePresence>
              {notificationMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="absolute right-0 mt-3 w-80 sm:w-96 rounded-[20px] border border-white/10 dark:border-white/5 bg-white/70 dark:bg-black/60 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden z-[100] origin-top-right p-2 ring-1 ring-black/5 dark:ring-white/10"
                >
                  <div className="p-3 mb-2 rounded-[16px] bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-between border border-primary/10">
                    <div>
                      <h3 className="font-bold text-foreground text-sm leading-tight">Notifications</h3>
                      <p className="text-[12px] font-medium text-muted-foreground opacity-80">You have {unreadCount} unread</p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMarkAllRead(); }}
                        className="p-1.5 rounded-full text-primary hover:bg-primary/20 transition-colors"
                        title="Mark all as read"
                      >
                        <CheckCheck size={16} />
                      </button>
                    )}
                  </div>

                  <div className="max-h-[350px] overflow-y-auto no-scrollbar px-1 space-y-1">
                    {allNotifications.length === 0 ? (
                      <div className="py-8 text-center px-4">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/5 dark:bg-white/5 mb-3">
                          <Bell size={20} className="text-muted-foreground" />
                        </div>
                        <p className="font-semibold text-foreground text-sm">All caught up!</p>
                        <p className="mt-1 text-xs text-muted-foreground opacity-80">Check back later for new updates.</p>
                      </div>
                    ) : (
                      allNotifications.map((notification) => {
                        const tone = notificationToneStyles[notification.tone]
                        return (
                          <button
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`w-full p-3 text-left transition-all duration-200 rounded-xl hover:translate-x-1 ${
                              notification.read ? 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10' : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${tone.bg} ${tone.border} ${tone.text}`}>
                                <Bell size={14} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="font-semibold text-[13px] text-foreground truncate">{notification.title}</p>
                                  {notification.createdAt && (
                                    <span className="shrink-0 text-[10px] font-medium text-muted-foreground">{timeAgo(notification.createdAt)}</span>
                                  )}
                                </div>
                                <p className="mt-0.5 text-xs text-foreground/70 line-clamp-2 leading-relaxed">{notification.body}</p>
                              </div>
                              {!notification.read && (
                                <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0 shadow-[0_0_8px_var(--cp-primary)]" />
                              )}
                            </div>
                          </button>
                        )
                      })
                    )}
                  </div>

                  <div className="my-2 h-px bg-border/40 mx-2" />
                  
                  <div className="px-1 pb-1">
                    <button
                      onClick={() => { setNotificationMenuOpen(false); router.push('/bulletin') }}
                      className="w-full py-2.5 text-xs font-semibold text-primary hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all"
                    >
                      View All Bulletins
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="rounded-full inline-flex items-center justify-center w-9 h-9 transition-colors"
            style={{ background: 'var(--pill-bg)', color: 'var(--pill-text)' }}
          >
            {mounted && resolvedTheme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Profile */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="rounded-full overflow-hidden w-9 h-9 border-2"
              style={{ borderColor: 'var(--pill-bg)' }}
            >
              <img src={getUserAvatar(profile?.avatarUrl, profile?.displayName)} alt="Profile" className="h-full w-full object-cover" />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="absolute right-0 mt-3 w-64 rounded-[20px] border border-white/10 dark:border-white/5 bg-white/70 dark:bg-black/60 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden z-[100] origin-top-right p-2 ring-1 ring-black/5 dark:ring-white/10"
                >
                  <div className="p-3 mb-2 rounded-[16px] bg-gradient-to-br from-primary/10 to-transparent flex items-center gap-3 border border-primary/10">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-background shadow-md">
                      <img src={getUserAvatar(profile?.avatarUrl, profile?.displayName)} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-bold text-foreground leading-tight">{profile?.displayName || 'User'}</p>
                      <p className="truncate text-[12px] font-medium text-muted-foreground opacity-80">{profile?.email || ''}</p>
                    </div>
                  </div>
                  
                  <div className="px-1 space-y-0.5">
                    <button onClick={() => navigate('/profile')} className="w-full text-left px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/10 hover:translate-x-1 transition-all text-foreground/90 hover:text-foreground">Profile</button>
                    <button onClick={() => navigate('/leaderboard')} className="w-full text-left px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/10 hover:translate-x-1 transition-all text-foreground/90 hover:text-foreground">Leaderboard</button>
                    <button onClick={() => navigate('/about')} className="w-full text-left px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/10 hover:translate-x-1 transition-all text-foreground/90 hover:text-foreground">About</button>
                  </div>
                  
                  <div className="my-2 h-px bg-border/40 mx-2" />
                  
                  <div className="px-1 pb-1">
                    <button
                      onClick={async () => { setProfileOpen(false); await logout(); router.push('/') }}
                      className="w-full text-left px-3 py-2.5 text-sm font-semibold rounded-xl hover:bg-destructive/10 transition-all text-destructive hover:text-destructive flex items-center gap-2 group"
                    >
                      <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Log Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          ref={hamburgerRef}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
          className="md:hidden rounded-full border-0 flex flex-col items-center justify-center gap-1 cursor-pointer p-0 shrink-0 pointer-events-auto"
          style={{ width: 'var(--nav-h)', height: 'var(--nav-h)', background: 'var(--base)' }}
        >
          <span className="hamburger-line w-4 h-0.5 rounded origin-center" style={{ background: 'var(--pill-bg)' }} />
          <span className="hamburger-line w-4 h-0.5 rounded origin-center" style={{ background: 'var(--pill-bg)' }} />
        </button>
      </div>

      {/* Mobile dropdown */}
      <div
        ref={mobileMenuRef}
        className="md:hidden absolute top-[4em] left-0 right-0 rounded-[24px] border border-white/10 dark:border-white/5 bg-white/70 dark:bg-black/60 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden z-[998] origin-top ring-1 ring-black/5 dark:ring-white/10 p-2"
        style={cssVars}
      >
        <ul className="list-none m-0 p-[2px] flex flex-col gap-1">
          {[...items, { label: 'Profile', href: '/profile' }, { label: 'Leaderboard', href: '/leaderboard' }].map(item => (
            <li key={item.href}>
              <button
                onClick={() => navigate(item.href)}
                className="w-full text-left block py-3.5 px-5 text-[15px] font-semibold rounded-2xl transition-all duration-200 hover:translate-x-1 hover:bg-black/5 dark:hover:bg-white/10"
                style={{ color: 'var(--pill-text)' }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
