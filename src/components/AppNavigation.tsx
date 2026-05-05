'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { StaggeredMenu, StaggeredMenuItem, StaggeredMenuHandle } from '@/components/StaggeredMenu';
import PillNavbar from '@/components/PillNavbar';
import { getUserAvatar } from '@/lib/avatar';
import Image from 'next/image';

/**
 * AppNavigation — renders:
 *  - PillNavbar    on md+ (desktop / laptop)
 *  - StaggeredMenu on < md (mobile)
 *
 * Theme-aware: adapts all colors to light / dark mode.
 */
export default function AppNavigation() {
  const router = useRouter();
  const { profile, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const staggeredMenuRef = useRef<StaggeredMenuHandle>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDark = !mounted || resolvedTheme === 'dark';

  // GSAP animates these as real hex — CSS vars won't interpolate
  const btnColor = isDark ? '#ffffff' : '#0f0f1a';

  const makeItem = (label: string, href: string): StaggeredMenuItem => ({
    label,
    ariaLabel: label,
    link: href,
    onClick: () => router.push(href),
  });

  const navItems: StaggeredMenuItem[] = [
    makeItem('Home',      '/home'),
    makeItem('Events',    '/feed'),
    makeItem('Organize',  '/create'),
    makeItem('Dashboard', '/dashboard'),
    makeItem('Board',     '/bulletin'),
  ];

  /* Logo element */
  const logoEl = (
    <button
      type="button"
      onClick={() => router.push('/home')}
      className="flex items-center gap-3 focus:outline-none transition-all hover:opacity-80"
    >
      <span
        className="flex items-center justify-center text-white font-bold text-lg"
        style={{ width: 40, height: 40, background: 'linear-gradient(135deg, var(--cp-primary), #818cf8)', borderRadius: '12px', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}
      >
        W
      </span>
      <span
        className="font-headline font-bold text-xl tracking-tight"
        style={{ color: btnColor }}
      >
        W.Y.A
      </span>
    </button>
  );

  /* Right slot: theme toggle + avatar */
  const rightEl = (
    <div className="flex items-center justify-end w-full gap-3">
      {/* Dark/light toggle */}
      <button
        type="button"
        aria-label="Toggle theme"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{
          width: 40, height: 40,
          borderRadius: '12px',
          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          color: btnColor,
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
          backdropFilter: 'blur(8px)',
        }}
      >
        {mounted && isDark ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
      </button>

      {/* Avatar */}
      {profile && (
        <div className="relative hover:scale-105 transition-all" ref={profileMenuRef}>
          <button onClick={() => setProfileOpen(!profileOpen)} className="block focus:outline-none rounded-full overflow-hidden">
            <Image
              src={getUserAvatar(profile.avatarUrl, profile.displayName)}
              alt={profile.displayName ?? 'User'}
              width={40}
              height={40}
              className="rounded-full object-cover"
              style={{
                width: 40, height: 40,
                border: `2px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)'}`,
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}
            />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="absolute right-0 bottom-[120%] mb-3 w-64 rounded-[20px] border border-white/10 dark:border-white/5 bg-white/70 dark:bg-black/60 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden z-[100] origin-bottom-right p-2 ring-1 ring-black/5 dark:ring-white/10"
              >
                <div className="p-3 mb-2 rounded-[16px] bg-gradient-to-br from-indigo-500/10 to-transparent flex items-center gap-3 border border-indigo-500/10">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-background shadow-md">
                    <img src={getUserAvatar(profile.avatarUrl, profile.displayName)} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-bold text-foreground leading-tight" style={{ color: btnColor }}>{profile.displayName || 'User'}</p>
                    <p className="truncate text-[12px] font-medium opacity-80" style={{ color: btnColor }}>{profile.email || ''}</p>
                  </div>
                </div>
                
                <div className="px-1 space-y-0.5">
                  <button onClick={() => { setProfileOpen(false); staggeredMenuRef.current?.closeMenu(); router.push('/profile'); }} className="w-full text-left px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/10 hover:translate-x-1 transition-all" style={{ color: btnColor }}>Profile</button>
                  <button onClick={() => { setProfileOpen(false); staggeredMenuRef.current?.closeMenu(); router.push('/about'); }} className="w-full text-left px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/10 hover:translate-x-1 transition-all" style={{ color: btnColor }}>About</button>
                </div>
                
                <div className="my-2 h-px bg-border/40 mx-2" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
                
                <div className="px-1 pb-1">
                  <button
                    onClick={async () => { setProfileOpen(false); staggeredMenuRef.current?.closeMenu(); await logout(); router.push('/'); }}
                    className="w-full text-left px-3 py-2.5 text-sm font-semibold rounded-xl hover:bg-red-500/10 transition-all text-red-500 hover:text-red-600 flex items-center gap-2 group"
                  >
                    <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Log Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ── CSS overrides for StaggeredMenu theming ── */}
      <style>{`
        /* Header bar: premium glassmorphism */
        .sm-fixed .sm-header {
          background: ${isDark ? 'rgba(15, 15, 26, 0.75)' : 'rgba(255, 255, 255, 0.75)'} !important;
          border-bottom: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'};
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
          padding: 1.25em 1.5em !important;
        }

        /* Menu Panel background and item styling */
        .sm-panel-item {
          font-size: clamp(2rem, 9vw, 3.5rem) !important;
          letter-spacing: -1px !important;
          padding-right: 1.5em !important;
          opacity: 0.8;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
          transform: translateX(0);
        }
        
        .sm-panel-item:hover {
          opacity: 1 !important;
          transform: translateX(12px) !important;
          color: var(--cp-primary) !important;
        }

        /* Light mode: panel items need dark text */
        ${!isDark ? `
          .sm-panel-item { color: #0f0f1a !important; }
          .sm-socials-link { color: #0f0f1a !important; }
        ` : ''}

        /* Number badges: always use primary color */
        .sm-panel-list[data-numbering] .sm-panel-item::after {
          color: var(--cp-primary) !important;
          font-size: 15px !important;
          right: 0em !important;
          top: 0.4em !important;
          opacity: 0.5 !important;
          font-weight: 500 !important;
          transition: all 0.4s ease !important;
        }
        
        .sm-panel-item:hover::after {
          opacity: 1 !important;
          transform: scale(1.1) !important;
        }
        
        /* Premium toggle button */
        .sm-toggle {
          padding: 8px 12px;
          border-radius: 12px;
          background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'} !important;
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'} !important;
          transition: all 0.3s ease !important;
        }
        .sm-toggle:hover {
          background: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'} !important;
        }
      `}</style>

      {/* ── Desktop: PillNavbar (md+) ── */}
      <div className="hidden md:block">
        <PillNavbar />
      </div>

      {/* ── Mobile: StaggeredMenu (<md) ── */}
      <div className="md:hidden">
        <StaggeredMenu
          ref={staggeredMenuRef}
          isFixed
          items={navItems}
          logoElement={null}
          bottomElement={rightEl}
          position="right"
          colors={isDark ? ['#0f0f1a', '#1a1a2e'] : ['#eaeaf5', '#d8d8ef']}
          panelBg={isDark ? 'rgba(10,10,20,0.97)' : 'rgba(248,248,254,0.98)'}
          accentColor="var(--cp-primary)"
          displaySocials={false}
          displayItemNumbering
          menuButtonColor={btnColor}
          openMenuButtonColor={btnColor}
          changeMenuColorOnOpen={false}
        />
      </div>
    </>
  );
}
