import React from 'react';
import { useLiveblocks } from '../services/liveblocksContext';
import { Users, Radio, Wifi, Volume2, Sparkles } from 'lucide-react';

interface LivePresenceBarProps {
  className?: string;
  compact?: boolean;
}

export const LivePresenceBar: React.FC<LivePresenceBarProps> = ({ className = '', compact = false }) => {
  const { collaborators, currentUser, activePlayingSpeaker, roomId } = useLiveblocks();

  return (
    <div 
      className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono shadow-2xs ${className}`}
      style={{
        backgroundColor: 'var(--af-raised, var(--skin-bg-subtle, #F6EDE2))',
        borderColor: 'var(--af-border, var(--skin-border, #E8D5C2))',
        color: 'var(--af-text, var(--skin-text-primary, #431407))'
      }}
    >
      {/* Left: Live Room Status */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <div className="flex items-center gap-1.5 truncate">
          <span 
            className="font-bold tracking-wider text-[11px] uppercase"
            style={{ color: 'var(--af-text, var(--skin-text-primary, #431407))' }}
          >
            Liveblocks Studio
          </span>
          <span 
            className="text-[9px] px-1.5 py-0.5 rounded border hidden sm:inline"
            style={{
              backgroundColor: 'var(--af-surface, var(--skin-bg-card, #FFFFFF))',
              borderColor: 'var(--af-border, var(--skin-border, #E8D5C2))',
              color: 'var(--af-text-muted, var(--skin-text-muted, #9A5B32))'
            }}
          >
            #{roomId.replace('-master-room', '')}
          </span>
        </div>
      </div>

      {/* Center: Live Speaker Activity if currently playing */}
      {activePlayingSpeaker && (
        <div 
          className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] animate-pulse"
          style={{
            backgroundColor: 'var(--skin-accent-muted, #FFEDD5)',
            borderColor: 'var(--skin-border, #E8D5C2)',
            color: 'var(--skin-accent, #C2410C)'
          }}
        >
          <Volume2 className="w-3 h-3" />
          <span>Live Broadcast: {activePlayingSpeaker}</span>
        </div>
      )}

      {/* Right: Active Collaborators Avatars */}
      <div className="flex items-center gap-2">
        <div className="flex items-center -space-x-1.5">
          {/* Current User */}
          <div 
            className="w-5 h-5 rounded-full border border-white flex items-center justify-center text-[9px] font-bold shadow-xs text-white"
            style={{ backgroundColor: currentUser.color }}
            title={`${currentUser.name} (${currentUser.role})`}
          >
            {currentUser.avatar}
          </div>

          {/* Collaborators */}
          {collaborators.map((c) => (
            <div
              key={c.id}
              className="relative w-5 h-5 rounded-full border border-white flex items-center justify-center text-[9px] font-bold shadow-xs text-white"
              style={{ backgroundColor: c.color }}
              title={`${c.name} (${c.role}) - ${c.status}`}
            >
              {c.avatar}
              {c.status === 'editing' && (
                <span 
                  className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ring-1 ring-white animate-pulse" 
                  style={{ backgroundColor: 'var(--skin-accent, #C2410C)' }}
                />
              )}
            </div>
          ))}
        </div>

        <span 
          className="text-[10px] hidden sm:inline"
          style={{ color: 'var(--af-text-muted, var(--skin-text-muted, #9A5B32))' }}
        >
          {collaborators.length + 1} online
        </span>
      </div>
    </div>

  );
};
