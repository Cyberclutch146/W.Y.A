"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Trophy, Users, Zap, Clock, Flame, TrendingUp, Star } from "lucide-react";

/* ─────────────────────────────────────────────────────────
   Hero Visual Option 1 — Floating Ecosystem  (Premium v4)
   High-contrast version with strong shadows and accent
   borders that pop in both light and dark mode.
   ───────────────────────────────────────────────────────── */

const float = (y: number, dur: number, delay = 0) => ({
  y: [0, y, 0],
  transition: {
    y: { duration: dur, repeat: Infinity, ease: "easeInOut", delay },
  },
});

// Compound shadow: token shadow + colored glow for strong visibility in light mode
const cardShadow = (color: string) =>
  `0 4px 20px -4px rgba(0,0,0,0.12), 0 8px 40px -8px rgba(0,0,0,0.08), 0 0 0 1px ${color}15`;

export default function HeroFloatingEcosystem() {
  return (
    <div
      className="hidden lg:flex relative w-full items-center justify-center"
      style={{ minHeight: 520 }}
    >
      {/* ── Ambient Background ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 65% 60% at 55% 45%, hsl(from var(--cp-primary) h s l / 0.1), transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 45% 45% at 30% 70%, hsl(from var(--cp-accent) h s l / 0.06), transparent 60%)",
        }}
      />

      {/* ── Decorative Particles ── */}
      {[
        { top: "8%", left: "12%", size: 4, delay: 0, dur: 4 },
        { top: "22%", left: "82%", size: 3, delay: 1.5, dur: 5 },
        { top: "72%", left: "8%", size: 3, delay: 0.8, dur: 4.5 },
        { top: "85%", left: "75%", size: 3, delay: 2, dur: 3.5 },
        { top: "45%", left: "92%", size: 4, delay: 0.3, dur: 5 },
        { top: "15%", left: "55%", size: 2.5, delay: 1, dur: 4 },
        { top: "60%", left: "25%", size: 3, delay: 1.8, dur: 3.8 },
      ].map((p, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full pointer-events-none"
          animate={{ opacity: [0.25, 0.7, 0.25], scale: [1, 1.4, 1] }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            background: "var(--cp-primary)",
          }}
        />
      ))}

      {/* ── Connector Lines ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.1 }}
      >
        <motion.line
          x1="30%" y1="28%" x2="55%" y2="38%"
          stroke="var(--cp-primary)" strokeWidth="1" strokeDasharray="4 6"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.2 }}
        />
        <motion.line
          x1="55%" y1="62%" x2="80%" y2="75%"
          stroke="var(--cp-accent)" strokeWidth="1" strokeDasharray="4 6"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.5 }}
        />
        <motion.line
          x1="72%" y1="18%" x2="55%" y2="38%"
          stroke="var(--cp-secondary)" strokeWidth="1" strokeDasharray="4 6"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.8 }}
        />
      </svg>

      {/* ═══════════════════════════════════════════
          MAIN EVENT CARD  —  Center
          ═══════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1, ...float(-6, 5) }}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-30 w-[310px] rounded-2xl overflow-hidden"
        style={{
          background: "var(--cp-surface)",
          border: "1px solid var(--cp-border)",
          boxShadow:
            "0 8px 32px -4px rgba(0,0,0,0.15), 0 16px 60px -12px rgba(0,0,0,0.1), 0 0 80px -20px hsl(from var(--cp-primary) h s l / 0.2)",
        }}
      >
        {/* Gradient header */}
        <div
          className="h-24 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, var(--cp-primary), var(--cp-accent))",
          }}
        >
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to top, var(--cp-surface) 5%, transparent 50%)",
          }}/>
          <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
            <span
              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-md"
              style={{
                background: "hsl(from var(--cp-primary) h s l / 0.25)",
                color: "white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              <span className="inline-flex items-center gap-1">
                <Flame size={10} /> Live Now
              </span>
            </span>
            <div className="flex items-center gap-1 text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.9)" }}>
              <MapPin size={10} /> Main Auditorium
            </div>
          </div>
        </div>

        {/* Card body */}
        <div className="p-4 pb-3.5">
          <h3 className="font-headline text-[17px] font-bold mb-0.5 leading-snug" style={{ color: "var(--cp-text-1)" }}>
            Winter Tech Summit &apos;26
          </h3>
          <p className="text-[11px] mb-3 leading-relaxed" style={{ color: "var(--cp-text-3)" }}>
            AI, Web3 &amp; the future of campus innovation
          </p>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex justify-between text-[10px] mb-1">
              <span style={{ color: "var(--cp-text-3)" }}>Spots filled</span>
              <span className="font-bold" style={{ color: "var(--cp-primary)" }}>142 / 200</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--cp-surface-dim)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, var(--cp-primary), var(--cp-accent))" }}
                initial={{ width: 0 }}
                animate={{ width: "71%" }}
                transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>

          {/* Avatars row */}
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2.5">
              {[11, 12, 13, 14, 15].map((i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full overflow-hidden ring-2"
                  style={{ ["--tw-ring-color" as string]: "var(--cp-surface)" }}
                >
                  <img
                    src={`https://i.pravatar.cc/56?img=${i}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold ring-2"
                style={{
                  ["--tw-ring-color" as string]: "var(--cp-surface)",
                  background: "var(--cp-primary-light)",
                  color: "var(--cp-primary)",
                }}
              >
                +137
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px]" style={{ color: "var(--cp-text-3)" }}>
              <Clock size={10} /> Starting in 2h
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════
          LIVE PULSE NOTIFICATION  —  Top Right
          ═══════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, x: 24, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1, ...float(-4, 4.2, 0.5) }}
        transition={{ duration: 0.7, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="absolute z-40 rounded-2xl flex items-center gap-3 px-4 py-3"
        style={{
          top: "6%",
          right: "2%",
          background: "var(--cp-surface)",
          borderTop: "2px solid var(--cp-secondary)",
          borderLeft: "1px solid var(--cp-border)",
          borderRight: "1px solid var(--cp-border)",
          borderBottom: "1px solid var(--cp-border)",
          boxShadow:
            "0 4px 24px -4px rgba(0,0,0,0.12), 0 8px 40px -12px rgba(0,0,0,0.08), 0 -2px 12px -2px hsl(from var(--cp-secondary) h s l / 0.15)",
        }}
      >
        <div className="relative">
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--cp-secondary)" }} />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "var(--cp-secondary)" }} />
          </span>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--cp-secondary-light)" }}
          >
            <TrendingUp size={14} style={{ color: "var(--cp-secondary)" }} />
          </div>
        </div>
        <div>
          <div className="text-[11px] font-bold" style={{ color: "var(--cp-text-1)" }}>
            12 students just RSVP&apos;d
          </div>
          <div className="text-[9px]" style={{ color: "var(--cp-text-3)" }}>
            Winter Tech Summit
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════
          LEADERBOARD  —  Top Left
          ═══════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, x: -20, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1, ...float(-5, 4.8, 0.3) }}
        transition={{ duration: 0.7, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute z-20 w-[195px] rounded-2xl p-4"
        style={{
          top: "3%",
          left: "0%",
          background: "var(--cp-surface)",
          borderTop: "2px solid var(--cp-gold)",
          borderLeft: "1px solid var(--cp-border)",
          borderRight: "1px solid var(--cp-border)",
          borderBottom: "1px solid var(--cp-border)",
          boxShadow:
            "0 4px 24px -4px rgba(0,0,0,0.12), 0 8px 40px -12px rgba(0,0,0,0.08), 0 -2px 12px -2px hsl(from var(--cp-gold) h s l / 0.2)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "var(--cp-gold-light)" }}>
            <Trophy size={12} style={{ color: "var(--cp-gold)" }} />
          </div>
          <span className="text-[12px] font-bold" style={{ color: "var(--cp-text-1)" }}>
            Top This Week
          </span>
        </div>
        {[
          { name: "Alex M.", pts: "2,450", rank: 1, img: 33 },
          { name: "Sarah T.", pts: "2,100", rank: 2, img: 44 },
          { name: "James K.", pts: "1,890", rank: 3, img: 51 },
        ].map((u) => (
          <div key={u.rank} className="flex items-center gap-2.5 py-1.5 text-[11px]">
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
              style={{
                background: u.rank === 1 ? "var(--cp-gold)" : u.rank === 2 ? "var(--cp-text-3)" : "var(--cp-orange)",
                color: "white",
              }}
            >
              {u.rank}
            </span>
            <div className="w-5 h-5 rounded-full overflow-hidden shrink-0">
              <img src={`https://i.pravatar.cc/40?img=${u.img}`} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="font-medium flex-1 truncate" style={{ color: "var(--cp-text-1)" }}>
              {u.name}
            </span>
            <span className="font-semibold" style={{ color: "var(--cp-text-3)" }}>{u.pts}</span>
          </div>
        ))}
      </motion.div>

      {/* ═══════════════════════════════════════════
          XP BADGE  —  Bottom Right
          ═══════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
        animate={{ opacity: 1, scale: 1, rotate: 0, ...float(-3, 3.5, 0.7) }}
        transition={{ duration: 0.5, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
        className="absolute z-40 rounded-2xl px-4 py-3 flex items-center gap-3"
        style={{
          bottom: "8%",
          right: "8%",
          background: "var(--cp-surface)",
          borderTop: "2px solid var(--cp-primary)",
          borderLeft: "1px solid var(--cp-border)",
          borderRight: "1px solid var(--cp-border)",
          borderBottom: "1px solid var(--cp-border)",
          boxShadow:
            "0 4px 24px -4px rgba(0,0,0,0.12), 0 8px 40px -12px rgba(0,0,0,0.08), 0 -2px 12px -2px hsl(from var(--cp-primary) h s l / 0.15)",
        }}
      >
        <div className="relative w-10 h-10">
          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="var(--cp-surface-dim)" strokeWidth="3" />
            <motion.circle
              cx="18" cy="18" r="15" fill="none" stroke="var(--cp-primary)" strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="94.25"
              initial={{ strokeDashoffset: 94.25 }}
              animate={{ strokeDashoffset: 94.25 * 0.28 }}
              transition={{ duration: 1.5, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap size={13} style={{ color: "var(--cp-primary)" }} />
          </div>
        </div>
        <div>
          <div className="text-sm font-extrabold" style={{ color: "var(--cp-primary)" }}>
            +250 XP
          </div>
          <div className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: "var(--cp-text-3)" }}>
            Level 12
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════
          UPCOMING EVENT  —  Bottom Left
          ═══════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1, ...float(-4, 4.5, 0.9) }}
        transition={{ duration: 0.6, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="absolute z-20 rounded-2xl px-4 py-3 flex items-center gap-3"
        style={{
          bottom: "10%",
          left: "2%",
          background: "var(--cp-surface)",
          borderTop: "2px solid var(--cp-accent)",
          borderLeft: "1px solid var(--cp-border)",
          borderRight: "1px solid var(--cp-border)",
          borderBottom: "1px solid var(--cp-border)",
          boxShadow:
            "0 4px 24px -4px rgba(0,0,0,0.12), 0 8px 40px -12px rgba(0,0,0,0.08), 0 -2px 12px -2px hsl(from var(--cp-accent) h s l / 0.15)",
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "var(--cp-accent-light)" }}
        >
          <Star size={16} style={{ color: "var(--cp-accent)" }} />
        </div>
        <div>
          <div className="text-[12px] font-bold" style={{ color: "var(--cp-text-1)" }}>
            Art &amp; Design Expo
          </div>
          <div className="text-[10px] flex items-center gap-1.5" style={{ color: "var(--cp-text-3)" }}>
            <Clock size={9} /> Tomorrow, 4 PM
          </div>
        </div>
        <div
          className="ml-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase"
          style={{
            background: "var(--cp-accent-light)",
            color: "var(--cp-accent)",
          }}
        >
          Soon
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════
          QUICK STAT PILL  —  Mid Right
          ═══════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0, ...float(-3, 3.8, 1.2) }}
        transition={{ duration: 0.5, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="absolute z-10 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5"
        style={{
          top: "48%",
          right: "0%",
          background: "var(--cp-surface)",
          borderLeft: "2px solid var(--cp-primary)",
          borderTop: "1px solid var(--cp-border)",
          borderRight: "1px solid var(--cp-border)",
          borderBottom: "1px solid var(--cp-border)",
          boxShadow:
            "0 4px 24px -4px rgba(0,0,0,0.12), 0 8px 40px -12px rgba(0,0,0,0.08)",
        }}
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--cp-primary-light)" }}>
          <Users size={12} style={{ color: "var(--cp-primary)" }} />
        </div>
        <div>
          <div className="text-[13px] font-extrabold" style={{ color: "var(--cp-text-1)" }}>12.4K</div>
          <div className="text-[8px] uppercase tracking-wider" style={{ color: "var(--cp-text-3)" }}>Active Users</div>
        </div>
      </motion.div>
    </div>
  );
}
