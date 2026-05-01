'use client';

import { EventNeeds } from '@/types';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateDonation, addVolunteerSignup, getUserPledge } from '@/services/eventService';
import { toast } from 'sonner';
import { VolunteerModal } from './VolunteerModal';
import { GoodsPledgeModal } from './GoodsPledgeModal';

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
  const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);
  const [isGoodsPledgeModalOpen, setIsGoodsPledgeModalOpen] = useState(false);
  const [goodsPledged, setGoodsPledged] = useState(false);
  const [donationAmount, setDonationAmount] = useState(50);
  const [activeTab, setActiveTab] = useState<'funds' | 'volunteers' | 'goods'>(
    needs.funds ? 'funds' : needs.volunteers ? 'volunteers' : 'goods'
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

  const handleVolunteerClick = () => {
    if (!user || !profile) { 
      toast.info('Please sign in to volunteer'); 
      return; 
    }
    setIsVolunteerModalOpen(true);
  };

  const handleVolunteerRegister = async (name: string, email: string, ticketId: string) => {
    if (!user) return;
    await addVolunteerSignup(eventId, user.uid, name, email, ticketId);
    setPledged(true);
    onActionComplete?.();
  };

  const tabStyle = (isActive: boolean, accentVar: string) => ({
    background: isActive ? `var(${accentVar})` : 'transparent',
    color: isActive ? 'var(--color-on-primary-container-base)' : undefined,
  });

  return (
    <>
      <div
        className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sticky top-24 overflow-hidden"
        style={{ background: 'var(--color-surface-container-lowest-base)' }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b-4 border-black" style={{ background: 'var(--color-tertiary-container-base)' }}>
          <h3 className="font-headline font-black text-lg uppercase tracking-tight flex items-center gap-2" style={{ color: 'var(--color-on-tertiary-container-base)' }}>
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            How You Can Help
          </h3>
        </div>

        {/* Tabs */}
        <div className="flex border-b-4 border-black">
          {needs.funds && (
            <button 
              onClick={() => setActiveTab('funds')}
              className={`flex-1 py-3 text-[11px] font-label font-black uppercase tracking-wider border-r-2 border-black/30 transition-all duration-150 ${activeTab === 'funds' ? '' : 'hover:bg-surface-container'}`}
              style={tabStyle(activeTab === 'funds', '--color-primary-container-base')}
            >
              💰 Funds
            </button>
          )}
          {needs.volunteers && (
            <button 
              onClick={() => setActiveTab('volunteers')}
              className={`flex-1 py-3 text-[11px] font-label font-black uppercase tracking-wider border-r-2 border-black/30 transition-all duration-150 ${activeTab === 'volunteers' ? '' : 'hover:bg-surface-container'}`}
              style={tabStyle(activeTab === 'volunteers', '--color-secondary-container-base')}
            >
              🙋 Volunteer
            </button>
          )}
          {needs.goods && (
            <button 
              onClick={() => setActiveTab('goods')}
              className={`flex-1 py-3 text-[11px] font-label font-black uppercase tracking-wider transition-all duration-150 ${activeTab === 'goods' ? '' : 'hover:bg-surface-container'}`}
              style={tabStyle(activeTab === 'goods', '--color-tertiary-container-base')}
            >
              📦 Goods
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'funds' && needs.funds && (
            <div>
              <p className="text-on-surface-variant text-sm mb-6 text-left">
                Your donation goes directly to the organizer to fulfill the goals of this event.
              </p>
              
              {/* Donation Amount Slider */}
              <div className="mb-6">
                <label className="text-[10px] font-label font-bold uppercase tracking-[0.14em] text-on-surface block mb-3">
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
                    className="flex-1 h-2 bg-surface-variant appearance-none cursor-pointer accent-black"
                    style={{ accentColor: 'var(--color-on-surface-base)' }}
                  />
                  <span
                    className="text-lg font-headline font-black min-w-[80px] text-center px-3 py-1.5 border-4 border-black"
                    style={{ background: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' }}
                  >
                    ₹{donationAmount}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] font-label font-bold uppercase tracking-wider text-on-surface-variant mt-2">
                  <span>₹50</span>
                  <span>₹2000</span>
                </div>
              </div>

              {!pledged ? (
                <button 
                  onClick={handleDonate}
                  disabled={loading || !user}
                  className="w-full py-4 font-label font-black text-sm uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
                  style={{ background: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' }}
                >
                  {loading ? 'Processing...' : user ? `Donate ₹${donationAmount} Now →` : 'Sign in to Donate'}
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 py-4 font-label font-black text-sm uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{ background: 'var(--color-secondary-container-base)', color: 'var(--color-on-secondary-container-base)' }}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Thank you for your donation!
                </div>
              )}
            </div>
          )}

          {activeTab === 'volunteers' && needs.volunteers && (
            <div>
              <p className="text-on-surface-variant text-sm mb-6">
                Sign up for a shift. The organizer will contact you with details and waivers if necessary.
              </p>
              {!pledged ? (
                <button 
                  onClick={handleVolunteerClick}
                  disabled={loading || !user}
                  className="w-full py-4 font-label font-black text-sm uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
                  style={{ background: 'var(--color-secondary-container-base)', color: 'var(--color-on-secondary-container-base)' }}
                >
                  {user ? '🙋 Sign Up to Volunteer →' : 'Sign in to Volunteer'}
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 py-4 font-label font-black text-sm uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{ background: 'var(--color-secondary-container-base)', color: 'var(--color-on-secondary-container-base)' }}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>how_to_reg</span>
                  You are signed up!
                </div>
              )}
            </div>
          )}

          {activeTab === 'goods' && needs.goods && (
            <div>
              <p className="text-on-surface-variant text-sm mb-4">
                We are looking for these specific items:
              </p>
              <ul className="space-y-2 mb-6">
                {needs.goods.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm font-body font-bold text-on-surface">
                    <span className="w-2 h-2 bg-black inline-block flex-shrink-0" />
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
                  className="w-full py-4 font-label font-black text-sm uppercase tracking-wider border-4 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150 active:scale-[0.98] text-on-surface"
                  style={{ background: 'var(--color-surface-container-base)' }}
                >
                  📦 I Can Bring Something
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 py-4 font-label font-black text-sm uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{ background: 'var(--color-tertiary-container-base)', color: 'var(--color-on-tertiary-container-base)' }}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Thank you for pledging!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <VolunteerModal 
        isOpen={isVolunteerModalOpen}
        onClose={() => setIsVolunteerModalOpen(false)}
        onRegister={handleVolunteerRegister}
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
