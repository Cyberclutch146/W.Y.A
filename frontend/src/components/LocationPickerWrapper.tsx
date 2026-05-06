'use client';

import dynamic from 'next/dynamic';

const LocationPickerWrapper = dynamic(() => import('./LocationPicker'), { 
  ssr: false,
  loading: () => (
    <div
      className="h-[300px] w-full animate-pulse rounded-2xl flex items-center justify-center"
      style={{ background: 'var(--cp-surface-dim)', border: '1.5px solid var(--cp-border)' }}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '3px solid var(--cp-border)', borderTopColor: 'var(--cp-primary)' }} />
        <p className="text-sm font-semibold" style={{ color: 'var(--cp-text-3)' }}>Loading map...</p>
      </div>
    </div>
  )
});

export default LocationPickerWrapper;
