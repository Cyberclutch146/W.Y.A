'use client';

import { useState, useEffect } from 'react';
import { getGlobalLeaderboard, getLeaderboardStats, LeaderboardEntry } from '@/services/userService';
import { getUserAvatar } from '@/lib/avatar';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, Clock, DollarSign, Users, Loader2, MapPin, TrendingUp, TrendingDown, Minus } from 'lucide-react';

function getStatValue(entry: LeaderboardEntry, tab: 'impact' | 'hours' | 'donated'): string {
  if (tab === 'hours') return `${entry.eventHours}h`;
  if (tab === 'donated') return `$${entry.totalDonated.toLocaleString()}`;
  return entry.impactScore.toLocaleString();
}

const PODIUM_CONFIG = [
  { medal: '🥇', ringColor: 'var(--cp-gold)', glowColor: 'hsl(42, 100%, 56%, 0.4)', height: 'h-28', size: 'w-20 h-20 md:w-24 md:h-24', textSize: 'text-sm', rank: 1 },
  { medal: '🥈', ringColor: 'hsl(220, 15%, 65%)', glowColor: 'hsl(220, 15%, 65%, 0.3)', height: 'h-20', size: 'w-14 h-14 md:w-16 md:h-16', textSize: 'text-xs', rank: 2 },
  { medal: '🥉', ringColor: 'hsl(25, 80%, 60%)', glowColor: 'hsl(25, 80%, 60%, 0.3)', height: 'h-14', size: 'w-14 h-14 md:w-16 md:h-16', textSize: 'text-xs', rank: 3 },
];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState({ totalAttendees: 0, totalHours: 0, totalDonated: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'impact' | 'hours' | 'donated'>('impact');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [leaderboard, globalStats] = await Promise.all([getGlobalLeaderboard(50), getLeaderboardStats()]);
        setEntries(leaderboard);
        setStats(globalStats);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const sortedEntries = [...entries].sort((a, b) => {
    if (activeTab === 'hours') return b.eventHours - a.eventHours;
    if (activeTab === 'donated') return b.totalDonated - a.totalDonated;
    return b.impactScore - a.impactScore;
  });

  const topThree = sortedEntries.slice(0, 3);
  const rest = sortedEntries.slice(3);

  if (loading) {
    return (
      <main className="flex-1 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--cp-gold), var(--cp-orange))', boxShadow: 'var(--shadow-lg)' }}>
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
          <p className="text-sm font-semibold" style={{ color: 'var(--cp-text-3)' }}>Loading heroes...</p>
        </div>
      </main>
    );
  }

  const STAT_CARDS = [
    { icon: Users, value: stats.totalAttendees, label: 'Attendees', accent: 'var(--cp-secondary)', gradient: 'linear-gradient(135deg, var(--cp-secondary), hsl(160, 70%, 30%))' },
    { icon: Clock, value: `${stats.totalHours.toLocaleString()}h`, label: 'Hours Given', accent: 'var(--cp-gold)', gradient: 'linear-gradient(135deg, var(--cp-gold), var(--cp-orange))' },
    { icon: DollarSign, value: `$${stats.totalDonated.toLocaleString()}`, label: 'Donated', accent: 'var(--cp-primary)', gradient: 'linear-gradient(135deg, var(--cp-primary), var(--cp-violet))' },
  ];

  const TABS = [
    { key: 'impact' as const, label: 'Impact Score', icon: Trophy },
    { key: 'hours' as const, label: 'Hours', icon: Clock },
    { key: 'donated' as const, label: 'Donations', icon: DollarSign },
  ];

  return (
    <main className="flex-1 p-4 md:p-10 max-w-5xl mx-auto w-full pb-28 md:pb-10" style={{ color: 'var(--cp-text-1)' }}>

      {/* ── Hero Header ── */}
      <motion.div className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4" style={{ background: 'hsl(42, 100%, 56%, 0.12)', color: 'var(--cp-gold)', border: '1px solid hsl(42, 100%, 56%, 0.3)' }}>
          <Trophy size={12} /> Community Heroes
        </div>
        <h1 className="font-headline font-bold text-5xl md:text-7xl tracking-tight leading-none mb-3" style={{ color: 'var(--cp-text-1)' }}>
          Leader<span className="energy-gradient-text">board</span>
        </h1>
        <p className="max-w-md leading-relaxed" style={{ color: 'var(--cp-text-2)' }}>
          Celebrating our most impactful campus members who make a difference every day.
        </p>
      </motion.div>

      {/* ── Stats Row ── */}
      <motion.div className="grid grid-cols-3 gap-3 md:gap-5 mb-12" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
        {STAT_CARDS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="stat-card flex flex-col items-center text-center p-4 md:p-6 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 group-hover:opacity-20 transition-opacity" style={{ background: s.accent }} />
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform" style={{ background: 'var(--cp-surface-dim)', border: '1px solid var(--cp-border)' }}>
                <Icon size={22} style={{ color: s.accent }} />
              </div>
              <p className="text-xl md:text-3xl font-black tracking-tight" style={{ color: 'var(--cp-text-1)' }}>{s.value}</p>
              <p className="text-[10px] md:text-xs font-black uppercase tracking-widest mt-1.5 opacity-40" style={{ color: 'var(--cp-text-1)' }}>{s.label}</p>
            </div>
          );
        })}
      </motion.div>

      {/* ── Tabs ── */}
      <motion.div className="flex items-center gap-2 mb-10 p-1.5 rounded-3xl w-fit mx-auto md:mx-0" style={{ background: 'var(--cp-surface-dim)', border: '1px solid var(--cp-border)' }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-black transition-all ${isActive ? 'shadow-lg' : 'hover:bg-white/50 dark:hover:bg-black/20'}`}
              style={{
                background: isActive ? 'linear-gradient(135deg, var(--cp-primary), var(--cp-violet))' : 'transparent',
                color: isActive ? 'white' : 'var(--cp-text-2)',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      {entries.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ background: 'var(--cp-surface-dim)', border: '1px solid var(--cp-border)' }}>
          <Trophy size={48} style={{ color: 'var(--cp-gold)', margin: '0 auto 1rem' }} />
          <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--cp-text-1)' }}>No Heroes Yet</h3>
          <p className="mb-6" style={{ color: 'var(--cp-text-2)' }}>Be the first to attendee and climb the leaderboard!</p>
          <Link href="/feed" className="btn-primary inline-flex">Browse Events</Link>
        </div>
      ) : (
        <>
          {/* ── Podium ── */}
          {topThree.length > 0 && (
            <div className="flex items-end justify-center gap-4 md:gap-8 mb-20 px-4">
              {[1, 0, 2].map((podiumIndex) => {
                const entry = topThree[podiumIndex];
                if (!entry) return null;
                const pc = PODIUM_CONFIG[podiumIndex];
                const isFirst = podiumIndex === 0;
                return (
                  <motion.div
                    key={entry.id}
                    className={`flex flex-col items-center ${isFirst ? 'w-32 md:w-48' : 'w-24 md:w-36'}`}
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + podiumIndex * 0.1, type: 'spring', stiffness: 100, damping: 20 }}
                  >
                    <motion.div
                      className="text-4xl md:text-5xl mb-4 relative z-20"
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.6 + podiumIndex * 0.1, type: 'spring', bounce: 0.6 }}
                    >
                      {pc.medal}
                      {isFirst && <div className="absolute inset-0 bg-white blur-xl opacity-20 -z-10 animate-pulse" />}
                    </motion.div>

                    {/* Avatar Container */}
                    <div className="relative mb-4">
                      <div
                        className={`${pc.size} rounded-full overflow-hidden flex items-center justify-center relative z-10 border-4 border-white dark:border-[var(--cp-surface)]`}
                        style={{ boxShadow: `0 20px 40px -10px ${pc.glowColor}` }}
                      >
                        {entry.avatarUrl ? (
                          <Image src={getUserAvatar(entry.avatarUrl, entry.displayName)} alt={entry.displayName} width={120} height={120} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-black text-2xl text-white" style={{ background: pc.ringColor }}>
                            {entry.displayName.charAt(0)}
                          </div>
                        )}
                      </div>
                      {/* Rank Indicator */}
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-[var(--cp-surface)] flex items-center justify-center font-black text-sm shadow-lg z-20" style={{ color: pc.ringColor, border: `2px solid ${pc.ringColor}` }}>
                        {pc.rank}
                      </div>
                    </div>

                    <div className="text-center w-full mb-4 px-2">
                      <p className={`${isFirst ? 'text-lg md:text-xl' : 'text-sm md:text-base'} font-black truncate`} style={{ color: 'var(--cp-text-1)' }}>{entry.displayName}</p>
                      <p className="text-xs font-black uppercase tracking-widest opacity-60" style={{ color: pc.ringColor }}>{getStatValue(entry, activeTab)}</p>
                    </div>

                    {/* Podium block */}
                    <motion.div
                      className={`w-full ${pc.height} rounded-2xl relative overflow-hidden glass-panel`}
                      style={{
                        background: `linear-gradient(to bottom, ${pc.ringColor}25, ${pc.ringColor}08)`,
                        borderColor: `${pc.ringColor}40`,
                        boxShadow: `inset 0 1px 0 0 ${pc.ringColor}20`,
                      }}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.4 + podiumIndex * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_0%,white,transparent)]" />
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* ── Full Rankings ── */}
          {rest.length > 0 && (
            <motion.div
              className="card-base overflow-hidden"
              style={{ border: '1px solid var(--cp-border)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="px-6 py-5 flex items-center justify-between" style={{ background: 'var(--cp-surface)', borderBottom: '1px solid var(--cp-border)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-primary/10">
                    <Trophy size={18} className="text-primary" />
                  </div>
                  <h3 className="font-headline font-black text-lg" style={{ color: 'var(--cp-text-1)' }}>Full Rankings</h3>
                </div>
                <div className="text-xs font-black uppercase tracking-widest opacity-40">
                  Top 50 Members
                </div>
              </div>

              <div style={{ background: 'var(--cp-surface)' }}>
                {rest.map((entry, index) => {
                  const rankChange = index % 3;
                  const maxScore = sortedEntries[0]?.impactScore || 1;
                  const barWidth = Math.min(100, (entry.impactScore / maxScore) * 100);
                  return (
                    <motion.div
                      key={entry.id}
                      className="flex items-center gap-4 px-6 py-4 transition-all hover:bg-primary/[0.02]"
                      style={{ borderBottom: '1px solid var(--cp-border)' }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index, duration: 0.3 }}
                    >
                      {/* Rank Number */}
                      <span className="w-10 h-10 flex items-center justify-center text-xs font-black rounded-xl shrink-0" style={{ background: 'var(--cp-surface-dim)', color: 'var(--cp-text-2)' }}>
                        {index + 4}
                      </span>

                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-2xl overflow-hidden flex items-center justify-center font-black text-sm shrink-0 border border-transparent group-hover:border-primary/20 transition-all" style={{ background: 'var(--cp-primary-light)' }}>
                        {entry.avatarUrl ? (
                          <Image src={getUserAvatar(entry.avatarUrl, entry.displayName)} alt={entry.displayName} width={44} height={44} className="object-cover w-full h-full" />
                        ) : (
                          <span style={{ color: 'var(--cp-primary)' }}>{entry.displayName.charAt(0).toUpperCase()}</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-base font-black truncate leading-none" style={{ color: 'var(--cp-text-1)' }}>{entry.displayName}</p>
                          <span className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-secondary/10" style={{ color: rankChange === 0 ? 'var(--cp-secondary)' : rankChange === 1 ? 'var(--cp-accent)' : 'var(--cp-text-3)' }}>
                            {rankChange === 0 ? '↑ 2' : rankChange === 1 ? '↓ 1' : '—'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          {entry.location && (
                            <p className="text-[10px] font-bold flex items-center gap-1 uppercase tracking-widest opacity-40" style={{ color: 'var(--cp-text-1)' }}>
                              <MapPin size={10} /> {entry.location}
                            </p>
                          )}
                          <div className="h-1.5 flex-1 max-w-[120px] rounded-full overflow-hidden bg-primary/5">
                            <div className="progress-bar-fill" style={{ width: `${barWidth}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right shrink-0">
                        <p className="text-base font-black px-4 py-1.5 rounded-xl bg-primary/10" style={{ color: 'var(--cp-primary)' }}>
                          {getStatValue(entry, activeTab)}
                        </p>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] mt-1.5 opacity-30" style={{ color: 'var(--cp-text-1)' }}>
                          {activeTab === 'hours' ? 'hours' : activeTab === 'donated' ? 'donations' : 'impact score'}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </>
      )}
    </main>
  );
}
