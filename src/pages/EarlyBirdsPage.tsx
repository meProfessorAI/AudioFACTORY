/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY — EARLY BIRDS 🕊️ Single-Screen Animated Early Access Landing Experience
 * Synchronized with AudioFACTORY 7-Day Light Architectural Studio Theme & Skins
 */
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { EarlyBirdsHero } from '../components/early-birds/EarlyBirdsHero';
import { EarlyBirdsForm } from '../components/early-birds/EarlyBirdsForm';
import { SuccessState } from '../components/early-birds/SuccessState';
import { EarlyBirdsPrivacyModal } from '../components/early-birds/EarlyBirdsPrivacyModal';
import { SeoHead } from '../website/components/SeoHead';
import { EarlyBirdSubmissionResult } from '../firebase/submissionClient';
import { initEarlyBirdsAppCheck } from '../firebase/config';
import { trackEarlyBirdsEvent } from '../utils/earlyBirdsAnalytics';
import { useTerminal } from '../../components/terminal/TerminalContext';
import { DaySkinSelector } from '../../components/theme/DaySkinSelector';

export const EarlyBirdsPage: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const { activeSkin } = useTerminal();
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
    <div
      className="relative min-h-screen lg:h-screen w-full max-w-[100vw] overflow-x-hidden lg:overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif] flex flex-col justify-between transition-colors duration-200"
      style={{
        backgroundColor: 'var(--skin-bg-app, #FAF6EF)',
        color: 'var(--skin-text-primary, #292524)',
      }}
    >
      <SeoHead
        title="AudioFACTORY Early Birds — Founding Tester Programme"
        description="Get early access to AudioFACTORY and help shape the future of the platform."
        canonicalPath="/early-birds"
      />

      {/* Ambient Animated Background Gradients reflecting Active Day Skin */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        <motion.div
          className="absolute -top-32 -left-32 w-[34rem] h-[34rem] rounded-full blur-[120px] opacity-25"
          style={{
            background: `radial-gradient(circle, ${activeSkin.palette.accent} 0%, transparent 70%)`,
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
          className="absolute top-1/4 -right-32 w-[32rem] h-[32rem] rounded-full blur-[120px] opacity-35"
          style={{
            background: `radial-gradient(circle, ${activeSkin.palette.accentMuted} 0%, ${activeSkin.palette.bgSubtle} 55%, transparent 75%)`,
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
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `linear-gradient(to right, ${activeSkin.palette.border} 1px, transparent 1px), linear-gradient(to bottom, ${activeSkin.palette.border} 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* Top Navigation Bar (Synchronized with AudioFACTORY Brand & 7-Day Skin Switcher) */}
      <header
        className="relative z-20 w-full border-b backdrop-blur-md transition-colors duration-200"
        style={{
          backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
          borderColor: 'var(--skin-border, #E2E8F0)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Wordmark + Active Day Edition */}
          <Link to="/" className="flex items-center gap-2.5 group focus:outline-none shrink-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs border transition-transform duration-200 group-hover:scale-105"
              style={{
                backgroundColor: 'var(--skin-accent, #0284C7)',
                borderColor: 'var(--skin-border-strong, #CBD5E1)',
                color: 'var(--skin-accent-text, #FFFFFF)',
              }}
            >
              <div className="flex items-center gap-0.5 h-3.5">
                <span className="w-0.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                <span className="w-0.5 h-3.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                <span className="w-0.5 h-2.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                <span className="w-0.5 h-3.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '75ms' }} />
                <span className="w-0.5 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '220ms' }} />
              </div>
            </div>
            <div className="flex flex-col">
              <span
                className="font-['Outfit',sans-serif] text-lg font-extrabold tracking-tight flex items-center"
                style={{ color: 'var(--skin-text-primary, #0F172A)' }}
              >
                Audio<span style={{ color: 'var(--skin-accent, #0284C7)' }}>FACTORY</span>
              </span>
              <span
                className="text-[9px] uppercase font-mono tracking-widest -mt-1 font-semibold"
                style={{ color: 'var(--skin-text-muted, #64748B)' }}
              >
                {activeSkin.dayName} Edition · Early Birds
              </span>
            </div>
          </Link>

          {/* Zone 2: Clean Single-Line Text Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-5 text-xs font-semibold"
            style={{ color: 'var(--skin-text-secondary, #475569)' }}
          >
            <button
              type="button"
              onClick={handleFocusForm}
              className="hover:opacity-80 transition-opacity whitespace-nowrap shrink-0 cursor-pointer font-bold"
              style={{ color: 'var(--skin-accent, #0284C7)' }}
            >
              Early Birds v2.0.0
            </button>
            <button
              type="button"
              onClick={() => setIsPrivacyOpen(true)}
              className="hover:opacity-80 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
            >
              Privacy Notice
            </button>
            <Link
              to="/app"
              className="hover:opacity-80 transition-opacity whitespace-nowrap shrink-0"
            >
              Web Studio
            </Link>
            <Link
              to="/"
              className="hover:opacity-80 transition-opacity whitespace-nowrap shrink-0"
            >
              Main Website
            </Link>
          </nav>

          {/* Zone 3: 7-Day Skin Switcher + Primary Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <DaySkinSelector compact />
            <button
              type="button"
              onClick={handleFocusForm}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-opacity hover:opacity-90 whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
              style={{
                backgroundColor: 'var(--skin-accent, #0284C7)',
                color: 'var(--skin-accent-text, #FFFFFF)',
              }}
            >
              COUNT ME IN →
            </button>
          </div>
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

      {/* Quiet Single-Line Footer reflecting Active Skin */}
      <footer
        className="relative z-20 w-full border-t transition-colors duration-200"
        style={{
          backgroundColor: 'var(--skin-bg-subtle, #F4ECE0)',
          borderColor: 'var(--skin-border, #E6DAC7)',
          color: 'var(--skin-text-muted, #64748B)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className="font-semibold"
              style={{ color: 'var(--skin-text-primary, #0F172A)' }}
            >
              AudioFACTORY Early Birds 🕊️
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">v2.0.0</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">com.audiofactory.app</span>
            <span aria-hidden="true">·</span>
            <span
              className="font-mono font-semibold"
              style={{ color: 'var(--skin-accent, #0284C7)' }}
            >
              {activeSkin.dayName} Edition ({activeSkin.themeName})
            </span>
          </div>

          <div
            className="flex flex-wrap items-center gap-x-4 gap-y-1 font-medium"
            style={{ color: 'var(--skin-text-secondary, #475569)' }}
          >
            <button
              type="button"
              onClick={() => setIsPrivacyOpen(true)}
              className="hover:underline transition-colors cursor-pointer"
            >
              Privacy &amp; Data Protection
            </button>
            <Link to="/terms" className="hover:underline transition-colors">
              Terms
            </Link>
            <Link to="/account-deletion" className="hover:underline transition-colors">
              Data Deletion
            </Link>
            <a
              href="mailto:privacy@audiofactory.app"
              className="hover:underline transition-colors"
            >
              privacy@audiofactory.app
            </a>
          </div>
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
