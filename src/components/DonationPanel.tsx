'use client';

import { EventNeeds } from '@/types';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateDonation, addEventRSVP, getUserPledge } from '@/services/eventService';
import { toast } from 'sonner';
import { RSVPModal } from './RSVPModal';
import { GoodsPledgeModal } from './GoodsPledgeModal';
import { Heart, HandHelping, Package, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface DonationPanelProps {
  eventId: string;
  eventTitle: string;
  eventDescription: string;
  eventLocation: string;
  eventTime: string;
  enrolledCount: number;
  needs: EventNeeds;
  onActionComplete?: () => void;
}

export function DonationPanel({ 
  eventId, 
  eventTitle, 
  eventDescription,
  eventLocation,
  eventTime,
  enrolledCount,
  needs, 
  onActionComplete 
}: DonationPanelProps) {
  const { user, profile } = useAuth();
  const [pledged, setPledged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRSVPModalOpen, setIsRSVPModalOpen] = useState(false);
  const [isGoodsPledgeModalOpen, setIsGoodsPledgeModalOpen] = useState(false);
  const [goodsPledged, setGoodsPledged] = useState(false);
  const [donationAmount, setDonationAmount] = useState(50);
  const [activeTab, setActiveTab] = useState<'funds' | 'attendees' | 'goods'>(
    needs.funds ? 'funds' : needs.attendees ? 'attendees' : 'goods'
  );

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Check if the user already pledged goods for this event
  useEffect(() => {
    if (!user) return;
    getUserPledge(eventId, user.uid).then((pledge) => {
      if (pledge) setGoodsPledged(true);
    });
  }, [user, eventId]);

  const handleDonate = async () => {
    if (!user) { toast.info('Please sign in to donate'); return; }
    if (loading) return;
    setLoading(true);
    
    try {
      const response = await fetch('/api/create-payment-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: donationAmount, 
          eventId,
          eventTitle 
        }),
      });
      
      const order = await response.json();
      
      if (!order.id) {
        throw new Error('Failed to create payment order');
      }
      
      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        name: 'Community Event',
        description: `Donation for ${eventTitle}`,
        prefill: {
          name: profile?.displayName || user.displayName || '',
          email: user.email || '',
        },
        handler: async (paymentResponse: any) => {
          try {
            await updateDonation(eventId, donationAmount);
            setPledged(true);
            toast.success(`Thank you for your ₹${donationAmount} donation!`);
            onActionComplete?.();
          } catch (err) {
            console.error('Error updating donation:', err);
            toast.error('Payment successful but failed to update. Contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.info('Payment cancelled');
          },
        },
      });
      
      razorpay.open();
    } catch (err) {
      console.error(err);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRSVPClick = () => {
    if (!user || !profile) { 
      toast.info('Please sign in to RSVP'); 
      return; 
    }
    setIsRSVPModalOpen(true);
  };

  const handleRSVPRegister = async (name: string, email: string, ticketId: string, status: 'interested' | 'going') => {
    if (!user) return;
    await addEventRSVP(eventId, user.uid, name, email, ticketId, status);
    setPledged(true);
    onActionComplete?.();
  };

  const TABS = [
    { key: 'funds' as const, label: '💰 Funds', icon: Heart, show: !!needs.funds, color: 'var(--cp-primary)' },
    { key: 'attendees' as const, label: '🙋 RSVP', icon: HandHelping, show: !!needs.attendees, color: 'var(--cp-secondary)' },
    { key: 'goods' as const, label: '📦 Goods', icon: Package, show: !!needs.goods, color: 'var(--cp-orange)' },
  ].filter(t => t.show);

  return (
    <>
      <div
        className="sticky top-24 overflow-hidden"
        style={{
          background: 'var(--cp-surface)',
          border: '1px solid var(--cp-border)',
          borderRadius: 'var(--r-2xl)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center gap-3"
          style={{ borderBottom: '1px solid var(--cp-border)' }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--cp-accent), var(--cp-pink))' }}
          >
            <Heart size={16} className="text-white fill-current" />
          </div>
          <h3 className="font-headline font-bold text-base" style={{ color: 'var(--cp-text-1)' }}>
            How You Can Help
          </h3>
        </div>

        {/* Tabs */}
        <div className="flex px-2 pt-2 gap-1" style={{ borderBottom: '1px solid var(--cp-border)' }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 py-2.5 text-xs font-bold rounded-t-xl transition-all relative"
              style={{
                background: activeTab === tab.key ? 'var(--cp-surface-dim)' : 'transparent',
                color: activeTab === tab.key ? tab.color : 'var(--cp-text-3)',
                borderBottom: activeTab === tab.key ? `2px solid ${tab.color}` : '2px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'funds' && needs.funds && (
            <div>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--cp-text-2)' }}>
                Your donation goes directly to the organizer to fulfill the goals of this event.
              </p>
              
              {/* Donation Amount Slider */}
              <div className="mb-6">
                <label className="text-xs font-semibold block mb-3" style={{ color: 'var(--cp-text-2)' }}>
                  Choose Amount
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="50"
                    max="2000"
                    step="50"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(Number(e.target.value))}
                    className="flex-1 h-2 appearance-none cursor-pointer rounded-full"
                    style={{ accentColor: 'var(--cp-primary)', background: 'var(--cp-surface-dim)' }}
                  />
                  <span
                    className="text-lg font-headline font-bold min-w-[80px] text-center px-3 py-1.5 rounded-xl"
                    style={{
                      background: 'hsl(from var(--cp-primary) h s l / 0.1)',
                      color: 'var(--cp-primary)',
                      border: '1px solid hsl(from var(--cp-primary) h s l / 0.2)',
                    }}
                  >
                    ₹{donationAmount}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mt-2" style={{ color: 'var(--cp-text-3)' }}>
                  <span>₹50</span>
                  <span>₹2000</span>
                </div>
              </div>

              {!pledged ? (
                <button 
                  onClick={handleDonate}
                  disabled={loading || !user}
                  className="btn-primary w-full justify-center py-4 text-sm disabled:opacity-50"
                >
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" /> Processing...</>
                  ) : (
                    user ? `Donate ₹${donationAmount} Now →` : 'Sign in to Donate'
                  )}
                </button>
              ) : (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold"
                  style={{
                    background: 'hsl(from var(--cp-secondary) h s l / 0.1)',
                    color: 'var(--cp-secondary)',
                    border: '1px solid hsl(from var(--cp-secondary) h s l / 0.25)',
                  }}
                >
                  <CheckCircle2 size={16} />
                  Thank you for your donation!
                </motion.div>
              )}
            </div>
          )}

          {activeTab === 'attendees' && needs.attendees && (
            <div>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--cp-text-2)' }}>
                RSVP to secure your spot. Choose to confirm your attendance and get a ticket, or just mark yourself as interested.
              </p>
              {!pledged ? (
                <button 
                  onClick={handleRSVPClick}
                  disabled={loading || !user}
                  className="btn-primary w-full justify-center py-4 text-sm disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, var(--cp-secondary), var(--cp-lime))' }}
                >
                  {user ? '🙋 RSVP Now →' : 'Sign in to RSVP'}
                </button>
              ) : (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold"
                  style={{
                    background: 'hsl(from var(--cp-secondary) h s l / 0.1)',
                    color: 'var(--cp-secondary)',
                    border: '1px solid hsl(from var(--cp-secondary) h s l / 0.25)',
                  }}
                >
                  <CheckCircle2 size={16} />
                  Your RSVP is confirmed!
                </motion.div>
              )}
            </div>
          )}

          {activeTab === 'goods' && needs.goods && (
            <div>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--cp-text-2)' }}>
                We are looking for these specific items:
              </p>
              <ul className="space-y-2 mb-6">
                {needs.goods.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-sm font-semibold px-3 py-2 rounded-lg"
                    style={{ background: 'var(--cp-surface-dim)', color: 'var(--cp-text-1)' }}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: 'var(--cp-orange)' }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
              {!goodsPledged ? (
                <button 
                  onClick={() => {
                    if (!user) { toast.info('Please sign in to contribute'); return; }
                    setIsGoodsPledgeModalOpen(true);
                  }}
                  className="btn-secondary w-full justify-center py-4 text-sm"
                >
                  📦 I Can Bring Something
                </button>
              ) : (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold"
                  style={{
                    background: 'hsl(from var(--cp-orange) h s l / 0.1)',
                    color: 'var(--cp-orange)',
                    border: '1px solid hsl(from var(--cp-orange) h s l / 0.25)',
                  }}
                >
                  <CheckCircle2 size={16} />
                  Thank you for pledging!
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      <RSVPModal 
        isOpen={isRSVPModalOpen}
        onClose={() => setIsRSVPModalOpen(false)}
        onRegister={handleRSVPRegister}
        eventTitle={eventTitle}
        eventDescription={eventDescription}
        eventLocation={eventLocation}
        eventTime={eventTime}
        enrolledCount={enrolledCount}
      />

      <GoodsPledgeModal
        isOpen={isGoodsPledgeModalOpen}
        onClose={() => setIsGoodsPledgeModalOpen(false)}
        eventId={eventId}
        eventTitle={eventTitle}
        goodsList={needs.goods || []}
        onPledgeComplete={() => {
          setGoodsPledged(true);
          onActionComplete?.();
        }}
      />
    </>
  );
}
