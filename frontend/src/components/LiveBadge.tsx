'use client';

export function LiveBadge({ className }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center ${className || ''}`}>
      {/* Pulsing background */}
      <span className="absolute flex h-full w-full">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive/40 opacity-75"></span>
      </span>
      {/* Badge itself */}
      <span className="relative inline-flex items-center gap-1.5 rounded-full border border-destructive/20 bg-destructive/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse"></span>
        NOW LIVE
      </span>
    </div>
  );
}
