"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

/**
 * Hero Visual Option 2: Campus Pulse Orb
 * Dense, glowing animated particle sphere. Theme-aware via CSS custom properties.
 */

const LABELS = [
  { text: "Hackathon", color: "var(--cp-primary)" },
  { text: "Art Fest", color: "var(--cp-accent)" },
  { text: "Football Finals", color: "var(--cp-secondary)" },
  { text: "Startup Pitch", color: "var(--cp-gold)" },
  { text: "Music Night", color: "var(--cp-violet)" },
  { text: "Career Fair", color: "var(--cp-cyan)" },
  { text: "Debate Club", color: "var(--cp-orange)" },
  { text: "Game Jam", color: "var(--cp-pink)" },
];

interface Particle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  orbitTilt: number;
}

export default function HeroPulseOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  const initParticles = useCallback(() => {
    const particles: Particle[] = [];
    for (let ring = 0; ring < 3; ring++) {
      const baseRadius = 60 + ring * 40;
      const count = 30 + ring * 15;
      for (let i = 0; i < count; i++) {
        particles.push({
          angle: (i / count) * Math.PI * 2 + Math.random() * 0.3,
          radius: baseRadius + (Math.random() - 0.5) * 20,
          speed: (0.3 + Math.random() * 0.4) * (ring % 2 === 0 ? 1 : -1),
          size: 1 + Math.random() * 2.5,
          orbitTilt: (ring * 30 + Math.random() * 15) * (Math.PI / 180),
        });
      }
    }
    for (let i = 0; i < 20; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: 150 + Math.random() * 40,
        speed: 0.15 + Math.random() * 0.2,
        size: 0.8 + Math.random() * 1.2,
        orbitTilt: Math.random() * Math.PI * 0.3,
      });
    }
    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // Read the primary color from CSS custom properties for canvas rendering
    const getThemeColor = () => {
      const style = getComputedStyle(document.documentElement);
      const primary = style.getPropertyValue("--cp-primary").trim();
      // Parse the HSL to get h, s, l values
      const match = primary.match(/hsl\(\s*([\d.]+)[,\s]+([\d.]+)%[,\s]+([\d.]+)%\s*\)/);
      if (match) {
        return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
      }
      return { h: 258, s: 90, l: 63 }; // fallback
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    if (particlesRef.current.length === 0) {
      particlesRef.current = initParticles();
    }

    let themeColor = getThemeColor();
    // Re-check theme color periodically (handles theme toggle)
    const themeInterval = setInterval(() => {
      themeColor = getThemeColor();
    }, 1000);

    const draw = (time: number) => {
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const t = time * 0.001;
      const { h: hue, s: sat, l: light } = themeColor;

      // ── Outer halo glow ──
      const haloGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200);
      haloGrad.addColorStop(0, `hsla(${hue}, ${sat}%, ${light}%, 0.14)`);
      haloGrad.addColorStop(0.3, `hsla(${hue}, ${sat - 10}%, ${light - 5}%, 0.07)`);
      haloGrad.addColorStop(0.6, `hsla(${hue + 15}, ${sat - 20}%, ${light - 10}%, 0.03)`);
      haloGrad.addColorStop(1, "transparent");
      ctx.fillStyle = haloGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Pulsing core ──
      const pulseScale = 1 + Math.sin(t * 2) * 0.15;
      const coreSize = 18 * pulseScale;

      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize * 3);
      coreGrad.addColorStop(0, `hsla(${hue}, ${Math.min(sat + 5, 100)}%, ${Math.min(light + 12, 95)}%, 0.6)`);
      coreGrad.addColorStop(0.4, `hsla(${hue}, ${sat}%, ${light}%, 0.2)`);
      coreGrad.addColorStop(1, "transparent");
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreSize * 3, 0, Math.PI * 2);
      ctx.fill();

      // Bright core dot
      const dotGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize);
      dotGrad.addColorStop(0, `hsla(${hue}, 100%, ${Math.min(light + 20, 95)}%, 0.9)`);
      dotGrad.addColorStop(0.5, `hsla(${hue}, ${sat}%, ${light}%, 0.4)`);
      dotGrad.addColorStop(1, "transparent");
      ctx.fillStyle = dotGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreSize, 0, Math.PI * 2);
      ctx.fill();

      // ── Particles ──
      const particles = particlesRef.current;
      for (const p of particles) {
        p.angle += p.speed * 0.008;
        const x = cx + Math.cos(p.angle) * p.radius;
        const yBase = Math.sin(p.angle) * p.radius * Math.cos(p.orbitTilt);
        const y = cy + yBase;

        const depth = Math.sin(p.angle) * Math.cos(p.orbitTilt);
        const alpha = 0.3 + (depth + 1) * 0.35;
        const sizeMultiplier = 0.7 + (depth + 1) * 0.3;

        ctx.fillStyle = `hsla(${hue}, ${sat - 10}%, ${Math.min(light + 10, 90)}%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size * sizeMultiplier, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Connection lines ──
      ctx.lineWidth = 0.3;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        const x1 = cx + Math.cos(p1.angle) * p1.radius;
        const y1 = cy + Math.sin(p1.angle) * p1.radius * Math.cos(p1.orbitTilt);

        for (let j = i + 1; j < Math.min(i + 8, particles.length); j++) {
          const p2 = particles[j];
          const x2 = cx + Math.cos(p2.angle) * p2.radius;
          const y2 = cy + Math.sin(p2.angle) * p2.radius * Math.cos(p2.orbitTilt);

          const dx = x1 - x2;
          const dy = y1 - y2;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 60) {
            const lineAlpha = (1 - dist / 60) * 0.18;
            ctx.strokeStyle = `hsla(${hue}, ${sat - 20}%, ${light}%, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        }
      }

      // ── Traveling pulse ──
      const pulseAngle = t * 0.8;
      const pulseX = cx + Math.cos(pulseAngle) * 90;
      const pulseY = cy + Math.sin(pulseAngle) * 90 * 0.7;
      const pulseGrad = ctx.createRadialGradient(pulseX, pulseY, 0, pulseX, pulseY, 12);
      pulseGrad.addColorStop(0, `hsla(${hue}, 100%, ${Math.min(light + 15, 92)}%, 0.5)`);
      pulseGrad.addColorStop(1, "transparent");
      ctx.fillStyle = pulseGrad;
      ctx.beginPath();
      ctx.arc(pulseX, pulseY, 12, 0, Math.PI * 2);
      ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      clearInterval(themeInterval);
      cancelAnimationFrame(animRef.current);
    };
  }, [initParticles]);

  return (
    <div className="hidden lg:flex relative w-full items-center justify-center" style={{ minHeight: 480 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
        style={{ width: 420, height: 420 }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{ width: "100%", height: "100%" }}
        />

        {/* Floating labels */}
        {LABELS.map((label, i) => {
          const angle = (i / LABELS.length) * Math.PI * 2 - Math.PI / 2;
          const rx = 48;
          const ry = 44;
          const x = 50 + Math.cos(angle) * rx;
          const y = 50 + Math.sin(angle) * ry;

          return (
            <motion.span
              key={label.text}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0 + i * 0.08, duration: 0.4 }}
              className="absolute text-[11px] font-semibold px-3 py-1.5 rounded-full pointer-events-none whitespace-nowrap"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: "translate(-50%, -50%)",
                background: "var(--cp-surface)",
                color: label.color,
                border: "1px solid var(--cp-border)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              {label.text}
            </motion.span>
          );
        })}
      </motion.div>
    </div>
  );
}
