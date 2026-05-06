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
      if (response.ok) {
        toast.success(`Promotion sent! Success: ${data.success}, Failed: ${data.failed}`);
        onClose(); setFile(null); setMessage('');
      } else {
        toast.error(data.error || 'Failed to send promotion.');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while sending promotions.');
    } finally {
      setLoading(false);
    }
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
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
          onClick={onClose}
        />

        {/* Modal — sharp-edge editorial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md overflow-hidden"
          style={{
            background: 'var(--cp-surface)',
            border: '1px solid var(--cp-border)',
            borderRadius: 0,
            boxShadow: '0 32px 64px -12px rgba(0,0,0,0.4)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid var(--cp-border)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 flex items-center justify-center"
                style={{ background: 'var(--cp-primary)', borderRadius: '4px' }}
              >
                <Send size={14} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--cp-primary)' }}>
                  Outreach
                </p>
                <h3 className="font-headline font-bold text-sm leading-tight" style={{ color: 'var(--cp-text-1)' }}>
                  Promote Event
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center transition-all hover:opacity-70"
              style={{ color: 'var(--cp-text-3)', borderRadius: '4px' }}
            >
              <X size={15} />
            </button>
          </div>

          <form onSubmit={handlePromote} className="p-6 space-y-6">
            {/* File Upload */}
            <div>
              <label
                className="block text-[10px] font-bold uppercase tracking-widest mb-3"
                style={{ color: 'var(--cp-text-3)' }}
              >
                Email List (CSV)
              </label>
              <div
                onClick={handleBoxClick}
                className="flex flex-col items-center justify-center w-full h-36 cursor-pointer transition-all"
                style={{
                  borderRadius: 0,
                  background: file ? 'hsl(from var(--cp-primary) h s l / 0.05)' : 'var(--cp-surface-dim)',
                  border: file
                    ? '1px solid var(--cp-primary)'
                    : '1px dashed var(--cp-border)',
                }}
              >
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className="w-9 h-9 flex items-center justify-center"
                      style={{ background: 'hsl(from var(--cp-primary) h s l / 0.12)', borderRadius: '4px' }}
                    >
                      <Send size={16} style={{ color: 'var(--cp-primary)' }} />
                    </div>
                    <p className="text-sm font-bold" style={{ color: 'var(--cp-text-1)' }}>File selected</p>
                    <p className="text-xs max-w-[200px] truncate" style={{ color: 'var(--cp-text-3)' }}>{file.name}</p>
                    <button
                      onClick={e => { e.stopPropagation(); setFile(null); }}
                      className="text-xs font-bold transition-all hover:opacity-70 mt-1"
                      style={{ color: 'var(--cp-accent)' }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <FileUp size={22} style={{ color: 'var(--cp-text-3)' }} />
                    <p className="text-sm font-semibold" style={{ color: 'var(--cp-text-1)' }}>Click to upload</p>
                    <p className="text-xs" style={{ color: 'var(--cp-text-3)' }}>CSV or Excel with &apos;email&apos; column</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx"
                className="hidden"
                onChange={e => {
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
            <div>
              <label
                className="block text-[10px] font-bold uppercase tracking-widest mb-3"
                style={{ color: 'var(--cp-text-3)' }}
              >
                Invitation Message
              </label>
              <textarea
                required
                rows={4}
                className="input-base resize-none w-full text-sm"
                placeholder="Enter the message for your community..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                style={{ borderRadius: 0 }}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-sm font-semibold transition-all hover:opacity-80"
                style={{
                  borderRadius: '4px',
                  background: 'var(--cp-surface-dim)',
                  color: 'var(--cp-text-2)',
                  border: '1px solid var(--cp-border)',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !file || !message}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ borderRadius: '4px', background: 'var(--cp-primary)' }}
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
