'use client';

import { Calendar, MapPin, Tag, Zap, DollarSign, Users, Package, ArrowLeft, Image as ImageIcon } from 'lucide-react';
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

  const hasNeeds = needFunds || needVols || (needGoods && goodsList.length > 0);

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h2 className="font-headline font-bold text-xl mb-1">Almost there! 🎉</h2>
        <p className="text-sm" style={{ color: 'var(--cp-text-3)' }}>Review everything before publishing</p>
      </div>

      {/* Preview Card */}
      <motion.div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', boxShadow: '0 8px 32px -8px rgba(0,0,0,0.1)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Image */}
        {image ? (
          <div className="w-full h-48 md:h-56 relative overflow-hidden">
            <img src={image} alt={title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: 'hsl(from var(--cp-primary) h s l / 0.2)', color: 'white', backdropFilter: 'blur(8px)' }}>
                  {category}
                </span>
                {urgency === 'high' && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: 'hsl(from var(--cp-accent) h s l / 0.2)', color: 'white', backdropFilter: 'blur(8px)' }}>
                    🔴 High Priority
                  </span>
                )}
              </div>
              <h3 className="font-headline font-bold text-xl text-white">{title || 'Untitled Event'}</h3>
            </div>
          </div>
        ) : (
          <div className="w-full h-32 flex items-center justify-center" style={{ background: 'var(--cp-surface-dim)' }}>
            <div className="text-center">
              <ImageIcon size={32} style={{ color: 'var(--cp-text-3)' }} className="mx-auto mb-2" />
              <p className="text-xs" style={{ color: 'var(--cp-text-3)' }}>No image — a default will be used</p>
            </div>
          </div>
        )}

        {/* Details */}
        <div className="p-5 space-y-4">
          {!image && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: 'var(--cp-primary-light)', color: 'var(--cp-primary)' }}>
                  {category}
                </span>
                {urgency === 'high' && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: 'hsl(from var(--cp-accent) h s l / 0.1)', color: 'var(--cp-accent)' }}>
                    🔴 High Priority
                  </span>
                )}
              </div>
              <h3 className="font-headline font-bold text-xl" style={{ color: 'var(--cp-text-1)' }}>{title || 'Untitled Event'}</h3>
            </div>
          )}

          {/* Date & Location */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 flex-1 px-3 py-2.5 rounded-xl" style={{ background: 'var(--cp-surface-dim)' }}>
              <Calendar size={14} style={{ color: 'var(--cp-primary)' }} />
              <span className="text-xs font-medium truncate" style={{ color: eventDate ? 'var(--cp-text-1)' : 'var(--cp-text-3)' }}>
                {formattedDate}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-1 px-3 py-2.5 rounded-xl" style={{ background: 'var(--cp-surface-dim)' }}>
              <MapPin size={14} style={{ color: 'var(--cp-accent)' }} />
              <span className="text-xs font-medium truncate" style={{ color: locationName ? 'var(--cp-text-1)' : 'var(--cp-text-3)' }}>
                {locationName || 'No location set'}
              </span>
            </div>
          </div>

          {/* Description */}
          {description && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--cp-text-2)' }}>
              {description.length > 200 ? description.slice(0, 200) + '...' : description}
            </p>
          )}

          {/* Needs */}
          {hasNeeds && (
            <div className="flex flex-wrap gap-2 pt-2" style={{ borderTop: '1px solid var(--cp-border)' }}>
              {needFunds && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: 'var(--cp-gold-light)', color: 'var(--cp-gold)' }}>
                  <DollarSign size={12} /> ${fundGoal}
                </span>
              )}
              {needVols && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: 'var(--cp-secondary-light)', color: 'var(--cp-secondary)' }}>
                  <Users size={12} /> {volGoal} volunteers
                </span>
              )}
              {needGoods && goodsList.length > 0 && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: 'var(--cp-primary-light)', color: 'var(--cp-primary)' }}>
                  <Package size={12} /> {goodsList.length} items
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Edit Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {['Title & Category', 'Date & Location', 'Description & Image', 'Needs'].map((label, idx) => (
          <button
            key={label}
            type="button"
            onClick={() => goToStep(idx + 1)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all hover:scale-[1.02] active:scale-95"
            style={{ background: 'var(--cp-surface-dim)', color: 'var(--cp-primary)', border: '1px solid var(--cp-border)' }}
          >
            <ArrowLeft size={10} />
            Edit {label.split(' ')[0]}
          </button>
        ))}
      </div>
    </div>
  );
}
