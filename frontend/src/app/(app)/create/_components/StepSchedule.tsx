'use client';

import { Calendar, MapPin } from 'lucide-react';
import DateTimePicker from '@/components/DateTimePicker';
import LocationPickerWrapper from '@/components/LocationPickerWrapper';

interface StepScheduleProps {
  eventDate: string;
  setEventDate: (v: string) => void;
  locationName: string;
  setLocationName: (v: string) => void;
  setLat: (v: number | undefined) => void;
  setLng: (v: number | undefined) => void;
}

const sectionStyle = {
  borderBottom: '1px solid var(--cp-border)',
  paddingBottom: '2rem',
  marginBottom: '2rem',
};

export default function StepSchedule({
  eventDate, setEventDate,
  locationName, setLocationName, setLat, setLng,
}: StepScheduleProps) {
  const quickPicks = [
    { label: 'Today 6 PM',      getValue: () => { const d = new Date(); d.setHours(18, 0, 0, 0); return d.toISOString().slice(0, 16); } },
    { label: 'Tomorrow 10 AM',  getValue: () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(10, 0, 0, 0); return d.toISOString().slice(0, 16); } },
    { label: 'This Weekend',    getValue: () => { const d = new Date(); const diff = d.getDay() === 0 ? 0 : 6 - d.getDay(); d.setDate(d.getDate() + diff); d.setHours(14, 0, 0, 0); return d.toISOString().slice(0, 16); } },
  ];

  return (
    <div>
      {/* ── Date & Time ── */}
      <div style={sectionStyle}>
        <div className="flex items-center gap-2 mb-5">
          <Calendar size={15} style={{ color: 'var(--cp-primary)' }} />
          <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--cp-text-3)' }}>
            Date & Time
          </label>
        </div>

        {/* Quick picks */}
        <div className="flex flex-wrap gap-2 mb-5">
          {quickPicks.map(qp => (
            <button
              key={qp.label}
              type="button"
              onClick={() => setEventDate(qp.getValue())}
              className="px-4 py-2 text-xs font-semibold transition-all hover:opacity-80"
              style={{
                borderRadius: '4px',
                background: 'var(--cp-surface-dim)',
                color: 'var(--cp-text-2)',
                border: '1px solid var(--cp-border)',
              }}
            >
              {qp.label}
            </button>
          ))}
        </div>

        <div style={{ border: '1px solid var(--cp-border)', borderRadius: 0, padding: '1.25rem', background: 'var(--cp-surface-dim)' }}>
          <DateTimePicker value={eventDate} onChange={val => setEventDate(val)} />
        </div>

        {eventDate && (
          <p className="text-xs mt-3 font-semibold" style={{ color: 'var(--cp-secondary)' }}>
            {new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      {/* ── Location ── */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <MapPin size={15} style={{ color: 'var(--cp-accent)' }} />
          <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--cp-text-3)' }}>
            Location
          </label>
        </div>

        <div style={{ border: '1px solid var(--cp-border)', borderRadius: 0, overflow: 'hidden' }}>
          <LocationPickerWrapper
            onLocationSelect={loc => {
              setLocationName(loc.name);
              setLat(loc.lat);
              setLng(loc.lng);
            }}
          />
        </div>

        {locationName && (
          <p className="text-xs mt-3 font-semibold" style={{ color: 'var(--cp-secondary)' }}>
            {locationName}
          </p>
        )}
      </div>
    </div>
  );
}
