"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Users } from "lucide-react";

/**
 * Hero Visual Option 3: Infinite Vertical Stream
 * Dual-column perspective stream of event cards scrolling infinitely.
 */

const EVENTS_COL_1 = [
  {
    title: "Winter Tech Summit",
    location: "Main Auditorium",
    time: "Today, 6PM",
    attendees: 142,
    gradient: "linear-gradient(135deg, #7c3aed, #3b82f6)",
  },
  {
    title: "Startup Pitch Night",
    location: "Innovation Lab",
    time: "Tomorrow, 7PM",
    attendees: 64,
    gradient: "linear-gradient(135deg, #ec4899, #f97316)",
  },
  {
    title: "Photography Walk",
    location: "Campus Gardens",
    time: "Sat, 10AM",
    attendees: 28,
    gradient: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
  },
  {
    title: "Debate Championship",
    location: "Forum Hall",
    time: "Mon, 3PM",
    attendees: 95,
    gradient: "linear-gradient(135deg, #f59e0b, #ef4444)",
  },
];

const EVENTS_COL_2 = [
  {
    title: "Art & Design Expo",
    location: "Gallery Hall B",
    time: "Fri, 2PM",
    attendees: 187,
    gradient: "linear-gradient(135deg, #10b981, #3b82f6)",
  },
  {
    title: "Game Jam Weekend",
    location: "CS Building",
    time: "Sat-Sun",
    attendees: 73,
    gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)",
  },
  {
    title: "Soccer Finals",
    location: "Main Field",
    time: "Wed, 6PM",
    attendees: 320,
    gradient: "linear-gradient(135deg, #14b8a6, #22d3ee)",
  },
  {
    title: "Career Fair 2026",
    location: "Convention Center",
    time: "Thu, 9AM",
    attendees: 450,
    gradient: "linear-gradient(135deg, #6366f1, #a855f7)",
  },
];

function EventStreamCard({
  title,
  location,
  time,
  attendees,
  gradient,
}: {
  title: string;
  location: string;
  time: string;
  attendees: number;
  gradient: string;
}) {
  return (
    <div
      className="w-[260px] rounded-2xl overflow-hidden shrink-0"
      style={{
        background: "var(--cp-surface)",
        border: "1px solid var(--cp-border)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div className="h-16 relative" style={{ background: gradient }}>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, var(--cp-surface), transparent 70%)",
          }}
        />
      </div>
      <div className="p-3 -mt-2 relative">
        <h4
          className="font-bold text-sm mb-2"
          style={{ color: "var(--cp-text-1)" }}
        >
          {title}
        </h4>
        <div
          className="flex items-center gap-3 text-[10px]"
          style={{ color: "var(--cp-text-3)" }}
        >
          <span className="flex items-center gap-1">
            <MapPin size={10} />
            {location}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {time}
          </span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex -space-x-1.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full overflow-hidden"
                style={{ border: "1.5px solid var(--cp-surface)" }}
              >
                <img
                  src={`https://i.pravatar.cc/40?img=${attendees + i}`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: "var(--cp-text-2)" }}>
            <Users size={10} />
            {attendees}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function HeroInfiniteStream() {
  // Duplicate arrays to create seamless loop
  const col1 = [...EVENTS_COL_1, ...EVENTS_COL_1];
  const col2 = [...EVENTS_COL_2, ...EVENTS_COL_2];

  return (
    <div className="hidden lg:flex relative h-[520px] w-full items-center justify-center overflow-hidden">
      {/* Perspective wrapper */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="relative flex gap-4"
        style={{
          perspective: "800px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        {/* Column 1 — scrolls up */}
        <div
          className="relative h-[520px] overflow-hidden"
          style={{
            transform: "rotateY(-8deg) rotateX(5deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Fade masks */}
          <div
            className="absolute top-0 left-0 right-0 h-24 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, var(--cp-bg), transparent)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-24 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, var(--cp-bg), transparent)",
            }}
          />
          <motion.div
            animate={{ y: [0, -(EVENTS_COL_1.length * 220)] }}
            transition={{
              y: { duration: 20, repeat: Infinity, ease: "linear" },
            }}
            className="flex flex-col gap-4"
          >
            {col1.map((ev, i) => (
              <EventStreamCard key={`c1-${i}`} {...ev} />
            ))}
          </motion.div>
        </div>

        {/* Column 2 — scrolls down */}
        <div
          className="relative h-[520px] overflow-hidden"
          style={{
            transform: "rotateY(-8deg) rotateX(5deg)",
            transformStyle: "preserve-3d",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-24 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, var(--cp-bg), transparent)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-24 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, var(--cp-bg), transparent)",
            }}
          />
          <motion.div
            animate={{ y: [-(EVENTS_COL_2.length * 220), 0] }}
            transition={{
              y: { duration: 22, repeat: Infinity, ease: "linear" },
            }}
            className="flex flex-col gap-4"
          >
            {col2.map((ev, i) => (
              <EventStreamCard key={`c2-${i}`} {...ev} />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
