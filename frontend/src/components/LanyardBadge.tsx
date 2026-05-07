'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserIcon } from 'lucide-react';
import Image from 'next/image';

interface LanyardBadgeProps {
  fullName?: string;
  email?: string;
  department?: string;
  year?: string;
  avatarUrl?: string;
  verified?: boolean;
  /** compact = smaller for sidebar embeds, full = larger standalone */
  size?: 'compact' | 'full';
}

const LanyardBadge = React.memo(({
  fullName,
  email,
  department,
  year,
  avatarUrl,
  verified = false,
  size = 'full',
}: LanyardBadgeProps) => {
  const isCompact = size === 'compact';
  const cardW = isCompact ? 'w-[220px]' : 'w-[260px]';
  const photoSize = isCompact ? 'w-[56px] h-[56px]' : 'w-[68px] h-[68px]';
  const nameFontSize = isCompact ? 'text-[15px]' : 'text-[18px]';
  const strapH = isCompact ? 'h-[60px]' : 'h-[80px]';

  // Deterministic barcode pattern
  const barcodePattern = React.useMemo(() => 
    (fullName || 'WYAWYA').split('').slice(0, 12).map((c, i) =>
      ((c.charCodeAt(0) + i) % 3) + 1
    ), [fullName]
  );

  return (
    <div className="flex flex-col items-center animate-lanyard-swing" style={{ transformOrigin: 'top center' }}>
      {/* ── Realistic Lanyard Strap ── */}
      <div className="relative flex flex-col items-center">
        {/* Fabric ribbon */}
        <div className={`w-[26px] ${strapH} relative overflow-hidden rounded-[1px]`}
          style={{ background: 'linear-gradient(90deg, #4a0e0e 0%, #7a2020 20%, #9b2c2c 40%, #a83434 50%, #9b2c2c 60%, #7a2020 80%, #4a0e0e 100%)' }}>
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[6px]"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,180,180,0.12), transparent)' }} />
          <div className="absolute inset-y-0 left-[3px] w-[1px]" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="absolute inset-y-0 right-[3px] w-[1px]" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="absolute top-0 left-0 right-0 h-[30%]"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.1), transparent)' }} />
        </div>

        {/* Metal ring / grommet */}
        <div className="relative -mt-[4px] w-[20px] h-[20px] rounded-full z-10 flex items-center justify-center"
          style={{
            background: 'conic-gradient(from 0deg, #e8e8e8, #b0b0b0, #d0d0d0, #a0a0a0, #c8c8c8, #909090, #e8e8e8)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.35), inset 0 0 3px rgba(255,255,255,0.4)',
          }}>
          <div className="w-[10px] h-[10px] rounded-full"
            style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.15), rgba(0,0,0,0.05))', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)' }} />
        </div>
      </div>

      {/* ── Alligator Clip ── */}
      <div className="relative -mt-[6px] flex flex-col items-center z-10">
        <div className="w-[40px] h-[14px] rounded-t-[3px] relative"
          style={{
            background: 'linear-gradient(180deg, #e0e0e0 0%, #c8c8c8 40%, #b0b0b0 100%)',
            boxShadow: '0 -1px 0 rgba(255,255,255,0.6), inset 0 -1px 2px rgba(0,0,0,0.1)',
          }}>
          <div className="absolute top-[1px] left-[4px] right-[4px] h-[3px] rounded-[1px]"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8) 40%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.8) 60%, transparent)' }} />
        </div>
        <div className="w-[38px] h-[12px] relative"
          style={{
            background: 'linear-gradient(180deg, #c0c0c0 0%, #a8a8a8 50%, #989898 100%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.2)',
          }} />
        <div className="w-[36px] h-[8px] rounded-b-[3px] relative"
          style={{
            background: 'linear-gradient(180deg, #a0a0a0 0%, #808080 100%)',
            boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
          }} />
      </div>

      {/* ── Card Holder Sleeve ── */}
      <motion.div
        initial={{ rotate: 12, y: 60, opacity: 0, scale: 0.9 }}
        animate={{ rotate: 0, y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 10, stiffness: 60, delay: 0.15 }}
        whileHover={{ rotate: -3, scale: 1.07, y: -8 }}
        className="relative mt-[1px]"
        style={{ transformOrigin: 'top center' }}
      >
        {/* Plastic sleeve */}
        <div className="relative rounded-2xl"
          style={{
            padding: isCompact ? '5px 5px 8px 5px' : '7px 7px 10px 7px',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.22) 40%, rgba(255,255,255,0.12) 100%)',
            border: '1.5px solid rgba(255,255,255,0.45)',
            boxShadow: '0 35px 70px -15px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.3)',
            backdropFilter: 'blur(3px)',
          }}>

          {/* Slot hole at top */}
          <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-[44px] h-[10px] rounded-b-[5px] overflow-hidden"
            style={{ background: 'rgba(0,0,0,0.12)', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.25)' }}>
          </div>

          {/* ════ THE CARD ════ */}
          <div className={`relative ${cardW} rounded-xl overflow-hidden`}
            style={{ background: 'white', boxShadow: '0 2px 15px rgba(0,0,0,0.06)' }}>

            {/* Holographic shimmer */}
            <div className="absolute inset-y-0 w-1/3 z-30 pointer-events-none animate-lanyard-shimmer"
              style={{ background: 'linear-gradient(100deg, transparent 10%, rgba(255,200,255,0.25) 30%, rgba(255,255,255,0.55) 45%, rgba(150,230,255,0.35) 55%, rgba(255,255,255,0.55) 60%, rgba(200,255,200,0.2) 75%, transparent 90%)' }} />

            {/* ── Top White Section ── */}
            <div className={`relative bg-white ${isCompact ? 'pt-4' : 'pt-6'} pb-0 text-center`}>
              {/* Photo circle */}
              <div className="relative inline-block mb-2">
                <div className={`${photoSize} rounded-full p-1 mx-auto bg-gradient-to-tr from-[var(--cp-primary)] to-[var(--cp-accent)] animate-photo-glow`}>
                  <div className="w-full h-full rounded-full overflow-hidden bg-white relative border-[2.5px] border-white flex items-center justify-center">
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt={fullName || 'User'} fill className="object-cover" />
                    ) : (
                      <UserIcon size={isCompact ? 22 : 28} className="text-slate-300" />
                    )}
                  </div>
                </div>
              </div>

              {/* Name */}
              <h3 className={`${nameFontSize} font-black leading-tight px-4`}
                style={{ color: fullName ? '#0f172a' : 'rgba(0,0,0,0.15)', fontStyle: fullName ? 'normal' : 'italic' }}>
                {fullName || 'Your Name'}
              </h3>
              {/* Role */}
              <p className={`${isCompact ? 'text-[10px]' : 'text-[11px]'} font-bold mt-0.5 mb-3`}
                style={{ color: 'var(--cp-primary)' }}>
                Member
              </p>
            </div>

            {/* ── Wave Swoosh Separator ── */}
            <div className="relative h-[32px]" style={{ background: 'white' }}>
              <svg viewBox="0 0 260 32" className="absolute top-0 left-0 w-full h-full" preserveAspectRatio="none">
                <path d="M0,16 C35,4 75,30 130,10 C185,-4 225,22 260,8 L260,32 L0,32 Z"
                  fill="#00d2ff" opacity="0.35" />
                <path d="M0,20 C45,8 90,30 145,14 C195,2 235,24 260,12 L260,32 L0,32 Z"
                  fill="var(--cp-violet)" opacity="0.5" />
                <path d="M0,24 C55,12 105,30 165,16 C215,6 245,24 260,16 L260,32 L0,32 Z"
                  fill="#0f1629" />
              </svg>
            </div>

            {/* ── Dark Bottom Section ── */}
            <div className={`relative ${isCompact ? 'px-4 pb-3 pt-2' : 'px-5 pb-4 pt-3'}`} style={{ background: '#0f1629' }}>
              <div className={`grid grid-cols-2 gap-x-4 ${isCompact ? 'gap-y-2 mb-2.5' : 'gap-y-3 mb-3.5'}`}>
                {[
                  { label: 'E-mail', value: email, placeholder: 'your@email.edu' },
                  { label: 'ID No.', value: '#WYA-0001', placeholder: null },
                  { label: 'Department', value: department, placeholder: 'Add me later' },
                  { label: 'Year', value: year, placeholder: 'Add me later' },
                ].map(({ label, value, placeholder }) => (
                  <div key={label}>
                    <p className={`${isCompact ? 'text-[6px]' : 'text-[7px]'} font-bold uppercase tracking-[0.18em] mb-0.5`} style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</p>
                    <p className={`${isCompact ? 'text-[9px]' : 'text-[10px]'} font-semibold truncate`}
                      style={{ color: value ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.25)', fontStyle: value ? 'normal' : 'italic' }}>
                      {value ?? placeholder}
                    </p>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="w-full h-[1px] mb-3" style={{ background: 'rgba(255,255,255,0.08)' }} />

              {/* Status badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-[6px] h-[6px] rounded-full animate-status-pulse`} style={{ background: verified ? '#22c55e' : '#00d2ff', boxShadow: `0 0 12px ${verified ? 'rgba(34,197,94,0.6)' : 'rgba(0,210,255,0.6)'}` }} />
                  <p className="text-[8px] font-bold uppercase tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {verified ? 'Verified' : 'Pending Verification'}
                  </p>
                </div>
                <p className="text-[8px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>2025</p>
              </div>

              {/* Barcode */}
              <div className="flex justify-center gap-[1.5px] mb-1 h-[22px]">
                {barcodePattern.map((w, i) => (
                  <div key={i} className="rounded-[0.5px]"
                    style={{ width: `${w}px`, background: `rgba(255,255,255,${0.18 + (i % 3) * 0.06})` }} />
                ))}
              </div>
              <p className="text-center text-[7px] font-mono tracking-[0.3em]"
                style={{ color: 'rgba(255,255,255,0.15)' }}>
                {(fullName || 'WYA').replace(/\s/g, '').substring(0, 3).toUpperCase()}-{(email || '0001').replace(/\D/g, '').substring(0, 4).padStart(4, '0')}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

LanyardBadge.displayName = 'LanyardBadge';

export default LanyardBadge;
