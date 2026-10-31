import React, { useState } from 'react';
import { Music, Loader2, Sparkles, Play, Pause, Volume2, CheckCircle2 } from 'lucide-react';
import { generateBGM } from '../services/elevenLabsService';
import { decodeBase64ToBytes } from '../services/geminiService';

import { useFirebase } from '../services/firebaseContext';

interface BgmGeneratorProps {
  onBgmGenerated: (audioBuffer: ArrayBuffer) => void;
  onRequireAuth?: (action?: () => void) => void;
}

const PRESET_STYLES = [
  { label: 'Cyberpunk Lo-Fi', prompt: 'Chill lo-fi synthwave beat with soft vinyl crackle and electric keys' },
  { label: 'Cinematic Orchestral', prompt: 'Epic cinematic strings building tension with deep brass swell' },
  { label: 'Corporate Podcast Stinger', prompt: 'Upbeat modern clean tech podcast acoustic intro stinger' },
  { label: 'Ambient Drone', prompt: 'Deep meditative ambient drone pad with gentle resonant echoes' }
];

export const BgmGenerator: React.FC<BgmGeneratorProps> = ({ onBgmGenerated, onRequireAuth }) => {
  const { user } = useFirebase();
  const [prompt, setPrompt] = useState('Chill lo-fi synthwave beat with soft vinyl crackle and electric keys');
  const [duration, setDuration] = useState<number>(15);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGeneratedUrl, setLastGeneratedUrl] = useState<string | null>(null);

  const handleGenerate = async (skipAuthCheck = false) => {
    if (!user && !skipAuthCheck) {
      if (onRequireAuth) onRequireAuth(() => handleGenerate(true));
      return;
    }
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateBGM(prompt, duration);
      const audioBytes = decodeBase64ToBytes(result.audioBase64);
      // Create preview url
      const blob = new Blob([audioBytes as any], { type: result.contentType || 'audio/mpeg' });
      setLastGeneratedUrl(URL.createObjectURL(blob));
      onBgmGenerated(audioBytes.buffer as ArrayBuffer);
    } catch (err: any) {
      setError(err.message || "Failed to generate BGM soundscape.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div 
      className="flex flex-col gap-3.5 rounded-xl p-4 sm:p-5 border shadow-2xs"
      style={{
        backgroundColor: 'var(--af-surface, #FFFFFF)',
        borderColor: 'var(--af-border, #E8D5C2)'
      }}
    >
      
      {/* Preset Vibe Chips */}
      <div>
        <label 
          className="block text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: 'var(--af-text, #431407)' }}
        >
          Preset Moods & Soundscapes
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_STYLES.map((style) => {
            const isSelected = prompt === style.prompt;
            return (
              <button
                key={style.label}
                type="button"
                onClick={() => setPrompt(style.prompt)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all border cursor-pointer"
                style={{
                  backgroundColor: isSelected ? 'var(--af-accent, #C2410C)' : 'var(--af-raised, #F6EDE2)',
                  color: isSelected ? 'var(--af-accent-text, #FFFFFF)' : 'var(--af-text, #431407)',
                  borderColor: isSelected ? 'var(--af-accent, #C2410C)' : 'var(--af-border, #E8D5C2)'
                }}
              >
                {style.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Prompt Box */}
      <div>
        <label 
          className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
          style={{ color: 'var(--af-text, #431407)' }}
        >
          Soundscape Prompt Directives
        </label>
        <div className="relative">
          <input 
            type="text" 
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe your desired mood, instrumentation, and tempo..."
            className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-sans focus:outline-none transition-all shadow-inner"
            style={{
              backgroundColor: 'var(--af-raised, #F6EDE2)',
              borderColor: 'var(--af-border, #E8D5C2)',
              color: 'var(--af-text, #431407)'
            }}
          />
        </div>
      </div>

      {/* Duration and Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: 'var(--af-text, #431407)' }}>Duration:</span>
          {[10, 15, 30].map(sec => {
            const isSelected = duration === sec;
            return (
              <button
                key={sec}
                type="button"
                onClick={() => setDuration(sec)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer"
                style={{
                  backgroundColor: isSelected ? 'var(--af-accent, #C2410C)' : 'var(--af-raised, #F6EDE2)',
                  color: isSelected ? 'var(--af-accent-text, #FFFFFF)' : 'var(--af-text, #431407)',
                  borderColor: isSelected ? 'var(--af-accent, #C2410C)' : 'var(--af-border, #E8D5C2)'
                }}
              >
                {sec}s
              </button>
            );
          })}
        </div>

        <button 
          onClick={() => handleGenerate()} 
          disabled={isGenerating || !prompt.trim()}
          className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          style={{
            backgroundColor: 'var(--af-accent, #C2410C)',
            color: 'var(--af-accent-text, #FFFFFF)'
          }}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Synthesizing Bed...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Soundscape</span>
            </>
          )}
        </button>
      </div>

      {/* Audio Sample Player if generated */}
      {lastGeneratedUrl && (
        <div 
          className="mt-1 pt-3 border-t flex flex-col sm:flex-row items-center justify-between gap-2 p-2.5 rounded-xl border"
          style={{
            backgroundColor: 'var(--af-raised, #F6EDE2)',
            borderColor: 'var(--af-border, #E8D5C2)'
          }}
        >
          <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--af-text, #431407)' }}>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Soundscape Ready ({duration}s stem)</span>
          </div>
          <audio controls src={lastGeneratedUrl} className="w-full sm:w-60 h-7" />
        </div>
      )}

      {error && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          {error}
        </div>
      )}

    </div>
  );
};

