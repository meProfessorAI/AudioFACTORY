/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY — EARLY BIRDS 🕊️ Single-Screen Animated Early Access Landing Experience
 */
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { EarlyBirdsHero } from '../components/EarlyBirdsHero';
import { EarlyBirdsForm } from '../components/EarlyBirdsForm';
import { SuccessState } from '../components/SuccessState';
import { EarlyBirdsPrivacyModal } from '../components/EarlyBirdsPrivacyModal';
import { EarlyBirdSubmissionResult } from '../firebase/submissionClient';
import { initEarlyBirdsAppCheck } from '../firebase/config';
import { trackEarlyBirdsEvent } from '../utils/earlyBirdsAnalytics';

export const EarlyBirdsPage: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [isFormFocused, setIsFormFocused] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<EarlyBirdSubmissionResult | null>(null);
  const [submittedName, setSubmittedName] = useState('');
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  useEffect(() => {
    initEarlyBirdsAppCheck();
    trackEarlyBirdsEvent('early_birds_page_view', undefined, true);
  }, []);

  const handleFocusForm = () => {
    if (submissionResult) return;
    if (nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="relative min-h-screen lg:h-screen w-full max-w-[100vw] overflow-x-hidden lg:overflow-y-auto bg-[#04050C] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-100">
      {/* Ambient Animated Background Gradients */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        <motion.div
          className="absolute -top-32 -left-32 w-[34rem] h-[34rem] rounded-full blur-[130px] opacity-35"
          style={{
            background: 'radial-gradient(circle, #6D28D9 0%, rgba(109,40,217,0) 70%)',
          }}
          animate={
            prefersReducedMotion
              ? {}
              : {
                  x: [0, 35, 0],
                  y: [0, 25, 0],
                }
          }
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/4 -right-32 w-[32rem] h-[32rem] rounded-full blur-[130px] opacity-25"
          style={{
            background: 'radial-gradient(circle, #06B6D4 0%, rgba(6,182,212,0) 70%)',
          }}
          animate={
            prefersReducedMotion
              ? {}
              : {
                  x: [0, -30, 0],
                  y: [0, -25, 0],
                }
          }
          transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* Top Navigation Bar (Strict 3-Zone Contract) */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-8 border-b border-white/[0.07]">
        {/* Zone 1: Single-line Brand Wordmark */}
        <Link
          to="/"
          className="font-['Outfit',sans-serif] text-lg sm:text-xl font-extrabold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          Audio<span className="text-cyan-400">FACTORY</span>
        </Link>

        {/* Zone 2: Clean Single-Line Text Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
          <button
            type="button"
            onClick={handleFocusForm}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Early Birds v2.0.0
          </button>
          <button
            type="button"
            onClick={() => setIsPrivacyOpen(true)}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Privacy Notice
          </button>
          <Link
            to="/app"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Web Studio
          </Link>
          <Link
            to="/home"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Overview
          </Link>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={handleFocusForm}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            COUNT ME IN →
          </button>
        </div>
      </header>

      {/* Main Single-Screen Interactive Campaign Poster Grid */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-5 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Left / Central Area: Positioning, Sound Sphere, Waveform & Founding Benefits */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-between">
            <EarlyBirdsHero
              isFormFocused={isFormFocused}
              isEmailValid={isEmailValid}
              isSubmitted={Boolean(submissionResult)}
              onFocusFormRequest={handleFocusForm}
            />
          </div>

          {/* Right Area: Compact Embedded Early Birds Application Form or Animated Success State */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center">
            {submissionResult ? (
              <SuccessState
                result={submissionResult}
                applicantName={submittedName}
                onOpenPrivacy={() => setIsPrivacyOpen(true)}
              />
            ) : (
              <EarlyBirdsForm
                nameInputRef={nameInputRef}
                onFocusChange={setIsFormFocused}
                onEmailValidityChange={setIsEmailValid}
                onSuccess={(res, name) => {
                  setSubmittedName(name);
                  setSubmissionResult(res);
                }}
                onOpenPrivacy={() => setIsPrivacyOpen(true)}
              />
            )}
          </div>
        </div>
      </main>

      {/* Quiet Single-Line Footer */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-slate-300 font-medium">AudioFACTORY Early Birds 🕊️</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">v2.0.0</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono">com.audiofactory.app</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <button
            type="button"
            onClick={() => setIsPrivacyOpen(true)}
            className="hover:text-slate-200 transition-colors cursor-pointer"
          >
            Privacy &amp; Data Protection
          </button>
          <Link to="/terms" className="hover:text-slate-200 transition-colors">
            Terms
          </Link>
          <Link to="/account-deletion" className="hover:text-slate-200 transition-colors">
            Data Deletion
          </Link>
          <a
            href="mailto:privacy@audiofactory.app"
            className="hover:text-slate-200 transition-colors"
          >
            privacy@audiofactory.app
          </a>
        </div>
      </footer>

      {/* Privacy Notice Modal */}
      <EarlyBirdsPrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
};

export default EarlyBirdsPage;
