'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { gsap } from 'gsap'
import { Bell, Search, Sun, Moon, LogOut, Zap } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from 'next-themes'
import { getUserAvatar } from '@/lib/avatar'
import { NotificationData } from '@/types'
import { subscribeToNotifications, markAsRead, markAllAsRead } from '@/services/notificationService'
import { BulletinAlert } from '@/types/bulletin'
import { AnimatePresence, motion } from 'framer-motion'

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
            items.push({ id: `bulletin-${alert.id}`, title: `${alert.severity} ${alert.type.toLowerCase()} bulletin`, body: alert.title, path: '/dashboard/bulletin', type: 'bulletin', tone: 'alert', read: false, createdAt: null })
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

  // Close profile menu on outside click
  useEffect(() => {
    if (!profileOpen) return
    const handler = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [profileOpen])

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
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] md:w-auto">
      <nav
        className="w-full md:w-max flex items-center justify-between md:justify-center gap-2 px-2 md:px-0 mx-auto"
        aria-label="Primary"
        style={cssVars}
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

        {/* Right actions cluster */}
        <div className="hidden md:flex items-center gap-1 ml-1 rounded-full px-1" style={{ height: 'var(--nav-h)', background: 'var(--base)' }}>
          {/* Notifications */}
          <button
            onClick={() => navigate('/dashboard/bulletin')}
            className="relative rounded-full inline-flex items-center justify-center w-9 h-9 transition-colors"
            style={{ background: 'var(--pill-bg)', color: 'var(--pill-text)' }}
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

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
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-border/50 bg-background shadow-xl overflow-hidden z-50 origin-top-right p-1.5"
                >
                  <div className="p-3 mb-1 rounded-xl bg-muted/30 flex items-center gap-3">
                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border/50">
                      <img src={getUserAvatar(profile?.avatarUrl, profile?.displayName)} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{profile?.displayName || 'User'}</p>
                      <p className="truncate text-xs text-muted-foreground">{profile?.email || ''}</p>
                    </div>
                  </div>
                  <button onClick={() => navigate('/profile')} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted/50 transition-colors text-foreground">Profile</button>
                  <button onClick={() => navigate('/leaderboard')} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted/50 transition-colors text-foreground">Leaderboard</button>
                  <button onClick={() => navigate('/about')} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted/50 transition-colors text-foreground">About</button>
                  <div className="my-1 h-px bg-border/50" />
                  <button
                    onClick={async () => { setProfileOpen(false); await logout(); router.push('/') }}
                    className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 transition-colors text-destructive flex items-center gap-2"
                  >
                    <LogOut size={14} /> Log Out
                  </button>
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
          className="md:hidden rounded-full border-0 flex flex-col items-center justify-center gap-1 cursor-pointer p-0 shrink-0"
          style={{ width: 'var(--nav-h)', height: 'var(--nav-h)', background: 'var(--base)' }}
        >
          <span className="hamburger-line w-4 h-0.5 rounded origin-center" style={{ background: 'var(--pill-bg)' }} />
          <span className="hamburger-line w-4 h-0.5 rounded origin-center" style={{ background: 'var(--pill-bg)' }} />
        </button>
      </nav>

      {/* Mobile dropdown */}
      <div
        ref={mobileMenuRef}
        className="md:hidden absolute top-[3.5em] left-0 right-0 rounded-[22px] shadow-xl z-[998] origin-top"
        style={{ ...cssVars, background: 'var(--base)' }}
      >
        <ul className="list-none m-0 p-[3px] flex flex-col gap-[3px]">
          {[...items, { label: 'Profile', href: '/profile' }, { label: 'Leaderboard', href: '/leaderboard' }].map(item => (
            <li key={item.href}>
              <button
                onClick={() => navigate(item.href)}
                className="w-full text-left block py-3 px-4 text-sm font-medium rounded-[50px] transition-all duration-200"
                style={{ background: 'var(--pill-bg)', color: 'var(--pill-text)' }}
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
