'use client'

import { useEffect, useState, useRef } from 'react'
import { useTheme } from 'next-themes'

export default function DynamicBackground({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let rafId: number

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const x = (e.clientX / window.innerWidth) * 100
      const y = (e.clientY / window.innerHeight) * 100

      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        containerRef.current?.style.setProperty('--mouse-x', `${x}%`)
        containerRef.current?.style.setProperty('--mouse-y', `${y}%`)
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <div ref={containerRef} className="relative min-h-screen flex flex-col w-full" style={{
      '--mouse-x': '50%',
      '--mouse-y': '50%'
    } as any}>
      {/* Animated gradient background layer */}
      <div
        className="fixed inset-0 pointer-events-none z-[-1]"
        style={{
          background: isDark
            ? `
                radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(142,207,158,0.08), transparent 25%),
                radial-gradient(ellipse at 20% 10%, rgba(59,107,74,0.05), transparent 45%),
                radial-gradient(ellipse at 80% 85%, rgba(139,109,46,0.04), transparent 40%),
                var(--color-background)
              `
            : `
                radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(59,107,74,0.1), transparent 25%),
                radial-gradient(ellipse at 15% 8%, rgba(59,107,74,0.05), transparent 40%),
                radial-gradient(ellipse at 85% 90%, rgba(139,109,46,0.05), transparent 35%),
                var(--color-background)
              `,
          willChange: 'background',
        }}
      />
      {children}
    </div>
  )
}