import React, { useRef } from 'react';
import { 
  Sparkles, 
  Wand2, 
  RotateCcw, 
  Clock, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  Radio,
  Sliders,
  Volume2
} from 'lucide-react';
import { IntroStyle } from '../../../types';
import { LivePresenceBar } from '../../../components/LivePresenceBar';

interface CreativeCanvasProps {
  text: string;
  onTextChange: (val: string) => void;
  selectedStyle: IntroStyle;
  selectedVoice: string;
  onOpenVoiceConfig: () => void;
  onOpenPersonaModal: () => void;
  isDramatizing: boolean;
  onDramatize: () => void;
  audioError: string | null;
  onDismissError: () => void;
  wordCount: number;
  charCount: number;
  estimatedSeconds: number;
}

const DRAMA_CUES = [
  { label: '[short pause]', insert: '... ' },
  { label: '[deep breath]', insert: ' (takes a breath) ' },
  { label: '[emphasis]', insert: ' *absolutely* ' },
  { label: '[whisper]', insert: ' (whispering) ' }
];

export const CreativeCanvas: React.FC<CreativeCanvasProps> = ({
  text,
  onTextChange,
  selectedStyle,
  selectedVoice,
  onOpenVoiceConfig,
  onOpenPersonaModal,
  isDramatizing,
  onDramatize,
  audioError,
  onDismissError,
  wordCount,
  charCount,
  estimatedSeconds
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertCue = (cueText: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = text.substring(0, start) + cueText + text.substring(end);
    onTextChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cueText.length, start + cueText.length);
    }, 10);
  };

  return (
    <div className="af-canvas select-none custom-scrollbar min-h-full flex flex-col gap-3">
      {/* Collaboration Live Presence */}
      <div className="flex-shrink-0">
        <LivePresenceBar />
      </div>

      {/* Audio/Synthesis Error Banner */}
      {audioError && (
        <div 
          className="p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs flex-shrink-0"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            borderColor: 'rgba(239, 68, 68, 0.25)',
            color: '#b91c1c'
          }}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{audioError}</span>
          </div>
          <button
            onClick={onDismissError}
            className="font-bold underline hover:opacity-80 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Central Script Editor Container */}
      <div 
        className="flex-1 min-h-[380px] rounded-2xl border shadow-sm flex flex-col overflow-hidden"
        style={{
          backgroundColor: 'var(--af-surface, #FFFFFF)',
          borderColor: 'var(--af-border, #E8D5C2)'
        }}
      >
        {/* Editor Toolbar: Persona, Voice Badge, AI Dramatize */}
        <div 
          className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2.5"
          style={{
            backgroundColor: 'var(--af-raised, #F6EDE2)',
            borderColor: 'var(--af-border, #E8D5C2)'
          }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            {/* Active Persona Tag */}
            <button
              onClick={onOpenPersonaModal}
              className="px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer hover:opacity-80"
              style={{
                borderColor: 'var(--af-border, #E8D5C2)',
                backgroundColor: 'var(--af-surface, #FFFFFF)',
                color: 'var(--af-text, #431407)'
              }}
              title="Change Persona Directives"
            >
              <Radio className="w-3.5 h-3.5" style={{ color: 'var(--af-accent, #C2410C)' }} />
              <span>{selectedStyle.name}</span>
            </button>

            {/* Active Voice Tag */}
            <button
              onClick={onOpenVoiceConfig}
              className="px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer hover:opacity-80"
              style={{
                borderColor: 'var(--af-border, #E8D5C2)',
                backgroundColor: 'var(--af-surface, #FFFFFF)',
                color: 'var(--af-text, #431407)'
              }}
              title="Configure Voice"
            >
              <Volume2 className="w-3.5 h-3.5" style={{ color: 'var(--af-accent, #C2410C)' }} />
              <span>{selectedVoice}</span>
            </button>
          </div>

          {/* AI Writing Assistant / Dramatization Button */}
          <button
            onClick={onDramatize}
            disabled={isDramatizing || !text.trim()}
            className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
            style={{
              backgroundColor: 'var(--af-accent, #C2410C)',
              color: 'var(--af-accent-text, #FFFFFF)'
            }}
            title="Dramatize Script using Gemini AI"
          >
            {isDramatizing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Dramatizing…</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5" />
                <span>AI Dramatize</span>
              </>
            )}
          </button>
        </div>

        {/* Script Text Area */}
        <div className="p-4 sm:p-6 flex-1 min-h-0 flex flex-col justify-between">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Write your narration, dialogue, or script here. Use drama cues below to insert acoustic pauses and performance directions..."
            className="w-full flex-1 min-h-[160px] text-sm sm:text-base leading-relaxed border-0 outline-none resize-none bg-transparent custom-scrollbar mb-3"
            style={{ color: 'var(--af-text, #431407)' }}
          />

          {/* Drama Acoustic Cues Toolbar */}
          <div 
            className="pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-xs flex-shrink-0"
            style={{ borderColor: 'var(--af-border, #E8D5C2)' }}
          >
            <div className="flex items-center gap-1.5 flex-wrap">
              <span 
                className="text-[11px] font-bold uppercase mr-1"
                style={{ color: 'var(--af-text-muted, #9A5B32)' }}
              >
                Cues:
              </span>
              {DRAMA_CUES.map(cue => (
                <button
                  key={cue.label}
                  onClick={() => insertCue(cue.insert)}
                  className="px-2 py-1 rounded-lg border text-[11px] font-mono transition-colors cursor-pointer hover:opacity-85"
                  style={{
                    backgroundColor: 'var(--af-raised, #F6EDE2)',
                    borderColor: 'var(--af-border, #E8D5C2)',
                    color: 'var(--af-text-secondary, #7C2D12)'
                  }}
                  title={`Insert ${cue.label}`}
                >
                  {cue.label}
                </button>
              ))}
            </div>

            {/* Live Stats: Words, Chars, Read Duration */}
            <div 
              className="flex items-center gap-3 text-[11px] font-mono"
              style={{ color: 'var(--af-text-muted, #9A5B32)' }}
            >
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{charCount} chars</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold" style={{ color: 'var(--af-text, #431407)' }}>
                <Clock className="w-3 h-3" />
                ~{estimatedSeconds}s read
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
