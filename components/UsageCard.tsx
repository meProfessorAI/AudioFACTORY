/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Authoritative Usage Card
 */
import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Crown, 
  Clock, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle,
  Infinity as InfinityIcon
} from 'lucide-react';
import { useGenerationQuota } from '../src/hooks/useGenerationQuota';
import { useEntitlementStore } from '../src/store/useEntitlementStore';
import { useFirebase } from '../services/firebaseContext';
import { useTerminal } from './terminal/TerminalContext';
import { PLANS } from '../shared/plans';

export interface UsageCardProps {
  className?: string;
  onOpenUpgrade?: () => void;
  compact?: boolean;
}

export const UsageCard: React.FC<UsageCardProps> = ({ 
  className = '', 
  onOpenUpgrade,
  compact = false 
}) => {
  const {
    plan,
    planName,
    isGuest,
    isFree,
    isPro,
    isUnlimited,
    usedToday,
    dailyQuota,
    remainingQuota,
    isExhausted,
    openUpgradeModal,
  } = useGenerationQuota();

  const { entitlement } = useEntitlementStore();
  const { loginGoogle } = useFirebase();
  const { isTerminalMode } = useTerminal();

  // Calculate live countdown to 00:00 UTC
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const utcTomorrow = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
        0, 0, 0, 0
      ));
      const diffMs = utcTomorrow.getTime() - now.getTime();
      if (diffMs <= 0) {
        setTimeUntilReset('0h 0m');
        return;
      }
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setTimeUntilReset(`${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUpgradeClick = () => {
    if (onOpenUpgrade) {
      onOpenUpgrade();
    } else {
      openUpgradeModal();
    }
  };

  // Percentage calculation
  const percentage = isUnlimited 
    ? 100 
    : Math.min(100, Math.round((usedToday / Math.max(1, dailyQuota)) * 100));
  
  const isNearLimit = !isUnlimited && percentage >= 80 && percentage < 100;
  const isAtLimit = !isUnlimited && percentage >= 100;

  // Exact prompt requirement strings:
  // Guest: "2 / 3 generations today"
  // Free: "7 / 10 generations today"
  // Paid: show configured plan allowance
  let usageHeadline = '';
  if (isUnlimited) {
    usageHeadline = `Unlimited generations (${PLANS[entitlement.plan]?.name || planName})`;
  } else {
    usageHeadline = `${usedToday} / ${dailyQuota} generations today`;
  }

  return (
    <div 
      className={`rounded-xl border p-4 transition-all shadow-xs ${className}`}
      style={{
        backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
        borderColor: 'var(--skin-border, #E8D5C2)',
        color: 'var(--skin-text-primary, #431407)'
      }}
    >
      {/* Top row: Headline & Badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {isUnlimited ? (
            <div 
              className="p-1.5 rounded-lg"
              style={{
                backgroundColor: 'var(--skin-accent-muted, #FFEDD5)',
                color: 'var(--skin-accent, #C2410C)'
              }}
            >
              <Crown className="w-4 h-4" />
            </div>
          ) : (
            <div 
              className="p-1.5 rounded-lg"
              style={{
                backgroundColor: isAtLimit ? 'rgba(239, 68, 68, 0.15)' : 'var(--skin-bg-subtle, #F6EDE2)',
                color: isAtLimit ? '#dc2626' : 'var(--skin-accent, #C2410C)'
              }}
            >
              <Zap className="w-4 h-4" />
            </div>
          )}
          <div>
            <span 
              className="text-[11px] font-mono uppercase tracking-wider block"
              style={{ color: 'var(--skin-text-muted, #9A5B32)' }}
            >
              {isUnlimited ? 'Active Plan Allowance' : "Today's Usage"}
            </span>
            <h4 className="text-sm font-bold tracking-tight">
              {usageHeadline}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isUnlimited ? (
            <span 
              className="px-2 py-0.5 rounded-full text-[10px] font-extrabold border flex items-center gap-1"
              style={{
                backgroundColor: 'var(--skin-accent-muted, #FFEDD5)',
                color: 'var(--skin-accent, #C2410C)',
                borderColor: 'var(--skin-border, #E8D5C2)'
              }}
            >
              <InfinityIcon className="w-3 h-3" />
              Unlimited
            </span>
          ) : (
            <span 
              className="px-2 py-0.5 rounded-full text-[10px] font-extrabold border"
              style={{
                backgroundColor: isAtLimit ? 'rgba(239, 68, 68, 0.1)' : 'var(--skin-bg-subtle, #F6EDE2)',
                color: isAtLimit ? '#dc2626' : 'var(--skin-text-secondary, #7C2D12)',
                borderColor: isAtLimit ? 'rgba(239, 68, 68, 0.25)' : 'var(--skin-border, #E8D5C2)'
              }}
            >
              {remainingQuota} remaining
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar (for limited quotas) */}
      {!isUnlimited && (
        <div className="my-3">
          <div 
            className="w-full h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)' }}
          >
            <div 
              className="h-full transition-all duration-300 rounded-full"
              style={{ 
                width: `${percentage}%`,
                backgroundColor: isAtLimit ? '#dc2626' : isNearLimit ? '#d97706' : 'var(--skin-accent, #C2410C)'
              }}
            />
          </div>
          
          <div 
            className="flex items-center justify-between text-[11px] font-mono mt-1.5"
            style={{ color: 'var(--skin-text-muted, #9A5B32)' }}
          >
            <span>
              {percentage}% used
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Resets tomorrow {timeUntilReset ? `(in ${timeUntilReset})` : ''}</span>
            </span>
          </div>
        </div>
      )}

      {/* Unlimited Active Details */}
      {isUnlimited && (
        <div className="my-2.5 flex items-center justify-between text-xs">
          <span 
            className="flex items-center gap-1.5"
            style={{ color: 'var(--skin-text-secondary, #7C2D12)' }}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Uncapped Gemini 2.5 & ElevenLabs generation
          </span>
          <span 
            className="font-mono text-[11px]"
            style={{ color: 'var(--skin-text-muted, #9A5B32)' }}
          >
            {usedToday} rendered today
          </span>
        </div>
      )}

      {/* 80% subtle upgrade prompt: when user reaches 80% of quota */}
      {isNearLimit && !isAtLimit && (
        <div className={`mt-3 p-2.5 rounded-lg border text-xs flex items-center justify-between gap-3 animate-in fade-in ${
          isTerminalMode
            ? 'bg-amber-950/20 border-amber-800/40 text-amber-300 font-mono'
            : 'bg-amber-50 border-amber-200 text-amber-900 font-sans'
        }`}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-[11px] leading-tight">
              You've used 80% of your daily generations. Upgrade to Pro for unlimited audio synthesis.
            </span>
          </div>
          <button
            onClick={handleUpgradeClick}
            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-md text-[11px] shrink-0 transition-colors shadow-2xs flex items-center gap-1"
          >
            <span>Upgrade</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 100% quota reached callout banner */}
      {isAtLimit && (
        <div className={`mt-3 p-2.5 rounded-lg border text-xs flex items-center justify-between gap-3 animate-in fade-in ${
          isTerminalMode
            ? 'bg-rose-950/20 border-rose-800/40 text-rose-300 font-mono'
            : 'bg-rose-50 border-rose-200 text-rose-950 font-sans'
        }`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="text-[11px] leading-tight font-medium">
              You're out of generations for today. Resets at 00:00 UTC.
            </span>
          </div>
          <button
            onClick={handleUpgradeClick}
            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-md text-[11px] shrink-0 transition-colors shadow-2xs flex items-center gap-1"
          >
            <span>Upgrade to Pro</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Guest encouragement notice (if 0 or low usage) */}
      {isGuest && !isNearLimit && !isAtLimit && !compact && (
        <div className="mt-2.5 pt-2 border-t border-zinc-200/50 dark:border-zinc-700/40 flex items-center justify-between text-[11px]">
          <span className={isTerminalMode ? 'text-[#8B949E]' : 'text-zinc-500'}>
            Sign in with Google to get 10 generations/day free.
          </span>
          <button
            onClick={loginGoogle}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold hover:underline"
          >
            Sign in
          </button>
        </div>
      )}
    </div>
  );
};
