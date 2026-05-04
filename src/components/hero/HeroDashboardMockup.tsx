"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Trophy, Calendar } from "lucide-react";

/**
 * Hero Visual Option 4: Dashboard Mockup (the current one, preserved)
 * A browser-window-style mockup showing the CampusPulse dashboard.
 */
export default function HeroDashboardMockup() {
  return (
    <motion.div
      className="hidden lg:block relative"
      style={{ perspective: 1000 }}
      initial={{ opacity: 0, x: 40, rotateY: -10 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="glass-panel rounded-3xl overflow-hidden"
        style={{ border: "1px solid var(--cp-border)", boxShadow: "var(--shadow-xl)" }}
      >
        {/* Mock window bar */}
        <div
          className="flex items-center gap-2 px-5 py-3"
          style={{
            borderBottom: "1px solid var(--cp-border)",
            background: "var(--cp-surface-dim)",
          }}
        >
          <div className="flex gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: "#ff5f57" }}
            />
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: "#febc2e" }}
            />
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: "#28c840" }}
            />
          </div>
          <div className="flex-1 flex justify-center">
            <div
              className="px-8 py-1 rounded-full text-[10px] font-medium"
              style={{
                background: "var(--cp-surface)",
                color: "var(--cp-text-3)",
              }}
            >
              campuspulse.app/dashboard
            </div>
          </div>
        </div>

        {/* Mock dashboard content */}
        <div
          className="p-5 grid grid-cols-3 gap-4"
          style={{ background: "var(--cp-bg)" }}
        >
          {/* Feed column — 2 cols */}
          <div className="col-span-2 space-y-3">
            {[
              {
                title: "Winter Tech Summit",
                tag: "Trending",
                tagColor: "var(--cp-primary)",
                loc: "Main Auditorium",
                spots: "12 / 150",
                avatar: 11,
              },
              {
                title: "Startup Pitch Night",
                tag: "New",
                tagColor: "var(--cp-secondary)",
                loc: "Innovation Lab",
                spots: "43 / 80",
                avatar: 15,
              },
              {
                title: "Art & Design Expo",
                tag: "This Week",
                tagColor: "var(--cp-accent)",
                loc: "Gallery Hall B",
                spots: "67 / 200",
                avatar: 22,
              },
            ].map((ev, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 rounded-xl transition-colors"
                style={{
                  background: "var(--cp-surface)",
                  border: "1px solid var(--cp-border)",
                }}
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                  <img
                    src={`https://i.pravatar.cc/80?img=${ev.avatar}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="font-bold text-sm truncate"
                      style={{ color: "var(--cp-text-1)" }}
                    >
                      {ev.title}
                    </span>
                    <span
                      className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-full shrink-0"
                      style={{
                        background: `${ev.tagColor}18`,
                        color: ev.tagColor,
                      }}
                    >
                      {ev.tag}
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-3 text-[11px]"
                    style={{ color: "var(--cp-text-3)" }}
                  >
                    <span className="flex items-center gap-1">
                      <MapPin size={10} />
                      {ev.loc}
                    </span>
                    <span>{ev.spots} spots</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar — 1 col */}
          <div className="space-y-3">
            {/* Leaderboard mini */}
            <div
              className="p-3 rounded-xl"
              style={{
                background: "var(--cp-surface)",
                border: "1px solid var(--cp-border)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Trophy
                  size={14}
                  style={{ color: "var(--cp-gold)" }}
                />
                <span
                  className="text-xs font-bold"
                  style={{ color: "var(--cp-text-1)" }}
                >
                  Leaderboard
                </span>
              </div>
              {[
                { name: "Alex M.", pts: "2,450", c: "var(--cp-gold)" },
                { name: "Sarah T.", pts: "2,100", c: "var(--cp-text-3)" },
                { name: "James K.", pts: "1,890", c: "var(--cp-orange)" },
              ].map((u, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-1.5 text-[11px]"
                >
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: u.c }}
                    />
                    <span
                      className="font-medium"
                      style={{ color: "var(--cp-text-1)" }}
                    >
                      {u.name}
                    </span>
                  </div>
                  <span style={{ color: "var(--cp-text-3)" }}>
                    {u.pts} XP
                  </span>
                </div>
              ))}
            </div>

            {/* Stats mini */}
            <div
              className="p-3 rounded-xl"
              style={{
                background: "var(--cp-surface)",
                border: "1px solid var(--cp-border)",
              }}
            >
              <span
                className="text-xs font-bold mb-2 block"
                style={{ color: "var(--cp-text-1)" }}
              >
                Your Stats
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Events", val: "14" },
                  { label: "XP", val: "1.2k" },
                  { label: "Rank", val: "#23" },
                  { label: "Streak", val: "7d" },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="text-center py-1.5 rounded-lg"
                    style={{ background: "var(--cp-surface-dim)" }}
                  >
                    <div
                      className="text-sm font-bold"
                      style={{ color: "var(--cp-primary)" }}
                    >
                      {s.val}
                    </div>
                    <div
                      className="text-[9px] uppercase tracking-wide"
                      style={{ color: "var(--cp-text-3)" }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
