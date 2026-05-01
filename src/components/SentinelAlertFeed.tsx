'use client';

import { SentinelAlert } from '@/types/sentinel';
import { AlertTriangle, CloudRain, Activity, MessageCircle, ExternalLink, Filter, Newspaper } from 'lucide-react';
import { useState, useMemo } from 'react';

interface SentinelAlertFeedProps { alerts: SentinelAlert[]; }

export default function SentinelAlertFeed({ alerts }: SentinelAlertFeedProps) {
  const [filterType, setFilterType] = useState('ALL');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const filteredAlerts = useMemo(() => alerts.filter(a => filterType === 'ALL' || a.type === filterType), [alerts, filterType]);
  const paginatedAlerts = useMemo(() => filteredAlerts.slice(0, page * ITEMS_PER_PAGE), [filteredAlerts, page]);
  const hasMore = paginatedAlerts.length < filteredAlerts.length;

  const getIcon = (type: string, severity: string) => {
    switch (type) {
      case 'WEATHER': return <CloudRain className={`h-4 w-4 ${severity === 'Extreme' ? 'text-red-600' : 'text-blue-500'}`} />;
      case 'SEISMIC': return <Activity className="h-4 w-4 text-red-500" />;
      case 'SOCIAL': return <MessageCircle className="h-4 w-4 text-purple-500" />;
      case 'NEWS': return <Newspaper className="h-4 w-4 text-amber-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const base = "px-2.5 py-1 text-[10px] font-label font-black uppercase tracking-wider border-2 border-black";
    switch (severity) {
      case 'Extreme': return <span className={`${base} bg-red-500 text-white`}>Extreme</span>;
      case 'Severe': return <span className={`${base} bg-orange-400 text-black`}>Severe</span>;
      case 'Moderate': return <span className={`${base} bg-amber-300 text-black`}>Moderate</span>;
      case 'Minor': return <span className={`${base} bg-blue-300 text-black`}>Minor</span>;
      default: return <span className={`${base} bg-gray-300 text-black`}>Unknown</span>;
    }
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className="p-10 text-center text-on-surface-variant border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{ background: 'var(--color-surface-container-base)' }}>
        <Activity className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p className="font-label font-bold text-sm uppercase tracking-wider text-on-surface">No active alerts.</p>
        <p className="text-xs mt-1">The sentinel is monitoring data streams.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden flex flex-col h-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{ background: 'var(--color-surface-container-lowest-base)' }}>
      <div className="p-4 md:p-5 flex flex-col gap-4 border-b-4 border-black" style={{ background: 'var(--color-error-container-base)' }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-headline text-lg font-black uppercase tracking-tight text-on-surface flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Sentinel Feed
            </h2>
            <p className="mt-1 text-[10px] font-label font-bold uppercase tracking-wider text-on-surface-variant">Weather • Seismic • Social • News</p>
          </div>
          <span className="text-[10px] font-label font-black uppercase tracking-wider px-2.5 py-1 border-2 border-black" style={{ background: 'var(--color-surface-container-lowest-base)' }}>
            {filteredAlerts.length} Active
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <Filter className="h-3 w-3 shrink-0 mr-1 text-on-surface-variant" />
          {['ALL', 'WEATHER', 'SEISMIC', 'SOCIAL', 'NEWS'].map(type => (
            <button key={type} onClick={() => { setFilterType(type); setPage(1); }}
              className={`shrink-0 px-3 py-1.5 text-[10px] uppercase tracking-wider font-black border-2 border-black transition-all ${filterType === type ? 'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[-1px] translate-y-[-1px]' : 'hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}`}
              style={filterType === type ? { background: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' } : { background: 'var(--color-surface-container-lowest-base)' }}
            >{type}</button>
          ))}
        </div>
      </div>

      <div className="overflow-y-auto flex-1 p-3 md:p-4 space-y-3">
        {paginatedAlerts.map((alert) => (
          <div key={alert.id} className="p-4 border-4 border-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all" style={{ background: 'var(--color-surface-container-base)' }}>
            <div className="flex justify-between items-start mb-2 gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-8 h-8 flex items-center justify-center border-2 border-black" style={{ background: 'var(--color-surface-container-lowest-base)' }}>
                  {getIcon(alert.type, alert.severity)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-label font-black uppercase tracking-[0.16em] text-on-surface-variant">{alert.type}</span>
                    <span className="text-[10px] text-on-surface-variant">•</span>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-on-surface-variant font-label font-bold">{alert.locationName}</p>
                  </div>
                  <h3 className="mt-1 font-body font-bold text-sm text-on-surface leading-tight">{alert.title}</h3>
                </div>
              </div>
              {getSeverityBadge(alert.severity)}
            </div>
            <p className="text-xs text-on-surface-variant mt-3 line-clamp-2 pl-11 leading-relaxed">{alert.description}</p>
            <div className="flex items-center justify-between mt-3 pl-11 pt-3 border-t-2 border-black">
              <span className="text-[10px] text-on-surface-variant font-label font-bold uppercase tracking-wider">
                {alert.source} • {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {alert.url && (
                <a href={alert.url} target="_blank" rel="noopener noreferrer" className="text-[10px] flex items-center gap-1 font-label font-bold uppercase tracking-wider px-2.5 py-1 border-2 border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all" style={{ background: 'var(--color-surface-container-lowest-base)' }}>
                  Source <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        ))}

        {paginatedAlerts.length === 0 && (
          <div className="text-center py-12 text-on-surface-variant text-xs font-label font-bold uppercase tracking-wider">
            <Activity className="h-8 w-8 mx-auto mb-3 opacity-40" />
            No alerts match the selected filter.
          </div>
        )}

        {hasMore && (
          <div className="pt-2 pb-6 flex justify-center">
            <button onClick={() => setPage(p => p + 1)} className="font-label font-black py-2.5 px-6 text-sm uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all" style={{ background: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' }}>
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
