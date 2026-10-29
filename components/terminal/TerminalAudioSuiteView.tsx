import React from 'react';
import { 
  Music, 
  Mic, 
  Sparkles, 
  Sliders, 
  Play, 
  Pause, 
  Zap,
  Disc3,
  Flame,
  Wind,
  BellRing
} from 'lucide-react';
import { BgmGenerator } from '../BgmGenerator';
import { TerminalWindow } from './TerminalWindow';
import { LivePresenceBar } from '../LivePresenceBar';
import { useTerminal } from './TerminalContext';

const QUICK_SFX_PRESETS = [
  { id: 'whoosh', name: 'Cinematic Whoosh', prompt: 'Fast airy cinematic sub-bass whoosh transition', icon: Wind },
  { id: 'impact', name: 'Dramatic Impact', prompt: 'Heavy cinematic sub-bass hit impact with reverb tail', icon: Flame },
  { id: 'chime', name: 'Studio Bell Stinger', prompt: 'Crystal clean modern broadcast chime notification', icon: BellRing },
  { id: 'vinyl', name: 'Vinyl Crackle Bed', prompt: 'Vintage warm vinyl static crackle room tone loop', icon: Disc3 }
];

interface TerminalAudioSuiteViewProps {
  onBgmBufferGenerated?: (buffer: AudioBuffer) => void;
  onOpenVoiceCloning: () => void;
  activeBgmBuffer?: AudioBuffer | null;
  onRequireAuth?: (action?: () => void) => void;
  bgmVolume: number;
  setBgmVolume: (v: number) => void;
  voiceVolume: number;
  setVoiceVolume: (v: number) => void;
  sfxGeneratingId: string | null;
  generatedSfx: Record<string, string>;
  playingSfxId: string | null;
  handleGenerateQuickSfx: (preset: typeof QUICK_SFX_PRESETS[0]) => void;
  playSfx: (id: string) => void;
}

export const TerminalAudioSuiteView: React.FC<TerminalAudioSuiteViewProps> = ({
  onBgmBufferGenerated,
  onOpenVoiceCloning,
  activeBgmBuffer,
  onRequireAuth,
  bgmVolume,
  setBgmVolume,
  voiceVolume,
  setVoiceVolume,
  sfxGeneratingId,
  generatedSfx,
  playingSfxId,
  handleGenerateQuickSfx,
  playSfx
}) => {
  const { activeSkin } = useTerminal();

  return (
    <div 
      className="flex-1 flex flex-col h-full overflow-hidden p-3 sm:p-5 md:p-6 space-y-4 font-mono transition-colors"
      style={{
        color: 'var(--skin-text-primary, #431407)',
      }}
    >
      
      {/* 1. TOP STATUS PANEL */}
      <div 
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3 mb-1"
        style={{ borderColor: 'var(--skin-border, #E8D5C2)' }}
      >
        <div>
          <div className="flex items-center gap-2">
            <span 
              className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border"
              style={{
                backgroundColor: 'var(--skin-accent-muted, #FFEDD5)',
                borderColor: 'var(--skin-border, #E8D5C2)',
                color: 'var(--skin-accent, #C2410C)',
              }}
            >
              AUDIO_PRODUCTION // {activeSkin.dayShort}
            </span>
            <span 
              className="text-[10px] px-2 py-0.5 rounded uppercase border font-bold"
              style={{
                backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
                borderColor: 'var(--skin-border, #E8D5C2)',
                color: 'var(--skin-text-secondary, #7C2D12)',
              }}
            >
              Pro Suite & Foley Lab
            </span>
          </div>
          <p className="text-xs mt-1.5 leading-relaxed opacity-80" style={{ color: 'var(--skin-text-secondary, #7C2D12)' }}>
            Synthesize soundscapes, clone actor timbres, trigger dynamic sound effects, and mix master stems.
          </p>
        </div>

        <button
          onClick={onOpenVoiceCloning}
          className="px-3.5 py-1.5 rounded-lg border font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-2xs hover:shadow-xs active:scale-95"
          style={{
            backgroundColor: 'var(--skin-accent, #C2410C)',
            borderColor: 'var(--skin-border-strong, #D7BCA3)',
            color: 'var(--skin-accent-text, #FFFFFF)',
          }}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Clone Voice</span>
        </button>
      </div>

      {/* Live Presence Bar */}
      <div className="scale-90 origin-left">
        <LivePresenceBar className="border shadow-2xs rounded-lg" />
      </div>

      {/* 2. MAIN BENTO GRID */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 overflow-y-auto custom-scrollbar pr-1">
        
        {/* COMPARTMENT 1: AI Soundscape Engine (7 cols) */}
        <div className="lg:col-span-7 flex flex-col min-h-0">
          <TerminalWindow
            title="AI_AMBIENT_SOUNDSCAPE_ENGINE.sh"
            badge="Looping Ready"
            accentColor="yellow"
          >
            <div 
              className="p-4 space-y-4 h-full flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                color: 'var(--skin-text-primary, #431407)',
              }}
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Music className="w-4 h-4" style={{ color: 'var(--skin-accent, #C2410C)' }} />
                  <span className="text-xs font-bold uppercase" style={{ color: 'var(--skin-text-primary, #431407)' }}>
                    Algorithmic & Neural Soundscape Synthesis
                  </span>
                </div>
                
                {/* Background music soundscape builder */}
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
          </TerminalWindow>
        </div>

        {/* COMPARTMENT 2: Voice Cloning Telemetry (5 cols) */}
        <div className="lg:col-span-5 flex flex-col min-h-0">
          <TerminalWindow
            title="VOICE_CLONING_TELEMETRY.conf"
            badge="HD Acoustic"
            accentColor="red"
          >
            <div 
              className="p-4 space-y-4 h-full flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                color: 'var(--skin-text-primary, #431407)',
              }}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4" style={{ color: 'var(--skin-accent, #C2410C)' }} />
                  <span className="text-xs font-bold uppercase" style={{ color: 'var(--skin-text-primary, #431407)' }}>
                    Custom Vocal Resonance Cloning
                  </span>
                </div>
                
                <p className="text-xs leading-relaxed opacity-80" style={{ color: 'var(--skin-text-secondary, #7C2D12)' }}>
                  Clone your vocal resonance with a 30-second studio recording. Once cloned, your voice model becomes immediately assignable to actors in the Multi-Speaker Drama Studio.
                </p>

                {/* Animated waveform visualizer mock */}
                <div 
                  className="p-3.5 rounded-lg border space-y-2.5"
                  style={{
                    backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
                    borderColor: 'var(--skin-border, #E8D5C2)',
                  }}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span>Microphone Telemetry</span>
                    <span style={{ color: 'var(--skin-accent, #C2410C)' }}>Ready</span>
                  </div>
                  <div 
                    className="flex items-center gap-1 h-3 rounded overflow-hidden px-1 border"
                    style={{
                      backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                      borderColor: 'var(--skin-border, #E8D5C2)',
                    }}
                  >
                    {[20, 45, 75, 30, 60, 85, 40, 25, 50, 90, 65, 30, 40, 70, 80, 50, 35].map((val, i) => (
                      <div 
                        key={i} 
                        style={{ 
                          height: `${val}%`,
                          backgroundColor: 'var(--skin-accent, #C2410C)'
                        }} 
                        className="flex-1 rounded-xs opacity-75" 
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] opacity-70" style={{ color: 'var(--skin-text-secondary, #7C2D12)' }}>
                    <span>-48 dB</span>
                    <span>Stereo 48kHz Target</span>
                    <span>0 dB Peak</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onOpenVoiceCloning}
                className="w-full py-2.5 rounded-lg border font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-2xs hover:shadow-xs active:scale-95"
                style={{
                  backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
                  borderColor: 'var(--skin-border, #E8D5C2)',
                  color: 'var(--skin-text-primary, #431407)',
                }}
              >
                <Mic className="w-3.5 h-3.5" style={{ color: 'var(--skin-accent, #C2410C)' }} />
                <span>Open Recording Wizard</span>
              </button>
            </div>
          </TerminalWindow>
        </div>

        {/* COMPARTMENT 3: Foley Soundboard (6 cols) */}
        <div className="lg:col-span-6 flex flex-col min-h-0">
          <TerminalWindow
            title="FOLEY_EFFECTS_SOUNDBOARD.sh"
            badge="Instant Sync"
            accentColor="blue"
          >
            <div 
              className="p-4 space-y-3.5 h-full"
              style={{
                backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                color: 'var(--skin-text-primary, #431407)',
              }}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" style={{ color: 'var(--skin-accent, #C2410C)' }} />
                <span className="text-xs font-bold uppercase" style={{ color: 'var(--skin-text-primary, #431407)' }}>
                  Foley & Sound Effects Soundboard
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {QUICK_SFX_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const hasGenerated = Boolean(generatedSfx[preset.id]);
                  const isGen = sfxGeneratingId === preset.id;
                  const isPlaying = playingSfxId === preset.id;

                  return (
                    <div
                      key={preset.id}
                      className="p-3 rounded-lg border transition-all flex flex-col justify-between gap-2.5 shadow-2xs"
                      style={{
                        backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
                        borderColor: 'var(--skin-border, #E8D5C2)',
                      }}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--skin-accent, #C2410C)' }} />
                        <span className="text-xs font-bold truncate">
                          {preset.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1">
                        {hasGenerated ? (
                          <button
                            onClick={() => playSfx(preset.id)}
                            className="flex-1 py-1.5 px-2.5 rounded text-[10px] font-bold flex items-center justify-center gap-1 transition-all uppercase tracking-wider border shadow-2xs"
                            style={{
                              backgroundColor: isPlaying ? 'var(--skin-accent, #C2410C)' : 'var(--skin-bg-card, #FFFFFF)',
                              borderColor: 'var(--skin-border, #E8D5C2)',
                              color: isPlaying ? '#FFFFFF' : 'var(--skin-text-primary, #431407)',
                            }}
                          >
                            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                            <span>{isPlaying ? 'Playing' : 'Play FX'}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleGenerateQuickSfx(preset)}
                            disabled={isGen}
                            className="flex-1 py-1.5 px-2.5 rounded border text-[10px] font-bold flex items-center justify-center gap-1 transition-all uppercase tracking-wider disabled:opacity-40 shadow-2xs"
                            style={{
                              backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                              borderColor: 'var(--skin-border, #E8D5C2)',
                              color: 'var(--skin-text-primary, #431407)',
                            }}
                          >
                            {isGen ? (
                              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Sparkles className="w-3 h-3" style={{ color: 'var(--skin-accent, #C2410C)' }} />
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
          </TerminalWindow>
        </div>

        {/* COMPARTMENT 4: Master Mix Console (6 cols) */}
        <div className="lg:col-span-6 flex flex-col min-h-0">
          <TerminalWindow
            title="MASTER_STEM_MIX_CONSOLE.exec"
            badge="Bus Faders"
            accentColor="green"
          >
            <div 
              className="p-4 space-y-4 h-full flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                color: 'var(--skin-text-primary, #431407)',
              }}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4" style={{ color: 'var(--skin-accent, #C2410C)' }} />
                  <span className="text-xs font-bold uppercase" style={{ color: 'var(--skin-text-primary, #431407)' }}>
                    Master Stem Mixer & Bus Faders
                  </span>
                </div>

                <div className="space-y-3.5 pt-1">
                  {/* Dialogue Track Slider */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--skin-text-secondary, #7C2D12)' }}>
                      <span className="font-bold flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5" style={{ color: 'var(--skin-accent, #C2410C)' }} /> Spoken Dialogue Stem
                      </span>
                      <span className="font-bold" style={{ color: 'var(--skin-text-primary, #431407)' }}>{voiceVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={voiceVolume}
                      onChange={e => setVoiceVolume(Number(e.target.value))}
                      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                      style={{
                        backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
                        accentColor: 'var(--skin-accent, #C2410C)',
                      }}
                    />
                  </div>

                  {/* BGM Track Slider */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--skin-text-secondary, #7C2D12)' }}>
                      <span className="font-bold flex items-center gap-1.5">
                        <Music className="w-3.5 h-3.5" style={{ color: 'var(--skin-accent, #C2410C)' }} /> Background Soundscape Bed
                      </span>
                      <span className="font-bold" style={{ color: 'var(--skin-text-primary, #431407)' }}>{bgmVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={bgmVolume}
                      onChange={e => setBgmVolume(Number(e.target.value))}
                      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                      style={{
                        backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
                        accentColor: 'var(--skin-accent, #C2410C)',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Active Soundscape Status */}
              <div 
                className="p-2.5 rounded-lg border flex items-center justify-between text-[11px]"
                style={{
                  backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
                  borderColor: 'var(--skin-border, #E8D5C2)',
                  color: 'var(--skin-text-secondary, #7C2D12)',
                }}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: activeBgmBuffer ? '#10B981' : '#9CA3AF' }}
                  />
                  <span>{activeBgmBuffer ? 'Background Bed Active in Memory' : 'No Background Bed Loaded'}</span>
                </div>
                {activeBgmBuffer && (
                  <span className="font-bold" style={{ color: 'var(--skin-accent, #C2410C)' }}>
                    {activeBgmBuffer.duration.toFixed(1)}s
                  </span>
                )}
              </div>
            </div>
          </TerminalWindow>
        </div>

      </div>

    </div>
  );
};
