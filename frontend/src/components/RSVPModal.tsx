'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Lock, ShieldCheck, Download, CalendarPlus, Copy, Loader2, Heart, Ticket } from 'lucide-react';

interface RSVPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (name: string, email: string, ticketId: string, status: 'interested' | 'going') => Promise<void>;
  eventTitle: string;
  eventDescription: string;
  eventLocation: string;
  eventTime: string;
  enrolledCount: number;
  eventId: string;
}

export function RSVPModal({ 
  isOpen, 
  onClose, 
  onRegister, 
  eventTitle,
  eventDescription,
  eventLocation,
  eventTime,
  enrolledCount,
  eventId
}: RSVPModalProps) {
  // Move all hooks to the absolute top
  const [mounted, setMounted] = useState(false);
  const { profile } = useAuth();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    otp: '',
    status: 'going' as 'interested' | 'going'
  });
  const [ticketId, setTicketId] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-fill user data
  useEffect(() => {
    if (profile && isOpen) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || profile.displayName || '',
        email: prev.email || profile.email || ''
      }));
    }
  }, [profile, isOpen]);

  if (!mounted) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.otp) {
      toast.error('Please fill all fields');
      return;
    }

    if (!otpSent) {
      toast.error('Please verify your email first by clicking the Verify button.');
      return;
    }

    setLoading(true);
    try {
      const verifyRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        toast.error(verifyData.error || 'Invalid verification code.');
        setLoading(false);
        return;
      }

      const newTicketId = formData.status === 'going' ? Math.random().toString(36).substring(2, 12).toUpperCase() : '';
      await onRegister(formData.name, formData.email, newTicketId, formData.status);
      
      if (formData.status === 'going') {
        try {
          await fetch('/api/auth/confirm-registration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: formData.email,
              eventTitle,
              ticketId: newTicketId
            }),
          });
        } catch (emailErr) {
          console.error("Failed to send confirmation email:", emailErr);
        }
      }

      setTicketId(newTicketId);
      
      if (formData.status === 'going') {
        const cachedTickets = JSON.parse(localStorage.getItem('wya_tickets') || '[]');
        cachedTickets.push({
          id: newTicketId,
          eventId,
          eventTitle,
          eventTime,
          eventLocation,
          userName: formData.name,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('wya_tickets', JSON.stringify(cachedTickets.slice(-10)));
      }

      setStep('success');
      toast.success('Successfully registered! Digital ticket sent to your email.');
    } catch (err) {
      console.error(err);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      toast.error('Please enter your email first');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSendingOtp(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          eventTitle
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || errorData?.details || "Failed to send verification email");
      }

      setOtpSent(true);
      toast.success("Verification Code Sent!", {
        description: `Check your email (${formData.email}) for the code.`,
      });
    } catch (err) {
      console.error("OTP Error:", err);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const copyTicketId = () => {
    navigator.clipboard.writeText(ticketId);
    toast.success('Ticket ID copied to clipboard');
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticketId)}`;

  const calendarUrl = (() => {
    const baseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
    const text = encodeURIComponent(`Event RSVP: ${eventTitle}`);
    const details = encodeURIComponent(eventDescription);
    const location = encodeURIComponent(eventLocation);
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const startDate = date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endDate = new Date(date.getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const dates = `${startDate}/${endDate}`;
    return `${baseUrl}&text=${text}&details=${details}&location=${location}&dates=${dates}`;
  })();

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, y: 50, scale: 0.9, rotate: 2 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative w-full max-w-md overflow-hidden z-10"
            style={{
              background: 'var(--cp-surface)',
              border: '4px solid var(--cp-border)',
              borderRadius: '32px',
              boxShadow: '12px 12px 0px var(--cp-secondary)',
            }}
          >
            {/* Header */}
            <div className="px-8 py-6 flex items-center justify-between border-b-4 border-[var(--cp-border)] bg-[var(--cp-secondary)]/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white border-2 border-[var(--cp-border)] shadow-[3px 3px 0px_var(--cp-border)]">
                  {step === 'form' ? (
                    <Heart size={24} className="text-[var(--cp-secondary)] fill-current" />
                  ) : (
                    <ShieldCheck size={24} className="text-[var(--cp-secondary)]" />
                  )}
                </div>
                <div>
                  <h2 className="font-headline font-black text-2xl uppercase tracking-tight" style={{ color: 'var(--cp-text-1)' }}>
                    {step === 'form' ? 'Count Me In' : 'Confirmed!'}
                  </h2>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60" style={{ color: 'var(--cp-text-1)' }}>
                    {step === 'form' ? 'Join the community event' : 'You are on the list'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-white/20 border-2 border-transparent hover:border-[var(--cp-border)]"
                style={{ color: 'var(--cp-text-1)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              {step === 'form' ? (
                <form onSubmit={handleRegister} className="space-y-6">
                  {/* Participation Level */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: 'interested' })}
                      className={`py-4 rounded-2xl border-4 font-black uppercase tracking-widest text-xs transition-all flex flex-col items-center gap-2 ${
                        formData.status === 'interested'
                          ? 'bg-[var(--cp-secondary)] text-white border-[var(--cp-border)] shadow-[4px 4px 0px_rgba(0,0,0,0.2)] scale-105'
                          : 'bg-white text-[var(--cp-text-2)] border-[var(--cp-border)] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Heart size={20} className={formData.status === 'interested' ? 'fill-current' : ''} />
                      Interested
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: 'going' })}
                      className={`py-4 rounded-2xl border-4 font-black uppercase tracking-widest text-xs transition-all flex flex-col items-center gap-2 ${
                        formData.status === 'going'
                          ? 'bg-[var(--cp-primary)] text-white border-[var(--cp-border)] shadow-[4px 4px 0px_rgba(0,0,0,0.2)] scale-105'
                          : 'bg-white text-[var(--cp-text-2)] border-[var(--cp-border)] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <ShieldCheck size={20} />
                      Going
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 opacity-60 ml-1">Full Name</label>
                      <input
                        type="text"
                        required
                        className="w-full px-5 py-4 bg-white border-4 border-[var(--cp-border)] rounded-2xl font-bold text-sm focus:outline-none focus:ring-0 focus:border-[var(--cp-secondary)] transition-colors placeholder:opacity-30"
                        placeholder="Type your name..."
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 opacity-60 ml-1">Email Address</label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          required
                          className="flex-1 px-5 py-4 bg-white border-4 border-[var(--cp-border)] rounded-2xl font-bold text-sm focus:outline-none focus:ring-0 focus:border-[var(--cp-secondary)] transition-colors placeholder:opacity-30"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={sendingOtp || !formData.email}
                          className="px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-[var(--cp-secondary)] text-white border-4 border-[var(--cp-border)] shadow-[4px 4px 0px_rgba(0,0,0,0.1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50"
                        >
                          {sendingOtp ? <Loader2 size={16} className="animate-spin" /> : 'Verify'}
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 opacity-60 ml-1">Verification Code</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        className="w-full px-5 py-4 bg-white border-4 border-[var(--cp-border)] rounded-2xl font-mono text-2xl font-black text-center tracking-[0.5em] focus:outline-none focus:ring-0 focus:border-[var(--cp-secondary)] transition-colors placeholder:opacity-10"
                        placeholder="000000"
                        value={formData.otp}
                        onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !otpSent}
                    className="w-full py-5 rounded-3xl font-black font-headline text-xl uppercase tracking-tight text-white transition-all enabled:hover:scale-[1.02] enabled:active:scale-95 disabled:opacity-50 border-4 border-[var(--cp-border)] shadow-[6px 6px 0px_rgba(0,0,0,0.1)]"
                    style={{ background: 'var(--cp-primary)' }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-3">
                        <Loader2 size={24} className="animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <span>{formData.status === 'going' ? 'Secure My Ticket →' : 'Log My Interest →'}</span>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center space-y-8">
                  <div className="relative inline-block">
                    <motion.div
                      animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 4 }}
                      className="w-24 h-24 rounded-3xl bg-[var(--cp-secondary)] border-4 border-[var(--cp-border)] flex items-center justify-center shadow-[8px 8px 0px_var(--cp-border)]"
                    >
                      <ShieldCheck size={48} className="text-white" />
                    </motion.div>
                    <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-[var(--cp-primary)] border-4 border-[var(--cp-border)] flex items-center justify-center animate-bounce">
                      <Ticket size={20} className="text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-headline font-black text-3xl uppercase tracking-tighter mb-2" style={{ color: 'var(--cp-text-1)' }}>
                      Awesome choice!
                    </h3>
                    <p className="text-sm font-medium opacity-70 px-4" style={{ color: 'var(--cp-text-1)' }}>
                      {formData.status === 'going' 
                        ? "You're officially on the guest list. Your digital ticket is ready below." 
                        : "Thanks for your interest! We'll keep you posted on updates for this event."}
                    </p>
                  </div>

                  {formData.status === 'going' && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="p-6 bg-white border-4 border-[var(--cp-border)] rounded-[32px] shadow-[8px 8px 0px_rgba(0,0,0,0.05)] relative overflow-hidden"
                    >
                      {/* Ticket Cutout Effect */}
                      <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[var(--cp-surface)] border-4 border-[var(--cp-border)]" />
                      <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[var(--cp-surface)] border-4 border-[var(--cp-border)]" />
                      
                      <div className="flex justify-between items-start mb-6 border-b-2 border-dashed border-[var(--cp-border)] pb-4 px-2">
                        <div className="text-left">
                          <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Ticket ID</p>
                          <p className="font-mono font-black text-lg">{ticketId}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Entry No.</p>
                          <p className="font-headline font-black text-xl">#{enrolledCount + 1}</p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border-2 border-[var(--cp-border)] inline-block mb-6">
                        <img src={qrUrl} alt="QR Code" className="w-32 h-32" />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={copyTicketId}
                          className="flex-1 py-3 px-4 rounded-xl border-2 border-[var(--cp-border)] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                        >
                          <Copy size={14} /> Copy ID
                        </button>
                        <a
                          href={qrUrl}
                          download={`ticket-${ticketId}.png`}
                          className="flex-1 py-3 px-4 rounded-xl bg-black text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                        >
                          <Download size={14} /> Save
                        </a>
                      </div>
                    </motion.div>
                  )}

                  <button
                    onClick={onClose}
                    className="w-full py-4 rounded-2xl border-4 border-[var(--cp-border)] font-black uppercase tracking-widest text-sm hover:bg-[var(--cp-surface-dim)] transition-colors"
                  >
                    Close Window
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
