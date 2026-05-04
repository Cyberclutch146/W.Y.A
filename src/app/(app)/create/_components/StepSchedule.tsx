'use client';

import { Calendar, Clock } from 'lucide-react';
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

export default function StepSchedule({
  eventDate, setEventDate,
  locationName, setLocationName, setLat, setLng,
}: StepScheduleProps) {
  // Quick pick helpers
  const quickPicks = [
    { label: '📅 Today 6 PM', getValue: () => { const d = new Date(); d.setHours(18, 0, 0, 0); return d.toISOString().slice(0, 16); } },
    { label: '🌅 Tomorrow 10 AM', getValue: () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(10, 0, 0, 0); return d.toISOString().slice(0, 16); } },
    { label: '🎉 This Weekend', getValue: () => { const d = new Date(); const day = d.getDay(); const diff = day === 0 ? 0 : 6 - day; d.setDate(d.getDate() + diff); d.setHours(14, 0, 0, 0); return d.toISOString().slice(0, 16); } },
  ];

  return (
    <div className="space-y-8">
      {/* Date Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--cp-primary-light)', color: 'var(--cp-primary)' }}>
            <Calendar size={18} />
          </div>
          <div>
            <h3 className="font-headline font-bold text-sm">Date & Time</h3>
            <p className="text-[11px]" style={{ color: 'var(--cp-text-3)' }}>When is your event happening?</p>
          </div>
        </div>

        {/* Quick Picks */}
        <div className="flex flex-wrap gap-2 mb-4">
          {quickPicks.map((qp) => (
            <button
              key={qp.label}
              type="button"
              onClick={() => setEventDate(qp.getValue())}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 hover:scale-[1.02]"
              style={{
                background: 'var(--cp-surface-dim)',
                color: 'var(--cp-text-2)',
                border: '1px solid var(--cp-border)',
              }}
            >
              {qp.label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl p-5" style={{ background: 'var(--cp-surface-dim)', border: '1px solid var(--cp-border)' }}>
          <DateTimePicker value={eventDate} onChange={(val) => setEventDate(val)} />
        </div>
      </div>

      {/* Location Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'hsl(from var(--cp-accent) h s l / 0.12)', color: 'var(--cp-accent)' }}>
            <Clock size={18} />
          </div>
          <div>
            <h3 className="font-headline font-bold text-sm">Location</h3>
            <p className="text-[11px]" style={{ color: 'var(--cp-text-3)' }}>Search an address or click on the map</p>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--cp-border)' }}>
          <LocationPickerWrapper
            onLocationSelect={(loc) => {
              setLocationName(loc.name);
              setLat(loc.lat);
              setLng(loc.lng);
            }}
          />
        </div>
        {locationName && (
          <p className="text-xs mt-2 px-1 font-medium" style={{ color: 'var(--cp-secondary)' }}>
            📍 {locationName}
          </p>
        )}
      </div>
    </div>
  );
}
