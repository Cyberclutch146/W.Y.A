'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { X, Send, FileUp, Loader2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-md overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" style={{ background: 'var(--color-surface-container-lowest-base)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black" style={{ background: 'var(--color-tertiary-container-base)' }}>
          <h3 className="font-headline font-black text-base uppercase tracking-tight text-on-surface">Promote Event</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center border-2 border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all" style={{ background: 'var(--color-surface-container-lowest-base)' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handlePromote} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-label font-bold uppercase tracking-[0.14em] text-on-surface">Upload Email List (CSV)</label>
            <div onClick={handleBoxClick} className={`flex flex-col items-center justify-center w-full h-40 border-4 cursor-pointer transition-all ${file ? 'border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'border-dashed border-black/40 hover:border-black'}`} style={file ? { background: 'var(--color-primary-container-base)' } : { background: 'var(--color-surface-container-base)' }}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {file ? (
                  <>
                    <Send size={28} className="mb-3 text-on-surface" />
                    <p className="text-sm font-label font-black uppercase text-on-surface mb-1">File Ready!</p>
                    <p className="text-xs text-on-surface-variant max-w-[200px] truncate">{file.name}</p>
                    <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="mt-3 text-[10px] uppercase tracking-wider font-black text-error hover:underline">Remove</button>
                  </>
                ) : (
                  <>
                    <FileUp size={32} className="text-on-surface-variant mb-2" />
                    <p className="text-sm font-label font-bold text-on-surface">Click to upload</p>
                    <p className="text-xs text-on-surface-variant/60 mt-1">CSV or Excel with &apos;email&apos; column</p>
                  </>
                )}
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept=".csv, .xlsx" className="hidden" onChange={(e) => { const f = e.target.files?.[0] || null; if (f) { const n = f.name.toLowerCase(); if (!n.endsWith('.csv') && !n.endsWith('.xlsx')) { toast.error('Please select a valid CSV or Excel file.'); e.target.value = ''; return; } setFile(f); toast.success(`File selected: ${f.name}`); } e.target.value = ''; }} />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-label font-bold uppercase tracking-[0.14em] text-on-surface">Invitation Message</label>
            <textarea required rows={4} className="w-full border-4 border-black px-4 py-3 text-sm focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] outline-none text-on-surface resize-none transition-all" style={{ background: 'var(--color-surface-container-base)' }} placeholder="Enter the message for your community..." value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 font-label font-black text-sm uppercase tracking-wider border-4 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all text-on-surface" style={{ background: 'var(--color-surface-container-base)' }}>Cancel</button>
            <button type="submit" disabled={loading || !file || !message} className="flex-1 flex items-center justify-center gap-2 py-3 font-label font-black text-sm uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-40 disabled:cursor-not-allowed transition-all" style={{ background: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' }}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
