'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function AppAccessGate({ children }: { children: React.ReactNode }) {
  const { user, loading, isOtpVerified } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  // Only show the overlay if auth takes longer than 150ms (avoids flash on warm loads)
  const [showOverlay, setShowOverlay] = useState(false)

  const isPublicAppRoute = pathname === '/about'

  useEffect(() => {
    if (loading) {
      const t = setTimeout(() => setShowOverlay(true), 150)
      return () => clearTimeout(t)
    } else {
      setShowOverlay(false)
    }
  }, [loading])

  useEffect(() => {
    if (!loading) {
      if (!user && !isPublicAppRoute) {
        router.replace('/login')
      } else if (user && !isOtpVerified) {
        router.replace('/login')
      }
    }
  }, [isPublicAppRoute, loading, router, user, isOtpVerified])

  if (isPublicAppRoute) {
    return <>{children}</>
  }

  return (
    <>
      {/* Render children immediately — don't block on auth */}
      {children}

      {/* Overlay only while auth is still resolving */}
      <AnimatePresence>
        {showOverlay && loading && (
          <motion.div
            key="access-gate-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3, ease: 'easeOut' } }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="flex flex-col items-center justify-center p-8 rounded-3xl bg-surface/50 border border-white/5 shadow-[0_0_50px_rgba(59,107,74,0.15)]"
            >
              <div className="relative flex items-center justify-center w-20 h-20 mb-6">
                <div className="absolute inset-0 rounded-full border-t-2 border-primary border-r-2 border-transparent animate-spin" />
                <div className="absolute inset-2 rounded-full border-b-2 border-accent border-l-2 border-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                <div className="absolute inset-4 rounded-full bg-primary/20 animate-pulse" />
              </div>
              <p className="text-sm font-medium text-foreground/60 tracking-widest uppercase animate-pulse">
                Buffering
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
