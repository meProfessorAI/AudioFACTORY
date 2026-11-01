/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Early Birds — Campaign Positioning, Headline & Benefits
 */
import React from 'react';
import { motion } from 'framer-motion';
import { AudioVisualizer } from './AudioVisualizer';

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
  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Campaign Status Kicker (Unboxed editorial typography) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-mono tracking-wider text-cyan-300/95 mb-3"
        >
          <span className="font-semibold text-white">EARLY BIRDS 🕊️ — APPLICATIONS OPEN</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-violet-300">Be here before the world hears about it.</span>
        </motion.div>

        {/* Primary Campaign Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="font-['Outfit',sans-serif] text-3xl sm:text-4xl lg:text-[2.65rem] xl:text-[3rem] font-extrabold tracking-tight text-white leading-[1.06] text-balance"
        >
          THE WORLD HASN&apos;T HEARD IT YET.{' '}
          <span className="bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
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
          <p className="text-base sm:text-lg font-semibold text-slate-100 tracking-wide">
            Get inside AudioFACTORY before everyone else.
          </p>
          <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed">
            We&apos;re inviting our first wave of Early Birds to explore AudioFACTORY v2.0.0, share their
            experience, and help shape what comes next. The first ones don&apos;t just get access. They
            help shape what comes next.
          </p>
          <p className="hidden xl:block text-xs text-slate-400 leading-relaxed">
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/[0.08]">
          {FOUNDING_BENEFITS.map((item) => (
            <div key={item.index} className="space-y-0.5">
              <div className="text-xs font-semibold text-white">
                <span className="font-mono text-cyan-400 mr-1.5 tabular-nums">{item.index}.</span>
                {item.title}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">{item.detail}</p>
            </div>
          ))}
        </div>

        {/* Supporting Microcopy & Quick Focus Trigger on Mobile */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-slate-300 font-medium">First access. Real influence.</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>A small community. A big role in what comes next.</span>
          </div>
          <button
            type="button"
            onClick={onFocusFormRequest}
            className="lg:hidden text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition-colors cursor-pointer whitespace-nowrap"
          >
            COUNT ME IN →
          </button>
        </div>
      </motion.div>
    </div>
  );
};
