'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { pledgeGoods } from '@/services/eventService';
import { useAuth } from '@/context/AuthContext';

interface GoodsPledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  goodsList: string[];
  onPledgeComplete: () => void;
}

export function GoodsPledgeModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  goodsList,
  onPledgeComplete,
}: GoodsPledgeModalProps) {
  const { user, profile } = useAuth();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [otherItems, setOtherItems] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleItem = (item: string) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const hasSelection = selectedItems.length > 0 || otherItems.trim().length > 0;

  const handleSubmit = async () => {
    if (!user || !profile) {
      toast.info('Please sign in to contribute.');
      return;
    }
    if (!hasSelection) {
      toast.warning('Please select at least one item or type something in "Other".');
      return;
    }

    setLoading(true);
    try {
      await pledgeGoods(
        eventId,
        user.uid,
        profile.displayName || user.displayName || 'Anonymous',
        selectedItems,
        otherItems.trim()
      );
      toast.success('Thank you for your pledge!');
      onPledgeComplete();
      onClose();
    } catch (err) {
      console.error('Pledge failed:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            style={{ background: 'var(--color-surface-container-lowest-base)' }}
          >
            {/* Header */}
            <div
              className="px-6 py-4 border-b-4 border-black flex items-center justify-between"
              style={{ background: 'var(--color-tertiary-container-base)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center border-2 border-black" style={{ background: 'var(--color-surface-container-lowest-base)' }}>
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
                </div>
                <div>
                  <h3 className="font-headline font-black text-base uppercase tracking-tight" style={{ color: 'var(--color-on-tertiary-container-base)' }}>
                    Contribute Goods
                  </h3>
                  <p className="text-[10px] font-label font-bold uppercase tracking-wider opacity-70">
                    for {eventTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center border-2 border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-150"
                style={{ background: 'var(--color-error-container-base)' }}
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
              {/* Requested Items */}
              <div>
                <p className="text-[10px] font-label font-bold uppercase tracking-[0.14em] text-on-surface mb-3">
                  Select items you can bring:
                </p>
                <div className="space-y-2">
                  {goodsList.map((item) => {
                    const isSelected = selectedItems.includes(item);
                    return (
                      <button
                        key={item}
                        onClick={() => toggleItem(item)}
                        className={`w-full flex items-center gap-3 px-4 py-3 border-4 text-left text-sm font-body font-bold transition-all duration-150 ${
                          isSelected
                            ? 'border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]'
                            : 'border-black/40 hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        }`}
                        style={{
                          background: isSelected ? 'var(--color-primary-container-base)' : 'var(--color-surface-container-base)',
                          color: isSelected ? 'var(--color-on-primary-container-base)' : undefined,
                        }}
                      >
                        {/* Checkbox */}
                        <span
                          className={`flex-shrink-0 w-5 h-5 border-2 border-black flex items-center justify-center ${
                            isSelected ? '' : ''
                          }`}
                          style={{ background: isSelected ? 'var(--color-on-primary-container-base)' : 'var(--color-surface-container-lowest-base)' }}
                        >
                          {isSelected && (
                            <motion.svg
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="3"
                            >
                              <path d="M20 6L9 17l-5-5" />
                            </motion.svg>
                          )}
                        </span>
                        <span>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 text-[10px] font-label font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                <span className="flex-1 h-[3px] bg-black" />
                or
                <span className="flex-1 h-[3px] bg-black" />
              </div>

              {/* Other Items */}
              <div>
                <label
                  htmlFor="other-items"
                  className="text-[10px] font-label font-bold uppercase tracking-[0.14em] text-on-surface mb-2 block"
                >
                  Something else?
                </label>
                <textarea
                  id="other-items"
                  value={otherItems}
                  onChange={(e) => setOtherItems(e.target.value)}
                  placeholder="e.g. First Aid Kit, Sleeping Bags, Tarps..."
                  rows={3}
                  className="w-full border-4 border-black px-4 py-3 text-sm font-body text-on-surface placeholder:text-on-surface-variant/50 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] outline-none resize-none transition-all"
                  style={{ background: 'var(--color-surface-container-base)' }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t-4 border-black flex items-center gap-3" style={{ background: 'var(--color-surface-container-base)' }}>
              <button
                onClick={onClose}
                className="flex-1 py-3 font-label font-black text-sm uppercase tracking-wider border-4 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150 text-on-surface"
                style={{ background: 'var(--color-surface-container-lowest-base)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !hasSelection}
                className="flex-1 py-3 font-label font-black text-sm uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Confirm →'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
