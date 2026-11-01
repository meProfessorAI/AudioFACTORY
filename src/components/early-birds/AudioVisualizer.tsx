/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Early Birds — Interactive Sound Sphere & Dynamic Waveform Visualizer
 * Dynamically reactive to AudioFACTORY's 7-Day Light Theme Skins
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useTerminal } from '../../../components/terminal/TerminalContext';

interface AudioVisualizerProps {
  isFormFocused?: boolean;
  isEmailValid?: boolean;
  isSubmitted?: boolean;
}

const BASE_AMPLITUDES = [
  0.28, 0.42, 0.65, 0.51, 0.84, 0.95, 0.72, 0.60,
  0.88, 1.00, 0.78, 0.54, 0.69, 0.92, 0.81, 0.96,
  0.89, 0.74, 0.91, 0.66, 0.52, 0.79, 0.94, 0.83,
  0.62, 0.48, 0.75, 0.68, 0.55, 0.40, 0.32, 0.24,
];

const PARTICLE_POSITIONS = [
  { id: 1, x: '14%', y: '18%', size: 5, duration: 7.5, delay: 0.2 },
  { id: 2, x: '84%', y: '22%', size: 6, duration: 9.0, delay: 1.1 },
  { id: 3, x: '78%', y: '76%', size: 4.5, duration: 8.2, delay: 0.6 },
  { id: 4, x: '18%', y: '74%', size: 5.5, duration: 10.4, delay: 1.8 },
  { id: 5, x: '52%', y: '10%', size: 4, duration: 6.8, delay: 2.3 },
  { id: 6, x: '88%', y: '50%', size: 5, duration: 8.7, delay: 0.9 },
];

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isFormFocused = false,
  isEmailValid = false,
  isSubmitted = false,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const { activeSkin } = useTerminal();
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

      // Harmonic chord frequencies
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
  const { palette } = activeSkin;

  return (
    <div
      ref={containerRef}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      className="relative flex flex-col items-center justify-center w-full select-none py-2 lg:py-3"
    >
      {/* Floating Sound Particles colored by Active Skin */}
      {!prefersReducedMotion &&
        PARTICLE_POSITIONS.map((p, idx) => {
          const particleColor = idx % 2 === 0 ? palette.accent : palette.borderStrong;
          return (
            <motion.span
              key={p.id}
              aria-hidden="true"
              className="pointer-events-none absolute rounded-full"
              style={{
                left: p.x,
                top: p.y,
                width: p.size,
                height: p.size,
                backgroundColor: particleColor,
                boxShadow: `0 0 10px ${palette.ring}`,
              }}
              animate={{
                y: [0, -12, 0],
                opacity: [0.35, 0.85, 0.35],
                scale: [1, 1.25, 1],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          );
        })}

      {/* Central Sound Sphere Container */}
      <div className="relative flex items-center justify-center w-44 h-44 sm:w-52 sm:h-52 lg:w-60 lg:h-60">
        {/* Outer Acoustic Wave Rings */}
        {[0, 1, 2].map((ringIdx) => (
          <motion.div
            key={ringIdx}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full border"
            style={{
              borderColor: ringIdx === 0 ? palette.accent : palette.borderStrong,
            }}
            animate={
              prefersReducedMotion
                ? { scale: 1 + ringIdx * 0.14, opacity: 0.45 - ringIdx * 0.1 }
                : {
                    scale: [1, 1.18 + ringIdx * 0.12, 1],
                    opacity: [0.5 - ringIdx * 0.12, 0.12, 0.5 - ringIdx * 0.12],
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
          className="pointer-events-none absolute w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 rounded-full blur-2xl"
          style={{
            background: `radial-gradient(circle, ${palette.accentMuted} 0%, ${palette.ring} 52%, transparent 78%)`,
          }}
          animate={
            prefersReducedMotion
              ? { scale: 1 }
              : {
                  x: pointerOffset.x * 0.7,
                  y: pointerOffset.y * 0.7,
                  scale: [0.96, 1.08 * energyBoost, 0.96],
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
          className="group relative flex items-center justify-center w-32 h-32 sm:w-38 sm:h-38 lg:w-44 lg:h-44 rounded-full cursor-pointer focus:outline-none"
          style={{
            boxShadow: palette.shadow,
          }}
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
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(from 0deg at 50% 50%, ${palette.accent} 0deg, ${palette.accentMuted} 120deg, ${palette.bgCard} 210deg, ${palette.accentHover} 290deg, ${palette.accent} 360deg)`,
              boxShadow: `inset 0 0 24px ${palette.ring}, 0 8px 32px ${palette.ring}`,
              border: `1.5px solid ${palette.borderStrong}`,
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
              background: `radial-gradient(circle at 35% 30%, ${palette.bgCard} 0%, ${palette.accentMuted} 58%, ${palette.bgSubtle} 100%)`,
              border: `1px solid ${palette.border}`,
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
            className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 transition-transform duration-300 group-hover:scale-105"
            aria-hidden="true"
          >
            <circle
              cx="60"
              cy="60"
              r="46"
              fill="none"
              stroke={palette.accent}
              strokeWidth="1.4"
              strokeDasharray="6 4"
              opacity="0.75"
            />
            <circle
              cx="60"
              cy="60"
              r="32"
              fill="none"
              stroke={palette.accentHover}
              strokeWidth="1.6"
              opacity="0.85"
            />
            <circle
              cx="60"
              cy="60"
              r="16"
              fill={palette.accentMuted}
              stroke={palette.accent}
              strokeWidth="1.4"
            />
          </svg>

          {/* Center Audition Affordance Icon */}
          <div
            className="absolute z-20 flex items-center justify-center w-9 h-9 rounded-full border shadow-xs transition-transform group-hover:scale-105"
            style={{
              backgroundColor: palette.bgCard,
              borderColor: palette.accent,
              color: palette.accent,
            }}
          >
            {isPlayingPreview ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 opacity-80 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        </motion.button>
      </div>

      {/* Dynamic Multi-Bar Skin-Reactive Waveform */}
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
                  background: `linear-gradient(180deg, ${palette.accent} 0%, ${palette.accentHover} 75%, ${palette.borderStrong} 100%)`,
                  height: `${minHeight}%`,
                }}
                animate={
                  prefersReducedMotion
                    ? { height: `${Math.round(amp * 65)}%`, opacity: 0.85 }
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

        {/* Quiet Unboxed Technical Metadata Strip */}
        <div
          className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] font-mono tabular-nums"
          style={{ color: 'var(--skin-text-muted, #64748B)' }}
        >
          <button
            type="button"
            onClick={toggleAcousticPreview}
            className="font-bold underline underline-offset-4 transition-opacity hover:opacity-80 cursor-pointer"
            style={{ color: 'var(--skin-accent, #0284C7)' }}
          >
            {isPlayingPreview ? 'Listening: v2.0.0 Acoustic Core' : 'Audition v2.0.0 Acoustic Core'}
          </button>
          <span aria-hidden="true">·</span>
          <span>Release v2.0.0</span>
          <span aria-hidden="true">·</span>
          <span>com.audiofactory.app</span>
        </div>
      </div>
    </div>
  );
};
