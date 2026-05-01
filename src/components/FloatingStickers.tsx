'use client';

import { useEffect, useState } from 'react';

const STICKERS = ['⭐', '✨', '🔥', '💜', '🎯', '🏆', '⚡', '🎪', '🎶', '💥'];
const COLORS = [
  'var(--pop-hot-pink)',
  'var(--pop-electric-purple)',
  'var(--pop-neon-orange)',
  'var(--pop-acid-lime)',
  'var(--pop-sky-cyan)',
];

interface FloatingStickersProps {
  count?: number;
}

export function FloatingStickers({ count = 6 }: FloatingStickersProps) {
  const [stickers, setStickers] = useState<Array<{ id: number; emoji: string; x: number; y: number; rotate: number; color: string; delay: number; size: number }>>([]);

  useEffect(() => {
    // Generate random stickers only on the client side to avoid hydration mismatch
    const generated = Array.from({ length: count }).map((_, i) => ({
      id: i,
      emoji: STICKERS[Math.floor(Math.random() * STICKERS.length)],
      x: Math.random() * 90 + 5, // 5% to 95%
      y: Math.random() * 90 + 5, // 5% to 95%
      rotate: Math.random() * 40 - 20, // -20deg to +20deg
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 2, // 0 to 2s delay
      size: Math.random() * 1.5 + 1, // 1rem to 2.5rem
    }));
    setStickers(generated);
  }, [count]);

  if (stickers.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden md:block">
      {stickers.map((s) => (
        <div
          key={s.id}
          className="absolute flex items-center justify-center border-2 border-black animate-subtle-pulse shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            transform: `rotate(${s.rotate}deg)`,
            backgroundColor: s.color,
            animationDelay: `${s.delay}s`,
            width: `${s.size * 2}rem`,
            height: `${s.size * 2}rem`,
            fontSize: `${s.size}rem`,
            borderRadius: '50%',
            opacity: 0.8,
          }}
        >
          {s.emoji}
        </div>
      ))}
    </div>
  );
}
