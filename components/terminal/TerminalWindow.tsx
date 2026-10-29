import React, { useState } from 'react';
import { 
  Minimize2, 
  Maximize2, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Minus
} from 'lucide-react';
import { useTerminal } from './TerminalContext';

export interface TerminalWindowProps {
  id?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'blue' | 'red' | 'yellow' | 'green';
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
  onClose?: () => void;
  defaultMinimized?: boolean;
  isMinimized?: boolean;
  onMinimizeChange?: (minimized: boolean) => void;
  canMaximize?: boolean;
  accentColor?: 'blue' | 'red' | 'yellow' | 'green';
}

export const TerminalWindow: React.FC<TerminalWindowProps> = ({
  id,
  title,
  subtitle,
  badge,
  badgeColor = 'green',
  children,
  className = '',
  headerActions,
  onClose,
  defaultMinimized = false,
  isMinimized: isMinimizedProp,
  onMinimizeChange,
  canMaximize = true,
}) => {
  const [internalMinimized, setInternalMinimized] = useState<boolean>(defaultMinimized);
  const isMinimized = isMinimizedProp !== undefined ? isMinimizedProp : internalMinimized;
  const { activeSkin } = useTerminal();
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  const setIsMinimized = (val: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof val === 'function' ? val(isMinimized) : val;
    if (isMinimizedProp === undefined) {
      setInternalMinimized(nextVal);
    }
    if (onMinimizeChange) {
      onMinimizeChange(nextVal);
    }
  };

  const parsedClassName = isMinimized 
    ? className.replace(/\b(h-full|h-\[.*?\]|flex-1)\b/g, '') + ' h-auto flex-initial'
    : className;

  return (
    <div
      id={id}
      className={`relative rounded-xl border transition-all duration-200 flex flex-col ${
        isMaximized 
          ? 'fixed inset-4 z-50 overflow-hidden shadow-2xl' 
          : 'overflow-hidden shadow-sm'
      } ${parsedClassName}`}
      style={{
        backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
        borderColor: 'var(--skin-border, #E8D5C2)',
        boxShadow: 'var(--skin-shadow, 0 4px 16px -2px rgba(0,0,0,0.06))',
      }}
    >
      {/* Window Header Bar */}
      <div 
        className="px-3.5 py-2.5 border-b flex items-center justify-between gap-3 select-none flex-shrink-0"
        style={{
          backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
          borderColor: 'var(--skin-border, #E8D5C2)',
        }}
      >
        {/* Left: Tactile Window Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Close / Collapse button */}
          <button
            onClick={onClose ? onClose : () => setIsMinimized(true)}
            className="w-3 h-3 rounded-full border border-rose-300 bg-rose-400 hover:bg-rose-500 flex items-center justify-center text-white opacity-80 hover:opacity-100 transition-all active:scale-90"
            title={onClose ? 'Close' : 'Collapse Window'}
            aria-label="Close"
          >
            <X className="w-2 h-2 opacity-0 hover:opacity-100 transition-opacity" />
          </button>

          {/* Minimize / Fold button */}
          <button
            onClick={() => setIsMinimized(prev => !prev)}
            className="w-3 h-3 rounded-full border border-amber-300 bg-amber-400 hover:bg-amber-500 flex items-center justify-center text-zinc-900 opacity-80 hover:opacity-100 transition-all active:scale-90"
            title={isMinimized ? 'Expand' : 'Minimize Window'}
            aria-label="Minimize"
          >
            <Minus className="w-2 h-2 opacity-0 hover:opacity-100 transition-opacity" />
          </button>

          {/* Maximize button */}
          {canMaximize && (
            <button
              onClick={() => setIsMaximized(prev => !prev)}
              className="w-3 h-3 rounded-full border border-emerald-300 bg-emerald-400 hover:bg-emerald-500 flex items-center justify-center text-white opacity-80 hover:opacity-100 transition-all active:scale-90"
              title={isMaximized ? 'Restore Window' : 'Maximize Window'}
              aria-label="Maximize"
            >
              {isMaximized ? (
                <Minimize2 className="w-2 h-2 opacity-0 hover:opacity-100 transition-opacity" />
              ) : (
                <Maximize2 className="w-2 h-2 opacity-0 hover:opacity-100 transition-opacity" />
              )}
            </button>
          )}

          {/* Studio Prompt Accent */}
          <span 
            className="text-[11px] font-mono font-bold flex items-center gap-1 ml-1"
            style={{ color: 'var(--skin-accent, #C2410C)' }}
          >
            <span>❯</span>
          </span>
        </div>

        {/* Center: Window Title & Subtitle */}
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-start">
          <span 
            className="text-xs font-mono font-bold tracking-wide truncate"
            style={{ color: 'var(--skin-text-primary, #431407)' }}
          >
            {title}
          </span>
          {subtitle && (
            <span 
              className="text-[10px] font-mono hidden md:inline truncate opacity-70"
              style={{ color: 'var(--skin-text-secondary, #7C2D12)' }}
            >
              // {subtitle}
            </span>
          )}
        </div>

        {/* Right: Badge & Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {badge && (
            <span 
              className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded border"
              style={{
                backgroundColor: 'var(--skin-accent-muted, #FFEDD5)',
                borderColor: 'var(--skin-border, #E8D5C2)',
                color: 'var(--skin-accent, #C2410C)',
              }}
            >
              {badge}
            </span>
          )}

          {headerActions}

          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setIsMinimized(prev => !prev)}
            className="p-1 rounded hover:bg-black/5 transition-colors"
            style={{ color: 'var(--skin-text-secondary, #7C2D12)' }}
            title={isMinimized ? 'Expand' : 'Collapse'}
          >
            {isMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>

      {/* Window Body */}
      {!isMinimized && (
        <div 
          className="flex-1 flex flex-col min-h-0 transition-all"
          style={{
            backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
            color: 'var(--skin-text-primary, #431407)',
          }}
        >
          {children}
        </div>
      )}

      {/* Minimized Placeholder */}
      {isMinimized && (
        <div 
          onClick={() => setIsMinimized(false)}
          className="px-4 py-2 text-center cursor-pointer text-[11px] font-mono hover:opacity-100 transition-colors flex items-center justify-center gap-2"
          style={{
            backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
            color: 'var(--skin-text-secondary, #7C2D12)',
          }}
        >
          <span>[WINDOW COLLAPSED - CLICK TO RESTORE]</span>
          <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--skin-accent, #C2410C)' }} />
        </div>
      )}
    </div>
  );
};
