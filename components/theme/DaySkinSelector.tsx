/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY 7-Day Light Skin Selector
 * Interactive switcher for the 7 unique light theme skins.
 */
import React, { useState, useRef, useEffect } from 'react';
import { Sun, Check, Sparkles, ChevronDown, Calendar, RefreshCw } from 'lucide-react';
import { useTerminal } from '../terminal/TerminalContext';
import { DAY_SKINS, DAY_ORDER, DaySkinId, getTodaySkinId } from '../../src/theme/daySkins';

export const DaySkinSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { activeSkin, selectedSkinId, setSelectedSkinId, isAutoDaySkin } = useTerminal();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const todayId = getTodaySkinId();

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-2xs hover:shadow-xs active:scale-98"
        style={{
          backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
          borderColor: 'var(--skin-border, #E8D5C2)',
          color: 'var(--skin-text-primary, #431407)',
        }}
        title={`Active Skin: ${activeSkin.themeName} (${activeSkin.dayName})`}
        aria-expanded={isOpen}
      >
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-xs"
          style={{ backgroundColor: activeSkin.palette.accent }}
        />
        
        <span className="tracking-wide">
          <span className="font-extrabold">{activeSkin.dayShort}</span>
          <span className="hidden sm:inline font-medium text-xs ml-1 opacity-90">
            · {activeSkin.themeName}
          </span>
        </span>

        {isAutoDaySkin && (
          <span
            className="text-[9px] uppercase px-1.5 py-0.5 rounded font-extrabold hidden md:inline tracking-wider"
            style={{
              backgroundColor: 'var(--skin-accent-muted, #FFEDD5)',
              color: 'var(--skin-accent, #C2410C)',
            }}
          >
            AUTO
          </span>
        )}

        <ChevronDown className="w-3.5 h-3.5 opacity-60 transition-transform duration-150" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border p-3 z-50 shadow-xl transition-all animate-in fade-in zoom-in-95 duration-150"
          style={{
            backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
            borderColor: 'var(--skin-border, #E8D5C2)',
            color: 'var(--skin-text-primary, #431407)',
            boxShadow: 'var(--skin-shadow, 0 10px 25px -5px rgba(0,0,0,0.1))',
          }}
        >
          {/* Popover Header */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b" style={{ borderColor: 'var(--skin-border, #E8D5C2)' }}>
            <div className="flex items-center gap-1.5">
              <Sun className="w-4 h-4" style={{ color: 'var(--skin-accent, #C2410C)' }} />
              <span className="font-mono text-xs font-bold uppercase tracking-wider">
                7-Day Light Skins
              </span>
            </div>

            {/* Auto Match Toggle */}
            <button
              type="button"
              onClick={() => setSelectedSkinId('auto')}
              className={`px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-colors border ${
                isAutoDaySkin
                  ? 'border-transparent'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border-zinc-200'
              }`}
              style={
                isAutoDaySkin
                  ? {
                      backgroundColor: 'var(--skin-accent-muted, #FFEDD5)',
                      color: 'var(--skin-accent, #C2410C)',
                    }
                  : undefined
              }
              title="Automatically match today's day of week"
            >
              <RefreshCw className={`w-3 h-3 ${isAutoDaySkin ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
              <span>Auto (Today)</span>
            </button>
          </div>

          <p className="text-[11px] mb-2.5 opacity-75 font-sans leading-relaxed">
            Every day of the week has a bespoke light palette tailored for high-contrast audio production.
          </p>

          {/* Quick 7-Day Pill Bar */}
          <div className="grid grid-cols-7 gap-1 mb-3 p-1 rounded-lg" style={{ backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)' }}>
            {DAY_ORDER.map((dayId) => {
              const skin = DAY_SKINS[dayId];
              const isSelected = activeSkin.id === dayId;
              const isToday = dayId === todayId;

              return (
                <button
                  key={dayId}
                  type="button"
                  onClick={() => {
                    setSelectedSkinId(dayId);
                  }}
                  className={`py-1.5 rounded text-[10px] font-mono font-bold flex flex-col items-center justify-center transition-all ${
                    isSelected ? 'shadow-2xs font-extrabold scale-105' : 'hover:opacity-100 opacity-70'
                  }`}
                  style={{
                    backgroundColor: isSelected ? skin.palette.accent : 'transparent',
                    color: isSelected ? skin.palette.accentText : 'var(--skin-text-primary, #431407)',
                  }}
                  title={`${skin.dayName}: ${skin.themeName}`}
                >
                  <span>{skin.dayShort}</span>
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-0.5"
                    style={{ backgroundColor: isSelected ? '#FFFFFF' : skin.palette.accent }}
                  />
                </button>
              );
            })}
          </div>

          {/* Detailed List */}
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {DAY_ORDER.map((dayId) => {
              const skin = DAY_SKINS[dayId];
              const isSelected = activeSkin.id === dayId;
              const isToday = dayId === todayId;

              return (
                <button
                  key={dayId}
                  type="button"
                  onClick={() => {
                    setSelectedSkinId(dayId);
                  }}
                  className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between gap-2.5 ${
                    isSelected ? 'shadow-2xs' : 'hover:opacity-95'
                  }`}
                  style={{
                    backgroundColor: isSelected ? skin.palette.bgSubtle : skin.palette.bgCard,
                    borderColor: isSelected ? skin.palette.accent : skin.palette.border,
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Color Swatch Disc */}
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center font-mono font-bold text-[10px] flex-shrink-0 shadow-2xs border"
                      style={{
                        backgroundColor: skin.palette.accent,
                        color: skin.palette.accentText,
                        borderColor: skin.palette.borderStrong,
                      }}
                    >
                      {skin.dayShort}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold truncate" style={{ color: skin.palette.textPrimary }}>
                          {skin.themeName}
                        </span>
                        {isToday && (
                          <span
                            className="text-[9px] px-1 py-0.2 rounded font-mono font-extrabold"
                            style={{
                              backgroundColor: skin.palette.accentMuted,
                              color: skin.palette.accent,
                            }}
                          >
                            TODAY
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] truncate" style={{ color: skin.palette.textSecondary }}>
                        {skin.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Active Indicator Checkmark */}
                  {isSelected && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: skin.palette.accent, color: skin.palette.accentText }}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] font-mono opacity-70" style={{ borderColor: 'var(--skin-border, #E8D5C2)' }}>
            <span>Pure Light Architecture</span>
            <span style={{ color: 'var(--skin-accent, #C2410C)' }}>{activeSkin.dayName} Active</span>
          </div>
        </div>
      )}
    </div>
  );
};
