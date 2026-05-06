'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { getUserAvatar } from '@/lib/avatar';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Info, LogOut, Moon, Sun, User, LayoutDashboard,
  GraduationCap, Megaphone, Trophy, PlusCircle, Home, Compass, Zap,
} from 'lucide-react';

export function SideNav() {
  const pathname = usePathname();
  const { profile } = useAuth();

  const navItems = [
    { name: 'Home',        href: '/home',              icon: Home },
    { name: 'Feed',        href: '/feed',              icon: LayoutDashboard },
    { name: 'Dashboard',   href: '/dashboard',         icon: GraduationCap },
    { name: 'Bulletin',    href: '/bulletin', icon: Megaphone },
    { name: 'Leaderboard', href: '/leaderboard',       icon: Trophy },
    { name: 'Profile',     href: '/profile',           icon: User },
  ];

  return (
    <nav
      className="hidden md:flex flex-col h-screen sticky top-0 py-6 w-64 flex-shrink-0 border-r"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderColor: 'var(--cp-border)',
      }}
    >
      <Link href="/home" className="px-6 mb-10 flex items-center gap-3 group focus:outline-none">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
          style={{ 
            background: 'linear-gradient(135deg, var(--cp-primary), var(--cp-violet))', 
            boxShadow: '0 8px 24px -6px hsl(from var(--cp-primary) h s l / 0.5)' 
          }}
        >
          <Zap size={22} className="text-white fill-current animate-pulse-slow" />
        </div>
        <div>
          <h1 className="font-headline text-lg font-bold tracking-tight leading-none" style={{ color: 'var(--cp-text-1)' }}>W.Y.A</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-70" style={{ color: 'var(--cp-primary)' }}>Where You At</p>
        </div>
      </Link>

      <ul className="flex flex-col gap-1 px-3 flex-grow">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className="relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group"
              >
                {isActive && (
                  <>
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl"
                      style={{ 
                        background: 'linear-gradient(to right, var(--cp-primary-light), transparent)',
                        borderLeft: '3px solid var(--cp-primary)'
                      }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                    <motion.div
                      layoutId="sidebar-accent"
                      className="absolute left-0 top-1/4 h-1/2 w-1 rounded-r-full"
                      style={{ background: 'linear-gradient(to bottom, var(--cp-primary), var(--cp-violet))' }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  </>
                )}
                {!isActive && (
                  <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'var(--cp-surface-dim)' }} />
                )}
                <Icon 
                  size={18} 
                  className="relative z-10 transition-colors duration-300"
                  style={{ color: isActive ? 'var(--cp-primary)' : 'var(--cp-text-3)' }} 
                />
                <span 
                  className="relative z-10 transition-colors duration-300"
                  style={{ color: isActive ? 'var(--cp-primary)' : 'var(--cp-text-2)' }}
                >
                  {item.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="px-4 mb-4 mt-auto">
        <Link href="/create" className="btn-primary w-full" style={{ borderRadius: 'var(--r-xl)', fontSize: '0.875rem' }}>
          <PlusCircle size={17} />
          Drop an Event
        </Link>
      </div>

      <div className="px-4 pb-2">
        <Link
          href="/profile"
          className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all"
          style={{ background: 'var(--cp-surface-dim)', border: '1px solid var(--cp-border)' }}
        >
          <div className="h-9 w-9 overflow-hidden rounded-full shrink-0" style={{ border: '2px solid var(--cp-primary)' }}>
            <Image alt={profile?.displayName || 'User'} className="h-full w-full object-cover" src={getUserAvatar(profile?.avatarUrl, profile?.displayName)} width={36} height={36} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold" style={{ color: 'var(--cp-text-1)' }}>{profile?.displayName || 'User'}</p>
            <p className="truncate text-xs" style={{ color: 'var(--cp-text-3)' }}>{profile?.role || 'Student'}</p>
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
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setProfileMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItemStyle = {
    base: 'w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all cursor-pointer',
  };

  return (
    <div className="pointer-events-none fixed right-3 top-3 z-50 md:hidden sm:right-4 sm:top-4">
      <div className="pointer-events-auto relative" ref={menuRef}>
        <button
          onClick={() => setProfileMenuOpen((o) => !o)}
          className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full transition-all"
          style={{ border: '2.5px solid var(--cp-primary)', boxShadow: '0 4px 16px -4px hsl(from var(--cp-primary) h s l / 0.4)' }}
          aria-label="Open profile menu"
        >
          <img src={getUserAvatar(profile?.avatarUrl, profile?.displayName)} alt="Profile" className="h-full w-full object-cover" />
        </button>

        <AnimatePresence>
          {profileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl z-50 origin-top-right p-2"
              style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid var(--cp-border)', boxShadow: 'var(--shadow-xl)' }}
            >
              <div className="p-3 mb-2 rounded-xl flex items-center gap-3" style={{ background: 'var(--cp-surface-dim)' }}>
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full" style={{ border: '2px solid var(--cp-primary)' }}>
                  <img src={getUserAvatar(profile?.avatarUrl, profile?.displayName)} alt="Profile" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold" style={{ color: 'var(--cp-text-1)' }}>{profile?.displayName || 'User'}</p>
                  <p className="truncate text-xs" style={{ color: 'var(--cp-text-3)' }}>{profile?.email || ''}</p>
                </div>
              </div>

              <div className="space-y-0.5">
                <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className={menuItemStyle.base} style={{ color: 'var(--cp-text-1)' }}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--cp-primary-light)', color: 'var(--cp-primary)' }}>
                    {mounted && resolvedTheme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                  </div>
                  <span>{mounted && resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <button onClick={() => { setProfileMenuOpen(false); router.push('/profile'); }} className={menuItemStyle.base} style={{ color: 'var(--cp-text-1)' }}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--cp-primary-light)', color: 'var(--cp-primary)' }}>
                    <User size={15} />
                  </div>
                  <span>Profile</span>
                </button>
                <button onClick={() => { setProfileMenuOpen(false); router.push('/about'); }} className={menuItemStyle.base} style={{ color: 'var(--cp-text-1)' }}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'hsl(200,90%,60%,0.12)', color: 'var(--cp-cyan)' }}>
                    <Info size={15} />
                  </div>
                  <span>About</span>
                </button>
              </div>

              <div className="my-2 h-px" style={{ background: 'var(--cp-border)' }} />

              <button
                onClick={async () => { setProfileMenuOpen(false); await logout(); router.push('/'); }}
                className={menuItemStyle.base}
                style={{ color: 'var(--cp-accent)' }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'hsl(from var(--cp-accent) h s l / 0.12)', color: 'var(--cp-accent)' }}>
                  <LogOut size={15} />
                </div>
                <span>Log out</span>
              </button>
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
    { name: 'Home',   href: '/home',        icon: Home,            exact: true },
    { name: 'Feed',   href: '/feed',        icon: LayoutDashboard, exact: true },
    { name: 'Create', href: '/create',      icon: PlusCircle,      exact: true },
    { name: 'Dash',   href: '/dashboard',   icon: GraduationCap,   exact: false },
    { name: 'Board',  href: '/leaderboard', icon: Trophy,          exact: true },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:hidden pointer-events-none">
      <div
        className="mx-auto flex w-full max-w-sm items-center justify-around rounded-[2rem] p-2 pointer-events-auto shadow-2xl"
        style={{ 
          background: 'var(--glass-bg)', 
          backdropFilter: 'blur(32px)', 
          WebkitBackdropFilter: 'blur(32px)', 
          border: '1px solid var(--cp-border)',
        }}
      >
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          const isCreate = item.href === '/create';
          
          if (isCreate) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 active:scale-90 hover:scale-110 hover:-rotate-3"
                style={{ 
                  background: 'linear-gradient(135deg, var(--cp-primary), var(--cp-violet))', 
                  boxShadow: '0 8px 24px -6px hsl(from var(--cp-primary) h s l / 0.6)' 
                }}
              >
                <Icon size={24} className="text-white fill-current" />
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300"
              style={{ color: isActive ? 'var(--cp-primary)' : 'var(--cp-text-3)' }}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute inset-0 rounded-full"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--cp-primary-light), hsl(from var(--cp-primary-light) h s l / 0.5))',
                    border: '1px solid hsl(from var(--cp-primary) h s l / 0.1)'
                  }}
                  transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                />
              )}
              <Icon size={isActive ? 22 : 20} className="relative z-10 mb-0.5" />
              <span className="relative z-10 text-[10px] font-bold uppercase tracking-tighter" style={{ opacity: isActive ? 1 : 0.7 }}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
