/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Interactive Voice Preview Player
 */
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Sparkles, Mic, Layers, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface VoiceDemoItem {
  id: string;
  name: string;
  category: 'Cinematic' | 'Podcast' | 'Narrative' | 'Character' | 'Commercial' | 'Cloned';
  gender: 'Male' | 'Female';
  provider: 'Gemini 2.5' | 'ElevenLabs';
  style: string;
  accent: string;
  sampleLine: string;
  tempoBpm: number;
}

export const FEATURED_VOICE_DEMOS: VoiceDemoItem[] = [
  {
    id: 'Algieba',
    name: 'Algieba (Marcus S.)',
    category: 'Cinematic',
    gender: 'Male',
    provider: 'Gemini 2.5',
    style: 'Deep, Authoritative, Trailer',
    accent: 'US Cinematic',
    sampleLine: 'In a world where ordinary sounds fail to inspire, one studio rewrites the frequency of storytelling.',
    tempoBpm: 92
  },
  {
    id: 'Aoede',
    name: 'Aoede',
    category: 'Podcast',
    gender: 'Female',
    provider: 'Gemini 2.5',
    style: 'Breezy, Natural, Intimate',
    accent: 'US Neutral',
    sampleLine: 'Welcome back to the studio. Today, we are dissecting how multi-speaker AI changes the podcasting landscape.',
    tempoBpm: 110
  },
  {
    id: 'Vindemiatrix',
    name: 'Vindemiatrix (Jaz DJ)',
    category: 'Commercial',
    gender: 'Male',
    provider: 'Gemini 2.5',
    style: 'High-Energy, Punchy, Radio DJ',
    accent: 'British Estuary',
    sampleLine: 'Massive vibes locked in! Turn this right up — the brand new audio revolution starts in three, two, let’s go!',
    tempoBpm: 128
  },
  {
    id: 'Callirrhoe',
    name: 'Callirrhoe',
    category: 'Narrative',
    gender: 'Female',
    provider: 'Gemini 2.5',
    style: 'Warm, Easy-going, Audiobook',
    accent: 'US Warm',
    sampleLine: 'The morning mist slowly rolled across the valley, carrying with it the quiet whispers of forgotten travelers.',
    tempoBpm: 100
  },
  {
    id: 'Charon',
    name: 'Charon',
    category: 'Narrative',
    gender: 'Male',
    provider: 'Gemini 2.5',
    style: 'Informative, Documentary, Steady',
    accent: 'Mid-Atlantic',
    sampleLine: 'Deep within the acoustic architecture of the studio, neural networks reconstruct the subtle nuances of human inflection.',
    tempoBpm: 104
  },
  {
    id: 'Rachel',
    name: 'Rachel (Studio Elite)',
    category: 'Podcast',
    gender: 'Female',
    provider: 'ElevenLabs',
    style: 'Crisp, Professional, Conversational',
    accent: 'American Standard',
    sampleLine: 'AudioFACTORY empowers modern audio producers to build complex multi-character dialogue in seconds flat.',
    tempoBpm: 112
  },
  {
    id: 'Adam',
    name: 'Adam (Narrator Prime)',
    category: 'Cinematic',
    gender: 'Male',
    provider: 'ElevenLabs',
    style: 'Resonant, Dynamic, Dramatic',
    accent: 'US Deep',
    sampleLine: 'When you take complete control of both script and voice, the line between fiction and reality disappears completely.',
    tempoBpm: 98
  },
  {
    id: 'CustomClone',
    name: 'Acoustic Clone Matrix',
    category: 'Cloned',
    gender: 'Male',
    provider: 'Gemini 2.5',
    style: 'Zero-Shot Mic Matched Voice',
    accent: 'Custom Cloned Profile',
    sampleLine: 'This custom voice signature was extracted from just ten seconds of clean reference microphone audio.',
    tempoBpm: 106
  }
];

export const InteractiveVoicePlayer: React.FC = () => {
  const [activeVoiceId, setActiveVoiceId] = useState<string>('Algieba');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const activeVoice = FEATURED_VOICE_DEMOS.find((v) => v.id === activeVoiceId) || FEATURED_VOICE_DEMOS[0];
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      stopAudio();
    };
  }, []);

  const stopAudio = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setIsPlaying(false);
    setPlaybackProgress(0);
  };

  const playVoiceSample = (voice: VoiceDemoItem) => {
    stopAudio();
    setActiveVoiceId(voice.id);

    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(voice.sampleLine);
      utteranceRef.current = utterance;

      // Match voice parameters
      utterance.rate = voice.category === 'Cinematic' ? 0.9 : (voice.category === 'Commercial' ? 1.15 : 1.0);
      utterance.pitch = voice.gender === 'Female' ? 1.15 : 0.85;

      // Try selecting a matching system voice
      const voices = synthRef.current.getVoices();
      if (voices.length > 0) {
        const langVoice = voices.find(v => 
          (voice.gender === 'Female' ? v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('zira') : v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('george'))
        );
        if (langVoice) {
          utterance.voice = langVoice;
        }
      }

      const estimatedDurationMs = (voice.sampleLine.split(' ').length / 2.5) * 1000;
      const startTime = Date.now();

      progressIntervalRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, (elapsed / estimatedDurationMs) * 100);
        setPlaybackProgress(progress);
        if (progress >= 100) {
          stopAudio();
        }
      }, 50);

      utterance.onend = () => {
        stopAudio();
      };
      utterance.onerror = () => {
        stopAudio();
      };

      synthRef.current.speak(utterance);
      setIsPlaying(true);
    } else {
      // Fallback timer simulation
      setIsPlaying(true);
      const startTime = Date.now();
      const dur = 4000;
      progressIntervalRef.current = window.setInterval(() => {
        const p = Math.min(100, ((Date.now() - startTime) / dur) * 100);
        setPlaybackProgress(p);
        if (p >= 100) stopAudio();
      }, 50);
    }
  };

  const categories = ['All', 'Cinematic', 'Podcast', 'Commercial', 'Narrative', 'Cloned'];
  const filteredVoices = filterCategory === 'All' 
    ? FEATURED_VOICE_DEMOS 
    : FEATURED_VOICE_DEMOS.filter(v => v.category === filterCategory);

  return (
    <div 
      className="w-full border rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xs transition-colors duration-200"
      style={{
        backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
        borderColor: 'var(--skin-border, #E2E8F0)',
        boxShadow: 'var(--skin-shadow, 0 4px 20px -2px rgba(0,0,0,0.05))',
      }}
    >
      {/* Top Filter Bar */}
      <div 
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b"
        style={{ borderColor: 'var(--skin-border, #E2E8F0)' }}
      >
        <div>
          <span 
            className="text-xs font-mono font-bold uppercase tracking-wider"
            style={{ color: 'var(--skin-accent, #0284C7)' }}
          >
            Interactive Voice Explorer
          </span>
          <h3 
            className="text-xl sm:text-2xl font-black tracking-tight"
            style={{ color: 'var(--skin-text-primary, #0F172A)' }}
          >
            Audition Neural Personas & Timbres
          </h3>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className="px-3 py-1 text-xs font-semibold rounded-full transition-all whitespace-nowrap border"
              style={{
                backgroundColor: filterCategory === cat ? 'var(--skin-accent, #0284C7)' : 'var(--skin-bg-subtle, #F1F5F9)',
                borderColor: filterCategory === cat ? 'var(--skin-accent, #0284C7)' : 'var(--skin-border, #E2E8F0)',
                color: filterCategory === cat ? 'var(--skin-accent-text, #FFFFFF)' : 'var(--skin-text-secondary, #475569)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Voice List + Master Audition Player */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
        
        {/* Left Column: Voice Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
          {filteredVoices.map((voice) => {
            const isSelected = voice.id === activeVoiceId;
            const isThisPlaying = isSelected && isPlaying;

            return (
              <div
                key={voice.id}
                onClick={() => {
                  if (isSelected && isPlaying) {
                    stopAudio();
                  } else {
                    playVoiceSample(voice);
                  }
                }}
                className="p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between"
                style={{
                  backgroundColor: isSelected ? 'var(--skin-bg-subtle, #F1F5F9)' : 'var(--skin-bg-card, #FFFFFF)',
                  borderColor: isSelected ? 'var(--skin-accent, #0284C7)' : 'var(--skin-border, #E2E8F0)',
                  boxShadow: isSelected ? 'var(--skin-shadow)' : 'none',
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span 
                      className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: 'var(--skin-accent-muted, #E0F2FE)',
                        borderColor: 'var(--skin-border, #E2E8F0)',
                        color: 'var(--skin-accent, #0284C7)',
                      }}
                    >
                      {voice.category}
                    </span>
                    <span className="text-[10px] font-mono" style={{ color: 'var(--skin-text-muted, #64748B)' }}>
                      {voice.provider}
                    </span>
                  </div>
                  <h5 
                    className="text-sm font-bold flex items-center gap-1.5"
                    style={{ color: 'var(--skin-text-primary, #0F172A)' }}
                  >
                    <span>{voice.name}</span>
                  </h5>
                  <p className="text-[11px] mt-1 line-clamp-1" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                    {voice.style} &bull; {voice.accent}
                  </p>
                </div>

                <div 
                  className="flex items-center justify-between mt-3 pt-2 border-t"
                  style={{ borderColor: 'var(--skin-border, #E2E8F0)' }}
                >
                  <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--skin-text-muted, #64748B)' }}>
                    <Mic className="w-3 h-3" style={{ color: 'var(--skin-accent, #0284C7)' }} />
                    <span>{voice.gender}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isThisPlaying) {
                        stopAudio();
                      } else {
                        playVoiceSample(voice);
                      }
                    }}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-2xs"
                    style={{
                      backgroundColor: isThisPlaying ? 'var(--skin-accent, #0284C7)' : 'var(--skin-bg-subtle, #F1F5F9)',
                      color: isThisPlaying ? 'var(--skin-accent-text, #FFFFFF)' : 'var(--skin-text-primary, #0F172A)',
                      border: '1px solid var(--skin-border, #E2E8F0)'
                    }}
                    aria-label={`Audition ${voice.name}`}
                  >
                    {isThisPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Master Audition Player Deck */}
        <div 
          className="lg:col-span-5 border rounded-xl p-5 flex flex-col justify-between shadow-xs"
          style={{
            backgroundColor: 'var(--skin-bg-subtle, #F1F5F9)',
            borderColor: 'var(--skin-border, #E2E8F0)'
          }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--skin-text-muted, #64748B)' }}>
                Audition Console
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live Audio Engine
              </span>
            </div>

            <div>
              <h4 
                className="text-lg font-black tracking-tight"
                style={{ color: 'var(--skin-text-primary, #0F172A)' }}
              >
                {activeVoice.name}
              </h4>
              <p className="text-xs font-mono mt-0.5 font-bold" style={{ color: 'var(--skin-accent, #0284C7)' }}>
                {activeVoice.style} &bull; {activeVoice.provider}
              </p>
            </div>

            {/* Script Teleprompter Card */}
            <div 
              className="p-3.5 rounded-lg border text-xs leading-relaxed italic relative shadow-2xs"
              style={{
                backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                borderColor: 'var(--skin-border, #E2E8F0)',
                color: 'var(--skin-text-primary, #0F172A)'
              }}
            >
              &ldquo;{activeVoice.sampleLine}&rdquo;
            </div>

            {/* Audio Waveform Canvas Preview */}
            <div className="space-y-2">
              <div 
                className="h-10 rounded-lg border p-2 flex items-center justify-between gap-1 overflow-hidden"
                style={{
                  backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                  borderColor: 'var(--skin-border, #E2E8F0)'
                }}
              >
                {[15, 45, 80, 60, 95, 100, 75, 40, 60, 85, 90, 50, 70, 95, 60, 40, 80, 50, 30, 60, 85, 70, 40, 90, 55, 30, 20].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-full transition-all duration-150"
                    style={{
                      height: isPlaying ? `${Math.max(15, (h * (i % 3 + 1)) % 100)}%` : '20%',
                      backgroundColor: isPlaying ? 'var(--skin-accent, #0284C7)' : 'var(--skin-border-strong, #CBD5E1)',
                      opacity: isPlaying ? 1 : 0.6
                    }}
                  />
                ))}
              </div>

              {/* Progress bar */}
              <div 
                className="w-full h-1 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--skin-border, #E2E8F0)' }}
              >
                <div
                  className="h-full transition-all duration-75"
                  style={{ 
                    width: `${playbackProgress}%`,
                    backgroundColor: 'var(--skin-accent, #0284C7)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div 
            className="pt-5 border-t flex items-center justify-between gap-3 mt-4"
            style={{ borderColor: 'var(--skin-border, #E2E8F0)' }}
          >
            <button
              onClick={() => {
                if (isPlaying) stopAudio();
                else playVoiceSample(activeVoice);
              }}
              className="flex-1 py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-opacity hover:opacity-90 active:scale-98"
              style={{
                backgroundColor: 'var(--skin-accent, #0284C7)',
                color: 'var(--skin-accent-text, #FFFFFF)'
              }}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause Audition</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Sample ({activeVoice.name.split(' ')[0]})</span>
                </>
              )}
            </button>

            <Link
              to="/app"
              className="px-3.5 py-2.5 rounded-lg font-semibold text-xs border flex items-center gap-1.5 transition-colors hover:opacity-90 shadow-2xs"
              style={{
                backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                borderColor: 'var(--skin-border, #E2E8F0)',
                color: 'var(--skin-text-primary, #0F172A)'
              }}
            >
              <span>Use in Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

