import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Sparkles, 
  Download, 
  Cloud, 
  CheckCircle2, 
  Settings
} from 'lucide-react';
import { TerminalWindow } from './TerminalWindow';
import { IntroStyle } from '../../types';
import { INTRO_STYLES } from '../../constants';
import { LivePresenceBar } from '../LivePresenceBar';
import { QuotaExhaustedBanner } from '../QuotaExhaustedBanner';
import { useTerminal } from './TerminalContext';

interface TerminalMonologueViewProps {
  text: string;
  onTextChange: (text: string) => void;
  selectedStyle: IntroStyle;
  onSelectStyle: (style: IntroStyle) => void;
  selectedVoice: string;
  onOpenVoiceConfig: () => void;
  isPlaying: boolean;
  isLoading: boolean;
  isDramatizing: boolean;
  generatedAudio: { buffer: AudioBuffer; rawData: Uint8Array } | null;
  audioProgress: number;
  audioDuration: number;
  audioError: string | null;
  onDismissError: () => void;
  onSynthesizeOrPlay: () => void;
  onRegenerate?: () => void;
  onDramatize: () => void;
  onSaveToCloud: () => void;
  isSaving: boolean;
  justSaved: boolean;
  onDownloadWav: () => void;
  emotionalMode: string;
  onEmotionalModeChange: (mode: string) => void;
  lyricalMode: boolean;
  onLyricalModeChange: (enabled: boolean) => void;
}

const DRAMA_CUES = [
  { label: '[short pause]', tag: '... [pause] ...' },
  { label: '[whisper]', tag: '[soft whisper] ' },
  { label: '[dramatic]', tag: '[dramatic pause] ' },
  { label: '[emphasis]', tag: '[emphasize] ' }
];

export const TerminalMonologueView: React.FC<TerminalMonologueViewProps> = ({
  text,
  onTextChange,
  selectedStyle,
  onSelectStyle,
  selectedVoice,
  onOpenVoiceConfig,
  isPlaying,
  isLoading,
  isDramatizing,
  generatedAudio,
  audioProgress,
  audioDuration,
  audioError,
  onDismissError,
  onSynthesizeOrPlay,
  onDramatize,
  onSaveToCloud,
  isSaving,
  justSaved,
  onDownloadWav,
  emotionalMode,
  onEmotionalModeChange,
  lyricalMode,
  onLyricalModeChange
}) => {
  const { activeSkin } = useTerminal();
  const [isCommandStationMinimized, setIsCommandStationMinimized] = useState(false);
  const [isScriptBufferMinimized, setIsScriptBufferMinimized] = useState(false);
  const [isTimbreRouterMinimized, setIsTimbreRouterMinimized] = useState(false);

  const insertCue = (cue: string) => {
    onTextChange(text + (text.endsWith(' ') ? '' : ' ') + cue);
  };

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-5 md:p-6 space-y-4 max-w-7xl mx-auto w-full min-h-0 overflow-y-auto custom-scrollbar pb-16">
      
      {/* Live Collaborative Presence Bar (Light Theme) */}
      <div className="flex-shrink-0">
        <LivePresenceBar className="border shadow-2xs rounded-lg" />
      </div>

      {/* Quota Exhaustion & Upgrade Prompt */}
      <QuotaExhaustedBanner actionName="monologue generation" />

      {/* TWO COLUMN BENTO GRID */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-4 transition-all duration-200 ${isScriptBufferMinimized && isTimbreRouterMinimized ? 'flex-initial' : 'flex-1 min-h-0'}`}>
        
        {/* LEFT COLUMN: SCRIPT BUFFER (8 COLS) */}
        <div className={`lg:col-span-8 flex flex-col transition-all duration-200 ${isScriptBufferMinimized ? 'min-h-0' : 'min-h-[360px]'}`}>
          <TerminalWindow
            title="SCRIPT_STREAM_BUFFER.txt"
            subtitle="Spoken Speech Synthesis Pipeline"
            badge={`${text.length} CHARS`}
            badgeColor="blue"
            className="h-full"
            isMinimized={isScriptBufferMinimized}
            onMinimizeChange={setIsScriptBufferMinimized}
            headerActions={
              <div className="flex items-center gap-1.5 text-[11px] font-mono">
                <button
                  onClick={() => onTextChange(selectedStyle.templateText)}
                  className="hover:opacity-100 opacity-70 transition-opacity"
                  title="Reset to persona default template"
                >
                  [RESET]
                </button>
                <span className="opacity-30">|</span>
                <button
                  onClick={() => onTextChange('')}
                  className="text-rose-600 hover:text-rose-700 transition-colors font-bold"
                  title="Clear all script buffer"
                >
                  [CLEAR]
                </button>
              </div>
            }
          >
            <div 
              className="flex-1 p-3.5 flex flex-col gap-3 min-h-0"
              style={{
                backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                color: 'var(--skin-text-primary, #431407)',
              }}
            >
              
              {/* Cue Injectors Header */}
              <div 
                className="flex flex-wrap items-center gap-2 border-b pb-2.5 flex-shrink-0"
                style={{ borderColor: 'var(--skin-border, #E8D5C2)' }}
              >
                <span 
                  className="text-[10px] font-mono font-bold uppercase tracking-wide"
                  style={{ color: 'var(--skin-text-secondary, #7C2D12)' }}
                >
                  Injection Hooks:
                </span>
                {DRAMA_CUES.map((cue) => (
                  <button
                    key={cue.label}
                    onClick={() => insertCue(cue.tag)}
                    className="px-2 py-1 rounded border font-mono text-[10px] uppercase transition-all select-none hover:shadow-2xs active:scale-95"
                    style={{
                      backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
                      borderColor: 'var(--skin-border, #E8D5C2)',
                      color: 'var(--skin-text-primary, #431407)',
                    }}
                  >
                    {cue.label}
                  </button>
                ))}
              </div>

              {/* Lyrical / Emotional Fine-Tuning Controls */}
              <div 
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2.5 rounded-lg border flex-shrink-0"
                style={{
                  backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
                  borderColor: 'var(--skin-border, #E8D5C2)',
                }}
              >
                {/* Lyrical Mode Toggle */}
                <div 
                  className="flex items-center justify-between border-r pr-3 last:border-0 last:pr-0"
                  style={{ borderColor: 'var(--skin-border, #E8D5C2)' }}
                >
                  <div className="flex flex-col">
                    <span className="text-[11px] font-mono font-bold" style={{ color: 'var(--skin-text-primary, #431407)' }}>
                      LYRICAL_MELODY_ENGINE
                    </span>
                    <span className="text-[9px] font-mono opacity-70" style={{ color: 'var(--skin-text-secondary, #7C2D12)' }}>
                      Improves voice cadence
                    </span>
                  </div>
                  <button
                    onClick={() => onLyricalModeChange(!lyricalMode)}
                    className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                    style={{
                      backgroundColor: lyricalMode ? 'var(--skin-accent, #C2410C)' : '#D1D5DB'
                    }}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        lyricalMode ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Emotional Pitch Level Preset Selector */}
                <div className="flex items-center justify-between pl-0 sm:pl-3">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-mono font-bold" style={{ color: 'var(--skin-text-primary, #431407)' }}>
                      EMOTION_COEFFICIENT
                    </span>
                    <span className="text-[9px] font-mono opacity-70" style={{ color: 'var(--skin-text-secondary, #7C2D12)' }}>
                      Psychological color
                    </span>
                  </div>
                  <select
                    value={emotionalMode}
                    onChange={(e) => onEmotionalModeChange(e.target.value)}
                    className="p-1 px-2 rounded border font-mono text-[10px] outline-none cursor-pointer"
                    style={{
                      backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                      borderColor: 'var(--skin-border, #E8D5C2)',
                      color: 'var(--skin-text-primary, #431407)',
                    }}
                  >
                    <option value="none">00_FLAT_MONO</option>
                    <option value="whisper">01_WHISPER</option>
                    <option value="lyrical">02_SPOKEN_MELODY</option>
                    <option value="dramatic">03_DRAMA_CREST</option>
                    <option value="extreme">04_EMOTION_MAX</option>
                  </select>
                </div>
              </div>

              {/* Main Textarea */}
              <div className="flex-1 relative min-h-0">
                <textarea
                  value={text}
                  onChange={(e) => onTextChange(e.target.value)}
                  className="w-full h-full p-4 border rounded-lg font-mono text-xs sm:text-sm focus:outline-none resize-none leading-relaxed custom-scrollbar shadow-inner"
                  style={{
                    backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
                    borderColor: 'var(--skin-border, #E8D5C2)',
                    color: 'var(--skin-text-primary, #431407)',
                  }}
                  placeholder="// Enter voice script text here... //"
                />
              </div>

              {/* Bottom Telemetry Status bar */}
              <div 
                className="mt-2 pt-2 border-t flex items-center justify-between text-[10px] font-mono flex-shrink-0"
                style={{ borderColor: 'var(--skin-border, #E8D5C2)' }}
              >
                <span style={{ color: 'var(--skin-text-secondary, #7C2D12)' }}>
                  ENCODING: UTF-8 // 24kHz PCM
                </span>
                <span className="font-bold" style={{ color: 'var(--skin-accent, #C2410C)' }}>
                  STATUS: READY TO DISPATCH
                </span>
              </div>

            </div>
          </TerminalWindow>
        </div>

        {/* RIGHT COLUMN: TIMBRE MATRIX (4 COLS) */}
        <div className={`lg:col-span-4 flex flex-col transition-all duration-200 ${isTimbreRouterMinimized ? 'min-h-0' : 'min-h-[360px]'}`}>
          <TerminalWindow
            title="VOCAL_TIMBRE_ROUTER.conf"
            subtitle="Speaker Model Selection"
            badge={selectedStyle.name}
            badgeColor="yellow"
            className="h-full"
            isMinimized={isTimbreRouterMinimized}
            onMinimizeChange={setIsTimbreRouterMinimized}
            headerActions={
              <button
                onClick={onOpenVoiceConfig}
                className="p-1 rounded hover:bg-black/5 transition-colors"
                style={{ color: 'var(--skin-text-secondary, #7C2D12)' }}
                title="Configure Voice Parameters"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div 
              className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto custom-scrollbar"
              style={{
                backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                color: 'var(--skin-text-primary, #431407)',
              }}
            >
              
              <div 
                className="text-[10px] font-mono pb-1 uppercase font-bold"
                style={{ color: 'var(--skin-text-secondary, #7C2D12)' }}
              >
                Timbre Profiles available:
              </div>

              <div className="flex-1 flex flex-col gap-2 min-h-0">
                {INTRO_STYLES.map((style) => {
                  const isSelected = selectedStyle.id === style.id;
                  
                  return (
                    <div
                      key={style.id}
                      onClick={() => onSelectStyle(style)}
                      className={`p-3 rounded-lg border font-mono text-xs cursor-pointer select-none transition-all ${
                        isSelected
                          ? 'shadow-xs font-bold'
                          : 'hover:opacity-95'
                      }`}
                      style={{
                        backgroundColor: isSelected ? 'var(--skin-bg-subtle, #F6EDE2)' : 'var(--skin-bg-card, #FFFFFF)',
                        borderColor: isSelected ? 'var(--skin-accent, #C2410C)' : 'var(--skin-border, #E8D5C2)',
                      }}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span style={{ color: isSelected ? 'var(--skin-accent, #C2410C)' : 'var(--skin-text-primary, #431407)' }}>
                          {style.name}
                        </span>
                        <span 
                          className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border"
                          style={{
                            backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                            borderColor: 'var(--skin-border, #E8D5C2)',
                            color: 'var(--skin-text-secondary, #7C2D12)',
                          }}
                        >
                          {style.id === 'custom' ? 'USER_DEF' : 'SYS_PRE'}
                        </span>
                      </div>
                      
                      <div className="text-[10px] mt-1 line-clamp-2 leading-relaxed opacity-75" style={{ color: 'var(--skin-text-secondary, #7C2D12)' }}>
                        {style.description}
                      </div>

                      <div 
                        className="mt-2 flex items-center justify-between text-[10px] font-mono pt-1.5 border-t"
                        style={{ borderColor: 'var(--skin-border, #E8D5C2)' }}
                      >
                        <span className="opacity-70">DEFAULT: {style.defaultVoice}</span>
                        {isSelected && (
                          <span className="font-bold" style={{ color: 'var(--skin-accent, #C2410C)' }}>● PATCHED</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </TerminalWindow>
        </div>

      </div>

      {/* MASTER COMMAND STATION & AUDIO DECK */}
      <TerminalWindow
        title="MASTER_COMMAND_STATION.exec"
        subtitle="Linear PCM 24kHz / Neural Synthesis Core"
        badge={isLoading ? 'PROCESSING' : isPlaying ? 'ON AIR' : generatedAudio ? 'BUFFER READY' : 'STANDBY'}
        badgeColor={isLoading ? 'yellow' : isPlaying ? 'red' : generatedAudio ? 'green' : 'blue'}
        isMinimized={isCommandStationMinimized}
        onMinimizeChange={setIsCommandStationMinimized}
      >
        <div 
          className="p-3.5 sm:p-4 flex flex-col gap-3.5"
          style={{
            backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
            color: 'var(--skin-text-primary, #431407)',
          }}
        >
          
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Primary Action Button & Status */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={onSynthesizeOrPlay}
                disabled={isLoading || !text.trim()}
                className="h-11 sm:h-12 px-5 sm:px-6 rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-sm hover:shadow active:scale-95 flex-shrink-0"
                style={{
                  backgroundColor: 'var(--skin-accent, #C2410C)',
                  color: 'var(--skin-accent-text, #FFFFFF)',
                }}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>SYNTHESIZING...</span>
                  </>
                ) : isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>PAUSE_STREAM</span>
                  </>
                ) : generatedAudio ? (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>REPLAY_BUFFER</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>EXECUTE_SYNTH</span>
                  </>
                )}
              </button>

              {/* Status Telemetry */}
              <div className="flex flex-col justify-center font-mono min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold truncate" style={{ color: 'var(--skin-text-primary, #431407)' }}>
                  <span 
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${isLoading ? 'animate-ping' : isPlaying ? 'animate-pulse' : ''}`}
                    style={{ backgroundColor: 'var(--skin-accent, #C2410C)' }}
                  />
                  <span className="truncate">
                    {isLoading ? 'NEURAL COMPILATION' : isPlaying ? 'STREAM ACTIVE' : generatedAudio ? '24kHz STEREO' : 'IDLE'}
                  </span>
                </div>
                <div className="text-[10px] truncate opacity-70" style={{ color: 'var(--skin-text-secondary, #7C2D12)' }}>
                  {audioDuration > 0 ? `${audioDuration.toFixed(1)}s generated` : `${text.length} chars buffered`}
                </div>
              </div>
            </div>

            {/* Command Buttons */}
            <div className="flex items-center gap-2 flex-wrap justify-start md:justify-end">
              {/* AI Dramatize Button */}
              <button
                onClick={onDramatize}
                disabled={isDramatizing || !text.trim()}
                className="px-3 py-2 rounded-lg border font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-all shadow-2xs hover:shadow-xs"
                style={{
                  backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
                  borderColor: 'var(--skin-border, #E8D5C2)',
                  color: 'var(--skin-accent, #C2410C)',
                }}
                title="Dramatize script using Gemini AI"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isDramatizing ? 'animate-spin' : ''}`} />
                <span>DRAMATIZE</span>
              </button>

              {/* Save to Cloud */}
              <button
                onClick={onSaveToCloud}
                disabled={isSaving || !text.trim()}
                className="px-3 py-2 rounded-lg border font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-all shadow-2xs hover:shadow-xs"
                style={{
                  backgroundColor: justSaved ? 'var(--skin-accent, #C2410C)' : 'var(--skin-bg-subtle, #F6EDE2)',
                  borderColor: 'var(--skin-border, #E8D5C2)',
                  color: justSaved ? '#FFFFFF' : 'var(--skin-text-primary, #431407)',
                }}
                title="Save script to Cloud Vault"
              >
                {justSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Cloud className="w-3.5 h-3.5" />}
                <span>{justSaved ? 'SAVED' : 'SAVE_VAULT'}</span>
              </button>

              {/* WAV Export Button */}
              <button
                onClick={onDownloadWav}
                disabled={!generatedAudio}
                className="px-3.5 py-2 rounded-lg border disabled:opacity-40 font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-all shadow-2xs hover:shadow-xs"
                style={{
                  backgroundColor: 'var(--skin-accent, #C2410C)',
                  borderColor: 'var(--skin-border-strong, #D7BCA3)',
                  color: 'var(--skin-accent-text, #FFFFFF)',
                }}
                title="Download 24kHz Master WAV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>EXPORT_WAV</span>
              </button>
            </div>

          </div>

          {/* Waveform Scrubber Strip */}
          <div 
            className="pt-2 border-t flex items-center gap-3"
            style={{ borderColor: 'var(--skin-border, #E8D5C2)' }}
          >
            <span 
              className="text-[10px] font-mono uppercase font-bold flex-shrink-0"
              style={{ color: 'var(--skin-text-secondary, #7C2D12)' }}
            >
              SPECTRUM: {(audioProgress * 100).toFixed(0)}%
            </span>
            <div 
              className="flex-1 flex items-end gap-1 h-6 border rounded px-2 py-1 overflow-hidden"
              style={{
                backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
                borderColor: 'var(--skin-border, #E8D5C2)',
              }}
            >
              {[15, 30, 22, 45, 60, 25, 38, 70, 48, 20, 35, 55, 65, 32, 40, 75, 50, 28, 36, 62, 44, 25, 35, 55, 40, 25].map((h, idx) => (
                <div
                  key={idx}
                  style={{ 
                    height: `${Math.min(100, Math.max(15, h * (isPlaying ? 1.2 : 0.6)))}%`,
                    backgroundColor: audioProgress > (idx / 26) ? 'var(--skin-accent, #C2410C)' : 'var(--skin-border-strong, #D7BCA3)'
                  }}
                  className="flex-1 rounded-2xs transition-all"
                />
              ))}
            </div>
            {audioDuration > 0 && (
              <span className="text-[10px] font-mono flex-shrink-0 opacity-70" style={{ color: 'var(--skin-text-secondary, #7C2D12)' }}>
                {(audioProgress * audioDuration).toFixed(1)}s / {audioDuration.toFixed(1)}s
              </span>
            )}
          </div>

          {/* Error Banner */}
          {audioError && (
            <div className="p-2.5 rounded border border-rose-300 bg-rose-50 text-rose-800 font-mono text-xs flex items-center justify-between">
              <span>[ERR]: {audioError}</span>
              <button onClick={onDismissError} className="font-bold text-white px-2 py-0.5 bg-rose-600 rounded">✕</button>
            </div>
          )}

        </div>
      </TerminalWindow>

    </div>
  );
};
