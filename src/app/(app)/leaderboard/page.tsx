'use client';

import { useState, useEffect } from 'react';
import { getGlobalLeaderboard, getLeaderboardStats, LeaderboardEntry } from '@/services/userService';
import { getUserAvatar } from '@/lib/avatar';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState({ totalVolunteers: 0, totalHours: 0, totalDonated: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'impact' | 'hours' | 'donated'>('impact');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [leaderboard, globalStats] = await Promise.all([
          getGlobalLeaderboard(50),
          getLeaderboardStats(),
        ]);
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
    if (activeTab === 'hours') return b.volunteerHours - a.volunteerHours;
    if (activeTab === 'donated') return b.totalDonated - a.totalDonated;
    return b.impactScore - a.impactScore;
  });

  const topThree = sortedEntries.slice(0, 3);
  const rest = sortedEntries.slice(3);

  const podiumColors = [
    { bg: '#ffd93d', icon: '🥇', podiumH: 'h-28' },
    { bg: '#ccdcff', icon: '🥈', podiumH: 'h-20' },
    { bg: '#93f59c', icon: '🥉', podiumH: 'h-14' },
  ];

  if (loading) {
    return (
      <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full pb-28 md:pb-10 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-black border-t-[#ffd93d] rounded-full animate-spin" />
          <p className="font-black text-sm uppercase tracking-widest">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-10 max-w-5xl mx-auto w-full pb-28 md:pb-10">
      {/* Hero Header */}
      <div className="mb-10 animate-fade-in-up">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 border-2 border-black text-xs font-black uppercase tracking-widest mb-4 bg-[#ffd93d]"
          style={{ boxShadow: '2px 2px 0 #000' }}
        >
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
          Community Heroes
        </div>
        <h1 className="font-black text-5xl md:text-7xl uppercase tracking-tight text-black mb-3 leading-none">
          Leader<span className="inline-block bg-[#ffd93d] px-2 border-4 border-black">board</span>
        </h1>
        <p className="text-black/70 text-base max-w-md leading-relaxed font-medium">
          Celebrating our most impactful campus members who make a difference every day.
        </p>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-10 animate-fade-in-up delay-100">
        {[
          { icon: 'groups', value: stats.totalVolunteers, label: 'Volunteers', color: '#93f59c' },
          { icon: 'schedule', value: stats.totalHours.toLocaleString(), label: 'Hours Given', color: '#ffd93d' },
          { icon: 'paid', value: `$${stats.totalDonated.toLocaleString()}`, label: 'Donated', color: '#ccdcff' },
        ].map((s) => (
          <div
            key={s.label}
            className="border-4 border-black p-3 md:p-5 text-center"
            style={{ background: s.color, boxShadow: '4px 4px 0 #000' }}
          >
            <span className="material-symbols-outlined text-xl md:text-2xl mb-1 md:mb-2 block" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            <p className="text-lg md:text-3xl font-black text-black">{s.value}</p>
            <p className="text-[9px] md:text-[10px] font-black text-black/70 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Sort Tabs */}
      <div className="flex items-center gap-2 mb-8 animate-fade-in-up delay-200 flex-wrap">
        {[
          { key: 'impact' as const, label: 'Impact Score', icon: 'star' },
          { key: 'hours' as const, label: 'Hours', icon: 'schedule' },
          { key: 'donated' as const, label: 'Donations', icon: 'paid' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-black flex items-center gap-1.5 transition-all border-2 border-black uppercase tracking-wide ${
              activeTab === tab.key ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#ffd93d]'
            }`}
            style={{ boxShadow: activeTab === tab.key ? 'none' : '2px 2px 0 #000' }}
          >
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: activeTab === tab.key ? "'FILL' 1" : "'FILL' 0" }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-20 border-4 border-black animate-fade-in-up delay-300" style={{ background: '#ffd93d', boxShadow: '6px 6px 0 #000' }}>
          <span className="material-symbols-outlined text-6xl mb-4 block">emoji_events</span>
          <h3 className="text-2xl font-black text-black mb-2 uppercase">No Heroes Yet</h3>
          <p className="text-black/70 mb-6 font-medium">Be the first to volunteer and climb the leaderboard!</p>
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-black font-black text-sm uppercase bg-black text-white"
            style={{ boxShadow: '3px 3px 0 #555' }}
          >
            <span className="material-symbols-outlined text-base">explore</span>
            Browse Events
          </Link>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {topThree.length > 0 && (
            <div className="flex items-end justify-center gap-3 md:gap-6 mb-12 animate-fade-in-up delay-300">
              {[1, 0, 2].map((podiumIndex) => {
                const entry = topThree[podiumIndex];
                if (!entry) return null;
                const pc = podiumColors[podiumIndex];
                const isFirst = podiumIndex === 0;
                return (
                  <motion.div 
                    key={entry.id} 
                    className={`flex flex-col items-center justify-end ${isFirst ? 'w-32 md:w-40' : 'w-24 md:w-32'}`}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + (podiumIndex * 0.15), type: "spring", stiffness: 200, damping: 20 }}
                  >
                    <motion.div 
                      className="text-3xl md:text-4xl mb-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 + (podiumIndex * 0.15), type: "spring", bounce: 0.5 }}
                    >
                      {pc.icon}
                    </motion.div>
                    <div
                      className={`${isFirst ? 'w-20 h-20 md:w-24 md:h-24' : 'w-14 h-14 md:w-16 md:h-16'} border-4 border-black flex items-center justify-center font-black text-xl overflow-hidden`}
                      style={{ background: pc.bg, boxShadow: '4px 4px 0 #000' }}
                    >
                      {entry.avatarUrl ? (
                        <Image
                          src={getUserAvatar(entry.avatarUrl, entry.displayName)}
                          alt={entry.displayName}
                          width={96} height={96}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="font-black text-black">{entry.displayName.charAt(0)}</span>
                      )}
                    </div>
                    <p className={`${isFirst ? 'text-sm' : 'text-xs'} font-black text-black text-center truncate w-full mt-2`}>{entry.displayName}</p>
                    <p className="text-xs text-black/60 font-bold font-mono">{getStatValue(entry, activeTab)}</p>
                    <motion.div 
                      className={`w-full ${pc.podiumH} mt-2 border-4 border-b-0 border-black origin-bottom`} 
                      style={{ background: pc.bg, boxShadow: '4px 0 0 #000' }} 
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.4 + (podiumIndex * 0.15), duration: 0.5, type: "spring" }}
                    />
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Full Rankings */}
          {rest.length > 0 && (
            <div className="border-4 border-black overflow-hidden animate-fade-in-up delay-400" style={{ boxShadow: '6px 6px 0 #000' }}>
              <div className="px-5 py-4 border-b-4 border-black bg-[#ffd93d]">
                <h3 className="font-black text-lg text-black uppercase flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>leaderboard</span>
                  Full Rankings
                </h3>
              </div>
              <div className="bg-white">
                {rest.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-[#ffd93d]/20 transition-colors border-b-2 border-black/10 last:border-b-0"
                  >
                    <span
                      className="w-8 h-8 flex items-center justify-center text-xs font-black border-2 border-black bg-white flex-shrink-0"
                      style={{ boxShadow: '2px 2px 0 #000' }}
                    >
                      {index + 4}
                    </span>
                    <div
                      className="w-10 h-10 border-2 border-black flex items-center justify-center font-black text-sm flex-shrink-0 overflow-hidden"
                      style={{ background: '#ccdcff' }}
                    >
                      {entry.avatarUrl ? (
                        <Image src={getUserAvatar(entry.avatarUrl, entry.displayName)} alt={entry.displayName} width={40} height={40} className="object-cover w-full h-full" />
                      ) : (
                        entry.displayName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-black text-black truncate">{entry.displayName}</p>
                        {/* Rank change indicator (mocked) */}
                        <span className={`text-[10px] font-bold ${index % 3 === 0 ? 'text-green-600' : index % 3 === 1 ? 'text-red-600' : 'text-gray-400'}`}>
                          {index % 3 === 0 ? '▲ 2' : index % 3 === 1 ? '▼ 1' : '—'}
                        </span>
                        {/* Achievement badges (mocked) */}
                        <div className="flex gap-1 ml-1">
                          {Array.from({ length: Math.max(1, (entry.impactScore % 4)) }).map((_, i) => (
                             <div key={i} className="w-3 h-3 rounded-full border border-black" style={{ background: ['#FF6B9D', '#B5FF4D', '#4DD0E1', '#ffd93d'][i % 4] }}></div>
                          ))}
                        </div>
                      </div>
                      
                      {entry.location && (
                        <p className="text-xs text-black/50 font-medium flex items-center gap-1 mb-1">
                          <span className="material-symbols-outlined text-[12px]">location_on</span>
                          {entry.location}
                        </p>
                      )}
                      
                      {/* XP Bar Visualization */}
                      <div className="h-1.5 w-full max-w-[200px] bg-black/10 border border-black mt-1.5">
                        <div className="h-full border-r border-black" style={{ width: `${Math.min(100, (entry.impactScore / (sortedEntries[0]?.impactScore || 1)) * 100)}%`, background: 'var(--pop-acid-lime)' }}></div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-black text-black bg-[#93f59c] px-2 py-0.5 border-2 border-black inline-block">
                        {getStatValue(entry, activeTab)}
                      </p>
                      <p className="text-[10px] text-black/50 uppercase tracking-wider font-black mt-1">
                        {activeTab === 'hours' ? 'hours' : activeTab === 'donated' ? 'donated' : 'score'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}

function getStatValue(entry: LeaderboardEntry, tab: 'impact' | 'hours' | 'donated'): string {
  if (tab === 'hours') return `${entry.volunteerHours}h`;
  if (tab === 'donated') return `$${entry.totalDonated.toLocaleString()}`;
  return entry.impactScore.toLocaleString();
}
