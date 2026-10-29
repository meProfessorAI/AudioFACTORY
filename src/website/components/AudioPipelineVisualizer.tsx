/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Production Pipeline Visualizer
 * Script → Cast → Generate → Mix → Export
 */
import React, { useState } from 'react';
import { 
  FileText, 
  Users, 
  Sparkles, 
  Sliders, 
  Download, 
  CheckCircle2, 
  Play, 
  Volume2, 
  Music,
  Cpu,
  Layers,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface PipelineStep {
  id: string;
  stepNumber: string;
  name: string;
  tagline: string;
  description: string;
  icon: React.ElementType;
  color: string;
  badge: string;
  mockDetails: {
    label: string;
    items: string[];
  };
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 'script',
    stepNumber: '01',
    name: 'Script',
    tagline: 'AI Scriptwriting & Dramatization',
    description: 'Transform rough notes, story outlines, or raw dialogue into punchy, character-delineated scripts with auto-inserted emotional cues and SSML performance directions.',
    icon: FileText,
    color: 'from-amber-400 to-amber-600',
    badge: 'Gemini 2.5 Flash Script Engine',
    mockDetails: {
      label: 'Script Analysis & Cue Parsing',
      items: [
        '[Director: Breath intake before punchline]',
        'Marcus (Trailer Voice): "In a world without deadlines..."',
        'Elena (Bright): "Wait, did you check the commit logs?"',
        '[Auto-calculated target duration: 00:42.5s]'
      ]
    }
  },
  {
    id: 'cast',
    stepNumber: '02',
    name: 'Cast',
    tagline: 'Voice Assignment & Persona Matching',
    description: 'Assign unique acoustic signatures to each speaker. Choose from 30+ multi-accent neural voices or clone custom voices instantly from 10-second reference audio.',
    icon: Users,
    color: 'from-amber-500 to-orange-600',
    badge: 'Dual Engine: Gemini + ElevenLabs',
    mockDetails: {
      label: 'Speaker Casting Matrix',
      items: [
        'Speaker 1: Algieba (Deep / Firm / Cinematic)',
        'Speaker 2: Aoede (Breezy / Natural / Podcast)',
        'Speaker 3: Custom Cloned Voice (Studio Mic Profile)',
        'Pitch Offset: -1.2st | Dynamic Range: +4.0dB'
      ]
    }
  },
  {
    id: 'generate',
    stepNumber: '03',
    name: 'Generate',
    tagline: 'Parallel Neural Synthesis',
    description: 'Render multi-character dialogue streams concurrently. AudioFACTORY schedules multi-track synthesis with zero inter-line latency and natural cadence spacing.',
    icon: Sparkles,
    color: 'from-amber-400 to-yellow-500',
    badge: 'Sub-second Voice Synthesis',
    mockDetails: {
      label: 'Real-Time Neural Engine',
      items: [
        'Line 01: 24kHz 16-bit PCM (Synthesized in 240ms)',
        'Line 02: Prosody matching & pitch normalization applied',
        'Line 03: Breath inflection & sentence cadence aligned',
        'Total Generation Time: 0.8s for 14 dialogue turns'
      ]
    }
  },
  {
    id: 'mix',
    stepNumber: '04',
    name: 'Mix',
    tagline: 'Dynamic BGM & Sound FX Layering',
    description: 'Layer AI-synthesized background score, sidechain audio ducking when dialogue speaks, and dial in multi-band EQ and master studio compression.',
    icon: Sliders,
    color: 'from-emerald-400 to-teal-600',
    badge: 'WebAudio DAW Mixer + Sidechain Ducking',
    mockDetails: {
      label: 'Multi-Track Mixing Console',
      items: [
        'Track 1: Voice Master (Dialogue Level: 0.0dB)',
        'Track 2: Ambient Cyber/Lo-Fi BGM (Auto-Ducked -12dB)',
        'Master Bus: Fast Attack Limiter (True Peak -0.3dBFS)',
        'Acoustic Reverb: Studio Isolation Booth Preset'
      ]
    }
  },
  {
    id: 'export',
    stepNumber: '05',
    name: 'Export',
    tagline: 'Broadcast-Grade Lossless Delivery',
    description: 'Render full multichannel audio to 24-bit 48kHz lossless WAV or high-bitrate MP3 ready for YouTube, Spotify, podcast syndication, or video game engines.',
    icon: Download,
    color: 'from-amber-400 to-emerald-500',
    badge: 'Lossless 24-Bit WAV / MP3 / Zip Package',
    mockDetails: {
      label: 'Export Pipeline Matrix',
      items: [
        'Format: Master 48kHz / 24-bit Uncompressed WAV',
        'Separate Stems: Voice Only, BGM Only, Master Mix',
        'Timecode Synced SRT / JSON Subtitle Tracks',
        'Cloud Project Auto-Persisted to Firebase'
      ]
    }
  }
];

export const AudioPipelineVisualizer: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const currentStep = PIPELINE_STEPS[activeStepIndex];

  return (
    <div 
      className="w-full border rounded-2xl p-6 sm:p-8 lg:p-10 relative overflow-hidden transition-colors duration-200"
      style={{
        backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
        borderColor: 'var(--skin-border, #E2E8F0)',
        boxShadow: 'var(--skin-shadow, 0 4px 20px -2px rgba(0,0,0,0.05))',
      }}
    >
      {/* Background Subtle Dot Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#00000008_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div 
            className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider mb-1"
            style={{ color: 'var(--skin-accent, #0284C7)' }}
          >
            <Cpu className="w-4 h-4" />
            <span>AudioFACTORY Studio Workflow</span>
          </div>
          <h3 
            className="text-2xl sm:text-3xl font-black tracking-tight"
            style={{ color: 'var(--skin-text-primary, #0F172A)' }}
          >
            The 5-Stage Audio Production Pipeline
          </h3>
        </div>
        <Link
          to="/app"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-lg shadow-xs transition-opacity hover:opacity-90 w-fit"
          style={{
            backgroundColor: 'var(--skin-accent, #0284C7)',
            color: 'var(--skin-accent-text, #FFFFFF)',
          }}
        >
          <span>Test in Studio</span>
          <Zap className="w-3.5 h-3.5 fill-current" />
        </Link>
      </div>

      {/* Interactive Step Timeline Navigation */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 mb-8">
        {PIPELINE_STEPS.map((step, idx) => {
          const isActive = idx === activeStepIndex;
          const Icon = step.icon;

          return (
            <button
              key={step.id}
              onClick={() => setActiveStepIndex(idx)}
              className={`text-left p-3.5 rounded-xl border transition-all duration-150 relative group ${
                isActive ? 'shadow-xs font-bold' : 'hover:opacity-90'
              }`}
              style={{
                backgroundColor: isActive ? 'var(--skin-bg-subtle, #F1F5F9)' : 'var(--skin-bg-card, #FFFFFF)',
                borderColor: isActive ? 'var(--skin-accent, #0284C7)' : 'var(--skin-border, #E2E8F0)',
              }}
            >
              {/* Step indicator */}
              <div className="flex items-center justify-between mb-2">
                <span 
                  className="text-[10px] font-mono font-bold"
                  style={{ color: isActive ? 'var(--skin-accent, #0284C7)' : 'var(--skin-text-muted, #64748B)' }}
                >
                  STAGE {step.stepNumber}
                </span>
                <Icon 
                  className="w-4 h-4" 
                  style={{ color: isActive ? 'var(--skin-accent, #0284C7)' : 'var(--skin-text-muted, #64748B)' }} 
                />
              </div>
              <div 
                className="font-bold text-sm flex items-center gap-1.5"
                style={{ color: 'var(--skin-text-primary, #0F172A)' }}
              >
                <span>{step.name}</span>
                {isActive && (
                  <span 
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: 'var(--skin-accent, #0284C7)' }} 
                  />
                )}
              </div>
              
              {/* Active bar */}
              {isActive && (
                <div 
                  className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--skin-accent, #0284C7)' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Step Showcase Card */}
      <div 
        className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 border rounded-xl p-6 sm:p-8"
        style={{
          backgroundColor: 'var(--skin-bg-subtle, #F1F5F9)',
          borderColor: 'var(--skin-border, #E2E8F0)'
        }}
      >
        {/* Step Explanation */}
        <div className="lg:col-span-6 space-y-4">
          <div 
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono font-medium"
            style={{
              backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
              borderColor: 'var(--skin-border, #E2E8F0)',
              color: 'var(--skin-accent, #0284C7)'
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--skin-accent, #0284C7)' }} />
            <span>{currentStep.badge}</span>
          </div>
          
          <h4 
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--skin-text-primary, #0F172A)' }}
          >
            {currentStep.tagline}
          </h4>
          
          <p 
            className="text-sm leading-relaxed"
            style={{ color: 'var(--skin-text-secondary, #475569)' }}
          >
            {currentStep.description}
          </p>

          <div className="pt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveStepIndex((prev) => (prev > 0 ? prev - 1 : PIPELINE_STEPS.length - 1))}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors hover:opacity-90"
              style={{
                backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                borderColor: 'var(--skin-border, #E2E8F0)',
                color: 'var(--skin-text-secondary, #475569)'
              }}
            >
              &larr; Previous Stage
            </button>
            <button
              onClick={() => setActiveStepIndex((prev) => (prev < PIPELINE_STEPS.length - 1 ? prev + 1 : 0))}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-opacity hover:opacity-90"
              style={{
                backgroundColor: 'var(--skin-accent, #0284C7)',
                color: 'var(--skin-accent-text, #FFFFFF)'
              }}
            >
              Next Stage: {PIPELINE_STEPS[(activeStepIndex + 1) % PIPELINE_STEPS.length].name} &rarr;
            </button>
          </div>
        </div>

        {/* Live Studio Mock Console */}
        <div 
          className="lg:col-span-6 border rounded-xl p-4 sm:p-5 font-mono text-xs flex flex-col justify-between shadow-xs"
          style={{
            backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
            borderColor: 'var(--skin-border, #E2E8F0)'
          }}
        >
          <div 
            className="flex items-center justify-between pb-3 mb-3 border-b text-xs"
            style={{ borderColor: 'var(--skin-border, #E2E8F0)' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--skin-accent, #0284C7)' }} />
              <span className="font-bold" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>
                {currentStep.mockDetails.label}
              </span>
            </div>
            <span className="text-[10px]" style={{ color: 'var(--skin-text-muted, #64748B)' }}>
              DAW CH-0{activeStepIndex + 1}
            </span>
          </div>

          {/* Console lines */}
          <div className="space-y-2 py-2">
            {currentStep.mockDetails.items.map((line, i) => (
              <div 
                key={i} 
                className="flex items-start gap-2 p-2 rounded border"
                style={{
                  backgroundColor: 'var(--skin-bg-app, #F8FAFC)',
                  borderColor: 'var(--skin-border, #E2E8F0)',
                  color: 'var(--skin-text-primary, #0F172A)'
                }}
              >
                <span className="font-bold select-none" style={{ color: 'var(--skin-accent, #0284C7)' }}>&gt;</span>
                <span className="leading-snug">{line}</span>
              </div>
            ))}
          </div>

          {/* Live Waveform Simulation */}
          <div 
            className="mt-4 pt-3 border-t flex items-center justify-between text-[11px]"
            style={{ borderColor: 'var(--skin-border, #E2E8F0)' }}
          >
            <div className="flex items-center gap-1.5" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
              <Volume2 className="w-3.5 h-3.5" style={{ color: 'var(--skin-accent, #0284C7)' }} />
              <span>Real-Time Peak Meter: -0.2 dBFS</span>
            </div>
            <div className="flex items-center gap-1 h-3.5">
              {[40, 70, 95, 60, 85, 100, 50, 75, 90, 45, 65, 80, 55, 30].map((h, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full transition-all"
                  style={{
                    height: `${(h * (activeStepIndex + 2)) % 100}%`,
                    backgroundColor: 'var(--skin-accent, #0284C7)',
                    opacity: 0.5 + (i % 3) * 0.25
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

