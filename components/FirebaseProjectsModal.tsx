import React, { useState } from 'react';
import { 
  Cloud, 
  Trash2, 
  FolderOpen, 
  Clock, 
  User as UserIcon, 
  LogOut, 
  LogIn, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Layers,
  Radio,
  ExternalLink,
  Database
} from 'lucide-react';
import { useFirebase } from '../services/firebaseContext';
import { SavedAudioProject, SavedMonologue } from '../types';
import { useTerminal } from './terminal/TerminalContext';

interface FirebaseProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadProject: (project: SavedAudioProject) => void;
  onLoadMonologue: (monologue: SavedMonologue) => void;
}

export const FirebaseProjectsModal: React.FC<FirebaseProjectsModalProps> = ({
  isOpen,
  onClose,
  onLoadProject,
  onLoadMonologue,
}) => {
  const { isTerminalMode } = useTerminal();
  const { 
    user, 
    authLoading, 
    isOnline, 
    loginGoogle, 
    loginGuest, 
    logout, 
    savedProjects, 
    savedMonologues, 
    removeProjectFromCloud, 
    removeMonologueFromCloud 
  } = useFirebase();

  const [activeTab, setActiveTab] = useState<'scenes' | 'monologues'>('scenes');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this scene from your library?")) {
      setDeletingId(id);
      try {
        await removeProjectFromCloud(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleDeleteMonologue = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this monologue from your library?")) {
      setDeletingId(id);
      try {
        await removeMonologueFromCloud(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border transition-all"
        style={{
          backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
          borderColor: 'var(--skin-border, #E8D5C2)',
          color: 'var(--skin-text-primary, #431407)',
          boxShadow: 'var(--skin-shadow, 0 10px 25px rgba(0,0,0,0.1))'
        }}
      >
        
        {/* Header */}
        <div 
          className="p-4 sm:p-5 border-b flex items-center justify-between flex-shrink-0"
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
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  Projects & Script Vault
                </h2>
                <span 
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border"
                  style={{
                    backgroundColor: isOnline ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    color: isOnline ? '#15803d' : '#b91c1c',
                    borderColor: 'var(--skin-border, #E8D5C2)'
                  }}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  {isOnline ? 'Library Live' : 'Offline'}
                </span>
              </div>
              <p 
                className="text-xs"
                style={{ color: 'var(--skin-text-muted, #9A5B32)' }}
              >
                Persistent studio storage & scene manager
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border flex items-center justify-center transition-colors hover:opacity-80 cursor-pointer"
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

        {/* User Account / Auth Bar */}
        <div 
          className="px-4 sm:px-6 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 text-xs"
          style={{
            backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
            borderColor: 'var(--skin-border, #E8D5C2)',
            color: 'var(--skin-text-secondary, #7C2D12)'
          }}
        >
          <div className="flex items-center gap-2">
            <UserIcon className="w-3.5 h-3.5" style={{ color: 'var(--skin-accent, #C2410C)' }} />
            {authLoading ? (
              <span className="animate-pulse">Loading user profile...</span>
            ) : user ? (
              <div className="flex items-center gap-1.5">
                <span className="font-bold" style={{ color: 'var(--skin-text-primary, #431407)' }}>
                  {user.displayName || user.email || (user.isAnonymous ? 'Guest Creator' : 'Authenticated User')}
                </span>
                {user.isAnonymous && (
                  <span 
                    className="text-[10px] px-1.5 py-0.2 rounded border"
                    style={{
                      backgroundColor: 'var(--skin-accent-muted, #FFEDD5)',
                      color: 'var(--skin-accent, #C2410C)',
                      borderColor: 'var(--skin-border, #E8D5C2)'
                    }}
                  >
                    Anonymous
                  </span>
                )}
              </div>
            ) : (
              <span style={{ color: 'var(--skin-text-muted, #9A5B32)' }}>
                Not signed in (Local state only)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {user && !user.isAnonymous ? (
              <button
                onClick={logout}
                className="px-2.5 py-1 rounded-lg border flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer"
                style={{
                  backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                  borderColor: 'var(--skin-border, #E8D5C2)',
                  color: 'var(--skin-text-primary, #431407)'
                }}
              >
                <LogOut className="w-3 h-3 text-red-600" />
                Sign Out
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {user?.isAnonymous && (
                  <button
                    onClick={logout}
                    className="px-2.5 py-1 rounded-lg border flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer"
                    style={{
                      backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                      borderColor: 'var(--skin-border, #E8D5C2)',
                      color: 'var(--skin-text-primary, #431407)'
                    }}
                    title="Reset guest session to start fresh"
                  >
                    Reset Guest
                  </button>
                )}
                <button
                  onClick={loginGoogle}
                  className="px-2.5 py-1 rounded-lg border flex items-center gap-1 text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                  style={{
                    backgroundColor: 'var(--skin-accent, #C2410C)',
                    borderColor: 'var(--skin-accent, #C2410C)',
                    color: 'var(--skin-accent-text, #FFFFFF)'
                  }}
                >
                  <LogIn className="w-3 h-3" />
                  Sign In with Google
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Selection */}
        <div 
          className="flex border-b px-4 sm:px-6 pt-3 gap-2"
          style={{
            backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
            borderColor: 'var(--skin-border, #E8D5C2)'
          }}
        >
          <button
            onClick={() => setActiveTab('scenes')}
            className="pb-2.5 px-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer"
            style={{
              borderColor: activeTab === 'scenes' ? 'var(--skin-accent, #C2410C)' : 'transparent',
              color: activeTab === 'scenes' ? 'var(--skin-accent, #C2410C)' : 'var(--skin-text-muted, #9A5B32)'
            }}
          >
            <Layers className="w-3.5 h-3.5" />
            Multi-Speaker Scenes ({savedProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('monologues')}
            className="pb-2.5 px-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer"
            style={{
              borderColor: activeTab === 'monologues' ? 'var(--skin-accent, #C2410C)' : 'transparent',
              color: activeTab === 'monologues' ? 'var(--skin-accent, #C2410C)' : 'var(--skin-text-muted, #9A5B32)'
            }}
          >
            <Radio className="w-3.5 h-3.5" />
            Intro & Monologues ({savedMonologues.length})
          </button>
        </div>

        {/* Content Area */}
        <div 
          className="p-4 sm:p-6 flex-1 overflow-y-auto custom-scrollbar"
          style={{ backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)' }}
        >
          {activeTab === 'scenes' ? (
            <div className="space-y-2.5">
              {savedProjects.length === 0 ? (
                <div 
                  className="text-center py-12 border-2 border-dashed rounded-2xl p-6"
                  style={{
                    borderColor: 'var(--skin-border, #E8D5C2)',
                    backgroundColor: 'var(--skin-bg-card, #FFFFFF)'
                  }}
                >
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                    style={{
                      backgroundColor: 'var(--skin-accent-muted, #FFEDD5)',
                      color: 'var(--skin-accent, #C2410C)'
                    }}
                  >
                    <Layers className="w-6 h-6" />
                  </div>
                  <h3 
                    className="font-bold text-sm uppercase tracking-wide"
                    style={{ color: 'var(--skin-text-primary, #431407)' }}
                  >
                    No Saved Multi-Speaker Scenes Yet
                  </h3>
                  <p 
                    className="text-xs mt-1 max-w-sm mx-auto"
                    style={{ color: 'var(--skin-text-muted, #9A5B32)' }}
                  >
                    Generate or edit a multi-speaker script in the Multi-Speaker Studio, then click "Save to Cloud" to store it permanently.
                  </p>
                </div>
              ) : (
                savedProjects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => { onLoadProject(proj); onClose(); }}
                    className="p-3.5 rounded-xl flex items-center justify-between cursor-pointer transition-all border group"
                    style={{
                      backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                      borderColor: 'var(--skin-border, #E8D5C2)'
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div 
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-xs"
                        style={{
                          backgroundColor: 'var(--skin-accent-muted, #FFEDD5)',
                          color: 'var(--skin-accent, #C2410C)'
                        }}
                      >
                        {proj.lines?.length || 0}L
                      </div>
                      <div className="min-w-0">
                        <div 
                          className="font-bold text-sm truncate transition-colors"
                          style={{ color: 'var(--skin-text-primary, #431407)' }}
                        >
                          {proj.title}
                        </div>
                        <div 
                          className="flex items-center gap-2 text-[11px] mt-0.5"
                          style={{ color: 'var(--skin-text-muted, #9A5B32)' }}
                        >
                          <span>{proj.speakers?.length || 0} actors</span>
                          <span>•</span>
                          <span>{proj.updatedAt ? new Date(proj.updatedAt).toLocaleDateString() : 'Recent'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => handleDeleteProject(proj.id, e)}
                        disabled={deletingId === proj.id}
                        className="p-1.5 rounded-lg transition-colors hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                        style={{ color: 'var(--skin-text-muted, #9A5B32)' }}
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { onLoadProject(proj); onClose(); }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
                        style={{
                          backgroundColor: 'var(--skin-accent, #C2410C)',
                          color: 'var(--skin-accent-text, #FFFFFF)'
                        }}
                      >
                        Load
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {savedMonologues.length === 0 ? (
                <div 
                  className="text-center py-12 border-2 border-dashed rounded-2xl p-6"
                  style={{
                    borderColor: 'var(--skin-border, #E8D5C2)',
                    backgroundColor: 'var(--skin-bg-card, #FFFFFF)'
                  }}
                >
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                    style={{
                      backgroundColor: 'var(--skin-accent-muted, #FFEDD5)',
                      color: 'var(--skin-accent, #C2410C)'
                    }}
                  >
                    <Radio className="w-6 h-6" />
                  </div>
                  <h3 
                    className="font-bold text-sm uppercase tracking-wide"
                    style={{ color: 'var(--skin-text-primary, #431407)' }}
                  >
                    No Saved Monologues Yet
                  </h3>
                  <p 
                    className="text-xs mt-1 max-w-sm mx-auto"
                    style={{ color: 'var(--skin-text-muted, #9A5B32)' }}
                  >
                    Compose a monologue or meeting introduction, then click "Save" to store it in the cloud.
                  </p>
                </div>
              ) : (
                savedMonologues.map((mono) => (
                  <div
                    key={mono.id}
                    onClick={() => { onLoadMonologue(mono); onClose(); }}
                    className="p-3.5 rounded-xl flex items-center justify-between cursor-pointer transition-all border group"
                    style={{
                      backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                      borderColor: 'var(--skin-border, #E8D5C2)'
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div 
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                        style={{
                          backgroundColor: 'var(--skin-accent-muted, #FFEDD5)',
                          color: 'var(--skin-accent, #C2410C)'
                        }}
                      >
                        🎙️
                      </div>
                      <div className="min-w-0">
                        <div 
                          className="font-bold text-sm truncate transition-colors"
                          style={{ color: 'var(--skin-text-primary, #431407)' }}
                        >
                          {mono.title}
                        </div>
                        <div 
                          className="flex items-center gap-2 text-[11px] mt-0.5"
                          style={{ color: 'var(--skin-text-muted, #9A5B32)' }}
                        >
                          <span>{mono.voice}</span>
                          <span>•</span>
                          <span>{mono.text?.length || 0} chars</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => handleDeleteMonologue(mono.id, e)}
                        disabled={deletingId === mono.id}
                        className="p-1.5 rounded-lg transition-colors hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                        style={{ color: 'var(--skin-text-muted, #9A5B32)' }}
                        title="Delete monologue"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { onLoadMonologue(mono); onClose(); }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
                        style={{
                          backgroundColor: 'var(--skin-accent, #C2410C)',
                          color: 'var(--skin-accent-text, #FFFFFF)'
                        }}
                      >
                        Load
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="p-3.5 sm:px-6 border-t flex items-center justify-between text-xs flex-shrink-0"
          style={{
            backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
            borderColor: 'var(--skin-border, #E8D5C2)',
            color: 'var(--skin-text-muted, #9A5B32)'
          }}
        >
          <div className="flex items-center gap-1.5 truncate">
            <Database className="w-3.5 h-3.5" style={{ color: 'var(--skin-accent, #C2410C)' }} />
            <span className="truncate">Project: ai-studio-audiofactory</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border font-bold uppercase transition-colors cursor-pointer"
            style={{
              borderColor: 'var(--skin-border, #E8D5C2)',
              backgroundColor: 'var(--skin-bg-subtle, #F6EDE2)',
              color: 'var(--skin-text-primary, #431407)'
            }}
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
