'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (name: string, email: string, ticketId: string) => Promise<void>;
  eventTitle: string;
  eventDescription: string;
  eventLocation: string;
  eventTime: string;
  enrolledCount: number;
}

export function VolunteerModal({ 
  isOpen, 
  onClose, 
  onRegister, 
  eventTitle,
  eventDescription,
  eventLocation,
  eventTime,
  enrolledCount
}: VolunteerModalProps) {
  const { profile } = useAuth();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    otp: ''
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

      const newTicketId = Math.random().toString(36).substring(2, 12).toUpperCase();
      await onRegister(formData.name, formData.email, newTicketId);
      
      // Send confirmation email with QR code
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
    const text = encodeURIComponent(`Volunteer: ${eventTitle}`);
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

  const inputClass = "w-full px-4 py-3.5 border-4 border-black bg-transparent text-sm font-body outline-none transition-all focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] placeholder:text-on-surface-variant/50";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      
      <div
        className="relative w-full max-w-md overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        style={{ background: 'var(--color-surface-container-lowest-base)' }}
      >
        {/* Header bar */}
        <div
          className="px-6 py-4 border-b-4 border-black flex items-center justify-between"
          style={{ background: 'var(--color-primary-container-base)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center border-2 border-black" style={{ background: 'var(--color-surface-container-lowest-base)' }}>
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                {step === 'form' ? 'volunteer_activism' : 'verified'}
              </span>
            </div>
            <h2 className="font-headline font-black text-lg uppercase tracking-tight" style={{ color: 'var(--color-on-primary-container-base)' }}>
              {step === 'form' ? 'Be a Hero' : "You're All Set!"}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border-2 border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-150"
            style={{ background: 'var(--color-error-container-base)' }}
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <div className="p-6 md:p-8">
          {step === 'form' ? (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-[10px] font-label font-bold uppercase tracking-[0.14em] text-on-surface mb-2" htmlFor="vol-name">
                  Full Name
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">person</span>
                  <input
                    id="vol-name"
                    type="text"
                    required
                    className={`${inputClass} pl-10`}
                    style={{ background: 'var(--color-surface-container-base)' }}
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-label font-bold uppercase tracking-[0.14em] text-on-surface mb-2" htmlFor="vol-email">
                  Email Address
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">mail</span>
                    <input
                      id="vol-email"
                      type="email"
                      required
                      className={`${inputClass} pl-10`}
                      style={{ background: 'var(--color-surface-container-base)' }}
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || !formData.email}
                    className="px-4 font-label font-black text-xs uppercase tracking-wider border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150 disabled:opacity-50 whitespace-nowrap"
                    style={{ background: 'var(--color-secondary-container-base)', color: 'var(--color-on-secondary-container-base)' }}
                  >
                    {sendingOtp ? '...' : 'Verify'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-label font-bold uppercase tracking-[0.14em] text-on-surface mb-2" htmlFor="vol-otp">
                  Verification Code
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">lock</span>
                  <input
                    id="vol-otp"
                    type="text"
                    required
                    maxLength={6}
                    className={`${inputClass} pl-10 font-mono tracking-[0.5em] text-center text-lg`}
                    style={{ background: 'var(--color-surface-container-base)' }}
                    placeholder="000000"
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                  />
                </div>
                {otpSent && (
                  <p className="text-[10px] font-label font-bold uppercase tracking-wider mt-2 px-3 py-1.5 border-2 border-black inline-block" style={{ background: 'var(--color-secondary-container-base)', color: 'var(--color-on-secondary-container-base)' }}>
                    ✓ Code sent! Check inbox.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !otpSent}
                className="w-full py-4 font-label font-black text-sm uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                style={{ background: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-black/30 border-t-black animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
                    Confirm Registration →
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center">
              {/* Success icon */}
              <div className="mb-6 inline-flex items-center justify-center w-16 h-16 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{ background: 'var(--color-secondary-container-base)' }}>
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              </div>
              
              <h3 className="font-headline font-black text-xl uppercase tracking-tight text-on-surface mb-2">Registration Confirmed</h3>
              <p className="text-on-surface-variant text-sm mb-6">
                Thank you for joining<br />
                <span className="font-headline font-black text-base uppercase text-on-surface">{eventTitle}</span>
              </p>

              {/* Ticket Card */}
              <div className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 mb-6 text-left" style={{ background: 'var(--color-surface-container-base)' }}>
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <span className="block text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-1">Queue Pos</span>
                    <span className="text-xl font-headline font-black text-on-surface">#{enrolledCount + 1}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-1">Time</span>
                    <span className="text-sm font-bold text-on-surface leading-tight block">{eventTime}</span>
                  </div>
                </div>

                <div className="flex justify-center mb-4">
                  <div className="bg-white p-4 border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] inline-block hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150 cursor-pointer">
                    <img src={qrUrl} alt="Ticket QR Code" className="w-32 h-32" />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <code className="px-4 py-2 text-sm font-mono font-black tracking-widest border-2 border-black" style={{ background: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' }}>
                    {ticketId}
                  </code>
                  <button 
                    onClick={copyTicketId}
                    className="p-2 border-2 border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-150"
                    style={{ background: 'var(--color-secondary-container-base)' }}
                    title="Copy ID"
                  >
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <a 
                  href={qrUrl} 
                  download={`volunteer-ticket-${ticketId}.png`}
                  className="flex items-center justify-center gap-2 w-full py-3.5 font-label font-black text-sm uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150"
                  style={{ background: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' }}
                >
                  <span className="material-symbols-outlined text-lg">download</span>
                  Save Digital Ticket
                </a>

                <a 
                  href={calendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 font-label font-bold text-sm uppercase tracking-wider border-4 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150 text-on-surface"
                  style={{ background: 'var(--color-surface-container-base)' }}
                >
                  <span className="material-symbols-outlined text-lg">calendar_add_on</span>
                  Sync to Calendar
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
