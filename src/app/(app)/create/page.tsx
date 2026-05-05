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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import StepSpark from './_components/StepSpark';
import StepSchedule from './_components/StepSchedule';
import StepMedia from './_components/StepMedia';
import StepReview from './_components/StepReview';

const TOTAL_STEPS = 4;

const STEPS = [
  { icon: Zap,            label: 'The Spark',   subtitle: 'Name, category, and urgency.' },
  { icon: MapPin,         label: 'When & Where', subtitle: 'Date, time, and venue.' },
  { icon: FileImage,      label: 'Content',      subtitle: 'Description, image, and needs.' },
  { icon: ClipboardCheck, label: 'Review',       subtitle: 'Final check before publishing.' },
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
    <div className="flex" style={{ minHeight: 'calc(100dvh - 64px)', color: 'var(--cp-text-1)' }}>

      {/* ── Sidebar ── */}
      <aside
        className="hidden md:flex flex-col w-64 shrink-0 sticky"
        style={{
          top: 64,
          height: 'calc(100dvh - 64px)',
          background: 'var(--cp-surface)',
          borderRight: '1px solid var(--cp-border)',
        }}
      >
        {/* Brand */}
        <div className="px-7 py-6" style={{ borderBottom: '1px solid var(--cp-border)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--cp-primary)' }}>Organizer</p>
          <p className="font-headline font-bold text-lg">Create Event</p>
        </div>

        {/* Step list */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          {STEPS.map((s, idx) => {
            const n = idx + 1;
            const isActive = n === step;
            const isDone   = n < step;
            const Icon = s.icon;
            return (
              <button
                key={n}
                type="button"
                onClick={() => isDone && goToStep(n)}
                disabled={!isDone}
                className="w-full flex items-center gap-3 px-3 py-3.5 text-left transition-all relative"
                style={{
                  background: isActive ? 'var(--cp-surface-dim)' : 'transparent',
                  borderLeft: isActive ? '2px solid var(--cp-primary)' : '2px solid transparent',
                  cursor: isDone ? 'pointer' : 'default',
                }}
              >
                <div
                  className="w-6 h-6 flex items-center justify-center shrink-0 text-[11px] font-bold"
                  style={{
                    borderRadius: '4px',
                    background: isDone || isActive ? 'var(--cp-primary)' : 'transparent',
                    color: isDone || isActive ? 'white' : 'var(--cp-text-3)',
                    border: isDone || isActive ? 'none' : '1.5px solid var(--cp-border)',
                  }}
                >
                  {isDone ? <Check size={11} strokeWidth={3} /> : <Icon size={11} />}
                </div>
                <div>
                  <p className="text-xs font-semibold leading-tight"
                    style={{ color: isActive ? 'var(--cp-text-1)' : isDone ? 'var(--cp-text-2)' : 'var(--cp-text-3)' }}>
                    {s.label}
                  </p>
                  {isActive && (
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--cp-text-3)' }}>{s.subtitle}</p>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Live preview */}
        {title && (
          <div className="px-7 py-5" style={{ borderTop: '1px solid var(--cp-border)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--cp-text-3)' }}>Preview</p>
            <p className="text-sm font-bold leading-snug truncate">{title}</p>
            {cleanCategory && <p className="text-[11px] mt-1" style={{ color: 'var(--cp-text-3)' }}>{cleanCategory}</p>}
            {eventDate && (
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--cp-text-3)' }}>
                {new Date(eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            )}
            {locationName && <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--cp-text-3)' }}>{locationName}</p>}
          </div>
        )}
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Scrollable content */}
        <div className="flex-1 px-8 md:px-14 pt-6 pb-16 w-full">

          {/* Step header — full bleed */}
          <div className="mb-10 max-w-2xl">
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

          {/* Step body — constrained for readability */}
          <div className="max-w-2xl">
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

        {/* ── Sticky bottom bar ── */}
        <div
          className="sticky bottom-0 px-8 md:px-14 py-4 flex items-center justify-between gap-4"
          style={{ background: 'var(--cp-surface)', borderTop: '1px solid var(--cp-border)' }}
        >
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

      <PromotionModal isOpen={promotionModalOpen} onClose={() => setPromotionModalOpen(false)} />
    </div>
  );
}
