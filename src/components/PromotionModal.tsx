'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { X, Send, FileUp, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId?: string;
}

export default function PromotionModal({ isOpen, onClose, campaignId }: PromotionModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleBoxClick = () => { fileInputRef.current?.click(); };

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !message) { toast.error('Please provide both a CSV file and a message.'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('message', message);
      if (campaignId) formData.append('campaignId', campaignId);
      const response = await fetch('/api/promote', { method: 'POST', body: formData });
      const data = await response.json();
      if (response.ok) { toast.success(`Promotion sent! Success: ${data.success}, Failed: ${data.failed}`); onClose(); setFile(null); setMessage(''); }
      else { toast.error(data.error || 'Failed to send promotion.'); }
    } catch (err) { console.error(err); toast.error('An error occurred while sending promotions.'); }
    finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
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
                style={{ background: 'linear-gradient(135deg, var(--cp-cyan), var(--cp-violet))' }}
              >
                <Send size={16} className="text-white" />
              </div>
              <h3 className="font-headline font-bold text-base" style={{ color: 'var(--cp-text-1)' }}>
                Promote Event
              </h3>
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

          <form onSubmit={handlePromote} className="p-6 space-y-5">
            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-xs font-semibold" style={{ color: 'var(--cp-text-2)' }}>Upload Email List (CSV)</label>
              <div
                onClick={handleBoxClick}
                className="flex flex-col items-center justify-center w-full h-40 cursor-pointer transition-all rounded-xl"
                style={{
                  background: file ? 'hsl(from var(--cp-primary) h s l / 0.06)' : 'var(--cp-surface-dim)',
                  border: file ? '1.5px solid var(--cp-primary)' : '1.5px dashed var(--cp-border)',
                }}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {file ? (
                    <>
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                        style={{ background: 'hsl(from var(--cp-primary) h s l / 0.15)' }}
                      >
                        <Send size={20} style={{ color: 'var(--cp-primary)' }} />
                      </div>
                      <p className="text-sm font-bold" style={{ color: 'var(--cp-text-1)' }}>File Ready!</p>
                      <p className="text-xs mt-1 max-w-[200px] truncate" style={{ color: 'var(--cp-text-3)' }}>{file.name}</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="mt-3 text-xs font-bold transition-all hover:opacity-70"
                        style={{ color: 'var(--cp-accent)' }}
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <>
                      <FileUp size={28} className="mb-2" style={{ color: 'var(--cp-text-3)' }} />
                      <p className="text-sm font-semibold" style={{ color: 'var(--cp-text-1)' }}>Click to upload</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--cp-text-3)' }}>CSV or Excel with &apos;email&apos; column</p>
                    </>
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  if (f) {
                    const n = f.name.toLowerCase();
                    if (!n.endsWith('.csv') && !n.endsWith('.xlsx')) {
                      toast.error('Please select a valid CSV or Excel file.');
                      e.target.value = '';
                      return;
                    }
                    setFile(f);
                    toast.success(`File selected: ${f.name}`);
                  }
                  e.target.value = '';
                }}
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="text-xs font-semibold" style={{ color: 'var(--cp-text-2)' }}>Invitation Message</label>
              <textarea
                required
                rows={4}
                className="input-base resize-none"
                placeholder="Enter the message for your community..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1 justify-center py-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !file || !message}
                className="btn-primary flex-1 justify-center py-3 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
