'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-transparent pointer-events-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        {/* Pulsing ring */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-full bg-primary/20"
        />
        
        <div className="relative flex flex-col items-center gap-4">
          <div className="p-4 rounded-3xl bg-white shadow-2xl border border-white/20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          
          <div className="flex flex-col items-center">
            <motion.p
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-sm font-bold uppercase tracking-[0.2em] text-foreground/60"
            >
              Syncing Reality
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
