import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';
import { CtaBanner } from '../components/CtaBanner';
import { PLANS } from '../../../shared/plans';
import { useTerminal } from '../../../components/terminal/TerminalContext';
import { 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  HelpCircle, 
  Crown, 
  Infinity, 
  ArrowRight,
  Disc,
  Clock,
  Layers,
  Users
} from 'lucide-react';

export const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const { activeSkin } = useTerminal();

  // Derive plans directly from authoritative PLANS config
  const guestPlan = PLANS.guest;
  const freePlan = PLANS.free;
  const proMonthly = PLANS.pro_monthly;
  const proAnnual = PLANS.pro_annual;
  const lifetime = PLANS.lifetime;

  return (
    <div className="space-y-16 py-8 sm:py-12">
      <SeoHead
        title="Pricing & Studio Plans | AudioFACTORY"
        description="Choose the ideal AudioFACTORY plan: Creator Starter with daily free quotas, Pro Monthly & Annual with unlimited generations, or Lifetime Studio Pass with permanent access."
        canonicalPath="/pricing"
      />

      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div 
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-mono font-semibold"
          style={{
            backgroundColor: 'var(--skin-accent-muted, #E0F2FE)',
            borderColor: 'var(--skin-border, #E2E8F0)',
            color: 'var(--skin-accent, #0284C7)'
          }}
        >
          <Crown className="w-3.5 h-3.5" style={{ color: 'var(--skin-accent, #0284C7)' }} />
          <span>{activeSkin.dayName} Edition &bull; Transparent Creator Pricing</span>
        </div>
        
        <h1 
          className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight"
          style={{ color: 'var(--skin-text-primary, #0F172A)' }}
        >
          Simple plans for <br />
          <span style={{ color: 'var(--skin-accent, #0284C7)' }}>serious audio production.</span>
        </h1>
        
        <p 
          className="text-base sm:text-lg max-w-2xl mx-auto"
          style={{ color: 'var(--skin-text-secondary, #475569)' }}
        >
          Start creating for free immediately without a credit card. Upgrade whenever you need unlimited generations, instant voice cloning, and priority queues.
        </p>

        {/* Monthly / Annual Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <span 
            className="text-xs font-bold"
            style={{ color: billingCycle === 'monthly' ? 'var(--skin-text-primary, #0F172A)' : 'var(--skin-text-muted, #64748B)' }}
          >
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className="w-14 h-7 rounded-full p-1 relative transition-colors focus:outline-none border"
            style={{
              backgroundColor: 'var(--skin-bg-subtle, #F1F5F9)',
              borderColor: 'var(--skin-border, #E2E8F0)'
            }}
            aria-label="Toggle Billing Cycle"
          >
            <div
              className={`w-5 h-5 rounded-full transition-transform ${
                billingCycle === 'annual' ? 'translate-x-7' : 'translate-x-0'
              }`}
              style={{ backgroundColor: 'var(--skin-accent, #0284C7)' }}
            />
          </button>
          <div className="flex items-center gap-2">
            <span 
              className="text-xs font-bold"
              style={{ color: billingCycle === 'annual' ? 'var(--skin-text-primary, #0F172A)' : 'var(--skin-text-muted, #64748B)' }}
            >
              Annual
            </span>
            <span 
              className="px-2 py-0.5 rounded-full text-xs font-mono font-bold border"
              style={{
                backgroundColor: 'var(--skin-accent-muted, #E0F2FE)',
                borderColor: 'var(--skin-border, #E2E8F0)',
                color: 'var(--skin-accent, #0284C7)'
              }}
            >
              Save 35%
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* 1. Free / Creator Starter */}
          <div 
            className="border rounded-2xl p-6 sm:p-7 flex flex-col justify-between relative shadow-xs"
            style={{
              backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
              borderColor: 'var(--skin-border, #E2E8F0)'
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--skin-text-muted, #64748B)' }}>
                  {freePlan.badge}
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>
                Free Access
              </h3>
              <p className="text-xs mt-1 mb-4 leading-relaxed" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                Ideal for testing out monologues and exploring the multi-speaker studio.
              </p>

              <div className="flex items-baseline gap-1 my-4">
                <span className="text-4xl font-black" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>$0</span>
                <span className="text-xs font-mono" style={{ color: 'var(--skin-text-muted, #64748B)' }}>/ forever</span>
              </div>

              {/* Free Quotas */}
              <div 
                className="p-3 rounded-lg border space-y-1 text-xs font-mono mb-6"
                style={{
                  backgroundColor: 'var(--skin-bg-subtle, #F1F5F9)',
                  borderColor: 'var(--skin-border, #E2E8F0)'
                }}
              >
                <div className="flex justify-between" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                  <span>Guest Pass:</span>
                  <span className="font-bold" style={{ color: 'var(--skin-accent, #0284C7)' }}>
                    {guestPlan.dailyGenerations} gens/day
                  </span>
                </div>
                <div className="flex justify-between" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                  <span>Free Account:</span>
                  <span className="font-bold text-emerald-700">{freePlan.dailyGenerations} gens/day</span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Standard Gemini 2.5 voice models</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Multi-speaker scenes (up to 15 lines)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Dynamic BGM generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Lossless WAV & MP3 exports</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>IndexedDB persistent storage</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                to="/app"
                className="w-full py-3 text-center text-xs font-bold rounded-xl block border transition-colors hover:opacity-90 shadow-2xs"
                style={{
                  backgroundColor: 'var(--skin-bg-subtle, #F1F5F9)',
                  borderColor: 'var(--skin-border, #E2E8F0)',
                  color: 'var(--skin-text-primary, #0F172A)'
                }}
              >
                Start Free in Studio
              </Link>
            </div>
          </div>

          {/* 2. Pro Monthly */}
          <div 
            className="border rounded-2xl p-6 sm:p-7 flex flex-col justify-between relative shadow-xs"
            style={{
              backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
              borderColor: 'var(--skin-border, #E2E8F0)'
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--skin-accent, #0284C7)' }}>
                  {proMonthly.badge}
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>
                {proMonthly.name}
              </h3>
              <p className="text-xs mt-1 mb-4 leading-relaxed" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                Full studio access with zero daily generation caps for high-output creators.
              </p>

              <div className="flex items-baseline gap-1 my-4">
                <span className="text-4xl font-black" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>
                  ${proMonthly.priceUsd}
                </span>
                <span className="text-xs font-mono" style={{ color: 'var(--skin-text-muted, #64748B)' }}>/ month</span>
              </div>

              <div 
                className="p-3 rounded-lg border text-xs font-mono font-bold mb-6 flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--skin-accent-muted, #E0F2FE)',
                  borderColor: 'var(--skin-border, #E2E8F0)',
                  color: 'var(--skin-accent, #0284C7)'
                }}
              >
                <Infinity className="w-4 h-4" style={{ color: 'var(--skin-accent, #0284C7)' }} />
                <span>Unlimited Daily Speech Gens</span>
              </div>

              <ul className="space-y-2.5 text-xs" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--skin-accent, #0284C7)' }} />
                  <span>Unlimited generations (No quotas)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--skin-accent, #0284C7)' }} />
                  <span>All Gemini & ElevenLabs voices</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--skin-accent, #0284C7)' }} />
                  <span>Zero-shot instant voice cloning</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--skin-accent, #0284C7)' }} />
                  <span>Multi-speaker scenes up to 100 lines</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--skin-accent, #0284C7)' }} />
                  <span>Fastest priority synthesis queues</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                to="/profile"
                className="w-full py-3 text-center text-xs font-bold rounded-xl block shadow-xs transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: 'var(--skin-accent, #0284C7)',
                  color: 'var(--skin-accent-text, #FFFFFF)'
                }}
              >
                Request Early Access
              </Link>
            </div>
          </div>

          {/* 3. Pro Annual (Highlighted) */}
          <div 
            className="border-2 rounded-2xl p-6 sm:p-7 flex flex-col justify-between relative shadow-lg scale-[1.02]"
            style={{
              backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
              borderColor: 'var(--skin-accent, #0284C7)'
            }}
          >
            <div 
              className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-mono font-black uppercase tracking-wider shadow-xs"
              style={{
                backgroundColor: 'var(--skin-accent, #0284C7)',
                color: 'var(--skin-accent-text, #FFFFFF)'
              }}
            >
              Most Popular &bull; Save 35%
            </div>

            <div>
              <div className="flex items-center justify-between mb-3 mt-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--skin-accent, #0284C7)' }}>
                  Annual Pass
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>
                {proAnnual.name}
              </h3>
              <p className="text-xs mt-1 mb-4 leading-relaxed" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                Full unlimited studio access with maximum discount savings billed annually.
              </p>

              <div className="flex items-baseline gap-1 my-4">
                <span className="text-4xl font-black" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>
                  ${proAnnual.priceUsd}
                </span>
                <span className="text-xs font-mono" style={{ color: 'var(--skin-text-muted, #64748B)' }}>
                  / year (~$12.40/mo)
                </span>
              </div>

              <div 
                className="p-3 rounded-lg border text-xs font-mono font-bold mb-6 flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--skin-accent-muted, #E0F2FE)',
                  borderColor: 'var(--skin-border, #E2E8F0)',
                  color: 'var(--skin-accent, #0284C7)'
                }}
              >
                <Zap className="w-4 h-4 fill-current" style={{ color: 'var(--skin-accent, #0284C7)' }} />
                <span>Unlimited Gens + Priority Server Queue</span>
              </div>

              <ul className="space-y-2.5 text-xs" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--skin-accent, #0284C7)' }} />
                  <span className="font-semibold">All Pro features included</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--skin-accent, #0284C7)' }} />
                  <span>Unlimited generations all year</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--skin-accent, #0284C7)' }} />
                  <span>Instant voice cloning engine</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--skin-accent, #0284C7)' }} />
                  <span>Lossless 48kHz WAV master stems</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--skin-accent, #0284C7)' }} />
                  <span>Google Play & Web synchronized billing</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                to="/profile"
                className="w-full py-3 text-center text-xs font-black rounded-xl block shadow-xs transition-opacity hover:opacity-90 active:scale-98"
                style={{
                  backgroundColor: 'var(--skin-accent, #0284C7)',
                  color: 'var(--skin-accent-text, #FFFFFF)'
                }}
              >
                Request Early Access
              </Link>
            </div>
          </div>

          {/* 4. Lifetime Studio Pass */}
          <div 
            className="border rounded-2xl p-6 sm:p-7 flex flex-col justify-between relative shadow-xs"
            style={{
              backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
              borderColor: 'var(--skin-border, #E2E8F0)'
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">
                  {lifetime.badge}
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>
                {lifetime.name}
              </h3>
              <p className="text-xs mt-1 mb-4 leading-relaxed" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                One single payment. Permanent studio entitlement with all future voice models.
              </p>

              <div className="flex items-baseline gap-1 my-4">
                <span className="text-4xl font-black" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>
                  ${lifetime.priceUsd}
                </span>
                <span className="text-xs font-mono" style={{ color: 'var(--skin-text-muted, #64748B)' }}>/ one-time</span>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800 font-bold mb-6 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Never Pay Again &bull; Permanent Access</span>
              </div>

              <ul className="space-y-2.5 text-xs" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Permanent unlimited generations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>All present and future voice models</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Lifetime commercial broadcasting license</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Direct VIP developer support</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                to="/profile"
                className="w-full py-3 text-center text-xs font-bold rounded-xl block border transition-colors hover:opacity-90 shadow-2xs"
                style={{
                  backgroundColor: 'var(--skin-bg-subtle, #F1F5F9)',
                  borderColor: 'var(--skin-border, #E2E8F0)',
                  color: 'var(--skin-text-primary, #0F172A)'
                }}
              >
                Request Early Access
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="border rounded-2xl p-6 sm:p-10 shadow-xs space-y-6"
          style={{
            backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
            borderColor: 'var(--skin-border, #E2E8F0)'
          }}
        >
          <h3 
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--skin-text-primary, #0F172A)' }}
          >
            Detailed Plan Comparison Matrix
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b font-mono" style={{ borderColor: 'var(--skin-border, #E2E8F0)', color: 'var(--skin-text-muted, #64748B)' }}>
                  <th className="py-3 px-4 font-bold">Feature</th>
                  <th className="py-3 px-4 font-bold">Guest</th>
                  <th className="py-3 px-4 font-bold">Free Account</th>
                  <th className="py-3 px-4 font-bold" style={{ color: 'var(--skin-accent, #0284C7)' }}>Pro (Monthly/Annual)</th>
                  <th className="py-3 px-4 font-bold text-emerald-700">Lifetime Pass</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--skin-border, #E2E8F0)' }}>
                <tr>
                  <td className="py-3 px-4 font-medium" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>Daily Speech Generations</td>
                  <td className="py-3 px-4 font-mono" style={{ color: 'var(--skin-text-secondary, #475569)' }}>3 / day</td>
                  <td className="py-3 px-4 font-mono" style={{ color: 'var(--skin-text-secondary, #475569)' }}>10 / day</td>
                  <td className="py-3 px-4 font-mono font-bold" style={{ color: 'var(--skin-accent, #0284C7)' }}>Unlimited</td>
                  <td className="py-3 px-4 font-mono text-emerald-700 font-bold">Unlimited (Lifetime)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>Voice Models Available</td>
                  <td className="py-3 px-4" style={{ color: 'var(--skin-text-secondary, #475569)' }}>Gemini Standard</td>
                  <td className="py-3 px-4" style={{ color: 'var(--skin-text-secondary, #475569)' }}>Gemini + ElevenLabs</td>
                  <td className="py-3 px-4 font-bold" style={{ color: 'var(--skin-accent, #0284C7)' }}>All 30+ Voices + Custom</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">All Models + Future Additions</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>Instant Voice Cloning</td>
                  <td className="py-3 px-4 text-zinc-400">&times;</td>
                  <td className="py-3 px-4 text-zinc-400">&times;</td>
                  <td className="py-3 px-4 font-bold" style={{ color: 'var(--skin-accent, #0284C7)' }}>Included</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">Included</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>Max Dialogue Lines / Scene</td>
                  <td className="py-3 px-4 font-mono" style={{ color: 'var(--skin-text-secondary, #475569)' }}>6 lines</td>
                  <td className="py-3 px-4 font-mono" style={{ color: 'var(--skin-text-secondary, #475569)' }}>15 lines</td>
                  <td className="py-3 px-4 font-mono font-bold" style={{ color: 'var(--skin-accent, #0284C7)' }}>100 lines</td>
                  <td className="py-3 px-4 font-mono text-emerald-700 font-bold">100 lines</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>Lossless 24-bit 48kHz WAV Export</td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                  <td className="py-3 px-4"><Check className="w-4 h-4" style={{ color: 'var(--skin-accent, #0284C7)' }} /></td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>Client Persistence Vault</td>
                  <td className="py-3 px-4 text-zinc-400">&times;</td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                  <td className="py-3 px-4"><Check className="w-4 h-4" style={{ color: 'var(--skin-accent, #0284C7)' }} /></td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>Commercial Usage Rights</td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                  <td className="py-3 px-4"><Check className="w-4 h-4" style={{ color: 'var(--skin-accent, #0284C7)' }} /></td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CtaBanner
        title="Ready to upgrade your studio?"
        subtitle="Start with our free tiers or jump straight into unlimited Pro production."
        primaryCtaText="Launch Studio Free"
        secondaryCtaText="Upgrade to Pro"
      />
    </div>
  );
};

