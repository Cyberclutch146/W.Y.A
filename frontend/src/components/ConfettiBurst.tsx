'use client';

import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiBurstProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function ConfettiBurst({ trigger, onComplete }: ConfettiBurstProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (trigger && !firedRef.current) {
      firedRef.current = true;
      
      const duration = 2000;
      const end = Date.now() + duration;

      const colors = ['#FF6B9D', '#C77DFF', '#FF8C42', '#B5FF4D', '#4DD0E1'];

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        } else if (onComplete) {
          onComplete();
        }
      }());
    } else if (!trigger) {
      firedRef.current = false;
    }
  }, [trigger, onComplete]);

  return null;
}
