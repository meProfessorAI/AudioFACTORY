/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Early Birds — Campaign Positioning, Headline & Benefits
 * Synchronized with AudioFACTORY 7-Day Light Architectural Studio Theme & Skins
 */
import React from 'react';
import { motion } from 'framer-motion';
import { AudioVisualizer } from './AudioVisualizer';
import { useTerminal } from '../../../components/terminal/TerminalContext';

interface EarlyBirdsHeroProps {
  isFormFocused: boolean;
  isEmailValid: boolean;
  isSubmitted: boolean;
  onFocusFormRequest: () => void;
}

const FOUNDING_BENEFITS = [
  {
    index: '01',
    title: 'Early v2.0.0 Access',
    detail: 'Experience the next-generation neural studio before public release.',
  },
  {
    index: '02',
    title: 'Founding Community Role',
    detail: 'Direct feedback channel to shape voices, workflows, and studio tools.',
  },
  {
    index: '03',
    title: 'Google Play Invitation',
    detail: 'Selected participants receive an official Google Play testing invitation.',
  },
];

export const EarlyBirdsHero: React.FC<EarlyBirdsHeroProps> = ({
  isFormFocused,
  isEmailValid,
  isSubmitted,
  onFocusFormRequest,
}) => {
  const { activeSkin } = useTerminal();

  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Campaign Status Kicker (Unboxed editorial typography reflecting Active Skin) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-mono tracking-wider mb-3"
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse shrink-0"
            style={{ backgroundColor: 'var(--skin-accent, #0284C7)' }}
          />
          <span
            className="font-bold"
            style={{ color: 'var(--skin-accent, #0284C7)' }}
          >
            EARLY BIRDS 🕊️ — APPLICATIONS OPEN
          </span>
          <span aria-hidden="true" style={{ color: 'var(--skin-border-strong, #94A3B8)' }}>
            ·
          </span>
          <span
            className="font-semibold"
            style={{ color: 'var(--skin-text-secondary, #475569)' }}
          >
            {activeSkin.dayName} Edition • {activeSkin.themeName}
          </span>
        </motion.div>

        {/* Primary Campaign Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="font-['Outfit',sans-serif] text-3xl sm:text-4xl lg:text-[2.65rem] xl:text-[3rem] font-extrabold tracking-tight leading-[1.06] text-balance"
          style={{ color: 'var(--skin-text-primary, #0F172A)' }}
        >
          THE WORLD HASN&apos;T HEARD IT YET.{' '}
          <span style={{ color: 'var(--skin-accent, #0284C7)' }}>
            YOU CAN.
          </span>
        </motion.h1>

        {/* Supporting Headline & Core Message */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-3 space-y-2 max-w-xl"
        >
          <p
            className="text-base sm:text-lg font-bold tracking-wide"
            style={{ color: 'var(--skin-text-primary, #0F172A)' }}
          >
            Be here before the world hears about it. Get inside AudioFACTORY before everyone else.
          </p>
          <p
            className="text-xs sm:text-sm leading-relaxed"
            style={{ color: 'var(--skin-text-secondary, #475569)' }}
          >
            We&apos;re inviting our first wave of Early Birds to explore AudioFACTORY v2.0.0, share their
            experience, and help shape what comes next. The first ones don&apos;t just get access. They
            help shape what comes next.
          </p>
          <p
            className="hidden xl:block text-xs leading-relaxed"
            style={{ color: 'var(--skin-text-muted, #64748B)' }}
          >
            We&apos;re opening the doors to a select community of early explorers who want to experience
            AudioFACTORY, influence its evolution, and become part of its founding story.
          </p>
        </motion.div>
      </div>

      {/* Central Interactive Sound Sphere & Waveform Visualization */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="my-2 lg:my-1"
      >
        <AudioVisualizer
          isFormFocused={isFormFocused}
          isEmailValid={isEmailValid}
          isSubmitted={isSubmitted}
        />
      </motion.div>

      {/* Founding Explorer Benefits & Microcopy */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="space-y-3"
      >
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2.5 border-t"
          style={{ borderColor: 'var(--skin-border, #CBD5E1)' }}
        >
          {FOUNDING_BENEFITS.map((item) => (
            <div key={item.index} className="space-y-0.5">
              <div
                className="text-xs font-bold"
                style={{ color: 'var(--skin-text-primary, #0F172A)' }}
              >
                <span
                  className="font-mono mr-1.5 tabular-nums font-extrabold"
                  style={{ color: 'var(--skin-accent, #0284C7)' }}
                >
                  {item.index}.
                </span>
                {item.title}
              </div>
              <p
                className="text-[11px] leading-snug"
                style={{ color: 'var(--skin-text-secondary, #475569)' }}
              >
                {item.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Supporting Microcopy & Quick Focus Trigger on Mobile */}
        <div
          className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]"
          style={{ color: 'var(--skin-text-muted, #64748B)' }}
        >
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className="font-semibold"
              style={{ color: 'var(--skin-text-primary, #0F172A)' }}
            >
              First access. Real influence.
            </span>
            <span aria-hidden="true">·</span>
            <span>A small community. A big role in what comes next.</span>
          </div>
          <button
            type="button"
            onClick={onFocusFormRequest}
            className="lg:hidden text-xs font-bold hover:underline transition-colors cursor-pointer whitespace-nowrap"
            style={{ color: 'var(--skin-accent, #0284C7)' }}
          >
            COUNT ME IN →
          </button>
        </div>
      </motion.div>
    </div>
  );
};
