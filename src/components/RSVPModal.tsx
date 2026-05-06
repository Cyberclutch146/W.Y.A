'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Lock, ShieldCheck, Download, CalendarPlus, Copy, Loader2, Heart } from 'lucide-react';

interface RSVPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (name: string, email: string, ticketId: string, status: 'interested' | 'going') => Promise<void>;
  eventTitle: string;
  eventDescription: string;
  eventLocation: string;
  eventTime: string;
  enrolledCount: number;
}

export function RSVPModal({ 
  isOpen, 
  onClose, 
  onRegister, 
  eventTitle,
  eventDescription,
  eventLocation,
  eventTime,
  enrolledCount
}: RSVPModalProps) {
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

  if (!isOpen) return null;

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
      // Verify OTP on the server
      const verifyRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          code: formData.otp,
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
      
      // Send confirmation email with QR code if going
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
          // We don't block the success UI if just the email fails
        }
      }

      setTicketId(newTicketId);
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
      // OTP is now generated entirely on the server
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
    // Use a real date if possible, fallback to tomorrow
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const startDate = date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endDate = new Date(date.getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const dates = `${startDate}/${endDate}`;
    return `${baseUrl}&text=${text}&details=${details}&location=${location}&dates=${dates}`;
  })();

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
                  style={{ background: 'linear-gradient(135deg, var(--cp-secondary), var(--cp-lime))' }}
                >
                  {step === 'form' ? (
                    <Heart size={16} className="text-white" />
                  ) : (
                    <ShieldCheck size={16} className="text-white" />
                  )}
                </div>
                <div>
                  <h2 className="font-headline font-bold text-base" style={{ color: 'var(--cp-text-1)' }}>
                    {step === 'form' ? 'RSVP for Event' : "You're All Set!"}
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--cp-text-3)' }}>
                    {step === 'form' ? 'Choose how you want to participate' : 'RSVP confirmed'}
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

            <div className="p-6">
              {step === 'form' ? (
                <form onSubmit={handleRegister} className="space-y-5">
                  {/* RSVP Status */}
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--cp-text-2)' }}>
                      Participation Level
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: 'interested' })}
                        className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                          formData.status === 'interested'
                            ? 'border-[var(--cp-secondary)] bg-[hsl(from_var(--cp-secondary)_h_s_l_/_0.1)] text-[var(--cp-secondary)]'
                            : 'border-[var(--cp-border)] text-[var(--cp-text-2)] hover:bg-[var(--cp-surface-dim)]'
                        }`}
                      >
                        <Heart size={18} />
                        <span>Interested</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: 'going' })}
                        className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                          formData.status === 'going'
                            ? 'border-[var(--cp-primary)] bg-[hsl(from_var(--cp-primary)_h_s_l_/_0.1)] text-[var(--cp-primary)]'
                            : 'border-[var(--cp-border)] text-[var(--cp-text-2)] hover:bg-[var(--cp-surface-dim)]'
                        }`}
                      >
                        <ShieldCheck size={18} />
                        <span>Going</span>
                      </button>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--cp-text-2)' }} htmlFor="vol-name">
                      Full Name
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--cp-text-3)' }} />
                      <input
                        id="vol-name"
                        type="text"
                        required
                        className="input-base pl-10"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--cp-text-2)' }} htmlFor="vol-email">
                      Email Address
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--cp-text-3)' }} />
                        <input
                          id="vol-email"
                          type="email"
                          required
                          className="input-base pl-10"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendingOtp || !formData.email}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 whitespace-nowrap"
                        style={{
                          background: 'hsl(from var(--cp-secondary) h s l / 0.12)',
                          color: 'var(--cp-secondary)',
                          border: '1px solid hsl(from var(--cp-secondary) h s l / 0.3)',
                        }}
                      >
                        {sendingOtp ? <Loader2 size={14} className="animate-spin" /> : 'Verify'}
                      </button>
                    </div>
                  </div>

                  {/* OTP */}
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--cp-text-2)' }} htmlFor="vol-otp">
                      Verification Code
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--cp-text-3)' }} />
                      <input
                        id="vol-otp"
                        type="text"
                        required
                        maxLength={6}
                        className="input-base pl-10 font-mono tracking-[0.4em] text-center text-lg"
                        placeholder="000000"
                        value={formData.otp}
                        onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                      />
                    </div>
                    {otpSent && (
                      <div
                        className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: 'hsl(from var(--cp-secondary) h s l / 0.1)', color: 'var(--cp-secondary)' }}
                      >
                        <ShieldCheck size={12} /> Code sent! Check inbox.
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !otpSent}
                    className="btn-primary w-full justify-center py-4 text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <><Loader2 size={16} className="animate-spin" /> Processing...</>
                    ) : (
                      <><Heart size={16} /> {formData.status === 'going' ? 'Confirm RSVP & Get Ticket →' : 'Confirm Interest →'}</>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center">
                  {/* Success icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                    className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl"
                    style={{ background: 'linear-gradient(135deg, var(--cp-secondary), var(--cp-lime))', boxShadow: '0 12px 32px -6px hsl(from var(--cp-secondary) h s l / 0.5)' }}
                  >
                    <ShieldCheck size={28} className="text-white" />
                  </motion.div>
                  
                  <h3 className="font-headline font-bold text-xl mb-2" style={{ color: 'var(--cp-text-1)' }}>
                    {formData.status === 'going' ? 'RSVP Confirmed' : 'Interest Logged!'}
                  </h3>
                  <p className="text-sm mb-6" style={{ color: 'var(--cp-text-2)' }}>
                    {formData.status === 'going' ? 'Thank you for joining' : "We'll keep you updated on"}<br />
                    <span className="font-headline font-bold" style={{ color: 'var(--cp-text-1)' }}>{eventTitle}</span>
                  </p>

                  {/* Ticket Card for 'going' */}
                  {formData.status === 'going' && (
                    <>
                      <div
                        className="rounded-2xl p-5 mb-6 text-left"
                        style={{ background: 'var(--cp-surface-dim)', border: '1px solid var(--cp-border)' }}
                      >
                        <div className="grid grid-cols-2 gap-4 mb-5">
                          <div>
                            <span className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--cp-text-3)' }}>Queue Pos</span>
                            <span className="text-xl font-headline font-bold" style={{ color: 'var(--cp-text-1)' }}>#{enrolledCount + 1}</span>
                          </div>
                          <div className="text-right">
                            <span className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--cp-text-3)' }}>Time</span>
                            <span className="text-sm font-bold leading-tight block" style={{ color: 'var(--cp-text-1)' }}>{eventTime}</span>
                          </div>
                        </div>

                        <div className="flex justify-center mb-4">
                          <div
                            className="p-3 rounded-xl inline-block"
                            style={{ background: 'white', border: '1px solid var(--cp-border)', boxShadow: 'var(--shadow-md)' }}
                          >
                            <img src={qrUrl} alt="Ticket QR Code" className="w-32 h-32 rounded-lg" />
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-2">
                          <code
                            className="px-4 py-2 text-sm font-mono font-bold tracking-widest rounded-lg"
                            style={{ background: 'hsl(from var(--cp-primary) h s l / 0.1)', color: 'var(--cp-primary)', border: '1px solid hsl(from var(--cp-primary) h s l / 0.2)' }}
                          >
                            {ticketId}
                          </code>
                          <button
                            onClick={copyTicketId}
                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                            style={{ background: 'hsl(from var(--cp-secondary) h s l / 0.12)', color: 'var(--cp-secondary)' }}
                            title="Copy ID"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <a
                          href={qrUrl}
                          download={`rsvp-ticket-${ticketId}.png`}
                          className="btn-primary w-full justify-center py-3.5 text-sm"
                        >
                          <Download size={16} /> Save Digital Ticket
                        </a>

                        <a
                          href={calendarUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary w-full justify-center py-3.5 text-sm"
                        >
                          <CalendarPlus size={16} /> Sync to Calendar
                        </a>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
