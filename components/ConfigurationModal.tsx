import React, { useState, useMemo, useEffect } from 'react';
import { Voice } from '../types';
import { Settings, X, Search, Check, Sparkles, SlidersHorizontal, Volume2 } from 'lucide-react';
import { useTerminal } from './terminal/TerminalContext';

interface ConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
  voices: Voice[];
}

export const ConfigurationModal: React.FC<ConfigurationModalProps> = ({
  isOpen,
  onClose,
  selectedVoice,
  onVoiceChange,
  voices
}) => {
  const { isTerminalMode } = useTerminal();
  const [filterGender, setFilterGender] = useState('ALL');
  const [filterProvider, setFilterProvider] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter voices
  const filteredVoices = useMemo(() => {
    return voices.filter(voice => {
      const matchGender = filterGender === 'ALL' || (voice.gender && voice.gender.toUpperCase() === filterGender);
      const matchProvider = filterProvider === 'ALL' || 
        (filterProvider === 'gemini' && (!voice.provider || voice.provider === 'gemini')) ||
        (filterProvider === 'elevenlabs' && voice.provider === 'elevenlabs');
      const matchSearch = !searchQuery.trim() || voice.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchGender && matchProvider && matchSearch;
    });
  }, [filterGender, filterProvider, searchQuery, voices]);

  // Focus Management
  useEffect(() => {
    if (!isOpen) return;
    const modalElement = document.getElementById('config-modal');
    if (modalElement) {
      const searchInput = modalElement.querySelector('input');
      if (searchInput) {
        searchInput.focus();
      }
    }
  }, [isOpen]);

  // Keyboard Event Trap
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

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="config-modal-title"
    >
      <div 
        id="config-modal"
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border transition-all"
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
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="config-modal-title" className="text-base sm:text-lg font-bold flex items-center gap-2 tracking-tight">
                  Voice Configuration & Studio Cast
                </h2>
                <span 
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                  style={{
                    backgroundColor: 'var(--skin-accent-muted, #FFEDD5)',
                    color: 'var(--skin-accent, #C2410C)'
                  }}
                >
                  24kHz HD
                </span>
              </div>
              <p 
                className="text-xs"
                style={{ color: 'var(--skin-text-muted, #9A5B32)' }}
              >
                Multilingual neural voices from Gemini 2.5 Flash and ElevenLabs
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
            aria-label="Close configuration"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div 
          className="p-4 sm:p-6 flex flex-col min-h-0 space-y-4"
          style={{ backgroundColor: 'var(--skin-bg-card, #FFFFFF)' }}
        >
          
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label 
                htmlFor="search-voice" 
                className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--skin-text-secondary, #7C2D12)' }}
              >
                Search Voice
              </label>
              <div className="relative">
                <Search 
                  className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" 
                  style={{ color: 'var(--skin-text-muted, #9A5B32)' }}
                />
                <input
                  id="search-voice"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by name or style..."
                  className="w-full pl-8 pr-3 py-2 border rounded-xl text-sm transition-all focus:outline-none"
                  style={{
                    backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
                    borderColor: 'var(--skin-border, #E8D5C2)',
                    color: 'var(--skin-text-primary, #431407)'
                  }}
                />
              </div>
            </div>

            <div>
              <label 
                htmlFor="provider-filter" 
                className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--skin-text-secondary, #7C2D12)' }}
              >
                Provider Engine
              </label>
              <select 
                id="provider-filter"
                className="w-full px-3 py-2 border rounded-xl text-sm transition-all cursor-pointer focus:outline-none"
                style={{
                  backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
                  borderColor: 'var(--skin-border, #E8D5C2)',
                  color: 'var(--skin-text-primary, #431407)'
                }}
                value={filterProvider}
                onChange={(e) => setFilterProvider(e.target.value)}
              >
                <option value="ALL">All Engines (Gemini & ElevenLabs)</option>
                <option value="gemini">Gemini 2.5 Neural Voices</option>
                <option value="elevenlabs">ElevenLabs Voices</option>
              </select>
            </div>

            <div>
              <label 
                htmlFor="gender-filter" 
                className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--skin-text-secondary, #7C2D12)' }}
              >
                Vocal Gender
              </label>
              <select 
                id="gender-filter"
                className="w-full px-3 py-2 border rounded-xl text-sm transition-all cursor-pointer focus:outline-none"
                style={{
                  backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
                  borderColor: 'var(--skin-border, #E8D5C2)',
                  color: 'var(--skin-text-primary, #431407)'
                }}
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
              >
                <option value="ALL">All Genders</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
          </div>

          {/* Voice List in a Grid */}
          <div 
            className="flex-1 overflow-y-auto max-h-[380px] border rounded-2xl p-3 custom-scrollbar"
            style={{
              backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
              borderColor: 'var(--skin-border, #E8D5C2)'
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" role="radiogroup" aria-label="Voice Selection">
              {filteredVoices.map((voice) => {
                const isSelected = selectedVoice === voice.id;
                const isElevenLabs = voice.provider === 'elevenlabs';

                return (
                  <label 
                    key={voice.id}
                    className="flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all"
                    style={{
                      backgroundColor: isSelected ? 'var(--skin-bg-hover, #EFE1D2)' : 'var(--skin-bg-card, #FFFFFF)',
                      borderColor: isSelected ? 'var(--skin-accent, #C2410C)' : 'var(--skin-border, #E8D5C2)',
                      boxShadow: isSelected ? '0 0 0 1.5px var(--skin-accent, #C2410C)' : 'none'
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{
                          backgroundColor: isSelected 
                            ? 'var(--skin-accent, #C2410C)' 
                            : 'var(--skin-accent-muted, #FFEDD5)',
                          color: isSelected 
                            ? 'var(--skin-accent-text, #FFFFFF)' 
                            : 'var(--skin-accent, #C2410C)'
                        }}
                      >
                        <Volume2 className="w-4 h-4" />
                      </div>
                      
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span 
                            className="font-bold text-xs sm:text-sm truncate"
                            style={{ color: 'var(--skin-text-primary, #431407)' }}
                          >
                            {voice.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span 
                            className="text-[10px] uppercase"
                            style={{ color: 'var(--skin-text-muted, #9A5B32)' }}
                          >
                            {voice.gender}
                          </span>
                          <span style={{ color: 'var(--skin-border, #E8D5C2)' }}>•</span>
                          <span 
                            className="text-[9px] font-bold px-1.5 py-0.2 rounded border"
                            style={{
                              backgroundColor: isElevenLabs ? 'rgba(234, 179, 8, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                              color: 'var(--skin-text-secondary, #7C2D12)',
                              borderColor: 'var(--skin-border, #E8D5C2)'
                            }}
                          >
                            {isElevenLabs ? 'ElevenLabs' : 'Gemini 2.5'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center ml-2">
                      <div 
                        className="w-5 h-5 rounded-full border flex items-center justify-center transition-colors"
                        style={{
                          borderColor: isSelected ? 'var(--skin-accent, #C2410C)' : 'var(--skin-border, #E8D5C2)',
                          backgroundColor: isSelected ? 'var(--skin-accent, #C2410C)' : 'transparent',
                          color: 'var(--skin-accent-text, #FFFFFF)'
                        }}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    
                    <input 
                      type="radio" 
                      name="voice" 
                      value={voice.id}
                      checked={isSelected}
                      onChange={(e) => onVoiceChange(e.target.value)}
                      className="sr-only" 
                    />
                  </label>
                );
              })}

              {filteredVoices.length === 0 && (
                <div 
                  className="col-span-full text-center py-10 text-xs"
                  style={{ color: 'var(--skin-text-muted, #9A5B32)' }}
                >
                  No voices match your search criteria. Try a different query.
                </div>
              )}
            </div>
          </div>

          {/* Footer Controls */}
          <div 
            className="flex items-center justify-between pt-2 border-t text-xs"
            style={{
              borderColor: 'var(--skin-border, #E8D5C2)',
              color: 'var(--skin-text-muted, #9A5B32)'
            }}
          >
            <span>{filteredVoices.length} voices available</span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
              style={{
                backgroundColor: 'var(--skin-accent, #C2410C)',
                color: 'var(--skin-accent-text, #FFFFFF)'
              }}
            >
              Confirm Selection
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
