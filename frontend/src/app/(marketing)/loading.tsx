'use client';

import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-transparent pointer-events-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative w-24 h-24">
          <motion.div
            animate={{ 
              rotate: 360,
              borderRadius: ["20%", "50%", "20%"]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-full h-full border-4 border-primary/20 border-t-primary"
          />
        </div>
        <p className="text-sm font-black uppercase tracking-[0.4em] text-primary animate-pulse">
          CampusPulse
        </p>
      </motion.div>
    </div>
  );
}
