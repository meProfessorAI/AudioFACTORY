import React, { useEffect, useState, useRef } from 'react';
import { Voice } from '../types';
import { Terminal, X, Check, FileCode, Sliders } from 'lucide-react';
import { useTerminal } from './terminal/TerminalContext';

interface SystemPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  isEditable?: boolean;
  onSave?: (newPrompt: string, newVoice?: string) => void;
  currentVoice?: string;
  voices: Voice[];
}

export const SystemPromptModal: React.FC<SystemPromptModalProps> = ({
  isOpen,
  onClose,
  prompt,
  isEditable = false,
  onSave,
  currentVoice,
  voices
}) => {
  const { isTerminalMode } = useTerminal();
  const [localPrompt, setLocalPrompt] = useState(prompt);
  const [localVoice, setLocalVoice] = useState(currentVoice || (voices[0] ? voices[0].id : ''));

  useEffect(() => {
    setLocalPrompt(prompt);
    if (currentVoice) {
      setLocalVoice(currentVoice);
    }
  }, [prompt, currentVoice]);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSave = () => {
    if (onSave) {
      onSave(localPrompt, localVoice);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="prompt-modal-title"
    >
      <div 
        id="system-prompt-modal"
        tabIndex={-1}
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border outline-none transition-all"
        style={{
          backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
          borderColor: 'var(--skin-border, #E8D5C2)',
          color: 'var(--skin-text-primary, #431407)',
          boxShadow: 'var(--skin-shadow, 0 10px 25px rgba(0,0,0,0.1))'
        }}
      >
        
        {/* Header */}
        <div 
          className="p-4 sm:p-5 border-b flex justify-between items-center flex-shrink-0"
          style={{
            backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
            borderColor: 'var(--skin-border, #E8D5C2)'
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs"
              style={{
                backgroundColor: 'var(--skin-accent, #C2410C)',
                color: 'var(--skin-accent-text, #FFFFFF)'
              }}
            >
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 id="prompt-modal-title" className="text-base sm:text-lg font-bold flex items-center gap-2 tracking-tight">
                {isEditable ? 'Configure Custom Persona Style' : 'Persona Directives'}
              </h2>
              <p 
                className="text-xs"
                style={{ color: 'var(--skin-text-muted, #9A5B32)' }}
              >
                {isEditable ? 'Craft your custom prompt instructions and acoustic profile' : 'Underlying prompt directives dispatched to Gemini neural voice model'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl border transition-colors hover:opacity-80"
            style={{
              borderColor: 'var(--skin-border, #E8D5C2)',
              backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
              color: 'var(--skin-text-secondary, #7C2D12)'
            }}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div 
          className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-4 custom-scrollbar"
          style={{ backgroundColor: 'var(--skin-bg-card, #FFFFFF)' }}
        >
          
          {/* Voice Selector (Editable Mode Only) */}
          {isEditable && (
            <div 
              className="border rounded-2xl p-4"
              style={{
                backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
                borderColor: 'var(--skin-border, #E8D5C2)'
              }}
            >
              <label 
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--skin-text-secondary, #7C2D12)' }}
              >
                Assigned Voice Persona
              </label>
              <select
                value={localVoice}
                onChange={(e) => setLocalVoice(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-sm transition-all cursor-pointer focus:outline-none"
                style={{
                  backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                  borderColor: 'var(--skin-border, #E8D5C2)',
                  color: 'var(--skin-text-primary, #431407)'
                }}
              >
                {voices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.gender}) - {v.provider === 'elevenlabs' ? 'ElevenLabs' : 'Gemini'}
                  </option>
                ))}
              </select>
              <p 
                className="mt-1.5 text-[11px]"
                style={{ color: 'var(--skin-text-muted, #9A5B32)' }}
              >
                Select the baseline voice model that best reflects your persona.
              </p>
            </div>
          )}

          {/* Prompt Instructions */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-1.5">
              <label 
                className="block text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--skin-text-secondary, #7C2D12)' }}
              >
                Directives & Acoustic Prompts
              </label>
              <span 
                className="text-[10px]"
                style={{ color: 'var(--skin-text-muted, #9A5B32)' }}
              >
                {localPrompt.length} characters
              </span>
            </div>

            {isEditable ? (
              <textarea
                value={localPrompt}
                onChange={(e) => setLocalPrompt(e.target.value)}
                className="w-full flex-1 min-h-[220px] p-3.5 border rounded-xl text-xs sm:text-sm leading-relaxed resize-none focus:outline-none"
                style={{
                  backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
                  borderColor: 'var(--skin-border, #E8D5C2)',
                  color: 'var(--skin-text-primary, #431407)'
                }}
                placeholder="Instruct the model on pacing, tone, inflection, pauses, and emotional depth..."
              />
            ) : (
              <div 
                className="w-full flex-1 min-h-[220px] p-3.5 border rounded-xl text-xs sm:text-sm leading-relaxed overflow-y-auto whitespace-pre-wrap select-text"
                style={{
                  backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
                  borderColor: 'var(--skin-border, #E8D5C2)',
                  color: 'var(--skin-text-primary, #431407)'
                }}
              >
                {prompt}
              </div>
            )}
          </div>

          {/* Footer */}
          <div 
            className="flex items-center justify-end gap-2 pt-3 border-t"
            style={{ borderColor: 'var(--skin-border, #E8D5C2)' }}
          >
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border text-xs font-bold uppercase transition-colors cursor-pointer"
              style={{
                borderColor: 'var(--skin-border, #E8D5C2)',
                backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                color: 'var(--skin-text-secondary, #7C2D12)'
              }}
            >
              {isEditable ? 'Cancel' : 'Dismiss'}
            </button>
            {isEditable && (
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                style={{
                  backgroundColor: 'var(--skin-accent, #C2410C)',
                  color: 'var(--skin-accent-text, #FFFFFF)'
                }}
              >
                Save Persona
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
