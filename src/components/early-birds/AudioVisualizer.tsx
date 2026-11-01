/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Early Birds — Interactive Sound Sphere & Dynamic Waveform Visualizer
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

interface AudioVisualizerProps {
  isFormFocused?: boolean;
  isEmailValid?: boolean;
  isSubmitted?: boolean;
}

const WAVE_BAR_COUNT = 32;

const BASE_AMPLITUDES = [
  0.28, 0.42, 0.65, 0.51, 0.84, 0.95, 0.72, 0.60,
  0.88, 1.00, 0.78, 0.54, 0.69, 0.92, 0.81, 0.96,
  0.89, 0.74, 0.91, 0.66, 0.52, 0.79, 0.94, 0.83,
  0.62, 0.48, 0.75, 0.68, 0.55, 0.40, 0.32, 0.24,
];

const PARTICLES = [
  { id: 1, x: '14%', y: '18%', size: 4, duration: 7.5, delay: 0.2, color: '#22D3EE' },
  { id: 2, x: '84%', y: '22%', size: 5, duration: 9.0, delay: 1.1, color: '#A855F7' },
  { id: 3, x: '78%', y: '76%', size: 3.5, duration: 8.2, delay: 0.6, color: '#06B6D4' },
  { id: 4, x: '18%', y: '74%', size: 4.5, duration: 10.4, delay: 1.8, color: '#8B5CF6' },
  { id: 5, x: '52%', y: '10%', size: 3, duration: 6.8, delay: 2.3, color: '#38BDF8' },
  { id: 6, x: '88%', y: '50%', size: 4, duration: 8.7, delay: 0.9, color: '#C084FC' },
];

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isFormFocused = false,
  isEmailValid = false,
  isSubmitted = false,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const stopTimeoutRef = useRef<number | null>(null);

  const handlePointerMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const normX = (e.clientX - centerX) / (rect.width / 2);
      const normY = (e.clientY - centerY) / (rect.height / 2);
      setPointerOffset({
        x: Math.max(-1, Math.min(1, normX)) * 14,
        y: Math.max(-1, Math.min(1, normY)) * 14,
      });
    },
    [prefersReducedMotion]
  );

  const handlePointerLeave = useCallback(() => {
    setPointerOffset({ x: 0, y: 0 });
  }, []);

  // Subtle Web Audio API harmonic synth chord preview when user clicks the orb
  const toggleAcousticPreview = useCallback(() => {
    if (isPlayingPreview) {
      if (stopTimeoutRef.current) {
        window.clearTimeout(stopTimeoutRef.current);
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      setIsPlayingPreview(false);
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx: AudioContext = new AudioCtx();
      audioCtxRef.current = ctx;
      setIsPlayingPreview(true);

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.exponentialRampToValueAtTime(0.12, now + 0.6);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, now);
      filter.frequency.exponentialRampToValueAtTime(1680, now + 1.8);
      filter.frequency.exponentialRampToValueAtTime(520, now + 4.0);

      masterGain.connect(ctx.destination);
      filter.connect(masterGain);

      // Futuristic Fmaj9 / Dmin11 harmonic chord frequencies
      const freqs = [146.83, 220.0, 261.63, 329.63, 392.0, 523.25];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime((idx - 2.5) * 4, now);
        osc.connect(filter);
        osc.start(now);
        osc.stop(now + 4.3);
      });

      stopTimeoutRef.current = window.setTimeout(() => {
        setIsPlayingPreview(false);
        ctx.close().catch(() => {});
        audioCtxRef.current = null;
      }, 4200);
    } catch {
      setIsPlayingPreview(false);
    }
  }, [isPlayingPreview]);

  useEffect(() => {
    return () => {
      if (stopTimeoutRef.current) {
        window.clearTimeout(stopTimeoutRef.current);
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const energyBoost = isSubmitted ? 1.25 : isPlayingPreview ? 1.3 : isEmailValid ? 1.15 : isFormFocused ? 1.08 : 1;

  return (
    <div
      ref={containerRef}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      className="relative flex flex-col items-center justify-center w-full select-none py-2 lg:py-4"
    >
      {/* Floating Sound Particles */}
      {!prefersReducedMotion &&
        PARTICLES.map((p) => (
          <motion.span
            key={p.id}
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full blur-[0.5px]"
            style={{
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 12px ${p.color}`,
            }}
            animate={{
              y: [0, -14, 0],
              opacity: [0.25, 0.75, 0.25],
              scale: [1, 1.25, 1],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

      {/* Central Sound Sphere Container */}
      <div className="relative flex items-center justify-center w-44 h-44 sm:w-56 sm:h-56 lg:w-64 lg:h-64">
        {/* Outer Acoustic Wave Rings */}
        {[0, 1, 2].map((ringIdx) => (
          <motion.div
            key={ringIdx}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full border"
            style={{
              borderColor:
                ringIdx === 0
                  ? 'rgba(34, 211, 238, 0.22)'
                  : ringIdx === 1
                  ? 'rgba(139, 92, 246, 0.18)'
                  : 'rgba(168, 85, 247, 0.12)',
            }}
            animate={
              prefersReducedMotion
                ? { scale: 1 + ringIdx * 0.14, opacity: 0.35 - ringIdx * 0.08 }
                : {
                    scale: [1, 1.18 + ringIdx * 0.12, 1],
                    opacity: [0.42 - ringIdx * 0.1, 0.08, 0.42 - ringIdx * 0.1],
                  }
            }
            transition={{
              duration: (4.4 + ringIdx * 1.1) / energyBoost,
              delay: ringIdx * 0.6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Ambient Halo Glow */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute w-40 h-40 sm:w-52 sm:h-52 lg:w-60 lg:h-60 rounded-full blur-2xl"
          style={{
            background:
              'radial-gradient(circle, rgba(34,211,238,0.28) 0%, rgba(124,58,237,0.32) 52%, rgba(4,5,11,0) 78%)',
          }}
          animate={
            prefersReducedMotion
              ? { scale: 1 }
              : {
                  x: pointerOffset.x * 0.7,
                  y: pointerOffset.y * 0.7,
                  scale: [0.96, 1.07 * energyBoost, 0.96],
                }
          }
          transition={{
            scale: { duration: 4.2, repeat: Infinity, ease: 'easeInOut' },
            x: { type: 'spring', stiffness: 90, damping: 18 },
            y: { type: 'spring', stiffness: 90, damping: 18 },
          }}
        />

        {/* Interactive Core Sound Orb */}
        <motion.button
          type="button"
          onClick={toggleAcousticPreview}
          aria-label={
            isPlayingPreview
              ? 'Stop AudioFACTORY acoustic resonance preview'
              : 'Play AudioFACTORY v2.0.0 acoustic resonance preview'
          }
          className="group relative flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[#05060E]"
          animate={
            prefersReducedMotion
              ? {}
              : {
                  x: pointerOffset.x,
                  y: pointerOffset.y,
                  scale: isPlayingPreview ? [1, 1.06, 1] : [1, 1.03, 1],
                }
          }
          transition={{
            scale: { duration: isPlayingPreview ? 1.4 : 3.6, repeat: Infinity, ease: 'easeInOut' },
            x: { type: 'spring', stiffness: 120, damping: 16 },
            y: { type: 'spring', stiffness: 120, damping: 16 },
          }}
        >
          {/* Rotating Conic Gradient Layer */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 rounded-full opacity-90"
            style={{
              background:
                'conic-gradient(from 0deg at 50% 50%, #06B6D4 0deg, #7C3AED 120deg, #0F172A 210deg, #A855F7 290deg, #22D3EE 360deg)',
              boxShadow:
                'inset 0 0 28px rgba(34,211,238,0.45), 0 0 42px rgba(124,58,237,0.45)',
            }}
            animate={prefersReducedMotion ? {} : { rotate: 360 }}
            transition={{
              duration: isPlayingPreview ? 7 : 18,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Inner Counter-Rotating Acoustic Core */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-2.5 rounded-full backdrop-blur-md"
            style={{
              background:
                'radial-gradient(circle at 35% 30%, rgba(34,211,238,0.42), rgba(15,23,42,0.88) 62%, rgba(5,6,14,0.96) 100%)',
              border: '1px solid rgba(255,255,255,0.16)',
            }}
            animate={prefersReducedMotion ? {} : { rotate: -360 }}
            transition={{
              duration: 24,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Core Geometric Harmonic Rings SVG */}
          <svg
            viewBox="0 0 120 120"
            className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 text-cyan-300/90 transition-transform duration-300 group-hover:scale-105"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="orbRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22D3EE" />
                <stop offset="50%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
            <circle
              cx="60"
              cy="60"
              r="46"
              fill="none"
              stroke="url(#orbRingGrad)"
              strokeWidth="1.2"
              strokeDasharray="6 4"
              opacity="0.7"
            />
            <circle
              cx="60"
              cy="60"
              r="32"
              fill="none"
              stroke="url(#orbRingGrad)"
              strokeWidth="1.5"
              opacity="0.85"
            />
            <circle
              cx="60"
              cy="60"
              r="16"
              fill="rgba(34, 211, 238, 0.14)"
              stroke="#22D3EE"
              strokeWidth="1.2"
            />
          </svg>

          {/* Center Audition Affordance Icon */}
          <div className="absolute z-20 flex items-center justify-center w-8 h-8 rounded-full bg-[#05060E]/80 border border-cyan-400/40 text-cyan-300 shadow-sm">
            {isPlayingPreview ? (
              <Volume2 className="w-4 h-4 text-cyan-300" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-300 group-hover:text-cyan-300 transition-colors" />
            )}
          </div>
        </motion.button>
      </div>

      {/* Dynamic Multi-Bar Violet-to-Cyan Waveform */}
      <div className="w-full max-w-xs sm:max-w-sm mt-3 px-4">
        <div
          className="flex items-center justify-center gap-1 h-10 sm:h-12"
          aria-label="AudioFACTORY reactive soundwave visualization"
        >
          {BASE_AMPLITUDES.map((amp, i) => {
            const minHeight = Math.max(16, Math.round(amp * 34));
            const peakHeight = Math.min(100, Math.round(amp * 96 * energyBoost));
            return (
              <motion.span
                key={i}
                aria-hidden="true"
                className="flex-1 max-w-[4px] rounded-full"
                style={{
                  background: 'linear-gradient(180deg, #22D3EE 0%, #8B5CF6 60%, #4C1D95 100%)',
                  height: `${minHeight}%`,
                }}
                animate={
                  prefersReducedMotion
                    ? { height: `${Math.round(amp * 65)}%`, opacity: 0.8 }
                    : {
                        height: [`${minHeight}%`, `${peakHeight}%`, `${minHeight}%`],
                        opacity: [0.55, 0.95, 0.55],
                      }
                }
                transition={{
                  duration: isPlayingPreview
                    ? 0.55 + (i % 5) * 0.08
                    : 1.35 + (i % 7) * 0.14,
                  delay: (i * 0.04) % 0.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            );
          })}
        </div>

        {/* Quiet Unboxed Technical Metadata Strip (Zero-Pill Discipline) */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] font-mono tabular-nums text-slate-400">
          <button
            type="button"
            onClick={toggleAcousticPreview}
            className="text-cyan-300 hover:text-cyan-200 underline decoration-cyan-500/40 underline-offset-4 transition-colors cursor-pointer"
          >
            {isPlayingPreview ? 'Listening: v2.0.0 Acoustic Core' : 'Audition v2.0.0 Acoustic Core'}
          </button>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Release v2.0.0</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>com.audiofactory.app</span>
        </div>
      </div>
    </div>
  );
};
