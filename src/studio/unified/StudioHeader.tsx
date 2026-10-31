import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Cloud, 
  CheckCircle2, 
  User, 
  ExternalLink, 
  FolderOpen, 
  Activity, 
  Edit3, 
  Check, 
  Sparkles,
  Sliders
} from 'lucide-react';
import { GenerationQuotaBadge } from '../../../components/GenerationQuotaBadge';
import { DaySkinSelector } from '../../../components/theme/DaySkinSelector';

interface StudioHeaderProps {
  projectName: string;
  onProjectNameChange?: (newName: string) => void;
  isSaving: boolean;
  justSaved: boolean;
  isOnline: boolean;
  onOpenProjects: () => void;
  onOpenAccount: () => void;
  onOpenDiagnostics?: () => void;
  onToggleInspector?: () => void;
  isInspectorOpen?: boolean;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  projectName,
  onProjectNameChange,
  isSaving,
  justSaved,
  isOnline,
  onOpenProjects,
  onOpenAccount,
  onOpenDiagnostics,
  onToggleInspector,
  isInspectorOpen
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(projectName);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim() && onProjectNameChange) {
      onProjectNameChange(titleInput.trim());
    } else {
      setTitleInput(projectName);
    }
  };

  return (
    <header className="af-header justify-between select-none">
      {/* Left: Brand + Project Title */}
      <div className="flex items-center gap-3 min-w-0">
        <Link 
          to="/" 
          className="flex items-center gap-2 group focus:outline-none"
          title="AudioFACTORY Home"
        >
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-3.5 rounded-full bg-rose-600 shadow-xs group-hover:scale-105 transition-transform" />
            <div className="w-3.5 h-3.5 rounded-xs bg-amber-400 shadow-xs group-hover:scale-105 transition-transform" />
            <div className="w-3.5 h-3.5 rounded-xs bg-sky-500 shadow-xs group-hover:scale-105 transition-transform" />
          </div>
          <span className="font-extrabold text-sm md:text-base tracking-tight uppercase whitespace-nowrap text-zinc-950">
            AUDIO FACTORY
          </span>
        </Link>

        <span className="hidden sm:inline-block text-zinc-300">/</span>

        {/* Project Name & Rename */}
        <div className="flex items-center gap-1.5 min-w-0">
          {isEditingTitle ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                autoFocus
                className="px-2 py-0.5 text-xs font-semibold rounded border outline-none max-w-[140px] sm:max-w-[200px]"
                style={{
                  backgroundColor: 'var(--af-surface, #FFFFFF)',
                  borderColor: 'var(--af-accent, #C2410C)',
                  color: 'var(--af-text, #431407)'
                }}
              />
              <button 
                onClick={handleTitleSubmit}
                className="p-1 rounded hover:opacity-80"
                style={{ color: 'var(--af-accent, #C2410C)' }}
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setTitleInput(projectName);
                setIsEditingTitle(true);
              }}
              className="group flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-black/5 transition-colors max-w-[130px] sm:max-w-[220px] truncate text-left cursor-pointer"
              title="Click to rename project"
            >
              <span className="truncate" style={{ color: 'var(--af-text, #431407)' }}>
                {projectName || 'Untitled Production'}
              </span>
              <Edit3 
                className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" 
                style={{ color: 'var(--af-text-muted, #9A5B32)' }}
              />
            </button>
          )}

          {/* Sync / Save status pill */}
          <div 
            className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border"
            style={{
              borderColor: 'var(--af-border, #E8D5C2)',
              backgroundColor: 'var(--af-raised, #F6EDE2)',
              color: 'var(--af-text-secondary, #7C2D12)'
            }}
          >
            {isSaving ? (
              <>
                <div className="w-2 h-2 rounded-full border border-current border-t-transparent animate-spin" />
                <span>Saving…</span>
              </>
            ) : justSaved ? (
              <>
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Synced</span>
              </>
            ) : (
              <>
                <Cloud className="w-2.5 h-2.5 opacity-60" />
                <span>{isOnline ? 'Cloud Ready' : 'Local Draft'}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Project Library, Quota Badge, Theme Skin Selector, Account */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Projects Library Button */}
        <button
          onClick={onOpenProjects}
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer hover:opacity-90"
          style={{
            borderColor: 'var(--af-border, #E8D5C2)',
            backgroundColor: 'var(--af-surface, #FFFFFF)',
            color: 'var(--af-text, #431407)'
          }}
          title="Open Cloud Project Library"
        >
          <FolderOpen className="w-3.5 h-3.5" style={{ color: 'var(--af-accent, #C2410C)' }} />
          <span>Projects</span>
        </button>

        {/* Real Generation Quota Pill */}
        <GenerationQuotaBadge />

        {/* 7-Day Light Skin Selector */}
        <DaySkinSelector />

        {/* Toggle Inspector (Desktop / Tablet) */}
        {onToggleInspector && (
          <button
            onClick={onToggleInspector}
            className={`hidden md:inline-flex p-2 rounded-xl border transition-colors cursor-pointer ${
              isInspectorOpen ? 'shadow-xs' : ''
            }`}
            style={{
              borderColor: 'var(--af-border, #E8D5C2)',
              backgroundColor: isInspectorOpen ? 'var(--af-raised, #F6EDE2)' : 'var(--af-surface, #FFFFFF)',
              color: isInspectorOpen ? 'var(--af-accent, #C2410C)' : 'var(--af-text-secondary, #7C2D12)'
            }}
            title="Toggle Voice & Style Inspector"
            aria-label="Toggle Inspector"
          >
            <Sliders className="w-4 h-4" />
          </button>
        )}

        {/* Diagnostics Trigger */}
        {onOpenDiagnostics && (
          <button
            onClick={onOpenDiagnostics}
            className="hidden lg:inline-flex p-2 rounded-xl border transition-colors cursor-pointer hover:opacity-80"
            style={{
              borderColor: 'var(--af-border, #E8D5C2)',
              backgroundColor: 'var(--af-surface, #FFFFFF)',
              color: 'var(--af-text-muted, #9A5B32)'
            }}
            title="System Diagnostics & Telemetry"
            aria-label="System Diagnostics"
          >
            <Activity className="w-4 h-4" />
          </button>
        )}

        {/* Account & Profile Trigger */}
        <button
          onClick={onOpenAccount}
          className="p-2 rounded-xl border transition-colors cursor-pointer hover:opacity-80"
          style={{
            borderColor: 'var(--af-border, #E8D5C2)',
            backgroundColor: 'var(--af-surface, #FFFFFF)',
            color: 'var(--af-text-primary, #431407)'
          }}
          title="Account, Billing & Settings"
          aria-label="Account Settings"
        >
          <User className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
