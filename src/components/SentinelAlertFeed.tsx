'use client';

import { SentinelAlert } from '@/types/sentinel';
import { AlertTriangle, CloudRain, Activity, MessageCircle, ExternalLink, Filter, Newspaper } from 'lucide-react';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

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
      case 'WEATHER': return <CloudRain className={`h-4 w-4 ${severity === 'Extreme' ? 'text-red-400' : 'text-blue-400'}`} />;
      case 'SEISMIC': return <Activity className="h-4 w-4 text-red-400" />;
      case 'SOCIAL': return <MessageCircle className="h-4 w-4 text-purple-400" />;
      case 'NEWS': return <Newspaper className="h-4 w-4 text-amber-400" />;
      default: return <AlertTriangle className="h-4 w-4 text-amber-400" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const base = "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md";
    switch (severity) {
      case 'Extreme': return <span className={`${base}`} style={{ background: 'hsl(0 80% 55%)', color: 'white' }}>Extreme</span>;
      case 'Severe': return <span className={`${base}`} style={{ background: 'hsl(25 90% 55%)', color: 'white' }}>Severe</span>;
      case 'Moderate': return <span className={`${base}`} style={{ background: 'hsl(40 90% 55%)', color: 'white' }}>Moderate</span>;
      case 'Minor': return <span className={`${base}`} style={{ background: 'hsl(210 60% 55%)', color: 'white' }}>Minor</span>;
      default: return <span className={`${base}`} style={{ background: 'var(--cp-surface-dim)', color: 'var(--cp-text-3)' }}>Unknown</span>;
    }
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div
        className="p-10 text-center rounded-2xl"
        style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)' }}
      >
        <Activity className="h-10 w-10 mx-auto mb-3 opacity-20" style={{ color: 'var(--cp-text-3)' }} />
        <p className="font-semibold text-sm" style={{ color: 'var(--cp-text-1)' }}>No active alerts.</p>
        <p className="text-xs mt-1" style={{ color: 'var(--cp-text-3)' }}>The sentinel is monitoring data streams.</p>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden flex flex-col h-full rounded-2xl"
      style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', boxShadow: 'var(--shadow-md)' }}
    >
      {/* Header */}
      <div className="p-4 md:p-5 flex flex-col gap-4" style={{ borderBottom: '1px solid var(--cp-border)', background: 'hsl(0 60% 50% / 0.06)' }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-headline text-lg font-bold flex items-center gap-2" style={{ color: 'var(--cp-text-1)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(0 70% 55%), var(--cp-orange))' }}>
                <Activity className="h-4 w-4 text-white" />
              </div>
              Live Sentinel Feed
            </h2>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--cp-text-3)' }}>Weather • Seismic • Social • News</p>
          </div>
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md"
            style={{ background: 'var(--cp-surface-dim)', color: 'var(--cp-text-2)' }}
          >
            {filteredAlerts.length} Active
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <Filter className="h-3 w-3 shrink-0 mr-1" style={{ color: 'var(--cp-text-3)' }} />
          {['ALL', 'WEATHER', 'SEISMIC', 'SOCIAL', 'NEWS'].map(type => (
            <button key={type} onClick={() => { setFilterType(type); setPage(1); }}
              className="shrink-0 px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all"
              style={filterType === type
                ? { background: 'var(--cp-primary)', color: 'white' }
                : { background: 'var(--cp-surface)', color: 'var(--cp-text-2)', border: '1px solid var(--cp-border)' }
              }
            >{type}</button>
          ))}
        </div>
      </div>

      {/* Alert Cards */}
      <div className="overflow-y-auto flex-1 p-3 md:p-4 space-y-3">
        {paginatedAlerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="p-4 rounded-xl transition-all hover:shadow-lg"
            style={{ background: 'var(--cp-surface-dim)', border: '1px solid var(--cp-border)' }}
          >
            <div className="flex justify-between items-start mb-2 gap-3">
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)' }}
                >
                  {getIcon(alert.type, alert.severity)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--cp-text-3)' }}>{alert.type}</span>
                    <span className="text-[10px]" style={{ color: 'var(--cp-text-3)' }}>•</span>
                    <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--cp-text-3)' }}>{alert.locationName}</p>
                  </div>
                  <h3 className="mt-1 font-semibold text-sm leading-tight" style={{ color: 'var(--cp-text-1)' }}>{alert.title}</h3>
                </div>
              </div>
              {getSeverityBadge(alert.severity)}
            </div>
            <p className="text-xs mt-3 line-clamp-2 pl-11 leading-relaxed" style={{ color: 'var(--cp-text-2)' }}>{alert.description}</p>
            <div className="flex items-center justify-between mt-3 pl-11 pt-3" style={{ borderTop: '1px solid var(--cp-border)' }}>
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--cp-text-3)' }}>
                {alert.source} • {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {alert.url && (
                <a
                  href={alert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] flex items-center gap-1 font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md transition-all hover:shadow-sm"
                  style={{ background: 'var(--cp-surface)', color: 'var(--cp-text-2)', border: '1px solid var(--cp-border)' }}
                >
                  Source <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </motion.div>
        ))}

        {paginatedAlerts.length === 0 && (
          <div className="text-center py-12 text-xs font-semibold" style={{ color: 'var(--cp-text-3)' }}>
            <Activity className="h-8 w-8 mx-auto mb-3 opacity-20" />
            No alerts match the selected filter.
          </div>
        )}

        {hasMore && (
          <div className="pt-2 pb-6 flex justify-center">
            <button
              onClick={() => setPage(p => p + 1)}
              className="btn-secondary text-sm"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
