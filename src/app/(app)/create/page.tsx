'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createEvent } from '@/services/eventService';
import { toast } from 'sonner';
import PromotionModal from '@/components/PromotionModal';
import { ConfettiBurst } from '@/components/ConfettiBurst';
import { Rocket, ArrowLeft, ArrowRight, Loader2, Megaphone, PartyPopper, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import WizardProgress from './_components/WizardProgress';
import StepSpark from './_components/StepSpark';
import StepSchedule from './_components/StepSchedule';
import StepMedia from './_components/StepMedia';
import StepReview from './_components/StepReview';

const TOTAL_STEPS = 4;

export default function CreateEventPage() {
  const router = useRouter();
  const { user, profile } = useAuth();

  // Step management
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

  // Form state (lifted — stays here)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('🎓 Academic');
  const [distance] = useState('Local');
  const [image, setImage] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [urgency, setUrgency] = useState<'high' | 'normal'>('normal');

  const [needFunds, setNeedFunds] = useState(false);
  const [fundGoal, setFundGoal] = useState(1000);
  const [needVols, setNeedVols] = useState(false);
  const [volGoal, setVolGoal] = useState(10);
  const [needGoods, setNeedGoods] = useState(false);
  const [goodsItem, setGoodsItem] = useState('');
  const [goodsList, setGoodsList] = useState<string[]>([]);

  const [locationName, setLocationName] = useState('');
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);

  const [loading, setLoading] = useState(false);
  const [promotionModalOpen, setPromotionModalOpen] = useState(false);

  // Success state
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [newEventId, setNewEventId] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  // AI draft description (from StepSpark)
  const [draftDescription, setDraftDescription] = useState('');

  // Validation
  const canProceed = (s: number) => {
    if (s === 1) return title.trim().length >= 5;
    if (s === 2) return !!eventDate;
    if (s === 3) return true;
    return true;
  };

  const goToStep = (target: number) => {
    setDirection(target > step ? 1 : -1);
    setStep(target);
  };

  const handleNext = () => {
    if (!canProceed(step)) {
      if (step === 1) toast.error('Event title must be at least 5 characters.');
      if (step === 2) toast.error('Please select a date & time.');
      return;
    }
    // Auto-fill description from AI draft when entering Step 3
    if (step === 1 && draftDescription && !description) {
      setDescription(draftDescription);
    }
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    if (!user || !profile || loading) return;
    setLoading(true);
    try {
      const id = await createEvent({
        title, description,
        organizer: profile.displayName || 'Anonymous',
        organizerId: user.uid,
        location: locationName || profile.location || 'Unknown Location',
        lat, lng, distance, category, urgency,
        imageUrl: image, eventDate,
        needs: {
          ...(needFunds ? { funds: { goal: fundGoal, current: 0 } } : {}),
          ...(needVols ? { volunteers: { goal: volGoal, current: 0 } } : {}),
          ...(needGoods && goodsList.length > 0 ? { goods: goodsList } : {}),
        },
      });
      setNewEventId(id);
      setPublishSuccess(true);
      setShowConfetti(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to create event. Please try again.');
      setLoading(false);
    }
  };

  // Step transition variants
  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  // ── Success Screen ──
  if (publishSuccess) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-6 pb-28 md:pb-10 min-h-[80vh]" style={{ color: 'var(--cp-text-1)' }}>
        <ConfettiBurst trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
        <motion.div
          className="text-center max-w-md mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--cp-primary), hsl(290,90%,60%))', boxShadow: '0 12px 32px -8px hsl(from var(--cp-primary) h s l / 0.5)' }}>
            <PartyPopper size={36} className="text-white" />
          </div>
          <h1 className="font-headline font-bold text-3xl md:text-4xl mb-3">Your Event is Live! 🎉</h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--cp-text-2)' }}>
            <span className="font-bold" style={{ color: 'var(--cp-primary)' }}>{title}</span> has been published to the campus feed. Students can now discover and join your event!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push(`/event/${newEventId}`)}
              className="btn-primary px-8 py-3.5 text-sm"
            >
              <Eye size={16} /> View Event
            </button>
            <button
              onClick={() => {
                setPublishSuccess(false);
                setStep(1);
                setTitle('');
                setDescription('');
                setImage('');
                setEventDate('');
                setLocationName('');
                setLat(undefined);
                setLng(undefined);
                setNeedFunds(false);
                setNeedVols(false);
                setNeedGoods(false);
                setGoodsList([]);
                setDraftDescription('');
                setLoading(false);
              }}
              className="btn-secondary px-8 py-3.5 text-sm"
            >
              <Rocket size={16} /> Create Another
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  // ── Wizard ──
  return (
    <main className="flex-1 p-4 md:p-10 max-w-3xl mx-auto w-full pb-32 md:pb-10" style={{ color: 'var(--cp-text-1)' }}>
      {/* Header */}
      <motion.div className="mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4" style={{ background: 'hsl(from var(--cp-secondary) h s l / 0.12)', color: 'var(--cp-secondary)', border: '1px solid hsl(from var(--cp-secondary) h s l / 0.3)' }}>
          <Rocket size={12} /> Organizer
        </div>
        <h1 className="font-headline font-bold text-4xl md:text-5xl tracking-tight leading-none mb-2" style={{ color: 'var(--cp-text-1)' }}>
          Create an <span className="energy-gradient-text">Event</span>
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--cp-text-2)' }}>Rally your community around real change.</p>
      </motion.div>

      {/* Progress */}
      <WizardProgress currentStep={step} totalSteps={TOTAL_STEPS} />

      {/* Step Content */}
      <motion.div
        className="rounded-3xl p-6 md:p-10"
        style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', boxShadow: '0 8px 32px -8px rgba(0,0,0,0.08)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
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
      </motion.div>

      {/* Bottom Nav */}
      <div className="flex items-center justify-between mt-6 gap-3">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 1}
          className="h-12 px-6 rounded-2xl text-sm font-bold transition-all hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
          style={{ background: 'var(--cp-surface)', color: 'var(--cp-text-2)', border: '1px solid var(--cp-border)' }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex items-center gap-3">
          {step === 4 && (
            <button
              type="button"
              onClick={() => setPromotionModalOpen(true)}
              className="h-12 px-6 rounded-2xl text-sm font-bold transition-all hover:opacity-80 flex items-center gap-2"
              style={{ background: 'var(--cp-surface)', color: 'var(--cp-primary)', border: '1px solid var(--cp-border)' }}
            >
              <Megaphone size={16} /> Promote
            </button>
          )}

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed(step)}
              className="h-12 px-8 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, var(--cp-primary), hsl(290,90%,60%))', boxShadow: '0 8px 24px -6px hsl(from var(--cp-primary) h s l / 0.4)' }}
            >
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !user}
              className="h-12 px-8 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, var(--cp-primary), hsl(290,90%,60%))', boxShadow: '0 8px 24px -6px hsl(from var(--cp-primary) h s l / 0.4)' }}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Publishing...</> : <><Rocket size={16} /> Publish Event</>}
            </button>
          )}
        </div>
      </div>

      <PromotionModal isOpen={promotionModalOpen} onClose={() => setPromotionModalOpen(false)} />
    </main>
  );
}
