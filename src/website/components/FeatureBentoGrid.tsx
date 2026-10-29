/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Core Feature Bento Grid
 */
import React from 'react';
import { 
  FileText, 
  Users, 
  Mic2, 
  Sparkles, 
  Music, 
  Download, 
  Cloud, 
  Radio, 
  Layers, 
  ArrowRight,
  Cpu,
  Volume2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const FeatureBentoGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      
      {/* 1. Multi-Speaker Scene Generation (Large 8-col) */}
      <div 
        className="md:col-span-8 border rounded-2xl p-6 sm:p-8 transition-all duration-300 relative overflow-hidden group shadow-xs"
        style={{
          backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
          borderColor: 'var(--skin-border, #E2E8F0)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div 
            className="w-10 h-10 rounded-xl border flex items-center justify-center"
            style={{
              backgroundColor: 'var(--skin-accent-muted, #E0F2FE)',
              borderColor: 'var(--skin-border, #E2E8F0)',
              color: 'var(--skin-accent, #0284C7)'
            }}
          >
            <Users className="w-5 h-5" />
          </div>
          <span 
            className="text-xs font-mono px-2.5 py-1 rounded-full border font-bold"
            style={{
              backgroundColor: 'var(--skin-accent-muted, #E0F2FE)',
              borderColor: 'var(--skin-border, #E2E8F0)',
              color: 'var(--skin-accent, #0284C7)'
            }}
          >
            Flagship Studio Mode
          </span>
        </div>

        <h3 
          className="text-2xl font-bold tracking-tight mb-2"
          style={{ color: 'var(--skin-text-primary, #0F172A)' }}
        >
          Multi-Speaker Dialogue Production
        </h3>
        <p 
          className="text-sm leading-relaxed mb-6 max-w-xl"
          style={{ color: 'var(--skin-text-secondary, #475569)' }}
        >
          Direct complex multi-character conversations with distinct actor voices, natural pause pacing, emotional inflection tags, and seamless timeline orchestration.
        </p>

        {/* Visual Mini Mock */}
        <div 
          className="rounded-xl border p-4 font-mono text-xs space-y-2.5 shadow-2xs"
          style={{
            backgroundColor: 'var(--skin-bg-subtle, #F1F5F9)',
            borderColor: 'var(--skin-border, #E2E8F0)'
          }}
        >
          <div 
            className="flex items-center justify-between pb-2 border-b text-[11px]"
            style={{ borderColor: 'var(--skin-border, #E2E8F0)' }}
          >
            <span className="font-bold" style={{ color: 'var(--skin-accent, #0284C7)' }}>
              SCENE: PRODUCTION BRIEFING (2 ACTORS)
            </span>
            <span style={{ color: 'var(--skin-text-muted, #64748B)' }}>00:38.2</span>
          </div>
          <div 
            className="p-2.5 rounded border flex items-start gap-3"
            style={{
              backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
              borderColor: 'var(--skin-border, #E2E8F0)'
            }}
          >
            <span 
              className="w-6 h-6 rounded-full font-bold flex items-center justify-center text-[10px] shrink-0"
              style={{
                backgroundColor: 'var(--skin-accent, #0284C7)',
                color: 'var(--skin-accent-text, #FFFFFF)'
              }}
            >
              A1
            </span>
            <div>
              <span className="font-semibold" style={{ color: 'var(--skin-accent, #0284C7)' }}>
                Algieba (Director):
              </span>
              <p className="mt-0.5" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>
                &ldquo;All voice buffers are loaded. Initiate the multi-track synthesis protocol now.&rdquo;
              </p>
            </div>
          </div>
          <div 
            className="p-2.5 rounded border flex items-start gap-3"
            style={{
              backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
              borderColor: 'var(--skin-border, #E2E8F0)'
            }}
          >
            <span 
              className="w-6 h-6 rounded-full font-bold flex items-center justify-center text-[10px] shrink-0 bg-emerald-600 text-white"
            >
              A2
            </span>
            <div>
              <span className="font-semibold text-emerald-700">Aoede (Specialist):</span>
              <p className="mt-0.5" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>
                &ldquo;Frequencies locked. All 8 audio buffers ready for export in 24kHz.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. AI Script Generation & Dramatization (4-col) */}
      <div 
        className="md:col-span-4 border rounded-2xl p-6 sm:p-8 transition-all duration-300 flex flex-col justify-between shadow-xs"
        style={{
          backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
          borderColor: 'var(--skin-border, #E2E8F0)'
        }}
      >
        <div>
          <div 
            className="w-10 h-10 rounded-xl border flex items-center justify-center mb-4"
            style={{
              backgroundColor: 'var(--skin-accent-muted, #E0F2FE)',
              borderColor: 'var(--skin-border, #E2E8F0)',
              color: 'var(--skin-accent, #0284C7)'
            }}
          >
            <FileText className="w-5 h-5" />
          </div>
          <h3 
            className="text-xl font-bold tracking-tight mb-2"
            style={{ color: 'var(--skin-text-primary, #0F172A)' }}
          >
            AI Script Dramatization
          </h3>
          <p 
            className="text-sm leading-relaxed"
            style={{ color: 'var(--skin-text-secondary, #475569)' }}
          >
            Turn bullet points or raw transcripts into theatrical voiceover scripts with pacing, suspense, and acoustic direction automatically applied.
          </p>
        </div>
        <div 
          className="mt-6 pt-4 border-t flex items-center justify-between text-xs font-mono font-bold"
          style={{
            borderColor: 'var(--skin-border, #E2E8F0)',
            color: 'var(--skin-accent, #0284C7)'
          }}
        >
          <span>Gemini 2.5 Flash Script Engine</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* 3. Instant Voice Cloning (4-col) */}
      <div 
        className="md:col-span-4 border rounded-2xl p-6 sm:p-8 transition-all duration-300 flex flex-col justify-between shadow-xs"
        style={{
          backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
          borderColor: 'var(--skin-border, #E2E8F0)'
        }}
      >
        <div>
          <div 
            className="w-10 h-10 rounded-xl border flex items-center justify-center mb-4"
            style={{
              backgroundColor: 'var(--skin-accent-muted, #E0F2FE)',
              borderColor: 'var(--skin-border, #E2E8F0)',
              color: 'var(--skin-accent, #0284C7)'
            }}
          >
            <Mic2 className="w-5 h-5" />
          </div>
          <h3 
            className="text-xl font-bold tracking-tight mb-2"
            style={{ color: 'var(--skin-text-primary, #0F172A)' }}
          >
            Zero-Shot Voice Cloning
          </h3>
          <p 
            className="text-sm leading-relaxed"
            style={{ color: 'var(--skin-text-secondary, #475569)' }}
          >
            Upload or record 10 seconds of clear speech to replicate pitch, accent, and timbre instantly for consistent podcast or narrator branding.
          </p>
        </div>
        <div 
          className="mt-6 pt-4 border-t flex items-center justify-between text-xs font-mono font-bold"
          style={{
            borderColor: 'var(--skin-border, #E2E8F0)',
            color: 'var(--skin-accent, #0284C7)'
          }}
        >
          <span>10s Neural Sample Capture</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* 4. Algorithmic BGM Generation & Sidechain (4-col) */}
      <div 
        className="md:col-span-4 border rounded-2xl p-6 sm:p-8 transition-all duration-300 flex flex-col justify-between shadow-xs"
        style={{
          backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
          borderColor: 'var(--skin-border, #E2E8F0)'
        }}
      >
        <div>
          <div 
            className="w-10 h-10 rounded-xl border flex items-center justify-center mb-4"
            style={{
              backgroundColor: 'var(--skin-accent-muted, #E0F2FE)',
              borderColor: 'var(--skin-border, #E2E8F0)',
              color: 'var(--skin-accent, #0284C7)'
            }}
          >
            <Music className="w-5 h-5" />
          </div>
          <h3 
            className="text-xl font-bold tracking-tight mb-2"
            style={{ color: 'var(--skin-text-primary, #0F172A)' }}
          >
            Dynamic BGM & Sidechain Ducking
          </h3>
          <p 
            className="text-sm leading-relaxed"
            style={{ color: 'var(--skin-text-secondary, #475569)' }}
          >
            Generate custom ambient, cinematic, or electronic soundtracks. The master mixer automatically ducks BGM volume when characters speak.
          </p>
        </div>
        <div 
          className="mt-6 pt-4 border-t flex items-center justify-between text-xs font-mono font-bold"
          style={{
            borderColor: 'var(--skin-border, #E2E8F0)',
            color: 'var(--skin-accent, #0284C7)'
          }}
        >
          <span>Smart Ducking Matrix</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* 5. Lossless Audio Export & Cloud Sync (4-col) */}
      <div 
        className="md:col-span-4 border rounded-2xl p-6 sm:p-8 transition-all duration-300 flex flex-col justify-between shadow-xs"
        style={{
          backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
          borderColor: 'var(--skin-border, #E2E8F0)'
        }}
      >
        <div>
          <div 
            className="w-10 h-10 rounded-xl border flex items-center justify-center mb-4"
            style={{
              backgroundColor: 'var(--skin-accent-muted, #E0F2FE)',
              borderColor: 'var(--skin-border, #E2E8F0)',
              color: 'var(--skin-accent, #0284C7)'
            }}
          >
            <Download className="w-5 h-5" />
          </div>
          <h3 
            className="text-xl font-bold tracking-tight mb-2"
            style={{ color: 'var(--skin-text-primary, #0F172A)' }}
          >
            Broadcast-Grade Lossless Export
          </h3>
          <p 
            className="text-sm leading-relaxed"
            style={{ color: 'var(--skin-text-secondary, #475569)' }}
          >
            Export uncompressed 24-bit 48kHz WAV master files, separated stem packages, or web-optimized MP3 tracks with zero generation watermarks.
          </p>
        </div>
        <div 
          className="mt-6 pt-4 border-t flex items-center justify-between text-xs font-mono font-bold"
          style={{
            borderColor: 'var(--skin-border, #E2E8F0)',
            color: 'var(--skin-accent, #0284C7)'
          }}
        >
          <span>24-bit 48kHz WAV &bull; Stems</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

    </div>
  );
};

