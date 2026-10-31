import React from 'react';
import { 
  Sliders, 
  Sparkles, 
  Settings, 
  Volume2, 
  Globe, 
  HelpCircle, 
  ChevronRight, 
  Gauge, 
  Heart,
  Music,
  Download
} from 'lucide-react';
import { IntroStyle, Voice } from '../../../types';

interface VoiceInspectorProps {
  selectedStyle: IntroStyle;
  selectedVoice: string;
  onOpenVoiceConfig: () => void;
  onOpenPromptModal: () => void;
  onSelectStyle: (style: IntroStyle) => void;
  introStyles: IntroStyle[];
  emotionalMode: string;
  onEmotionalModeChange: (mode: string) => void;
  lyricalMode: boolean;
  onLyricalModeChange: (active: boolean) => void;
  speed: string;
  onSpeedChange: (speed: string) => void;
  allVoices: Voice[];
}

export const VoiceInspector: React.FC<VoiceInspectorProps> = ({
  selectedStyle,
  selectedVoice,
  onOpenVoiceConfig,
  onOpenPromptModal,
  onSelectStyle,
  introStyles,
  emotionalMode,
  onEmotionalModeChange,
  lyricalMode,
  onLyricalModeChange,
  speed,
  onSpeedChange,
  allVoices
}) => {
  const currentVoiceObj = allVoices.find(v => v.id === selectedVoice);
  const isEleven = currentVoiceObj?.provider === 'elevenlabs';
  const isLastVoice = selectedStyle.id === 'the_last_voice';

  const emotionalPresets = [
    'Quiet Love',
    'Longing',
    'Heartbreak',
    'Memory',
    'Unsent Letter',
    'Acceptance',
    'Cinematic Realization',
    'Pure Poetry'
  ];

  return (
    <aside className="af-inspector custom-scrollbar select-none">
      {/* Inspector Section Header */}
      <div 
        className="pb-3 border-b flex items-center justify-between"
        style={{ borderColor: 'var(--af-border, #E8D5C2)' }}
      >
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4" style={{ color: 'var(--af-accent, #C2410C)' }} />
          <h3 className="text-xs font-bold uppercase tracking-wider">Acoustic Inspector</h3>
        </div>
        <span 
          className="text-[10px] font-bold px-2 py-0.5 rounded-md"
          style={{
            backgroundColor: 'var(--af-raised, #F6EDE2)',
            color: 'var(--af-accent, #C2410C)'
          }}
        >
          {isEleven ? 'ElevenLabs' : 'Gemini 2.5'}
        </span>
      </div>

      {/* Voice Selection Tile */}
      <div 
        className="p-3.5 rounded-2xl border flex flex-col gap-2.5 transition-all"
        style={{
          backgroundColor: 'var(--af-raised, #F6EDE2)',
          borderColor: 'var(--af-border, #E8D5C2)'
        }}
      >
        <div className="flex items-center justify-between">
          <span 
            className="text-[11px] font-bold uppercase tracking-wide"
            style={{ color: 'var(--af-text-secondary, #7C2D12)' }}
          >
            Active Voice Model
          </span>
          <button
            onClick={onOpenVoiceConfig}
            className="text-[11px] font-bold transition-colors cursor-pointer hover:underline flex items-center gap-0.5"
            style={{ color: 'var(--af-accent, #C2410C)' }}
          >
            <span>Change</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs"
            style={{
              backgroundColor: 'var(--af-accent, #C2410C)',
              color: 'var(--af-accent-text, #FFFFFF)'
            }}
          >
            <Volume2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 
              className="text-sm font-bold truncate"
              style={{ color: 'var(--af-text, #431407)' }}
            >
              {currentVoiceObj?.name || selectedVoice}
            </h4>
            <div 
              className="flex items-center gap-1.5 text-[11px] mt-0.5"
              style={{ color: 'var(--af-text-muted, #9A5B32)' }}
            >
              <span>{currentVoiceObj?.gender || 'Neural'}</span>
              <span>•</span>
              <span>24kHz HD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Persona Style Selector */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label 
            className="text-[11px] font-bold uppercase tracking-wide"
            style={{ color: 'var(--af-text-secondary, #7C2D12)' }}
          >
            Persona Profile
          </label>
          <button
            onClick={onOpenPromptModal}
            className="text-[11px] font-bold transition-colors cursor-pointer hover:underline"
            style={{ color: 'var(--af-accent, #C2410C)' }}
          >
            Directives
          </button>
        </div>

        <select
          value={selectedStyle.id}
          onChange={(e) => {
            const style = introStyles.find(s => s.id === e.target.value);
            if (style) onSelectStyle(style);
          }}
          className="w-full px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer focus:outline-none"
          style={{
            backgroundColor: 'var(--af-raised, #F6EDE2)',
            borderColor: 'var(--af-border, #E8D5C2)',
            color: 'var(--af-text, #431407)'
          }}
        >
          {introStyles.map(s => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.category})
            </option>
          ))}
        </select>
        <p 
          className="text-[11px] leading-relaxed line-clamp-2"
          style={{ color: 'var(--af-text-muted, #9A5B32)' }}
        >
          {selectedStyle.description}
        </p>
      </div>

      {/* Pacing / Speed Controls */}
      <div className="flex flex-col gap-2">
        <label 
          className="text-[11px] font-bold uppercase tracking-wide flex items-center justify-between"
          style={{ color: 'var(--af-text-secondary, #7C2D12)' }}
        >
          <span className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5" />
            <span>Pacing & Speed</span>
          </span>
          <span className="font-mono text-xs">{speed}</span>
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {['0.8x', '1.0x', '1.25x', '1.5x'].map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className="py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer"
              style={{
                backgroundColor: speed === s ? 'var(--af-accent, #C2410C)' : 'var(--af-raised, #F6EDE2)',
                color: speed === s ? 'var(--af-accent-text, #FFFFFF)' : 'var(--af-text, #431407)',
                borderColor: speed === s ? 'var(--af-accent, #C2410C)' : 'var(--af-border, #E8D5C2)'
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Emotional Preset Modulation (Available for The Last Voice or Gemini neural models) */}
      <div className="flex flex-col gap-2">
        <label 
          className="text-[11px] font-bold uppercase tracking-wide flex items-center gap-1.5"
          style={{ color: 'var(--af-text-secondary, #7C2D12)' }}
        >
          <Heart className="w-3.5 h-3.5" style={{ color: 'var(--af-accent, #C2410C)' }} />
          <span>Emotional Delivery</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {emotionalPresets.map((preset) => (
            <button
              key={preset}
              onClick={() => onEmotionalModeChange(preset)}
              className="py-1.5 px-2 text-left text-[11px] font-semibold rounded-lg border transition-all truncate cursor-pointer"
              style={{
                backgroundColor: emotionalMode === preset ? 'var(--af-accent, #C2410C)' : 'var(--af-raised, #F6EDE2)',
                color: emotionalMode === preset ? 'var(--af-accent-text, #FFFFFF)' : 'var(--af-text, #431407)',
                borderColor: emotionalMode === preset ? 'var(--af-accent, #C2410C)' : 'var(--af-border, #E8D5C2)'
              }}
              title={preset}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Lyrical Cadence Switch (for romantic / narrative styles) */}
      <div 
        className="p-3 rounded-xl border flex items-center justify-between"
        style={{
          backgroundColor: 'var(--af-raised, #F6EDE2)',
          borderColor: 'var(--af-border, #E8D5C2)'
        }}
      >
        <div className="flex flex-col">
          <span 
            className="text-xs font-bold"
            style={{ color: 'var(--af-text, #431407)' }}
          >
            Lyrical Cadence
          </span>
          <span 
            className="text-[10px]"
            style={{ color: 'var(--af-text-muted, #9A5B32)' }}
          >
            Cinematic acoustic pauses
          </span>
        </div>
        <button
          onClick={() => onLyricalModeChange(!lyricalMode)}
          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
            lyricalMode ? 'bg-emerald-600' : 'bg-zinc-300'
          }`}
          aria-label="Toggle lyrical cadence"
        >
          <div 
            className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs absolute top-0.5 ${
              lyricalMode ? 'left-5.5' : 'left-0.5'
            }`}
          />
        </button>
      </div>
    </aside>
  );
};
