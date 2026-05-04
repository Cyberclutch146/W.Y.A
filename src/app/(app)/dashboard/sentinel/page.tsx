'use client';

import { useState, useEffect, useMemo } from 'react';
import { SentinelAlert } from '@/types/sentinel';
import SentinelAlertFeed from '@/components/SentinelAlertFeed';
import { Activity, Map as MapIcon, Loader2, ShieldAlert, Radio, TriangleAlert, Waves, RefreshCw } from 'lucide-react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false, loading: () => (
    <div className="h-full w-full flex items-center justify-center rounded-2xl" style={{ background: 'var(--cp-surface-dim)', border: '1.5px solid var(--cp-border)' }}>
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--cp-primary)' }} />
    </div>
  )}
);
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const SentinelMapOverlay = dynamic(() => import('@/components/SentinelMapOverlay'), { ssr: false });

export default function SentinelDashboardPage() {
  const [alerts, setAlerts] = useState<SentinelAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'map' | 'feed'>('map');
  const { resolvedTheme } = useTheme();

  const fetchAlerts = async () => {
    setLoading(true);
    try { const res = await fetch('/api/sentinel'); if (res.ok) { const data = await res.json(); setAlerts(data); } }
    catch (error) { console.error("Failed to fetch Sentinel data", error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAlerts(); const interval = setInterval(fetchAlerts, 300000); return () => clearInterval(interval); }, []);

  const tileUrl = resolvedTheme === 'dark'
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  const metrics = useMemo(() => {
    const total = alerts.length;
    const critical = alerts.filter(a => a.severity === 'Extreme' || a.severity === 'Severe').length;
    const weather = alerts.filter(a => a.type === 'WEATHER').length;
    const latestTimestamp = alerts[0]?.timestamp;
    return { total, critical, weather, latestUpdate: latestTimestamp ? new Date(latestTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Waiting' };
  }, [alerts]);

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-5 md:gap-6 h-[calc(100vh-120px)] md:h-[calc(100vh-140px)] min-h-[640px] md:min-h-[720px] w-full">
      {/* Header */}
      <section
        className="shrink-0 relative overflow-hidden p-5 md:p-7 rounded-2xl"
        style={{ background: 'linear-gradient(135deg, hsl(0 80% 55% / 0.08), hsl(30 90% 55% / 0.05))', border: '1.5px solid var(--cp-border)', boxShadow: 'var(--shadow-lg)' }}
      >
        <div className="relative z-10 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)] lg:items-start">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full"
              style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)' }}
            >
              <Radio className="h-3.5 w-3.5" style={{ color: 'hsl(0 80% 55%)' }} />
              <span style={{ color: 'var(--cp-text-2)' }}>Live Monitoring</span>
            </div>
            <h1 className="mt-4 flex items-center gap-3">
              <span
                className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center shrink-0 rounded-xl"
                style={{ background: 'linear-gradient(135deg, hsl(0 80% 55%), hsl(30 90% 55%))' }}
              >
                <ShieldAlert className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </span>
              <span className="text-3xl md:text-5xl font-headline font-bold tracking-tight" style={{ color: 'var(--cp-text-1)' }}>Community Sentinel</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm md:text-base leading-relaxed" style={{ color: 'var(--cp-text-2)' }}>
              Track live safety signals around your community with a premium situational view for organizers, volunteers, and rapid-response teams.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full"
                style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', color: 'var(--cp-text-1)' }}
              >
                <Waves className="h-3.5 w-3.5" style={{ color: 'var(--cp-primary)' }} /> Hazard overlays
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full"
                style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', color: 'var(--cp-text-1)' }}
              >
                <TriangleAlert className="h-3.5 w-3.5" style={{ color: 'var(--cp-orange)' }} /> Field-ready alerts
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {[
              { label: 'Active Alerts', value: loading ? '...' : metrics.total.toString() },
              { label: 'Critical Signals', value: loading ? '...' : metrics.critical.toString() },
              { label: 'Weather Events', value: loading ? '...' : metrics.weather.toString() },
              { label: 'Latest Refresh', value: metrics.latestUpdate },
            ].map((metric) => (
              <div
                key={metric.label}
                className="p-4 rounded-xl"
                style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', boxShadow: 'var(--shadow-sm)' }}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--cp-text-3)' }}>{metric.label}</p>
                <p className="mt-2 text-2xl md:text-3xl font-headline font-bold tracking-tight" style={{ color: 'var(--cp-text-1)' }}>{metric.value}</p>
                <div className="mt-3 h-1 rounded-full" style={{ background: 'var(--cp-primary)', opacity: 0.2 }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs & Controls */}
      <div className="shrink-0 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('map')}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
            style={activeTab === 'map' ? { background: 'var(--cp-primary)', color: '#fff' } : { background: 'var(--cp-surface)', color: 'var(--cp-text-1)', border: '1.5px solid var(--cp-border)' }}
          >
            <MapIcon className="h-4 w-4" /> Safety Map
          </button>
          <button
            onClick={() => setActiveTab('feed')}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
            style={activeTab === 'feed' ? { background: 'var(--cp-primary)', color: '#fff' } : { background: 'var(--cp-surface)', color: 'var(--cp-text-1)', border: '1.5px solid var(--cp-border)' }}
          >
            <Activity className="h-4 w-4" /> Alert Feed
          </button>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button onClick={fetchAlerts} disabled={loading} className="btn-secondary">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> {loading ? 'Syncing...' : 'Sync Now'}
          </button>
          <span
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full"
            style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', color: 'var(--cp-text-2)' }}
          >
            <ShieldAlert className="h-3.5 w-3.5" /> Route-aware monitoring
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-hidden flex flex-col relative min-h-[500px] md:min-h-0 rounded-2xl"
        style={{ background: 'var(--cp-surface)', border: '1.5px solid var(--cp-border)', boxShadow: 'var(--shadow-lg)' }}
      >
        {activeTab === 'map' && (
          <div className="flex-1 overflow-hidden z-0 h-full w-full relative" style={{ background: 'var(--cp-surface-dim)' }}>
            <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] flex items-center justify-between p-4">
              <div
                className="px-4 py-3 rounded-xl"
                style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', backdropFilter: 'blur(8px)' }}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--cp-text-3)' }}>National view</p>
                <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--cp-text-1)' }}>Pan and zoom through active sentinel zones</p>
              </div>
              <div
                className="hidden md:flex px-4 py-3 text-sm font-bold uppercase tracking-wider rounded-xl"
                style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', color: 'var(--cp-text-1)', backdropFilter: 'blur(8px)' }}
              >
                {loading ? 'Syncing live layers...' : `${metrics.total} alerts on map`}
              </div>
            </div>
            <MapContainer center={[39.8283, -98.5795]} zoom={4} style={{ height: '100%', width: '100%', zIndex: 0 }}>
              <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url={tileUrl} />
              <SentinelMapOverlay alerts={alerts} />
            </MapContainer>
          </div>
        )}

        {activeTab === 'feed' && (
          <div className="h-full overflow-hidden">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center" style={{ background: 'var(--cp-surface)' }}>
                <Loader2 className="h-8 w-8 animate-spin mb-4" style={{ color: 'var(--cp-primary)' }} />
                <p className="font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--cp-text-3)' }}>Synchronizing data streams...</p>
              </div>
            ) : (
              <SentinelAlertFeed alerts={alerts} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
