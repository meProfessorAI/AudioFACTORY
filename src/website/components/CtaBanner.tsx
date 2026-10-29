/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Universal CTA Banner
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Disc, ShieldCheck, Zap } from 'lucide-react';

interface CtaBannerProps {
  title?: string;
  subtitle?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
}

export const CtaBanner: React.FC<CtaBannerProps> = ({
  title = 'Ready to turn words into finished audio?',
  subtitle = 'Join thousands of producers, creators, and game studios building production-ready voice tracks in minutes.',
  primaryCtaText = 'Start Creating Free',
  secondaryCtaText = 'View Pricing Plans'
}) => {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      <div 
        className="relative rounded-3xl border p-8 sm:p-12 lg:p-16 text-center overflow-hidden transition-colors duration-200"
        style={{
          backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
          borderColor: 'var(--skin-border, #E2E8F0)',
          boxShadow: 'var(--skin-shadow, 0 8px 30px rgba(0,0,0,0.06))',
        }}
      >
        
        {/* Day Accent Ambient Glow */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ backgroundColor: 'var(--skin-accent, #0284C7)' }} 
        />
        
        {/* Radial Wave Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#00000008_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div 
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono font-semibold"
            style={{
              backgroundColor: 'var(--skin-accent-muted, #E0F2FE)',
              borderColor: 'var(--skin-border, #E2E8F0)',
              color: 'var(--skin-accent, #0284C7)'
            }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--skin-accent, #0284C7)' }} />
            <span>Instant Access &bull; No Credit Card Required</span>
          </div>

          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight"
            style={{ color: 'var(--skin-text-primary, #0F172A)' }}
          >
            {title}
          </h2>

          <p 
            className="text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-normal"
            style={{ color: 'var(--skin-text-secondary, #475569)' }}
          >
            {subtitle}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-bold rounded-xl shadow-md transition-opacity hover:opacity-90 active:scale-98"
              style={{
                backgroundColor: 'var(--skin-accent, #0284C7)',
                color: 'var(--skin-accent-text, #FFFFFF)'
              }}
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>{primaryCtaText}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 text-base font-semibold rounded-xl border transition-colors hover:opacity-90 shadow-2xs"
              style={{
                backgroundColor: 'var(--skin-bg-subtle, #F1F5F9)',
                borderColor: 'var(--skin-border, #E2E8F0)',
                color: 'var(--skin-text-primary, #0F172A)'
              }}
            >
              <span>{secondaryCtaText}</span>
            </Link>
          </div>

          {/* Value Badges */}
          <div 
            className="pt-6 border-t flex flex-wrap items-center justify-center gap-6 text-xs font-mono"
            style={{
              borderColor: 'var(--skin-border, #E2E8F0)',
              color: 'var(--skin-text-secondary, #475569)'
            }}
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Full Commercial Rights</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Disc className="w-4 h-4" style={{ color: 'var(--skin-accent, #0284C7)' }} />
              <span>Lossless 24-bit 48kHz WAV</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" style={{ color: 'var(--skin-accent, #0284C7)' }} />
              <span>Gemini 2.5 + Soundscape Engine</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

