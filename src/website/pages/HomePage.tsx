import React from 'react';
import { Link } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';
import { AudioPipelineVisualizer } from '../components/AudioPipelineVisualizer';
import { InteractiveVoicePlayer } from '../components/InteractiveVoicePlayer';
import { FeatureBentoGrid } from '../components/FeatureBentoGrid';
import { CtaBanner } from '../components/CtaBanner';
import { useTerminal } from '../../../components/terminal/TerminalContext';
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  Volume2, 
  Layers, 
  Users, 
  Mic, 
  Radio, 
  Sliders, 
  Music, 
  Download, 
  CheckCircle2, 
  Shield, 
  Zap,
  Star,
  Cpu
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { activeSkin } = useTerminal();

  return (
    <div className="space-y-20 sm:space-y-28">
      <SeoHead
        title="AudioFACTORY | Turn words into finished audio."
        description="AI-powered scripts, voices, dialogue and sound — in one production studio. Create multi-speaker scenes, high-fidelity speech, instant voice cloning, and algorithmic BGM."
        canonicalPath="/"
      />

      {/* 1. HERO SECTION */}
      <section className="relative pt-8 sm:pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Day Accent Ambient Glow */}
        <div 
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ backgroundColor: 'var(--skin-accent, #0284C7)' }} 
        />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6 sm:space-y-8">
          
          {/* Studio Release Badge */}
          <div 
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border text-xs font-mono font-semibold shadow-2xs"
            style={{
              backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
              borderColor: 'var(--skin-border, #E2E8F0)',
              color: 'var(--skin-text-primary, #0F172A)'
            }}
          >
            <span 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--skin-accent, #0284C7)' }} 
            />
            <span style={{ color: 'var(--skin-accent, #0284C7)' }} className="font-bold">
              {activeSkin.dayName} Edition • {activeSkin.themeName}
            </span>
            <span className="opacity-40">|</span>
            <span style={{ color: 'var(--skin-text-secondary, #475569)' }}>Gemini 2.5 Flash Audio</span>
          </div>

          {/* Hero Headline */}
          <h1 
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08]"
            style={{ color: 'var(--skin-text-primary, #0F172A)' }}
          >
            Turn words into <br />
            <span style={{ color: 'var(--skin-accent, #0284C7)' }}>
              finished audio.
            </span>
          </h1>

          {/* Supporting Copy */}
          <p 
            className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed font-normal"
            style={{ color: 'var(--skin-text-secondary, #475569)' }}
          >
            AI-powered scripts, voices, multi-character dialogue and soundscapes — in one light architectural studio.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-base font-bold rounded-xl shadow-md transition-opacity hover:opacity-90 active:scale-98"
              style={{
                backgroundColor: 'var(--skin-accent, #0284C7)',
                color: 'var(--skin-accent-text, #FFFFFF)',
              }}
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>Start Creating Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <a
              href="#pipeline"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold rounded-xl border transition-colors hover:opacity-90 shadow-2xs"
              style={{
                backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                borderColor: 'var(--skin-border, #E2E8F0)',
                color: 'var(--skin-text-primary, #0F172A)',
              }}
            >
              <Layers className="w-4 h-4" style={{ color: 'var(--skin-accent, #0284C7)' }} />
              <span>Explore AudioFACTORY</span>
            </a>
          </div>

          {/* Social Proof Metric Strip */}
          <div 
            className="pt-6 sm:pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-mono border-t"
            style={{ 
              borderColor: 'var(--skin-border, #E2E8F0)',
              color: 'var(--skin-text-secondary, #475569)' 
            }}
          >
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>30+</span>
              <span>Neural Personalities</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>&lt;250ms</span>
              <span>Synthesis Latency</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>48kHz</span>
              <span>Lossless 24-Bit WAV</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-700 font-extrabold text-sm">100%</span>
              <span>Commercial Rights</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. VISUAL PRODUCTION PIPELINE (Script → Cast → Generate → Mix → Export) */}
      <section id="pipeline" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AudioPipelineVisualizer />
      </section>

      {/* 3. CORE STUDIO CAPABILITIES (Bento Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span 
              className="text-xs font-mono font-bold uppercase tracking-wider"
              style={{ color: 'var(--skin-accent, #0284C7)' }}
            >
              Complete Feature Suite
            </span>
            <h2 
              className="text-3xl sm:text-4xl font-black tracking-tight mt-1"
              style={{ color: 'var(--skin-text-primary, #0F172A)' }}
            >
              Engineered for Real Audio Workflows
            </h2>
          </div>
          <Link
            to="/features"
            className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
            style={{ color: 'var(--skin-accent, #0284C7)' }}
          >
            <span>View All Detailed Specs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <FeatureBentoGrid />
      </section>

      {/* 4. INTERACTIVE VOICE EXPLORER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InteractiveVoicePlayer />
      </section>

      {/* 5. MULTI-SPEAKER & SCRIPT GENERATION HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="border rounded-2xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xs"
          style={{
            backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
            borderColor: 'var(--skin-border, #E2E8F0)',
            boxShadow: 'var(--skin-shadow, 0 4px 20px -2px rgba(0,0,0,0.05))',
          }}
        >
          
          <div className="lg:col-span-7 space-y-6">
            <div 
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono font-semibold"
              style={{
                backgroundColor: 'var(--skin-accent-muted, #E0F2FE)',
                borderColor: 'var(--skin-border, #E2E8F0)',
                color: 'var(--skin-accent, #0284C7)'
              }}
            >
              <Users className="w-3.5 h-3.5" style={{ color: 'var(--skin-accent, #0284C7)' }} />
              <span>Multi-Character Orchestration</span>
            </div>

            <h2 
              className="text-3xl sm:text-4xl font-black tracking-tight leading-tight"
              style={{ color: 'var(--skin-text-primary, #0F172A)' }}
            >
              Create full podcasts and dramas with casted AI dialogue.
            </h2>

            <p 
              className="text-base leading-relaxed"
              style={{ color: 'var(--skin-text-secondary, #475569)' }}
            >
              Never record a monologue and manually slice it together again. AudioFACTORY allows you to cast independent characters for each dialogue line, insert natural pauses, adjust voice timbres, and synthesize the entire scene with full multichannel stems.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div 
                className="flex items-start gap-3 p-3.5 rounded-xl border shadow-2xs"
                style={{
                  backgroundColor: 'var(--skin-bg-subtle, #F1F5F9)',
                  borderColor: 'var(--skin-border, #E2E8F0)'
                }}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--skin-accent, #0284C7)' }} />
                <div>
                  <h4 className="text-xs font-bold" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>
                    Smart Actor Switching
                  </h4>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                    Assign distinct neural actors line-by-line in a click.
                  </p>
                </div>
              </div>
              <div 
                className="flex items-start gap-3 p-3.5 rounded-xl border shadow-2xs"
                style={{
                  backgroundColor: 'var(--skin-bg-subtle, #F1F5F9)',
                  borderColor: 'var(--skin-border, #E2E8F0)'
                }}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--skin-accent, #0284C7)' }} />
                <div>
                  <h4 className="text-xs font-bold" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>
                    Automated Sidechain Ducking
                  </h4>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                    BGM smoothly dips whenever any speaker talks.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/app"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl shadow-xs transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: 'var(--skin-accent, #0284C7)',
                  color: 'var(--skin-accent-text, #FFFFFF)'
                }}
              >
                <span>Launch Multi-Speaker Studio</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div 
            className="lg:col-span-5 border rounded-xl p-5 font-mono text-xs space-y-3 shadow-2xs"
            style={{
              backgroundColor: 'var(--skin-bg-subtle, #F1F5F9)',
              borderColor: 'var(--skin-border, #E2E8F0)'
            }}
          >
            <div 
              className="flex items-center justify-between border-b pb-2"
              style={{ borderColor: 'var(--skin-border, #E2E8F0)' }}
            >
              <span className="font-bold text-xs" style={{ color: 'var(--skin-accent, #0284C7)' }}>
                MULTISPEAKER SCENE CONSOLE
              </span>
              <span className="text-emerald-700 font-bold text-[10px]">SYNCED</span>
            </div>
            
            <div className="space-y-2">
              <div 
                className="p-3 rounded-lg border shadow-2xs"
                style={{
                  backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                  borderColor: 'var(--skin-border, #E2E8F0)',
                  borderLeftWidth: '3px',
                  borderLeftColor: 'var(--skin-accent, #0284C7)'
                }}
              >
                <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                  <span style={{ color: 'var(--skin-accent, #0284C7)' }}>SPEAKER 01 &bull; Algieba (Narrator)</span>
                  <span style={{ color: 'var(--skin-text-muted, #64748B)' }}>00:00 - 00:06</span>
                </div>
                <p className="text-xs italic" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>
                  &ldquo;The studio went silent as the red light flared to life.&rdquo;
                </p>
              </div>

              <div 
                className="p-3 rounded-lg border shadow-2xs"
                style={{
                  backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                  borderColor: 'var(--skin-border, #E2E8F0)',
                  borderLeftWidth: '3px',
                  borderLeftColor: '#16A34A'
                }}
              >
                <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                  <span className="text-emerald-700">SPEAKER 02 &bull; Rachel (Host)</span>
                  <span style={{ color: 'var(--skin-text-muted, #64748B)' }}>00:07 - 00:14</span>
                </div>
                <p className="text-xs italic" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>
                  &ldquo;We are live. Let’s hear that master stem playback now!&rdquo;
                </p>
              </div>
            </div>

            <div 
              className="pt-2 border-t flex items-center justify-between text-[10px]"
              style={{ 
                borderColor: 'var(--skin-border, #E2E8F0)',
                color: 'var(--skin-text-muted, #64748B)' 
              }}
            >
              <span>Master Compression: Fast Peak</span>
              <span>Export: 48kHz WAV</span>
            </div>
          </div>

        </div>
      </section>

      {/* 6. TESTIMONIALS & CREATOR QUOTES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span 
            className="text-xs font-mono font-bold uppercase tracking-wider"
            style={{ color: 'var(--skin-accent, #0284C7)' }}
          >
            Trusted by Creators
          </span>
          <h2 
            className="text-3xl sm:text-4xl font-black tracking-tight mt-1"
            style={{ color: 'var(--skin-text-primary, #0F172A)' }}
          >
            Built for High-Velocity Audio Production
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            className="border rounded-2xl p-6 space-y-4 shadow-xs"
            style={{
              backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
              borderColor: 'var(--skin-border, #E2E8F0)'
            }}
          >
            <div className="flex items-center gap-1" style={{ color: 'var(--skin-accent, #0284C7)' }}>
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-sm leading-relaxed italic" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
              &ldquo;AudioFACTORY slashed our game dialogue prototyping time from three days to under fifteen minutes. The multi-speaker casting and instant WAV stem export are unmatched.&rdquo;
            </p>
            <div 
              className="pt-3 border-t flex items-center gap-3"
              style={{ borderColor: 'var(--skin-border, #E2E8F0)' }}
            >
              <div 
                className="w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs"
                style={{
                  backgroundColor: 'var(--skin-accent-muted, #E0F2FE)',
                  borderColor: 'var(--skin-border, #E2E8F0)',
                  color: 'var(--skin-accent, #0284C7)'
                }}
              >
                DK
              </div>
              <div>
                <h5 className="text-xs font-bold" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>David K.</h5>
                <span className="text-[11px]" style={{ color: 'var(--skin-text-muted, #64748B)' }}>Lead Sound Designer, Obsidian Void</span>
              </div>
            </div>
          </div>

          <div 
            className="border rounded-2xl p-6 space-y-4 shadow-xs"
            style={{
              backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
              borderColor: 'var(--skin-border, #E2E8F0)'
            }}
          >
            <div className="flex items-center gap-1" style={{ color: 'var(--skin-accent, #0284C7)' }}>
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-sm leading-relaxed italic" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
              &ldquo;The voice cloning and automated BGM sidechain ducking create a polished podcast trailer without touching an external DAW. It just works right in the browser.&rdquo;
            </p>
            <div 
              className="pt-3 border-t flex items-center gap-3"
              style={{ borderColor: 'var(--skin-border, #E2E8F0)' }}
            >
              <div 
                className="w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs"
                style={{
                  backgroundColor: 'var(--skin-accent-muted, #E0F2FE)',
                  borderColor: 'var(--skin-border, #E2E8F0)',
                  color: 'var(--skin-accent, #0284C7)'
                }}
              >
                SL
              </div>
              <div>
                <h5 className="text-xs font-bold" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>Sarah Lin</h5>
                <span className="text-[11px]" style={{ color: 'var(--skin-text-muted, #64748B)' }}>Executive Producer, TechPulse Daily</span>
              </div>
            </div>
          </div>

          <div 
            className="border rounded-2xl p-6 space-y-4 shadow-xs"
            style={{
              backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
              borderColor: 'var(--skin-border, #E2E8F0)'
            }}
          >
            <div className="flex items-center gap-1" style={{ color: 'var(--skin-accent, #0284C7)' }}>
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-sm leading-relaxed italic" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
              &ldquo;Having the Lifetime Pass gives our agency permanent unlimited audio generations. The combination of Gemini 2.5 and soundscape engine makes it the ultimate audio workstation.&rdquo;
            </p>
            <div 
              className="pt-3 border-t flex items-center gap-3"
              style={{ borderColor: 'var(--skin-border, #E2E8F0)' }}
            >
              <div 
                className="w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs"
                style={{
                  backgroundColor: 'var(--skin-accent-muted, #E0F2FE)',
                  borderColor: 'var(--skin-border, #E2E8F0)',
                  color: 'var(--skin-accent, #0284C7)'
                }}
              >
                MR
              </div>
              <div>
                <h5 className="text-xs font-bold" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>Marc Rossi</h5>
                <span className="text-[11px]" style={{ color: 'var(--skin-text-muted, #64748B)' }}>Creative Director, Apex Media Studio</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. UNIVERSAL CTA BANNER */}
      <CtaBanner
        title="Turn words into finished audio today."
        subtitle="Start with 3 free generations daily as a guest, or upgrade for unlimited high-fidelity studio access."
        primaryCtaText="Start Creating Free"
        secondaryCtaText="Explore Pricing Plans"
      />
    </div>
  );
};

