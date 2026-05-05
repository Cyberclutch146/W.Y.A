'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createEvent } from '@/services/eventService';
import { toast } from 'sonner';
import PromotionModal from '@/components/PromotionModal';
import { ConfettiBurst } from '@/components/ConfettiBurst';
import {
  Rocket, ArrowLeft, ArrowRight, Loader2,
  Zap, MapPin, FileImage, ClipboardCheck,
  Check, Eye, PartyPopper,
  ZapIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import StepSpark from './_components/StepSpark';
import StepSchedule from './_components/StepSchedule';
import StepMedia from './_components/StepMedia';
import StepReview from './_components/StepReview';

const TOTAL_STEPS = 4;

const STEPS = [
  { icon: ZapIcon,            label: 'The Spark',  },
  { icon: MapPin,         label: 'When & Where', },
  { icon: FileImage,      label: 'Content', },
  { icon: ClipboardCheck, label: 'Review',  },
];

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

export default function CreateEventPage() {
  const router = useRouter();
  const { user, profile } = useAuth();

  const [step, setStep]           = useState(1);
  const [direction, setDirection] = useState(1);

  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory]       = useState('🎓 Academic');
  const [image, setImage]             = useState('');
  const [eventDate, setEventDate]     = useState('');
  const [urgency, setUrgency]         = useState<'high' | 'normal'>('normal');
  const [locationName, setLocationName] = useState('');
  const [lat, setLat]   = useState<number | undefined>();
  const [lng, setLng]   = useState<number | undefined>();

  const [needFunds, setNeedFunds] = useState(false);
  const [fundGoal, setFundGoal]   = useState(1000);
  const [needVols, setNeedVols]   = useState(false);
  const [volGoal, setVolGoal]     = useState(10);
  const [needGoods, setNeedGoods] = useState(false);
  const [goodsItem, setGoodsItem] = useState('');
  const [goodsList, setGoodsList] = useState<string[]>([]);

  const [loading, setLoading]                       = useState(false);
  const [promotionModalOpen, setPromotionModalOpen] = useState(false);
  const [publishSuccess, setPublishSuccess]         = useState(false);
  const [newEventId, setNewEventId]                 = useState('');
  const [showConfetti, setShowConfetti]             = useState(false);
  const [draftDescription, setDraftDescription]     = useState('');

  const canProceed = (s: number) => {
    if (s === 1) return title.trim().length >= 5;
    if (s === 2) return !!eventDate;
    return true;
  };

  const goToStep = (target: number) => {
    setDirection(target > step ? 1 : -1);
    setStep(target);
  };

  const handleNext = () => {
    if (!canProceed(step)) {
      if (step === 1) toast.error('Event title must be at least 5 characters.');
      if (step === 2) toast.error('Please pick a date & time.');
      return;
    }
    if (step === 1 && draftDescription && !description) setDescription(draftDescription);
    setDirection(1);
    setStep(s => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleBack = () => { setDirection(-1); setStep(s => Math.max(s - 1, 1)); };

  const handleSubmit = async () => {
    if (!user || !profile || loading) return;
    setLoading(true);
    try {
      const id = await createEvent({
        title, description,
        organizer: profile.displayName || 'Anonymous',
        organizerId: user.uid,
        location: locationName || profile.location || 'Unknown Location',
        lat, lng, distance: 'Local', category, urgency,
        imageUrl: image, eventDate,
        needs: {
          ...(needFunds ? { funds: { goal: fundGoal, current: 0 } } : {}),
          ...(needVols  ? { volunteers: { goal: volGoal, current: 0 } } : {}),
          ...(needGoods && goodsList.length > 0 ? { goods: goodsList } : {}),
        },
      });
      setNewEventId(id);
      setPublishSuccess(true);
      setShowConfetti(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to create event.');
      setLoading(false);
    }
  };

  const resetWizard = () => {
    setPublishSuccess(false); setStep(1); setDirection(1);
    setTitle(''); setDescription(''); setImage(''); setEventDate('');
    setLocationName(''); setLat(undefined); setLng(undefined);
    setNeedFunds(false); setNeedVols(false); setNeedGoods(false);
    setGoodsList([]); setDraftDescription(''); setLoading(false);
  };

  // ── Success ──────────────────────────────────────────────────
  if (publishSuccess) {
    return (
      <main className="flex-1 flex items-center justify-center p-8 min-h-[80vh]">
        <ConfettiBurst trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'var(--cp-primary)', borderRadius: '6px' }}>
            <PartyPopper size={28} className="text-white" />
          </div>
          <h1 className="font-headline font-bold text-4xl tracking-tight mb-3">Event Published</h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--cp-text-2)' }}>
            <span className="font-bold" style={{ color: 'var(--cp-text-1)' }}>{title}</span> is now live on the campus feed.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push(`/event/${newEventId}`)}
              className="btn-primary px-6 py-3 text-sm flex items-center gap-2">
              <Eye size={15} /> View Event
            </button>
            <button onClick={resetWizard} className="btn-secondary px-6 py-3 text-sm flex items-center gap-2">
              <Rocket size={15} /> Create Another
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  const cur = STEPS[step - 1];
  const cleanCategory = category.replace(/^\S+\s/, '');

  // ── Wizard ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100dvh - 64px)', color: 'var(--cp-text-1)', background: 'var(--cp-background)' }}>

      {/* ── Top Navigation (Desktop) ── */}
      <div className="hidden md:flex justify-center px-8 py-5 sticky md:top-[4.5rem] z-30"
        style={{ background: 'var(--cp-background)' }}
      >
        <div className="w-full max-w-6xl flex items-center justify-center">
        {/* Steps */}
        <div className="flex items-center">
          {STEPS.map((s, idx) => {
            const n = idx + 1;
            const isActive = n === step;
            const isDone   = n < step;
            const Icon = s.icon;
            return (
              <div key={n} className="flex items-center">
                <button
                  type="button"
                  onClick={() => isDone && goToStep(n)}
                  disabled={!isDone}
                  className="flex items-center gap-2 transition-all text-left group"
                  style={{ cursor: isDone ? 'pointer' : 'default' }}
                >
                  <div
                    className="w-10 h-10 flex items-center justify-center shrink-0 text-sm font-bold transition-all shadow-sm group-hover:scale-105"
                    style={{
                      borderRadius: '10px',
                      background: isDone || isActive ? 'var(--cp-primary)' : 'var(--cp-surface-dim)',
                      color: isDone || isActive ? 'white' : 'var(--cp-text-3)',
                      border: isDone || isActive ? '1px solid var(--cp-primary)' : '1px solid var(--cp-border)',
                    }}
                  >
                    {isDone ? <Check size={16} strokeWidth={3} /> : <Icon size={16} />}
                  </div>
                  <div className="hidden lg:block w-28">
                    <p className="text-sm font-semibold leading-tight mb-0.5 transition-colors group-hover:text-foreground"
                      style={{ color: isActive ? 'var(--cp-text-1)' : isDone ? 'var(--cp-text-2)' : 'var(--cp-text-3)' }}>
                      {s.label}
                    </p>
                    <p className="text-[10px] leading-tight line-clamp-1" style={{ color: 'var(--cp-text-3)' }}>
                      {s.subtitle}
                    </p>
                  </div>
                </button>
                {/* Connector line */}
                {n < TOTAL_STEPS && (
                  <div className="w-4 lg:w-8 h-[2px] mx-2 lg:mx-3 rounded-full transition-all" 
                    style={{ background: isDone ? 'var(--cp-primary)' : 'var(--cp-border)', opacity: isDone ? 1 : 0.3 }} 
                  />
                )}
              </div>
            );
          })}
        </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Mobile top nav (hidden on md+) ── */}
        <div
          className="md:hidden sticky top-0 z-20"
          style={{ background: 'var(--cp-background)' }}
        >
          {/* Row 1: label + counter */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3">
            <div>
              <p
                className="text-[9px] font-bold uppercase tracking-widest mb-0.5"
                style={{ color: 'var(--cp-primary)' }}
              >
                Step {step} of {TOTAL_STEPS}
              </p>
              <p className="text-base font-headline font-bold leading-none" style={{ letterSpacing: '-0.02em' }}>
                {cur.label}
              </p>
            </div>

            {/* Back button — only show after step 1 */}
            {step > 1 && (
              <button
                type="button"
                onClick={() => goToStep(step - 1)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 transition-all active:scale-95"
                style={{
                  color: 'var(--cp-text-2)',
                  border: '1px solid var(--cp-border)',
                  borderRadius: '4px',
                  background: 'var(--cp-surface-dim)',
                }}
              >
                ← Back
              </button>
            )}
          </div>

          {/* Row 2: segmented progress track */}
          <div className="flex gap-1.5 px-5 pb-4">
            {STEPS.map((_, idx) => {
              const n = idx + 1;
              const isDone   = n < step;
              const isActive = n === step;
              return (
                <motion.div
                  key={n}
                  className="flex-1 cursor-pointer"
                  onClick={() => isDone && goToStep(n)}
                  style={{ height: 4, borderRadius: 0 }}
                  animate={{
                    background: isDone || isActive
                      ? 'var(--cp-primary)'
                      : 'var(--cp-border)',
                    opacity: isActive ? 1 : isDone ? 0.7 : 0.35,
                  }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
              );
            })}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 flex flex-col items-center w-full">
          <div className="w-full max-w-4xl px-5 md:px-8 pt-6 pb-16">

          {/* Step header — desktop only (mobile uses sticky top bar) */}
          <div className="hidden md:block mb-10">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3"
              style={{ color: 'var(--cp-primary)' }}>
              Step {step} of {TOTAL_STEPS}
            </p>
            <h1 className="font-headline font-bold text-5xl md:text-6xl tracking-tight leading-none mb-3"
              style={{ letterSpacing: '-0.03em' }}>
              {cur.label}
            </h1>
            <p className="text-base" style={{ color: 'var(--cp-text-2)' }}>{cur.subtitle}</p>
          </div>

          {/* Step body */}
          <div className="w-full">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {step === 1 && (
                <StepSpark
                  title={title} setTitle={setTitle}
                  category={category} setCategory={setCategory}
                  urgency={urgency} setUrgency={setUrgency}
                  setDraftDescription={setDraftDescription}
                />
              )}
              {step === 2 && (
                <StepSchedule
                  eventDate={eventDate} setEventDate={setEventDate}
                  locationName={locationName} setLocationName={setLocationName}
                  setLat={setLat} setLng={setLng}
                />
              )}
              {step === 3 && (
                <StepMedia
                  title={title} category={category}
                  description={description} setDescription={setDescription}
                  image={image} setImage={setImage}
                  needFunds={needFunds} setNeedFunds={setNeedFunds}
                  fundGoal={fundGoal} setFundGoal={setFundGoal}
                  needVols={needVols} setNeedVols={setNeedVols}
                  volGoal={volGoal} setVolGoal={setVolGoal}
                  needGoods={needGoods} setNeedGoods={setNeedGoods}
                  goodsItem={goodsItem} setGoodsItem={setGoodsItem}
                  goodsList={goodsList} setGoodsList={setGoodsList}
                />
              )}
              {step === 4 && (
                <StepReview
                  title={title} description={description}
                  category={category} urgency={urgency}
                  eventDate={eventDate} locationName={locationName}
                  image={image}
                  needFunds={needFunds} fundGoal={fundGoal}
                  needVols={needVols} volGoal={volGoal}
                  needGoods={needGoods} goodsList={goodsList}
                  goToStep={goToStep}
                />
              )}
            </motion.div>
          </AnimatePresence>
          </div>
          </div>
        </div>

        {/* ── Sticky bottom bar ── */}
        <div
          className="sticky bottom-0 flex justify-center w-full"
          style={{ background: 'var(--cp-background)' }}
        >
          <div className="w-full max-w-4xl px-5 md:px-8 py-4 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center gap-2 px-5 h-10 text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              borderRadius: '6px',
              background: 'var(--cp-surface-dim)',
              color: 'var(--cp-text-2)',
              border: '1px solid var(--cp-border)',
            }}
          >
            <ArrowLeft size={14} /> Back
          </button>

          <div className="flex items-center gap-3">
            {step === 4 && (
              <button
                type="button"
                onClick={() => setPromotionModalOpen(true)}
                className="h-10 px-5 text-sm font-semibold flex items-center gap-2 transition-all hover:opacity-80"
                style={{
                  borderRadius: '6px',
                  background: 'hsl(from var(--cp-primary) h s l / 0.08)',
                  color: 'var(--cp-primary)',
                  border: '1px solid hsl(from var(--cp-primary) h s l / 0.2)',
                }}
              >
                Promote
              </button>
            )}

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed(step)}
                className="flex items-center gap-2 px-7 h-10 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  borderRadius: '6px',
                  background: 'var(--cp-primary)',
                }}
              >
                Continue <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !user}
                className="flex items-center gap-2 px-7 h-10 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
                style={{ borderRadius: '6px', background: 'var(--cp-primary)' }}
              >
                {loading
                  ? <><Loader2 size={14} className="animate-spin" /> Publishing...</>
                  : <><Rocket size={14} /> Publish Event</>
                }
              </button>
            )}
          </div>
          </div>
        </div>
      </div>

      <PromotionModal isOpen={promotionModalOpen} onClose={() => setPromotionModalOpen(false)} />
    </div>
  );
}
