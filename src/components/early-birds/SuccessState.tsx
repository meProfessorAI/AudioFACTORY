/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Early Birds — Animated Post-Submission & Duplicate State
 * Synchronized with AudioFACTORY 7-Day Light Architectural Studio Theme & Skins
 */
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, MailCheck, ShieldCheck } from 'lucide-react';
import { EarlyBirdSubmissionResult } from '../../firebase/submissionClient';
import { useTerminal } from '../../../components/terminal/TerminalContext';

interface SuccessStateProps {
  result: EarlyBirdSubmissionResult;
  applicantName: string;
  onOpenPrivacy: () => void;
}

export const SuccessState: React.FC<SuccessStateProps> = ({
  result,
  applicantName,
  onOpenPrivacy,
}) => {
  const { activeSkin } = useTerminal();
  const isDuplicate = result.status === 'duplicate';
  const firstName =
    result.firstName || applicantName.trim().split(' ')[0] || 'Explorer';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      role="status"
      aria-live="polite"
      className="relative rounded-2xl p-5 sm:p-6 lg:p-7 backdrop-blur-xl border flex flex-col justify-between transition-colors duration-200"
      style={{
        backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
        borderColor: 'var(--skin-border-strong, #94A3B8)',
        boxShadow: 'var(--skin-shadow)',
      }}
    >
      {/* Brand & Status Header */}
      <div
        className="flex items-center justify-between gap-2 pb-4 border-b"
        style={{ borderColor: 'var(--skin-border, #CBD5E1)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-xs border"
            style={{
              backgroundColor: 'var(--skin-accent, #0284C7)',
              color: 'var(--skin-accent-text, #FFFFFF)',
              borderColor: 'var(--skin-border-strong, #94A3B8)',
            }}
          >
            AF
          </div>
          <div>
            <span
              className="text-sm font-extrabold tracking-tight"
              style={{ color: 'var(--skin-text-primary, #0F172A)' }}
            >
              Audio<span style={{ color: 'var(--skin-accent, #0284C7)' }}>FACTORY</span>
            </span>
            <span
              className="block text-[10px] font-mono"
              style={{ color: 'var(--skin-text-muted, #64748B)' }}
            >
              EARLY BIRDS 🕊️ · v2.0.0 · {activeSkin.dayName}
            </span>
          </div>
        </div>

        <span
          className="text-xs font-mono font-bold tabular-nums"
          style={{ color: 'var(--skin-accent, #0284C7)' }}
        >
          Status: Applied
        </span>
      </div>

      {/* Main Confirmation Body */}
      <div className="my-5 space-y-4">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.1 }}
          className="w-14 h-14 rounded-2xl border flex items-center justify-center shadow-xs"
          style={{
            backgroundColor: 'var(--skin-accent-muted, #E0F2FE)',
            borderColor: 'var(--skin-accent, #0284C7)',
            color: 'var(--skin-accent, #0284C7)',
          }}
        >
          {isDuplicate ? (
            <MailCheck className="w-7 h-7" />
          ) : (
            <CheckCircle2 className="w-7 h-7" />
          )}
        </motion.div>

        {isDuplicate ? (
          <div className="space-y-2">
            <h2
              className="font-['Outfit',sans-serif] text-2xl sm:text-3xl font-extrabold tracking-tight"
              style={{ color: 'var(--skin-text-primary, #0F172A)' }}
            >
              YOU&apos;RE ALREADY ON THE LIST. 🕊️
            </h2>
            <p
              className="text-sm sm:text-base font-semibold"
              style={{ color: 'var(--skin-accent, #0284C7)' }}
            >
              Looks like you&apos;re already on the Early Birds list. You&apos;re all set.
            </p>
            <p
              className="text-xs sm:text-sm leading-relaxed"
              style={{ color: 'var(--skin-text-secondary, #475569)' }}
            >
              Your original Early Birds application for AudioFACTORY v2.0.0 is safely recorded with
              status{' '}
              <span
                className="font-mono font-bold"
                style={{ color: 'var(--skin-text-primary, #0F172A)' }}
              >
                applied
              </span>
              . Keep an eye on your inbox—if selected, we&apos;ll send your official Google Play
              testing invitation.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p
              className="text-xs font-mono font-bold uppercase tracking-wider"
              style={{ color: 'var(--skin-accent, #0284C7)' }}
            >
              Application Received for {firstName}
            </p>
            <h2
              className="font-['Outfit',sans-serif] text-2xl sm:text-3xl font-extrabold tracking-tight"
              style={{ color: 'var(--skin-text-primary, #0F172A)' }}
            >
              YOU&apos;RE IN THE FIRST WAVE. 🕊️
            </h2>
            <p
              className="text-xs sm:text-sm leading-relaxed"
              style={{ color: 'var(--skin-text-secondary, #475569)' }}
            >
              Your Early Birds application has landed. Keep an eye on your inbox. If selected,
              we&apos;ll send your official Google Play testing invitation.
            </p>
          </div>
        )}

        {/* Next-Step Instructions */}
        <div
          className="rounded-xl border p-3.5 space-y-2"
          style={{
            backgroundColor: 'var(--skin-bg-subtle, #F1F5F9)',
            borderColor: 'var(--skin-border, #CBD5E1)',
          }}
        >
          <div
            className="flex items-center gap-2 text-xs font-bold"
            style={{ color: 'var(--skin-text-primary, #0F172A)' }}
          >
            <Sparkles
              className="w-3.5 h-3.5 shrink-0"
              style={{ color: 'var(--skin-accent, #0284C7)' }}
            />
            <span>What happens next</span>
          </div>
          <ol
            className="text-xs space-y-1.5 list-decimal list-inside leading-relaxed"
            style={{ color: 'var(--skin-text-secondary, #475569)' }}
          >
            <li>
              Our founding team reviews Early Birds applications in waves for{' '}
              <span
                className="font-mono font-semibold"
                style={{ color: 'var(--skin-text-primary, #0F172A)' }}
              >
                com.audiofactory.app
              </span>{' '}
              (v2.0.0).
            </li>
            <li>
              Your current status is{' '}
              <span
                className="font-mono font-bold"
                style={{ color: 'var(--skin-accent, #0284C7)' }}
              >
                applied
              </span>{' '}
              (selection pending).
            </li>
            <li>
              Selected testers receive an official Google Play testing opt-in link at the Google Play
              email address provided.
            </li>
          </ol>
        </div>
      </div>

      {/* Footer Microcopy */}
      <div
        className="pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-[11px]"
        style={{
          borderColor: 'var(--skin-border, #CBD5E1)',
          color: 'var(--skin-text-muted, #64748B)',
        }}
      >
        <span className="flex items-center gap-1.5">
          <ShieldCheck
            className="w-3.5 h-3.5"
            style={{ color: 'var(--skin-accent, #0284C7)' }}
          />
          <span>The first wave starts with you.</span>
        </span>
        <button
          type="button"
          onClick={onOpenPrivacy}
          className="font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer"
          style={{ color: 'var(--skin-accent, #0284C7)' }}
        >
          Privacy &amp; Data Protection
        </button>
      </div>
    </motion.div>
  );
};
