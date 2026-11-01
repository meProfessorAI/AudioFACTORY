/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Early Birds — Animated Post-Submission & Duplicate State
 */
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, MailCheck, ShieldCheck } from 'lucide-react';
import { EarlyBirdSubmissionResult } from '../../firebase/submissionClient';

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
      className="relative rounded-2xl p-5 sm:p-6 lg:p-7 backdrop-blur-xl bg-[#0A0E22]/90 border border-cyan-400/40 shadow-[0_0_50px_-12px_rgba(34,211,238,0.3)] flex flex-col justify-between"
    >
      {/* Brand & Status Header */}
      <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
            AF
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-white">
              Audio<span className="text-cyan-400">FACTORY</span>
            </span>
            <span className="block text-[10px] font-mono text-slate-400">
              EARLY BIRDS 🕊️ · v2.0.0
            </span>
          </div>
        </div>

        <span className="text-xs font-mono text-cyan-300 tabular-nums">
          Status: Applied
        </span>
      </div>

      {/* Main Confirmation Body */}
      <div className="my-5 space-y-4">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.1 }}
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-600/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.25)]"
        >
          {isDuplicate ? (
            <MailCheck className="w-7 h-7 text-cyan-300" />
          ) : (
            <CheckCircle2 className="w-7 h-7 text-cyan-300" />
          )}
        </motion.div>

        {isDuplicate ? (
          <div className="space-y-2">
            <h2 className="font-['Outfit',sans-serif] text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              YOU&apos;RE ALREADY ON THE LIST. 🕊️
            </h2>
            <p className="text-sm sm:text-base text-cyan-200 font-medium">
              Looks like you&apos;re already on the Early Birds list. You&apos;re all set.
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Your original Early Birds application for AudioFACTORY v2.0.0 is safely recorded with
              status <span className="font-mono text-white">applied</span>. Keep an eye on your
              inbox—if selected, we&apos;ll send your official Google Play testing invitation.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-mono uppercase tracking-wider text-cyan-300">
              Application Received for {firstName}
            </p>
            <h2 className="font-['Outfit',sans-serif] text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              YOU&apos;RE IN THE FIRST WAVE. 🕊️
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Your Early Birds application has landed. Keep an eye on your inbox. If selected,
              we&apos;ll send your official Google Play testing invitation.
            </p>
          </div>
        )}

        {/* Next-Step Instructions */}
        <div className="rounded-xl bg-[#050711]/80 border border-white/[0.08] p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            <span>What happens next</span>
          </div>
          <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
            <li>
              Our founding team reviews Early Birds applications in waves for{' '}
              <span className="font-mono text-slate-200">com.audiofactory.app</span> (v2.0.0).
            </li>
            <li>
              Your current status is <span className="font-mono text-cyan-300">applied</span>{' '}
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
      <div className="pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>The first wave starts with you.</span>
        </span>
        <button
          type="button"
          onClick={onOpenPrivacy}
          className="text-slate-300 hover:text-cyan-300 underline decoration-white/20 underline-offset-2 transition-colors cursor-pointer"
        >
          Privacy &amp; Data Protection
        </button>
      </div>
    </motion.div>
  );
};
