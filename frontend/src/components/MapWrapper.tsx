'use client';

import dynamic from 'next/dynamic';



const MapAreaComponent = dynamic(() => import('./MapArea'), { 
  ssr: false,
  loading: () => (
    <div
      className="h-full w-full animate-pulse flex items-center justify-center rounded-2xl"
      style={{ background: 'var(--cp-surface-dim)', border: '1.5px solid var(--cp-border)' }}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="w-6 h-6 rounded-full animate-spin" style={{ border: '3px solid var(--cp-border)', borderTopColor: 'var(--cp-primary)' }} />
        <p className="text-sm font-semibold" style={{ color: 'var(--cp-text-3)' }}>Loading map...</p>
      </div>
    </div>
  )
});

export default function MapWrapper(props: any) {
  return <MapAreaComponent {...props} />;
}
