'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles, MapPin, Palette, Rocket } from 'lucide-react';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

const STEPS = [
  { label: 'The Spark', icon: Sparkles },
  { label: 'When & Where', icon: MapPin },
  { label: 'Look & Feel', icon: Palette },
  { label: 'Launch', icon: Rocket },
];

export default function WizardProgress({ currentStep, totalSteps, onStepClick }: WizardProgressProps) {
  return (
    <div className="w-full mb-6">
      {/* Pill tabs row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {STEPS.map((step, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;
          const Icon = step.icon;
          const clickable = isCompleted && onStepClick;

          return (
            <motion.button
              key={stepNum}
              type="button"
              onClick={() => clickable && onStepClick(stepNum)}
              disabled={!clickable && !isActive}
              className="flex items-center gap-2 px-4 py-2 whitespace-nowrap text-xs font-bold transition-all shrink-0"
              style={{
                borderRadius: 'var(--r-full)',
                background: isActive
                  ? 'linear-gradient(135deg, var(--cp-primary), hsl(290,90%,60%))'
                  : isCompleted
                  ? 'var(--cp-surface-dim)'
                  : 'transparent',
                color: isActive
                  ? 'white'
                  : isCompleted
                  ? 'var(--cp-text-2)'
                  : 'var(--cp-text-3)',
                border: isActive
                  ? 'none'
                  : isCompleted
                  ? '1.5px solid var(--cp-border)'
                  : '1.5px dashed var(--cp-border)',
                boxShadow: isActive
                  ? '0 6px 20px -6px hsl(from var(--cp-primary) h s l / 0.45)'
                  : 'none',
                cursor: clickable ? 'pointer' : isActive ? 'default' : 'not-allowed',
                opacity: !isActive && !isCompleted ? 0.5 : 1,
              }}
              animate={{ scale: isActive ? 1.04 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {isCompleted ? (
                <motion.span
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                >
                  <Check size={12} strokeWidth={3} />
                </motion.span>
              ) : (
                <Icon size={12} />
              )}
              {step.label}
            </motion.button>
          );
        })}

        {/* Step counter — pushed right */}
        <span
          className="ml-auto pl-3 text-[11px] font-bold shrink-0"
          style={{ color: 'var(--cp-text-3)' }}
        >
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="mt-3 h-0.5 rounded-full overflow-hidden"
        style={{ background: 'var(--cp-border)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, var(--cp-primary), hsl(290,90%,60%))' }}
          initial={false}
          animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
