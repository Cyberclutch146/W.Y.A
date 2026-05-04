'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles, MapPin, Palette, Rocket } from 'lucide-react';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
}

const STEPS = [
  { label: 'The Spark', icon: Sparkles },
  { label: 'When & Where', icon: MapPin },
  { label: 'Look & Feel', icon: Palette },
  { label: 'Launch', icon: Rocket },
];

export default function WizardProgress({ currentStep }: WizardProgressProps) {
  return (
    <div className="w-full mb-8 md:mb-12">
      {/* Mobile: minimal */}
      <div className="flex md:hidden items-center justify-center gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--cp-text-3)' }}>
          Step {currentStep} of {STEPS.length}
        </span>
        <span className="text-xs font-bold" style={{ color: 'var(--cp-primary)' }}>
          — {STEPS[currentStep - 1]?.label}
        </span>
      </div>
      {/* Mobile progress bar */}
      <div className="flex md:hidden h-1.5 rounded-full overflow-hidden mx-4" style={{ background: 'var(--cp-surface-dim)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, var(--cp-primary), hsl(290,90%,60%))' }}
          initial={false}
          animate={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Desktop: full progress */}
      <div className="hidden md:flex items-center justify-center gap-0">
        {STEPS.map((step, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;
          const Icon = step.icon;

          return (
            <div key={stepNum} className="flex items-center">
              <div className="flex flex-col items-center gap-2.5 relative">
                <motion.div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold relative z-10 transition-colors"
                  style={{
                    background: isCompleted
                      ? 'var(--cp-secondary)'
                      : isActive
                      ? 'linear-gradient(135deg, var(--cp-primary), hsl(290,90%,60%))'
                      : 'var(--cp-surface-dim)',
                    color: isCompleted || isActive ? 'white' : 'var(--cp-text-3)',
                    border: isActive ? 'none' : isCompleted ? 'none' : '1.5px solid var(--cp-border)',
                    boxShadow: isActive
                      ? '0 8px 24px -6px hsl(from var(--cp-primary) h s l / 0.4)'
                      : isCompleted
                      ? '0 4px 12px -4px hsl(from var(--cp-secondary) h s l / 0.3)'
                      : 'none',
                  }}
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {isCompleted ? <Check size={20} strokeWidth={3} /> : <Icon size={20} />}
                </motion.div>
                <span
                  className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap"
                  style={{ color: isActive ? 'var(--cp-primary)' : isCompleted ? 'var(--cp-secondary)' : 'var(--cp-text-3)' }}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div className="w-16 xl:w-24 h-0.5 mx-3 rounded-full relative" style={{ background: 'var(--cp-border)' }}>
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ background: 'linear-gradient(90deg, var(--cp-secondary), var(--cp-primary))' }}
                    initial={false}
                    animate={{ width: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
