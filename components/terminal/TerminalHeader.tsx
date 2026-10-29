import React from 'react';
import { 
  Radio, 
  Layers, 
  Music, 
  FolderOpen, 
  Settings, 
  Volume2, 
  Globe,
  AudioWaveform,
  Sparkles
} from 'lucide-react';
import { useTerminal } from './TerminalContext';
import { GenerationQuotaBadge } from '../GenerationQuotaBadge';
import { DaySkinSelector } from '../theme/DaySkinSelector';

interface TerminalHeaderProps {
  activeMode: 'intro' | 'multispeaker' | 'suite';
  onModeChange: (mode: 'intro' | 'multispeaker' | 'suite') => void;
  onOpenProjectsModal: () => void;
  onOpenConfigModal: () => void;
  isPlaying: boolean;
  isGenerating: boolean;
  onToggleTheme?: () => void;
  isTerminalMode?: boolean;
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({
  activeMode,
  onModeChange,
  onOpenProjectsModal,
  onOpenConfigModal,
  isPlaying,
  isGenerating,
}) => {
  const { activeSkin } = useTerminal();

  return (
    <header 
      className="border-b sticky top-0 z-30 select-none transition-colors duration-200"
      style={{
        backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
        borderColor: 'var(--skin-border, #E8D5C2)',
        color: 'var(--skin-text-primary, #431407)',
      }}
    >
      {/* Top Telemetry & Global System Bar */}
      <div 
        className="px-3 sm:px-6 py-2 flex items-center justify-between gap-3 border-b"
        style={{ borderColor: 'var(--skin-border, #E8D5C2)' }}
      >
        {/* Left: Studio Brand & Audio Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center shadow-xs border transition-transform active:scale-95"
              style={{
                backgroundColor: 'var(--skin-accent, #C2410C)',
                color: 'var(--skin-accent-text, #FFFFFF)',
                borderColor: 'var(--skin-border-strong, #D7BCA3)',
              }}
            >
              <AudioWaveform className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span 
                  className="font-mono font-extrabold text-sm tracking-wider"
                  style={{ color: 'var(--skin-text-primary, #431407)' }}
                >
                  AudioFACTORY
                </span>
                <span 
                  className="text-[10px] font-mono opacity-60 hidden sm:inline"
                  style={{ color: 'var(--skin-text-secondary, #7C2D12)' }}
                >
                  // STUDIO
                </span>
              </div>
              <div 
                className="text-[10px] font-mono leading-none flex items-center gap-1.5"
                style={{ color: 'var(--skin-text-secondary, #7C2D12)' }}
              >
                <span>{activeSkin.dayName} Skin:</span>
                <span className="font-bold" style={{ color: 'var(--skin-accent, #C2410C)' }}>
                  {activeSkin.themeName}
                </span>
              </div>
            </div>
          </div>

          {/* Clean Real-Time Engine Indicators */}
          <div 
            className="hidden md:flex items-center gap-2.5 px-2.5 py-1 rounded-md border text-[10px] font-mono"
            style={{
              backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
              borderColor: 'var(--skin-border, #E8D5C2)',
              color: 'var(--skin-text-secondary, #7C2D12)',
            }}
          >
            <div className="flex items-center gap-1.5" title="Neural TTS Audio Engine">
              <span 
                className={`w-2 h-2 rounded-full ${isGenerating ? 'animate-ping' : ''}`}
                style={{ backgroundColor: isGenerating ? 'var(--skin-accent, #C2410C)' : '#10B981' }}
              />
              <span className="font-bold">{isGenerating ? 'SYNTHESIZING' : 'ENGINE READY'}</span>
            </div>
            <span className="opacity-30">·</span>
            <div className="flex items-center gap-1.5" title="Audio Playback Monitor">
              <span 
                className={`w-2 h-2 rounded-full ${isPlaying ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: isPlaying ? '#EF4444' : '#9CA3AF' }}
              />
              <span className="font-bold">{isPlaying ? 'ON-AIR' : 'STANDBY'}</span>
            </div>
          </div>
        </div>

        {/* Center: VU Level Meter */}
        <div 
          className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-md border"
          style={{
            backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
            borderColor: 'var(--skin-border, #E8D5C2)',
          }}
        >
          <Volume2 className="w-3.5 h-3.5" style={{ color: 'var(--skin-text-secondary, #7C2D12)' }} />
          <div className="flex items-end gap-1 h-3.5 w-24">
            {[20, 50, 35, 75, 60, 90, 45, 100, 65, 30].map((h, idx) => (
              <div
                key={idx}
                style={{ 
                  height: `${isPlaying ? Math.min(100, h * 1.1) : 20}%`,
                  backgroundColor: isPlaying
                    ? idx > 7 ? '#EF4444' : idx > 5 ? '#F59E0B' : 'var(--skin-accent, #C2410C)'
                    : 'var(--skin-border-strong, #D7BCA3)'
                }}
                className="flex-1 rounded-2xs transition-all duration-150"
              />
            ))}
          </div>
          <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--skin-text-secondary, #7C2D12)' }}>
            {isPlaying ? '-3dB' : 'MUTE'}
          </span>
        </div>

        {/* Right: 7-Day Light Skin Selector & Actions */}
        <div className="flex items-center gap-2">
          {/* Plan & Daily Quota Status */}
          <GenerationQuotaBadge />

          {/* 7 Unique Day Light Theme Skins Switcher */}
          <DaySkinSelector />

          {/* Marketing Website Link */}
          <a
            href="/website"
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg border hover:bg-black/5 transition-colors hidden sm:flex items-center gap-1 text-xs font-mono"
            style={{
              borderColor: 'var(--skin-border, #E8D5C2)',
              color: 'var(--skin-text-secondary, #7C2D12)',
            }}
            title="Open AudioFACTORY Marketing Website"
          >
            <Globe className="w-3.5 h-3.5" />
          </a>

          {/* Cloud Projects Button */}
          <button
            onClick={onOpenProjectsModal}
            className="px-2.5 py-1.5 rounded-lg border font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors hover:opacity-90 shadow-2xs"
            style={{
              backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
              borderColor: 'var(--skin-border, #E8D5C2)',
              color: 'var(--skin-text-primary, #431407)',
            }}
            title="Open Cloud Projects"
          >
            <FolderOpen className="w-3.5 h-3.5" style={{ color: 'var(--skin-accent, #C2410C)' }} />
            <span className="hidden sm:inline">VAULT</span>
          </button>

          {/* Voice Settings */}
          <button
            onClick={onOpenConfigModal}
            className="p-1.5 rounded-lg border hover:bg-black/5 transition-colors shadow-2xs"
            style={{
              backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
              borderColor: 'var(--skin-border, #E8D5C2)',
              color: 'var(--skin-text-secondary, #7C2D12)',
            }}
            title="Configure System Voice Models"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Primary Studio Mode Navigation Tabs */}
      <div 
        className="px-3 sm:px-6 py-1.5 flex items-center gap-2 overflow-x-auto custom-scrollbar"
        style={{
          backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
        }}
      >
        <button
          onClick={() => onModeChange('intro')}
          className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-2 transition-all whitespace-nowrap border ${
            activeMode === 'intro'
              ? 'shadow-xs font-extrabold'
              : 'hover:opacity-100 opacity-75 border-transparent'
          }`}
          style={{
            backgroundColor: activeMode === 'intro' ? 'var(--skin-bg-card, #FFFFFF)' : 'transparent',
            borderColor: activeMode === 'intro' ? 'var(--skin-accent, #C2410C)' : 'transparent',
            color: activeMode === 'intro' ? 'var(--skin-accent, #C2410C)' : 'var(--skin-text-primary, #431407)',
          }}
        >
          <span style={{ color: 'var(--skin-accent, #C2410C)' }}>❯</span>
          <Radio className="w-3.5 h-3.5" />
          <span>01_MONO_SPEECH</span>
          {activeMode === 'intro' && (
            <span 
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: 'var(--skin-accent, #C2410C)' }}
            />
          )}
        </button>

        <button
          onClick={() => onModeChange('multispeaker')}
          className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-2 transition-all whitespace-nowrap border ${
            activeMode === 'multispeaker'
              ? 'shadow-xs font-extrabold'
              : 'hover:opacity-100 opacity-75 border-transparent'
          }`}
          style={{
            backgroundColor: activeMode === 'multispeaker' ? 'var(--skin-bg-card, #FFFFFF)' : 'transparent',
            borderColor: activeMode === 'multispeaker' ? 'var(--skin-accent, #C2410C)' : 'transparent',
            color: activeMode === 'multispeaker' ? 'var(--skin-accent, #C2410C)' : 'var(--skin-text-primary, #431407)',
          }}
        >
          <span style={{ color: 'var(--skin-accent, #C2410C)' }}>❯</span>
          <Layers className="w-3.5 h-3.5" />
          <span>02_SCENE_DRAMA</span>
          {activeMode === 'multispeaker' && (
            <span 
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: 'var(--skin-accent, #C2410C)' }}
            />
          )}
        </button>

        <button
          onClick={() => onModeChange('suite')}
          className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-2 transition-all whitespace-nowrap border ${
            activeMode === 'suite'
              ? 'shadow-xs font-extrabold'
              : 'hover:opacity-100 opacity-75 border-transparent'
          }`}
          style={{
            backgroundColor: activeMode === 'suite' ? 'var(--skin-bg-card, #FFFFFF)' : 'transparent',
            borderColor: activeMode === 'suite' ? 'var(--skin-accent, #C2410C)' : 'transparent',
            color: activeMode === 'suite' ? 'var(--skin-accent, #C2410C)' : 'var(--skin-text-primary, #431407)',
          }}
        >
          <span style={{ color: 'var(--skin-accent, #C2410C)' }}>❯</span>
          <Music className="w-3.5 h-3.5" />
          <span>03_BGM_&_STEMS</span>
          {activeMode === 'suite' && (
            <span 
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: 'var(--skin-accent, #C2410C)' }}
            />
          )}
        </button>

      </div>

    </header>
  );
};
