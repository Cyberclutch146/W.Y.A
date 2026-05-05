'use client';

import { Calendar, MapPin, DollarSign, Users, Package, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StepReviewProps {
  title: string;
  description: string;
  category: string;
  urgency: 'high' | 'normal';
  eventDate: string;
  locationName: string;
  image: string;
  needFunds: boolean;
  fundGoal: number;
  needVols: boolean;
  volGoal: number;
  needGoods: boolean;
  goodsList: string[];
  goToStep: (step: number) => void;
}

export default function StepReview({
  title, description, category, urgency,
  eventDate, locationName, image,
  needFunds, fundGoal, needVols, volGoal,
  needGoods, goodsList, goToStep,
}: StepReviewProps) {
  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : 'Not set';

  const cleanCategory = category.replace(/^\S+\s/, '');
  const hasNeeds = needFunds || needVols || (needGoods && goodsList.length > 0);

  const rowStyle = {
    display: 'flex' as const,
    borderBottom: '1px solid var(--cp-border)',
    padding: '1rem 0',
    gap: '1rem',
    alignItems: 'flex-start' as const,
  };

  const labelStyle = {
    width: '140px',
    flexShrink: 0 as const,
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.07em',
    color: 'var(--cp-text-3)',
    paddingTop: '2px',
  };

  return (
    <div>
      {/* Cover image */}
      {image ? (
        <motion.div
          className="w-full mb-8 relative overflow-hidden"
          style={{ height: 220, borderRadius: 0 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
          <img src={image} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-5 left-6">
            <p className="text-white font-headline font-bold text-2xl">{title || 'Untitled Event'}</p>
            <p className="text-white/70 text-sm mt-1">{cleanCategory} · {urgency === 'high' ? 'High Priority' : 'Normal'}</p>
          </div>
        </motion.div>
      ) : (
        <div className="w-full mb-8 flex items-center justify-center"
          style={{ height: 120, background: 'var(--cp-surface-dim)', border: '1px solid var(--cp-border)', borderRadius: 0 }}>
          <div className="text-center">
            <ImageIcon size={24} style={{ color: 'var(--cp-text-3)' }} className="mx-auto mb-1" />
            <p className="text-xs" style={{ color: 'var(--cp-text-3)' }}>No image — a default will be used</p>
          </div>
        </div>
      )}

      {/* Details table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        {!image && (
          <div style={rowStyle}>
            <span style={labelStyle}>Title</span>
            <span className="text-base font-bold">{title || 'Untitled Event'}</span>
          </div>
        )}

        <div style={rowStyle}>
          <span style={labelStyle}>Category</span>
          <span className="text-sm font-semibold">{cleanCategory || '—'}</span>
        </div>

        <div style={rowStyle}>
          <span style={labelStyle}>Urgency</span>
          <span className="text-sm font-semibold" style={{ color: urgency === 'high' ? 'var(--cp-accent)' : 'var(--cp-secondary)' }}>
            {urgency === 'high' ? 'High Priority' : 'Normal'}
          </span>
        </div>

        <div style={rowStyle}>
          <span style={labelStyle}>Date & Time</span>
          <div className="flex items-start gap-2">
            <Calendar size={14} style={{ color: 'var(--cp-primary)', marginTop: 2 }} />
            <span className="text-sm" style={{ color: eventDate ? 'var(--cp-text-1)' : 'var(--cp-text-3)' }}>
              {formattedDate}
            </span>
          </div>
        </div>

        <div style={rowStyle}>
          <span style={labelStyle}>Location</span>
          <div className="flex items-start gap-2">
            <MapPin size={14} style={{ color: 'var(--cp-accent)', marginTop: 2 }} />
            <span className="text-sm" style={{ color: locationName ? 'var(--cp-text-1)' : 'var(--cp-text-3)' }}>
              {locationName || 'Not set'}
            </span>
          </div>
        </div>

        {description && (
          <div style={rowStyle}>
            <span style={labelStyle}>Description</span>
            <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--cp-text-2)' }}>
              {description.length > 220 ? description.slice(0, 220) + '...' : description}
            </p>
          </div>
        )}

        {hasNeeds && (
          <div style={{ ...rowStyle, borderBottom: 'none' }}>
            <span style={labelStyle}>Needs</span>
            <div className="flex flex-wrap gap-2">
              {needFunds && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
                  style={{ borderRadius: '3px', background: 'var(--cp-gold-light)', color: 'var(--cp-gold)', border: '1px solid hsl(from var(--cp-gold) h s l / 0.2)' }}>
                  <DollarSign size={11} /> ${fundGoal}
                </span>
              )}
              {needVols && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
                  style={{ borderRadius: '3px', background: 'var(--cp-secondary-light)', color: 'var(--cp-secondary)', border: '1px solid hsl(from var(--cp-secondary) h s l / 0.2)' }}>
                  <Users size={11} /> {volGoal} volunteers
                </span>
              )}
              {needGoods && goodsList.length > 0 && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
                  style={{ borderRadius: '3px', background: 'var(--cp-primary-light)', color: 'var(--cp-primary)', border: '1px solid hsl(from var(--cp-primary) h s l / 0.2)' }}>
                  <Package size={11} /> {goodsList.length} items
                </span>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Edit shortcuts */}
      <div className="mt-8 pt-6 grid grid-cols-2 sm:grid-cols-4 gap-2"
        style={{ borderTop: '1px solid var(--cp-border)' }}>
        {['Title & Category', 'Date & Location', 'Content', 'Back to top'].map((label, idx) => (
          <button
            key={label}
            type="button"
            onClick={() => goToStep(idx + 1)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-all hover:opacity-80"
            style={{
              borderRadius: '4px',
              background: 'var(--cp-surface-dim)',
              color: 'var(--cp-text-2)',
              border: '1px solid var(--cp-border)',
            }}
          >
            <ArrowLeft size={10} />
            Edit {label.split(' ')[0]}
          </button>
        ))}
      </div>
    </div>
  );
}
