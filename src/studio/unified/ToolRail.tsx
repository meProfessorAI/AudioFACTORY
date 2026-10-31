import React from 'react';
import { 
  Radio, 
  Layers, 
  Music, 
  Mic, 
  FolderOpen, 
  Terminal, 
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';

export type StudioMode = 'intro' | 'multispeaker' | 'suite';

interface ToolRailProps {
  activeMode: StudioMode;
  onSelectMode: (mode: StudioMode) => void;
  onOpenCloning: () => void;
  onOpenProjects: () => void;
  onToggleTerminal?: () => void;
  isTerminalActive?: boolean;
}

export const ToolRail: React.FC<ToolRailProps> = ({
  activeMode,
  onSelectMode,
  onOpenCloning,
  onOpenProjects,
  onToggleTerminal,
  isTerminalActive
}) => {
  const tools = [
    {
      id: 'intro',
      label: 'Monologue',
      description: 'Single-voice narration & AI dramatization',
      icon: Radio,
      onClick: () => onSelectMode('intro'),
      isActive: activeMode === 'intro'
    },
    {
      id: 'multispeaker',
      label: 'Multi-Speaker',
      description: 'Dialogue sequencing & multi-actor studio',
      icon: Layers,
      onClick: () => onSelectMode('multispeaker'),
      isActive: activeMode === 'multispeaker'
    },
    {
      id: 'suite',
      label: 'Audio Mixer',
      description: 'Soundscapes, BGM synthesizer & sound effects',
      icon: Music,
      onClick: () => onSelectMode('suite'),
      isActive: activeMode === 'suite'
    }
  ];

  return (
    <>
      {/* Desktop 64px Vertical Icon Rail */}
      <nav className="af-rail justify-between select-none" aria-label="Studio tools">
        <div className="flex flex-col items-center gap-2 w-full">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={tool.onClick}
                className="w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative group focus:outline-none"
                style={{
                  backgroundColor: tool.isActive ? 'var(--af-raised, #F6EDE2)' : 'transparent',
                  color: tool.isActive ? 'var(--af-accent, #C2410C)' : 'var(--af-text-secondary, #7C2D12)',
                  border: tool.isActive ? '1px solid var(--af-border, #E8D5C2)' : '1px solid transparent'
                }}
                title={`${tool.label} — ${tool.description}`}
                aria-label={tool.label}
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="text-[9px] font-bold mt-1 tracking-tight leading-none">
                  {tool.label.split(' ')[0]}
                </span>

                {/* Tooltip on hover */}
                <div 
                  className="absolute left-16 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 border"
                  style={{
                    backgroundColor: 'var(--af-surface, #FFFFFF)',
                    borderColor: 'var(--af-border, #E8D5C2)',
                    color: 'var(--af-text, #431407)'
                  }}
                >
                  {tool.label}
                </div>
              </button>
            );
          })}

          <div 
            className="w-8 my-1 border-t"
            style={{ borderColor: 'var(--af-border, #E8D5C2)' }}
          />

          {/* Voice Cloning Shortcut */}
          <button
            onClick={onOpenCloning}
            className="w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative group focus:outline-none hover:opacity-80"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--af-text-secondary, #7C2D12)'
            }}
            title="Instant Voice Cloning (ElevenLabs)"
            aria-label="Clone Voice"
          >
            <Mic className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="text-[9px] font-bold mt-1 tracking-tight leading-none">
              Clone
            </span>
          </button>

          {/* Cloud Projects Vault */}
          <button
            onClick={onOpenProjects}
            className="w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative group focus:outline-none hover:opacity-80"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--af-text-secondary, #7C2D12)'
            }}
            title="Projects & Script Vault"
            aria-label="Projects Vault"
          >
            <FolderOpen className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="text-[9px] font-bold mt-1 tracking-tight leading-none">
              Vault
            </span>
          </button>
        </div>

        {/* Bottom utility: Diagnostics Terminal */}
        {onToggleTerminal && (
          <div className="flex flex-col items-center w-full pb-2">
            <button
              onClick={onToggleTerminal}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group hover:opacity-80"
              style={{
                backgroundColor: isTerminalActive ? 'var(--af-raised, #F6EDE2)' : 'transparent',
                color: isTerminalActive ? 'var(--af-accent, #C2410C)' : 'var(--af-text-muted, #9A5B32)'
              }}
              title="Terminal Diagnostics Mode"
              aria-label="Toggle Terminal View"
            >
              <Terminal className="w-4 h-4" />
            </button>
          </div>
        )}
      </nav>

      {/* Mobile Bottom Navigation Bar (Appears on screens < 768px) */}
      <div className="af-bottom-nav select-none">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={tool.onClick}
              className="flex-1 py-1 flex flex-col items-center justify-center min-h-[48px] cursor-pointer transition-colors"
              style={{
                color: tool.isActive ? 'var(--af-accent, #C2410C)' : 'var(--af-text-muted, #9A5B32)'
              }}
              aria-label={tool.label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">{tool.label}</span>
            </button>
          );
        })}

        <button
          onClick={onOpenCloning}
          className="flex-1 py-1 flex flex-col items-center justify-center min-h-[48px] cursor-pointer transition-colors"
          style={{ color: 'var(--af-text-muted, #9A5B32)' }}
          aria-label="Clone Voice"
        >
          <Mic className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1">Clone</span>
        </button>

        <button
          onClick={onOpenProjects}
          className="flex-1 py-1 flex flex-col items-center justify-center min-h-[48px] cursor-pointer transition-colors"
          style={{ color: 'var(--af-text-muted, #9A5B32)' }}
          aria-label="Projects"
        >
          <FolderOpen className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1">Vault</span>
        </button>
      </div>
    </>
  );
};
