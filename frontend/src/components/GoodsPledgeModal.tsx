'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { pledgeGoods } from '@/services/eventService';
import { useAuth } from '@/context/AuthContext';
import { X, Package, Check, Loader2 } from 'lucide-react';

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

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
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
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-md overflow-hidden"
            style={{
              background: 'var(--cp-surface)',
              border: '1px solid var(--cp-border)',
              borderRadius: 'var(--r-2xl)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid var(--cp-border)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, var(--cp-orange), var(--cp-pink))' }}
                >
                  <Package size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base" style={{ color: 'var(--cp-text-1)' }}>
                    Contribute Goods
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--cp-text-3)' }}>
                    for {eventTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                style={{ color: 'var(--cp-text-2)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--cp-surface-dim)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
              {/* Requested Items */}
              <div>
                <p className="text-xs font-semibold mb-3" style={{ color: 'var(--cp-text-2)' }}>
                  Select items you can bring:
                </p>
                <div className="space-y-2">
                  {goodsList.map((item) => {
                    const isSelected = selectedItems.includes(item);
                    return (
                      <button
                        key={item}
                        onClick={() => toggleItem(item)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all"
                        style={{
                          background: isSelected ? 'hsl(from var(--cp-primary) h s l / 0.1)' : 'var(--cp-surface-dim)',
                          color: isSelected ? 'var(--cp-primary)' : 'var(--cp-text-1)',
                          border: isSelected ? '1.5px solid var(--cp-primary)' : '1px solid var(--cp-border)',
                          transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                        }}
                      >
                        {/* Checkbox */}
                        <span
                          className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-all"
                          style={{
                            background: isSelected ? 'var(--cp-primary)' : 'transparent',
                            border: isSelected ? '1.5px solid var(--cp-primary)' : '1.5px solid var(--cp-border)',
                          }}
                        >
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              <Check size={12} className="text-white" strokeWidth={3} />
                            </motion.div>
                          )}
                        </span>
                        <span>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <span className="flex-1 h-px" style={{ background: 'var(--cp-border)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--cp-text-3)' }}>or</span>
                <span className="flex-1 h-px" style={{ background: 'var(--cp-border)' }} />
              </div>

              {/* Other Items */}
              <div>
                <label
                  htmlFor="other-items"
                  className="text-xs font-semibold mb-2 block"
                  style={{ color: 'var(--cp-text-2)' }}
                >
                  Something else?
                </label>
                <textarea
                  id="other-items"
                  value={otherItems}
                  onChange={(e) => setOtherItems(e.target.value)}
                  placeholder="e.g. First Aid Kit, Sleeping Bags, Tarps..."
                  rows={3}
                  className="input-base resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div
              className="px-6 py-4 flex items-center gap-3"
              style={{ background: 'var(--cp-surface-dim)', borderTop: '1px solid var(--cp-border)' }}
            >
              <button
                onClick={onClose}
                className="btn-secondary flex-1 justify-center py-3"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !hasSelection}
                className="btn-primary flex-1 justify-center py-3 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={15} className="animate-spin" />
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
    </AnimatePresence>,
    document.body
  );
}
