'use client';

export function LiveBadge() {
  return (
    <div className="relative inline-flex items-center">
      {/* Pulsing background */}
      <span className="absolute flex h-full w-full">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-none border-2 border-black bg-[var(--pop-hot-pink)] opacity-75"></span>
      </span>
      {/* Badge itself */}
      <span className="relative inline-flex items-center gap-1.5 border-2 border-black bg-[var(--pop-hot-pink)] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-black">
        <span className="h-2 w-2 rounded-full bg-black animate-pulse"></span>
        NOW LIVE
      </span>
    </div>
  );
}
