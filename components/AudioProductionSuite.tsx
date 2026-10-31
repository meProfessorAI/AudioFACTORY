import React, { useState } from 'react';
import { 
  Music, 
  Mic, 
  Sparkles, 
  Sliders, 
  Play, 
  Pause, 
  CheckCircle2, 
  Zap,
  Disc3,
  Flame,
  Wind,
  BellRing
} from 'lucide-react';
import { BgmGenerator } from './BgmGenerator';
import { generateBGM } from '../services/elevenLabsService';
import { decodeBase64ToBytes } from '../services/geminiService';
import { LivePresenceBar } from './LivePresenceBar';
import { useFirebase } from '../services/firebaseContext';

interface AudioProductionSuiteProps {
  onBgmBufferGenerated?: (buffer: AudioBuffer) => void;
  onOpenVoiceCloning: () => void;
  activeBgmBuffer?: AudioBuffer | null;
  onRequireAuth?: (action?: () => void) => void;
}

const QUICK_SFX_PRESETS = [
  { id: 'whoosh', name: 'Cinematic Whoosh', prompt: 'Fast airy cinematic sub-bass whoosh transition', icon: Wind },
  { id: 'impact', name: 'Dramatic Impact', prompt: 'Heavy cinematic sub-bass hit impact with reverb tail', icon: Flame },
  { id: 'chime', name: 'Studio Bell Stinger', prompt: 'Crystal clean modern broadcast chime notification', icon: BellRing },
  { id: 'vinyl', name: 'Vinyl Crackle Bed', prompt: 'Vintage warm vinyl static crackle room tone loop', icon: Disc3 }
];

export const AudioProductionSuite: React.FC<AudioProductionSuiteProps> = ({
  onBgmBufferGenerated,
  onOpenVoiceCloning,
  activeBgmBuffer,
  onRequireAuth
}) => {
  const { user } = useFirebase();
  const [sfxGeneratingId, setSfxGeneratingId] = useState<string | null>(null);
  const [generatedSfx, setGeneratedSfx] = useState<Record<string, string>>({});
  const [playingSfxId, setPlayingSfxId] = useState<string | null>(null);
  const [bgmVolume, setBgmVolume] = useState<number>(75);
  const [voiceVolume, setVoiceVolume] = useState<number>(100);

  const handleGenerateQuickSfx = async (preset: typeof QUICK_SFX_PRESETS[0], skipAuthCheck = false) => {
    if (!user && !skipAuthCheck) {
      if (onRequireAuth) onRequireAuth(() => handleGenerateQuickSfx(preset, true));
      return;
    }
    setSfxGeneratingId(preset.id);
    try {
      const buffer = await generateBGM(preset.prompt, 5);
      const audioBytes = decodeBase64ToBytes(buffer.audioBase64);
      const blob = new Blob([audioBytes as any], { type: buffer.contentType || 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      setGeneratedSfx(prev => ({ ...prev, [preset.id]: url }));
      const audio = new Audio(url);
      setPlayingSfxId(preset.id);
      audio.onended = () => setPlayingSfxId(null);
      audio.play();
    } catch (err) {
      console.error("SFX generation error:", err);
    } finally {
      setSfxGeneratingId(null);
    }
  };

  const playSfx = (id: string) => {
    const url = generatedSfx[id];
    if (!url) return;
    const audio = new Audio(url);
    setPlayingSfxId(id);
    audio.onended = () => setPlayingSfxId(null);
    audio.play();
  };

  return (
    <div className="af-canvas select-none custom-scrollbar min-h-full flex flex-col gap-4 pb-28 sm:pb-16">
      
      {/* Live Collaboration & Studio Status Bar */}
      <div className="flex-shrink-0">
        <LivePresenceBar />
      </div>

      {/* Top Header Strip matching Monologue Style */}
      <div 
        className="rounded-2xl border shadow-xs p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-shrink-0"
        style={{
          backgroundColor: 'var(--af-surface, #FFFFFF)',
          borderColor: 'var(--af-border, #E8D5C2)'
        }}
      >
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 
              className="text-base sm:text-lg font-bold tracking-tight"
              style={{ color: 'var(--af-text, #431407)' }}
            >
              Audio Production Suite & Foley Lab
            </h1>
            <span 
              className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border"
              style={{
                backgroundColor: 'var(--af-raised, #F6EDE2)',
                borderColor: 'var(--af-border, #E8D5C2)',
                color: 'var(--af-accent, #C2410C)'
              }}
            >
              Multi-Track Pro
            </span>
          </div>
          <p 
            className="text-xs mt-1"
            style={{ color: 'var(--af-text-muted, #78716C)' }}
          >
            Synthesize soundscapes, clone actor timbres, trigger dynamic sound effects, and mix stems.
          </p>
        </div>

        <button
          onClick={onOpenVoiceCloning}
          className="px-3.5 py-2 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
          style={{
            backgroundColor: 'var(--af-accent, #C2410C)',
            color: 'var(--af-accent-text, #FFFFFF)'
          }}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Launch Voice Cloner</span>
        </button>
      </div>

      {/* Main 4-Quadrant Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* BENTO CARD 1: Background Music (BGM) Generator (7 cols) */}
        <div 
          className="lg:col-span-7 rounded-2xl border shadow-xs flex flex-col justify-between overflow-hidden"
          style={{
            backgroundColor: 'var(--af-surface, #FFFFFF)',
            borderColor: 'var(--af-border, #E8D5C2)'
          }}
        >
          <div 
            className="px-4 py-3 border-b flex items-center justify-between gap-2.5"
            style={{
              backgroundColor: 'var(--af-raised, #F6EDE2)',
              borderColor: 'var(--af-border, #E8D5C2)'
            }}
          >
            <div className="flex items-center gap-2.5">
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center font-bold"
                style={{
                  backgroundColor: 'var(--af-surface, #FFFFFF)',
                  color: 'var(--af-accent, #C2410C)',
                  border: '1px solid var(--af-border, #E8D5C2)'
                }}
              >
                <Music className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 
                  className="text-xs sm:text-sm font-bold"
                  style={{ color: 'var(--af-text, #431407)' }}
                >
                  AI Ambient & BGM Soundscapes
                </h2>
                <span 
                  className="text-[11px]"
                  style={{ color: 'var(--af-text-muted, #78716C)' }}
                >
                  ElevenLabs Audio Neural Engine
                </span>
              </div>
            </div>
            <span 
              className="text-[10px] font-mono px-2 py-0.5 rounded border"
              style={{
                backgroundColor: 'var(--af-surface, #FFFFFF)',
                borderColor: 'var(--af-border, #E8D5C2)',
                color: 'var(--af-text-muted, #78716C)'
              }}
            >
              Looping Ready
            </span>
          </div>

          <div className="p-4 sm:p-5">
            <BgmGenerator 
              onBgmGenerated={async (buf) => {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const decoded = await ctx.decodeAudioData(buf.slice(0));
                onBgmBufferGenerated?.(decoded);
              }}
              onRequireAuth={onRequireAuth}
            />
          </div>
        </div>

        {/* BENTO CARD 2: Instant Voice Cloning Booth (5 cols) */}
        <div 
          className="lg:col-span-5 rounded-2xl border shadow-xs flex flex-col justify-between overflow-hidden"
          style={{
            backgroundColor: 'var(--af-surface, #FFFFFF)',
            borderColor: 'var(--af-border, #E8D5C2)'
          }}
        >
          <div 
            className="px-4 py-3 border-b flex items-center justify-between gap-2.5"
            style={{
              backgroundColor: 'var(--af-raised, #F6EDE2)',
              borderColor: 'var(--af-border, #E8D5C2)'
            }}
          >
            <div className="flex items-center gap-2.5">
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center font-bold"
                style={{
                  backgroundColor: 'var(--af-surface, #FFFFFF)',
                  color: 'var(--af-accent, #C2410C)',
                  border: '1px solid var(--af-border, #E8D5C2)'
                }}
              >
                <Mic className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 
                  className="text-xs sm:text-sm font-bold"
                  style={{ color: 'var(--af-text, #431407)' }}
                >
                  Voice Cloning Booth
                </h2>
                <span 
                  className="text-[11px]"
                  style={{ color: 'var(--af-text-muted, #78716C)' }}
                >
                  Custom Actor Profiles
                </span>
              </div>
            </div>
            <span 
              className="text-[10px] font-mono px-2 py-0.5 rounded border font-semibold"
              style={{
                backgroundColor: 'var(--af-surface, #FFFFFF)',
                borderColor: 'var(--af-border, #E8D5C2)',
                color: 'var(--af-accent, #C2410C)'
              }}
            >
              HD Acoustic
            </span>
          </div>

          <div className="p-4 sm:p-5 flex flex-col justify-between gap-4 flex-1">
            <p 
              className="text-xs leading-relaxed"
              style={{ color: 'var(--af-text-muted, #78716C)' }}
            >
              Clone your vocal resonance with a 30-second studio recording. Once cloned, your voice model becomes immediately assignable to actors in the Multi-Speaker Drama Studio.
            </p>

            <div 
              className="p-3.5 rounded-xl border space-y-2.5"
              style={{
                backgroundColor: 'var(--af-raised, #F6EDE2)',
                borderColor: 'var(--af-border, #E8D5C2)'
              }}
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span style={{ color: 'var(--af-text, #431407)' }}>Microphone Telemetry</span>
                <span className="text-emerald-600 font-bold">Ready</span>
              </div>
              <div 
                className="flex items-center gap-1 h-3 rounded overflow-hidden px-1 border"
                style={{
                  backgroundColor: 'var(--af-surface, #FFFFFF)',
                  borderColor: 'var(--af-border, #E8D5C2)'
                }}
              >
                {[20, 45, 75, 30, 60, 85, 40, 25, 50, 90, 65, 30, 40, 70, 80, 50, 35].map((val, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      height: `${val}%`,
                      backgroundColor: 'var(--af-accent, #C2410C)'
                    }} 
                    className="flex-1 rounded-xs opacity-80" 
                  />
                ))}
              </div>
              <div 
                className="flex justify-between text-[10px] font-mono"
                style={{ color: 'var(--af-text-muted, #78716C)' }}
              >
                <span>-48 dB</span>
                <span>Stereo 48kHz Target</span>
                <span>0 dB Peak</span>
              </div>
            </div>

            <button
              onClick={onOpenVoiceCloning}
              className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              style={{
                backgroundColor: 'var(--af-raised, #F6EDE2)',
                borderColor: 'var(--af-border, #E8D5C2)',
                borderWidth: '1px',
                color: 'var(--af-text, #431407)'
              }}
            >
              <Mic className="w-3.5 h-3.5" style={{ color: 'var(--af-accent, #C2410C)' }} />
              <span>Open Recording Wizard</span>
            </button>
          </div>
        </div>

        {/* BENTO CARD 3: Quick SFX & Foley Soundboard (6 cols) */}
        <div 
          className="lg:col-span-6 rounded-2xl border shadow-xs overflow-hidden"
          style={{
            backgroundColor: 'var(--af-surface, #FFFFFF)',
            borderColor: 'var(--af-border, #E8D5C2)'
          }}
        >
          <div 
            className="px-4 py-3 border-b flex items-center justify-between gap-2.5"
            style={{
              backgroundColor: 'var(--af-raised, #F6EDE2)',
              borderColor: 'var(--af-border, #E8D5C2)'
            }}
          >
            <div className="flex items-center gap-2.5">
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center font-bold"
                style={{
                  backgroundColor: 'var(--af-surface, #FFFFFF)',
                  color: 'var(--af-accent, #C2410C)',
                  border: '1px solid var(--af-border, #E8D5C2)'
                }}
              >
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 
                  className="text-xs sm:text-sm font-bold"
                  style={{ color: 'var(--af-text, #431407)' }}
                >
                  Foley & Sound Effects Soundboard
                </h2>
                <span 
                  className="text-[11px]"
                  style={{ color: 'var(--af-text-muted, #78716C)' }}
                >
                  Instant Neural Sound Synthesis
                </span>
              </div>
            </div>
            <span 
              className="text-[10px] font-mono px-2 py-0.5 rounded border"
              style={{
                backgroundColor: 'var(--af-surface, #FFFFFF)',
                borderColor: 'var(--af-border, #E8D5C2)',
                color: 'var(--af-text-muted, #78716C)'
              }}
            >
              1-Click
            </span>
          </div>

          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {QUICK_SFX_PRESETS.map((preset) => {
                const Icon = preset.icon;
                const hasGenerated = Boolean(generatedSfx[preset.id]);
                const isGen = sfxGeneratingId === preset.id;
                const isPlaying = playingSfxId === preset.id;

                return (
                  <div
                    key={preset.id}
                    className="p-3 rounded-xl border flex flex-col justify-between gap-2 transition-all"
                    style={{
                      backgroundColor: 'var(--af-raised, #F6EDE2)',
                      borderColor: 'var(--af-border, #E8D5C2)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--af-accent, #C2410C)' }} />
                        <span 
                          className="text-xs font-semibold truncate"
                          style={{ color: 'var(--af-text, #431407)' }}
                        >
                          {preset.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1">
                      {hasGenerated ? (
                        <button
                          onClick={() => playSfx(preset.id)}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                            isPlaying 
                              ? 'bg-amber-400 text-zinc-950 animate-pulse' 
                              : ''
                          }`}
                          style={!isPlaying ? {
                            backgroundColor: 'var(--af-surface, #FFFFFF)',
                            borderColor: 'var(--af-border, #E8D5C2)',
                            borderWidth: '1px',
                            color: 'var(--af-text, #431407)'
                          } : undefined}
                        >
                          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                          <span>{isPlaying ? 'Playing' : 'Play FX'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleGenerateQuickSfx(preset)}
                          disabled={isGen}
                          className="flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                          style={{
                            backgroundColor: 'var(--af-surface, #FFFFFF)',
                            borderColor: 'var(--af-border, #E8D5C2)',
                            borderWidth: '1px',
                            color: 'var(--af-text, #431407)'
                          }}
                        >
                          {isGen ? (
                            <div className="w-3 h-3 border-2 border-zinc-700 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3" style={{ color: 'var(--af-accent, #C2410C)' }} />
                          )}
                          <span>{isGen ? 'Synth...' : 'Generate'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* BENTO CARD 4: Master Stem Console & Mixing Radar (6 cols) */}
        <div 
          className="lg:col-span-6 rounded-2xl border shadow-xs overflow-hidden"
          style={{
            backgroundColor: 'var(--af-surface, #FFFFFF)',
            borderColor: 'var(--af-border, #E8D5C2)'
          }}
        >
          <div 
            className="px-4 py-3 border-b flex items-center justify-between gap-2.5"
            style={{
              backgroundColor: 'var(--af-raised, #F6EDE2)',
              borderColor: 'var(--af-border, #E8D5C2)'
            }}
          >
            <div className="flex items-center gap-2.5">
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center font-bold"
                style={{
                  backgroundColor: 'var(--af-surface, #FFFFFF)',
                  color: 'var(--af-accent, #C2410C)',
                  border: '1px solid var(--af-border, #E8D5C2)'
                }}
              >
                <Sliders className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 
                  className="text-xs sm:text-sm font-bold"
                  style={{ color: 'var(--af-text, #431407)' }}
                >
                  Master Stem Mixer & Bus Faders
                </h2>
                <span 
                  className="text-[11px]"
                  style={{ color: 'var(--af-text-muted, #78716C)' }}
                >
                  Dialogue vs Soundscape Balance
                </span>
              </div>
            </div>
            <span 
              className="text-[10px] font-mono px-2 py-0.5 rounded border"
              style={{
                backgroundColor: 'var(--af-surface, #FFFFFF)',
                borderColor: 'var(--af-border, #E8D5C2)',
                color: 'var(--af-text-muted, #78716C)'
              }}
            >
              24kHz Master
            </span>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            {/* Dialogue Track Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="flex items-center gap-1.5" style={{ color: 'var(--af-text, #431407)' }}>
                  <Mic className="w-3.5 h-3.5" style={{ color: 'var(--af-accent, #C2410C)' }} /> Spoken Dialogue Stem
                </span>
                <span className="font-mono text-[11px]" style={{ color: 'var(--af-text-muted, #78716C)' }}>{voiceVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={voiceVolume}
                onChange={e => setVoiceVolume(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  accentColor: 'var(--af-accent, #C2410C)',
                  backgroundColor: 'var(--af-raised, #F6EDE2)'
                }}
              />
            </div>

            {/* BGM Track Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="flex items-center gap-1.5" style={{ color: 'var(--af-text, #431407)' }}>
                  <Music className="w-3.5 h-3.5" style={{ color: 'var(--af-accent, #C2410C)' }} /> Background Soundscape Bed
                </span>
                <span className="font-mono text-[11px]" style={{ color: 'var(--af-text-muted, #78716C)' }}>{bgmVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={bgmVolume}
                onChange={e => setBgmVolume(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  accentColor: 'var(--af-accent, #C2410C)',
                  backgroundColor: 'var(--af-raised, #F6EDE2)'
                }}
              />
            </div>

            {/* Active BGM Buffer Status */}
            <div 
              className="p-3 rounded-xl border flex items-center justify-between text-xs"
              style={{
                backgroundColor: 'var(--af-raised, #F6EDE2)',
                borderColor: 'var(--af-border, #E8D5C2)'
              }}
            >
              <div className="flex items-center gap-2">
                <div 
                  className={`w-2.5 h-2.5 rounded-full ${
                    activeBgmBuffer ? 'bg-emerald-500 shadow-xs' : 'bg-zinc-300'
                  }`} 
                />
                <span className="font-medium" style={{ color: 'var(--af-text, #431407)' }}>
                  {activeBgmBuffer ? 'Background Bed Active in Memory' : 'No Background Bed Loaded'}
                </span>
              </div>
              {activeBgmBuffer && (
                <span 
                  className="font-mono font-bold text-[11px]"
                  style={{ color: 'var(--af-accent, #C2410C)' }}
                >
                  {activeBgmBuffer.duration.toFixed(1)}s
                </span>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

