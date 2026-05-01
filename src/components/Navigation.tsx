'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { getUserAvatar } from '@/lib/avatar';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { AnimatePresence, motion } from 'framer-motion';
import { Info, LogOut, Moon, Sun, User } from 'lucide-react';

export function SideNav() {
  const pathname = usePathname();
  const { profile } = useAuth();

  const navItems = [
    { name: 'Feed', href: '/feed', icon: 'dashboard' },
    { name: 'Dashboard', href: '/dashboard', icon: 'school' },
    { name: 'Bulletin', href: '/dashboard/bulletin', icon: 'campaign' },
    { name: 'Leaderboard', href: '/leaderboard', icon: 'emoji_events' },
    { name: 'Create', href: '/create', icon: 'add_circle' },
    { name: 'Profile', href: '/profile', icon: 'person' },
  ];

  return (
    <nav className="hidden md:flex flex-col h-screen sticky top-0 py-8 w-64 flex-shrink-0 bg-[var(--color-surface-container-lowest-base)] border-r-4 border-black">
      {/* Logo */}
      <Link href="/" className="px-6 mb-8 flex items-center gap-3 group">
        <div
          className="w-10 h-10 flex items-center justify-center font-headline font-bold text-lg border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none transition-all duration-150"
          style={{ background: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' }}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
        </div>
        <div>
          <h1 className="font-headline text-lg font-bold tracking-tight text-on-surface uppercase">CampusPulse</h1>
          <p className="font-body text-xs text-on-surface-variant">Student Event Hub</p>
        </div>
      </Link>

      <ul className="flex flex-col gap-1.5 px-4 flex-grow">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 font-label font-bold text-sm uppercase tracking-wider transition-all duration-150 ${
                  isActive
                    ? 'text-[var(--color-on-primary-container-base)] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]'
                    : 'text-on-surface-variant hover:text-on-surface hover:translate-x-[2px] border-4 border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                }`}
                style={isActive ? { background: 'var(--color-primary-container-base)' } : undefined}
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Create Event CTA */}
      <div className="px-4 mb-4">
        <Link
          href="/create"
          className="flex items-center justify-center gap-2 px-4 py-3 font-label font-bold text-sm uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150"
          style={{ background: 'var(--color-secondary-container-base)', color: 'var(--color-on-secondary-container-base)' }}
        >
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
          Drop an Event
        </Link>
      </div>

      {/* User Profile */}
      <div className="px-5 mt-auto pt-4 border-t-4 border-black">
        <Link
          href="/profile"
          className="flex items-center gap-3 px-2 py-2 hover:translate-x-[2px] transition-all duration-150"
        >
          <Image
            alt={profile?.displayName || 'User'}
            className="w-9 h-9 rounded-full object-cover border-2 border-black"
            src={getUserAvatar(profile?.avatarUrl, profile?.displayName)}
            width={36}
            height={36}
          />
          <div>
            <p className="text-sm font-bold text-on-surface font-headline uppercase">{profile?.displayName || 'User'}</p>
            <p className="text-xs text-on-surface-variant font-body">{profile?.role || 'Student'}</p>
          </div>
        </Link>
      </div>
    </nav>
  );
}

export function MobileHeader() {
  const router = useRouter();
  const { profile, logout } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="pointer-events-none fixed right-3 top-3 z-50 md:hidden sm:right-4 sm:top-4">
      <div className="pointer-events-auto relative" ref={menuRef}>
        <button
          onClick={() => setProfileMenuOpen((open) => !open)}
          className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          style={{ background: 'var(--color-primary-container-base)' }}
        >
          <img
            src={getUserAvatar(profile?.avatarUrl, profile?.displayName)}
            alt="Profile"
            className="relative z-10 h-full w-full object-cover"
          />
        </button>

        <AnimatePresence>
          {profileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute right-0 mt-3 w-[17.5rem] overflow-hidden border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] origin-top-right"
              style={{ background: 'var(--color-surface-container-lowest-base)' }}
            >
              <div className="relative z-10 p-3">
                {/* Profile Card */}
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
                    <User size={16} className="mb-2 text-on-surface" />
                    <p className="text-sm font-bold text-on-surface font-label uppercase">Profile</p>
                    <p className="mt-0.5 text-[11px] text-on-surface-variant">Your card</p>
                  </button>

                  <button
                    onClick={() => { setProfileMenuOpen(false); router.push('/about'); }}
                    className="px-3.5 py-3 text-left transition-all duration-150 hover:translate-x-[2px] border-2 border-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    style={{ background: 'var(--color-tertiary-container-base)' }}
                  >
                    <Info size={16} className="mb-2 text-on-surface" />
                    <p className="text-sm font-bold text-on-surface font-label uppercase">About</p>
                    <p className="mt-0.5 text-[11px] text-on-surface-variant">Our mission</p>
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
                      <p className="text-sm font-bold text-on-surface font-label uppercase">Log out</p>
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
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/home', icon: 'home', exact: true },
    { name: 'Feed', href: '/feed', icon: 'dashboard', exact: true },
    { name: 'Create', href: '/create', icon: 'add_circle', exact: true },
    { name: 'Dash', href: '/dashboard', icon: 'school', exact: true },
    { name: 'Board', href: '/leaderboard', icon: 'emoji_events', exact: true },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:hidden"
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="mx-auto flex w-full max-w-[32rem] items-center border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
        style={{ pointerEvents: 'auto', background: 'var(--color-surface-container-lowest-base)' }}
      >
        {navItems.map((item, index) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-all duration-150 active:scale-95 sm:text-[11px] font-label ${
                index < navItems.length - 1 ? 'border-r-4 border-black' : ''
              } ${isActive ? 'text-[var(--color-on-primary-container-base)]' : 'text-on-surface-variant'}`}
              style={isActive ? { background: 'var(--color-primary-container-base)' } : undefined}
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
              <span className="truncate leading-none">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
