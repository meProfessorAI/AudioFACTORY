/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Studio Application Shell
 */
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { INTRO_STYLES, CUSTOM_STYLE, SUPPORTED_LANGUAGES } from '../../constants';
import { IntroStyle, Voice, SavedAudioProject } from '../../types';
import { ALL_VOICES } from '../../voices';
import { generateSpeech, dramatizeText, audioBufferToWavBlob } from '../../services/geminiService';
import { 
  getElevenLabsVoices, 
  generateSpeechElevenLabs, 
  isElevenLabsKeyAvailable, 
  DEFAULT_ELEVENLABS_VOICES 
} from '../../services/elevenLabsService';
import { StyleSelector } from '../../components/StyleSelector';
import { ConfigurationModal } from '../../components/ConfigurationModal';
import { SystemPromptModal } from '../../components/SystemPromptModal';
import { MultiSpeakerStudio } from '../../components/MultiSpeakerStudio';
import { BgmGenerator } from '../../components/BgmGenerator';
import { VoiceCloningModal } from '../../components/VoiceCloningModal';
import { FirebaseProjectsModal } from '../../components/FirebaseProjectsModal';
import { MonologueBentoStudio } from '../../components/MonologueBentoStudio';
import { AudioProductionSuite } from '../../components/AudioProductionSuite';
import { useTerminal } from '../../components/terminal/TerminalContext';
import { TerminalBackgroundCanvas } from '../../components/terminal/TerminalBackgroundCanvas';
import { TerminalHeader } from '../../components/terminal/TerminalHeader';
import { TerminalMonologueView } from '../../components/terminal/TerminalMonologueView';
import { TerminalDiagnosticDrawer } from '../../components/terminal/TerminalDiagnosticDrawer';
import { StudioShell } from './unified/StudioShell';
import { StudioHeader } from './unified/StudioHeader';
import { ToolRail, MobileBottomNav } from './unified/ToolRail';
import { CreativeCanvas } from './unified/CreativeCanvas';
import { VoiceInspector } from './unified/VoiceInspector';
import { AudioTransport } from './unified/AudioTransport';
import { MobileBottomSheet } from './unified/MobileBottomSheet';
import { PlanUpgradeModal } from '../../components/PlanUpgradeModal';
import { GenerationQuotaBadge } from '../../components/GenerationQuotaBadge';
import { DaySkinSelector } from '../../components/theme/DaySkinSelector';
import { AccountDrawer } from '../../components/AccountDrawer';
import { DailyQuotaExhaustedModal } from '../../components/DailyQuotaExhaustedModal';
import { LockdownOverlay } from '../../components/LockdownOverlay';
import { AuthModal } from '../../components/AuthModal';
import { Toast } from '../../components/Toast';
import { useGenerationQuota } from '../hooks/useGenerationQuota';
import { useEntitlementStore } from '../store/useEntitlementStore';
import { useDeepLinks } from '../hooks';
import { BauhausButton, getIcon, getColorClass, DownloadIcon } from '../../components/BauhausComponents';
import { AdManager } from '../monetization/AdManager';
import { useFirebase } from '../../services/firebaseContext';
import { 
  Play, 
  Pause, 
  Sparkles, 
  Settings, 
  Mic, 
  Music, 
  Layers, 
  Volume2, 
  RotateCcw, 
  Sliders, 
  Globe, 
  Check, 
  Info,
  Radio,
  Download,
  Cloud,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Monitor,
  User,
  ExternalLink
} from 'lucide-react';

type StudioMode = 'intro' | 'multispeaker' | 'suite';

export const StudioApp: React.FC = () => {
  const location = useLocation();

  // Terminal System Context
  const { isTerminalMode, toggleTerminalMode, setIsAudioActive, addLog, toggleDrawer, isDrawerOpen } = useTerminal();

  // Firebase State
  const { 
    user, 
    isOnline, 
    savedProjects, 
    savedMonologues, 
    saveMonologueToCloud, 
    isSaving, 
    statusMessage, 
    clearStatusMessage 
  } = useFirebase();
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [loadedMultiSpeakerProject, setLoadedMultiSpeakerProject] = useState<SavedAudioProject | null>(null);
  const [monologueJustSaved, setMonologueJustSaved] = useState(false);
  const [apiError, setApiError] = useState<{ message: string; type: 'error' | 'warning' } | null>(null);

  // Navigation / Mode
  const [activeMode, setActiveMode] = useState<StudioMode>('intro');
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(true);
  const [isMobilePersonaDrawerOpen, setIsMobilePersonaDrawerOpen] = useState<boolean>(false);
  const [speed, setSpeed] = useState<string>('1.0x');
  const [projectName, setProjectName] = useState<string>('Untitled Narration');

  // Entitlement store & quota
  const { refreshEntitlement, setUpgradeModalOpen } = useEntitlementStore();
  const { isExhausted, isUnlimited, refresh: refreshQuota } = useGenerationQuota();

  // Modal States
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [isPromptOpen, setIsPromptOpen] = useState<boolean>(false);
  const [isCloningOpen, setIsCloningOpen] = useState<boolean>(false);
  const [isAccountOpen, setIsAccountOpen] = useState<boolean>(false);
  const [isQuotaExhaustedModalOpen, setIsQuotaExhaustedModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [pendingAuthAction, setPendingAuthAction] = useState<(() => void) | null>(null);

  const handleRequireAuth = useCallback((action?: () => void) => {
    if (action) {
      setPendingAuthAction(() => action);
    } else {
      setPendingAuthAction(null);
    }
    setIsAuthModalOpen(true);
  }, []);

  // Deep Link & Native Android Lifecycle Handler
  useDeepLinks({
    onOpenProjects: () => setIsCloudModalOpen(true),
    onOpenCloning: () => setIsCloningOpen(true),
    onSetMode: (m) => {
      stopPlayback();
      setActiveMode(m);
    },
  });

  // Handle URL route params (e.g. /app/projects, /app/billing, /app/account)
  useEffect(() => {
    if (location.pathname.includes('/projects')) {
      setIsCloudModalOpen(true);
    } else if (location.pathname.includes('/billing')) {
      setUpgradeModalOpen(true);
    } else if (location.pathname.includes('/account')) {
      setIsAccountOpen(true);
    }
  }, [location.pathname]);

  // Voice and Style States
  const [selectedStyle, setSelectedStyle] = useState<IntroStyle>(INTRO_STYLES[0]);
  const [customStyle, setCustomStyle] = useState<IntroStyle>(CUSTOM_STYLE);
  const [selectedVoice, setSelectedVoice] = useState<string>(INTRO_STYLES[0].defaultVoice);
  const [text, setText] = useState<string>(INTRO_STYLES[0].templateText);

  // Custom Studio Parameter States for The Last Voice & Lyrical Synthesis
  const [emotionalMode, setEmotionalMode] = useState<string>('Quiet Love');
  const [lyricalMode, setLyricalMode] = useState<boolean>(true);

  // Audio Generation & Playback States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isDramatizing, setIsDramatizing] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Audio buffer and context refs
  const [generatedAudio, setGeneratedAudio] = useState<{ buffer: AudioBuffer; rawData: Uint8Array } | null>(null);
  const [bgmBuffer, setBgmBuffer] = useState<AudioBuffer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Pre-generated HTML audio element ref
  const pregenAudioRef = useRef<HTMLAudioElement | null>(null);

  // Available Voices: Combine Gemini and ElevenLabs
  const [elevenLabsVoicesList, setElevenLabsVoicesList] = useState<Voice[]>(DEFAULT_ELEVENLABS_VOICES);
  const hasElevenLabsKey = isElevenLabsKeyAvailable();

  useEffect(() => {
    refreshEntitlement(user);
    getElevenLabsVoices().then(v => {
      if (v && v.length > 0) setElevenLabsVoicesList(v);
    });
  }, [user]);

  const allAvailableVoices = useMemo<Voice[]>(() => {
    const geminiVoices: Voice[] = ALL_VOICES.map(v => ({
      id: v.name,
      name: `${v.name} (${v.style})`,
      gender: v.ssmlGender === 'FEMALE' ? 'Female' : 'Male',
      languageCode: 'en-US',
      languageName: 'English (Gemini)',
      provider: 'gemini' as const
    }));
    return [...geminiVoices, ...elevenLabsVoicesList];
  }, [elevenLabsVoicesList]);

  // Web Audio Context setup
  const getAudioContext = () => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  // Stop playback cleanly
  const stopPlayback = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {}
      sourceNodeRef.current = null;
    }
    if (pregenAudioRef.current) {
      pregenAudioRef.current.pause();
      pregenAudioRef.current.currentTime = 0;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsPlaying(false);
    setAudioProgress(0);
  };

  // Style change handler
  const handleSelectStyle = (style: IntroStyle) => {
    stopPlayback();
    setSelectedStyle(style);
    setSelectedVoice(style.defaultVoice);
    setText(style.templateText);
    setGeneratedAudio(null);
    setAudioError(null);
    if (style.id === 'the_last_voice') {
      setLyricalMode(true);
    }
  };

  // Reset restricted style if user is not the admin
  useEffect(() => {
    // No-op: the_last_voice is now globally public.
  }, [user, selectedStyle]);

  // Switch to custom style
  const handleSelectCustom = () => {
    stopPlayback();
    setSelectedStyle(customStyle);
    setSelectedVoice(customStyle.defaultVoice);
    setText(customStyle.templateText);
    setGeneratedAudio(null);
    setAudioError(null);
    setIsPromptOpen(true);
  };

  // Save custom persona from modal
  const handleSaveCustom = (newPrompt: string, newVoice?: string) => {
    const updated = {
      ...customStyle,
      description: newPrompt,
      defaultVoice: newVoice || customStyle.defaultVoice
    };
    setCustomStyle(updated);
    if (selectedStyle.id === 'custom') {
      setSelectedStyle(updated);
      if (newVoice) setSelectedVoice(newVoice);
    }
  };

  // Dramatize Text via Gemini AI
  const handleDramatize = async (skipAuthCheck = false) => {
    if (!text.trim() || isDramatizing) return;
    
    if (!user && !skipAuthCheck) {
      handleRequireAuth(() => handleDramatize(true));
      return;
    }

    setIsDramatizing(true);
    setAudioError(null);
    AdManager.getInstance().suppressAds('generation');
    try {
      const dramatized = await dramatizeText(text, selectedStyle.systemPrompt || selectedStyle.description);
      setText(dramatized);
    } catch (err: any) {
      console.error("Dramatization failed:", err);
      setAudioError("Dramatization failed. Please try again.");
    } finally {
      setIsDramatizing(false);
      AdManager.getInstance().resumeAds('generation');
    }
  };

  // Generate Speech Audio
  const handleGenerateSpeech = async (skipAuthCheck = false) => {
    if (!text.trim() || isGenerating) return;

    if (!user && !skipAuthCheck) {
      handleRequireAuth(() => handleGenerateSpeech(true));
      return;
    }

    // Check quota before initiating generation
    if (!isUnlimited && isExhausted) {
      setIsQuotaExhaustedModalOpen(true);
      return;
    }

    stopPlayback();
    setIsGenerating(true);
    setAudioError(null);
    AdManager.getInstance().suppressAds('generation');
    AdManager.getInstance().suppressAds('voice_generation');

    const isEleven = elevenLabsVoicesList.some(v => v.id === selectedVoice);

    try {
      if (isEleven) {
        const result = await generateSpeechElevenLabs(text, selectedVoice);
        const rawData = new Uint8Array(result.rawData);
        setGeneratedAudio({ buffer: result.buffer, rawData });
        setAudioDuration(result.buffer.duration);
        playGeneratedAudio(result.buffer);
      } else {
        let basePrompt = selectedStyle.systemPrompt || selectedStyle.description;
        
        // Add Dynamic Emotional Preset Instruction for The Last Voice
        if (selectedStyle.id === 'the_last_voice') {
          let emoInstruction = '';
          switch (emotionalMode) {
            case 'Quiet Love':
              emoInstruction = '\n\nEMOTIONAL PRESET MODE: "Quiet Love". Deliver with quiet affection, tender warmth, a gentle smile in the voice, and intimate, close-up reading. The emotional tone should be soft, sweet, and comforting, holding onto nostalgic affection without becoming overly sad. Keep emotional intensity strictly between 25% and 40%.';
              break;
            case 'Longing':
              emoInstruction = '\n\nEMOTIONAL PRESET MODE: "Longing". Deliver with reflective yearning, nostalgia, a slightly distant tone of remembering someone who is not there, and quiet pauses of contemplation. Keep emotional intensity between 35% and 50%.';
              break;
            case 'Heartbreak':
              emoInstruction = '\n\nEMOTIONAL PRESET MODE: "Heartbreak". Deliver with restrained sorrow, low-energy sighs, heavy emotional pauses, and vulnerable chest resonance. The feeling should be of deep, quiet, unresolved pain, but kept completely controlled—do not sob or shout. Keep emotional intensity between 40% and 60%.';
              break;
            case 'Memory':
              emoInstruction = '\n\nEMOTIONAL PRESET MODE: "Memory". Deliver with narrative, calm nostalgic recognition, and gentle, soft conversational cadence. Treat each statement as a picture from the past.';
              break;
            case 'Unsent Letter':
              emoInstruction = '\n\nEMOTIONAL PRESET MODE: "Unsent Letter". Deliver with private conversational intimacy, speaking directly as if reading a secret letter late at night.';
              break;
            case 'Acceptance':
              emoInstruction = '\n\nEMOTIONAL PRESET MODE: "Acceptance". Deliver with peaceful maturity, calm acceptance, and quiet hope. The emotional tone should be stable and resolved.';
              break;
            case 'Cinematic Realization':
              emoInstruction = '\n\nEMOTIONAL PRESET MODE: "Cinematic Realization". Deliver with precise emotional focus and cinematic impact, highlighting the realization line with deliberate slowing.';
              break;
            case 'Pure Poetry':
              emoInstruction = '\n\nEMOTIONAL PRESET MODE: "Pure Poetry". Deliver with literary depth, musical phrasing, and a high focus on the beautiful flow of Devanagari Hindi sounds.';
              break;
          }
          basePrompt += emoInstruction;
        }

        // Add Poetic Lyrical Mode Instruction
        if (lyricalMode) {
          basePrompt += '\n\nLYRICAL MODE ACTIVE: You MUST strictly respect all line breaks and punctuation. Do NOT flatten poetic text into regular prose. Ensure that commas trigger short, deliberate pauses of ~150–300 ms, and phrase breaks or line breaks trigger pauses of ~300–500 ms. Preserve the lyricism and physical structure of the text exactly as written.';
        }

        const result = await generateSpeech(text, selectedVoice, basePrompt);
        setGeneratedAudio({ buffer: result.buffer, rawData: result.rawData });
        setAudioDuration(result.buffer.duration);
        playGeneratedAudio(result.buffer);
      }
      
      // Refresh the quota after successful generation
      refreshQuota().catch(err => console.warn('Failed to refresh quota:', err));

    } catch (err: any) {
      console.error("Generation failed:", err);
      const errorMsg = err.message || "";
      if (errorMsg.includes('QUOTA_EXHAUSTED') || errorMsg.includes('daily generation limit') || errorMsg.includes('429')) {
        setIsQuotaExhaustedModalOpen(true);
        setApiError({ message: 'Daily generation quota exceeded.', type: 'warning' });
      } else if (errorMsg.includes('network') || errorMsg.includes('fetch failed')) {
        setApiError({ message: 'Network error connecting to AI services. Please check your connection.', type: 'error' });
        setAudioError("Network error. Please try again.");
      } else if (errorMsg.toLowerCase().includes('voice id') || errorMsg.toLowerCase().includes('deprecated')) {
        setApiError({ message: 'The selected voice is invalid or deprecated. Please choose another voice.', type: 'error' });
        setAudioError("Invalid voice ID.");
      } else {
        setApiError({ message: `API Error: ${errorMsg || 'Failed to generate audio'}`, type: 'error' });
        setAudioError(errorMsg || "Failed to generate audio.");
      }
    } finally {
      setIsGenerating(false);
      AdManager.getInstance().resumeAds('generation');
      AdManager.getInstance().resumeAds('voice_generation');
    }
  };

  const playGeneratedAudio = (buffer: AudioBuffer) => {
    stopPlayback();
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    source.onended = () => {
      stopPlayback();
    };

    source.start(0);
    sourceNodeRef.current = source;
    startTimeRef.current = ctx.currentTime;
    setIsPlaying(true);

    const updateProgress = () => {
      if (!audioContextRef.current || !sourceNodeRef.current) return;
      const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
      const progress = Math.min(100, (elapsed / buffer.duration) * 100);
      setAudioProgress(progress);
      if (progress < 100) {
        animFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };
    animFrameRef.current = requestAnimationFrame(updateProgress);
  };

  const handleMainActionClick = () => {
    if (isPlaying) {
      stopPlayback();
    } else if (generatedAudio) {
      playGeneratedAudio(generatedAudio.buffer);
    } else {
      handleGenerateSpeech();
    }
  };

  const handleDownload = () => {
    if (!generatedAudio) return;
    try {
      AdManager.getInstance().suppressAds('download');
      const wavBlob = audioBufferToWavBlob(generatedAudio.buffer);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audiofactory-${selectedStyle.id}-${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      AdManager.getInstance().resumeAds('download');
    }
  };

  // Word count, character count, and estimated duration metrics
  const wordCount = useMemo(() => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, [text]);

  const charCount = text.length;

  const estimatedSeconds = useMemo(() => {
    return Math.ceil(wordCount / 2.5);
  }, [wordCount]);

  // Unified Seek Scrubbing Handler
  const handleSeek = (seconds: number) => {
    if (!generatedAudio) return;
    stopPlayback();
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const source = ctx.createBufferSource();
    source.buffer = generatedAudio.buffer;
    source.connect(ctx.destination);

    source.onended = () => {
      stopPlayback();
    };

    const clampedOffset = Math.max(0, Math.min(seconds, generatedAudio.buffer.duration));
    source.start(0, clampedOffset);
    sourceNodeRef.current = source;
    startTimeRef.current = ctx.currentTime - clampedOffset;
    setIsPlaying(true);

    const updateProgress = () => {
      if (!audioContextRef.current || !sourceNodeRef.current) return;
      const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
      const progress = Math.min(100, (elapsed / generatedAudio.buffer.duration) * 100);
      setAudioProgress(progress);
      if (progress < 100) {
        animFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };
    animFrameRef.current = requestAnimationFrame(updateProgress);
  };



  return (
    <div 
      className="flex flex-col h-[100dvh] w-screen overflow-hidden select-none font-sans transition-colors duration-200"
      style={{
        backgroundColor: 'var(--skin-bg-app, #FDF8F3)',
        color: 'var(--skin-text-primary, #431407)',
      }}
    >
      <StudioShell
        isInspectorOpen={isInspectorOpen}
        header={
          <StudioHeader 
            projectName={projectName}
            onProjectNameChange={setProjectName}
            isSaving={isSaving}
            justSaved={monologueJustSaved}
            isOnline={isOnline}
            onOpenProjects={() => setIsCloudModalOpen(true)}
            onOpenAccount={() => setIsAccountOpen(true)}
            onOpenDiagnostics={toggleDrawer}
            onToggleInspector={() => setIsInspectorOpen(prev => !prev)}
            isInspectorOpen={isInspectorOpen}
          />
        }
        navigation={
          <ToolRail 
            activeMode={activeMode}
            onSelectMode={(mode) => {
              stopPlayback();
              setActiveMode(mode);
            }}
            onOpenCloning={() => setIsCloningOpen(true)}
            onOpenProjects={() => setIsCloudModalOpen(true)}
            onToggleTerminal={toggleDrawer}
            isTerminalActive={isDrawerOpen}
          />
        }
        canvas={
          activeMode === 'intro' ? (
            <CreativeCanvas 
              text={text}
              onTextChange={setText}
              selectedStyle={selectedStyle}
              selectedVoice={selectedVoice}
              onOpenVoiceConfig={() => setIsConfigOpen(true)}
              onOpenPersonaModal={() => setIsPromptOpen(true)}
              isDramatizing={isDramatizing}
              onDramatize={() => handleDramatize()}
              audioError={audioError}
              onDismissError={() => setAudioError(null)}
              wordCount={wordCount}
              charCount={charCount}
              estimatedSeconds={estimatedSeconds}
            />
          ) : activeMode === 'multispeaker' ? (
            <MultiSpeakerStudio 
              onBgmOverlay={(buf) => setBgmBuffer(buf)} 
              loadedProject={loadedMultiSpeakerProject}
              onOpenCloudModal={() => setIsCloudModalOpen(true)}
              onRequireAuth={handleRequireAuth}
            />
          ) : (
            <AudioProductionSuite
              onBgmBufferGenerated={(buf: AudioBuffer) => setBgmBuffer(buf)}
              activeBgmBuffer={bgmBuffer}
              onOpenVoiceCloning={() => setIsCloningOpen(true)}
              onRequireAuth={handleRequireAuth}
            />
          )
        }
        inspector={
          activeMode === 'intro' ? (
            <VoiceInspector 
              selectedStyle={selectedStyle}
              selectedVoice={selectedVoice}
              onOpenVoiceConfig={() => setIsConfigOpen(true)}
              onOpenPromptModal={() => setIsPromptOpen(true)}
              onSelectStyle={handleSelectStyle}
              introStyles={INTRO_STYLES}
              emotionalMode={emotionalMode}
              onEmotionalModeChange={setEmotionalMode}
              lyricalMode={lyricalMode}
              onLyricalModeChange={setLyricalMode}
              speed={speed}
              onSpeedChange={setSpeed}
              allVoices={allAvailableVoices}
            />
          ) : undefined
        }
        transport={
          activeMode === 'intro' ? (
            <AudioTransport 
              isPlaying={isPlaying}
              onPlay={() => {
                if (generatedAudio) playGeneratedAudio(generatedAudio.buffer);
                else handleGenerateSpeech();
              }}
              onPause={stopPlayback}
              onStop={stopPlayback}
              onSeek={handleSeek}
              currentTime={(audioProgress / 100) * audioDuration}
              duration={audioDuration}
              hasAudio={!!generatedAudio}
              isGenerating={isGenerating}
              onGenerate={() => handleGenerateSpeech()}
              onDownloadWav={handleDownload}
              onOpenMobileInspector={() => setIsMobilePersonaDrawerOpen(true)}
              waveformBuffer={generatedAudio?.buffer || null}
            />
          ) : undefined
        }
        mobileNav={
          <MobileBottomNav 
            activeMode={activeMode}
            onSelectMode={(mode) => {
              stopPlayback();
              setActiveMode(mode);
            }}
            onOpenCloning={() => setIsCloningOpen(true)}
            onOpenProjects={() => setIsCloudModalOpen(true)}
          />
        }
      />

      {/* Modals & Overlays */}
      <ConfigurationModal 
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        selectedVoice={selectedVoice}
        onVoiceChange={(v) => {
          setSelectedVoice(v);
          setIsConfigOpen(false);
        }}
        voices={allAvailableVoices}
      />

      <SystemPromptModal 
        isOpen={isPromptOpen}
        onClose={() => setIsPromptOpen(false)}
        prompt={selectedStyle.systemPrompt || selectedStyle.description}
        isEditable={selectedStyle.id === 'custom'}
        onSave={handleSaveCustom}
        currentVoice={selectedVoice}
        voices={allAvailableVoices}
      />

      <VoiceCloningModal 
        isOpen={isCloningOpen}
        onClose={() => setIsCloningOpen(false)}
        onSuccess={() => {
          getElevenLabsVoices().then(v => {
            if (v && v.length > 0) setElevenLabsVoicesList(v);
          });
        }}
      />

      <PlanUpgradeModal />

      {/* AudioFACTORY Account & Monetization Center Drawer */}
      <AccountDrawer 
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        onOpenPricing={() => {
          setIsAccountOpen(false);
          setUpgradeModalOpen(true);
        }}
      />

      {/* Polite Daily Quota Exhausted Modal */}
      <DailyQuotaExhaustedModal 
        isOpen={isQuotaExhaustedModalOpen}
        onClose={() => setIsQuotaExhaustedModalOpen(false)}
        onUpgrade={() => {
          setIsQuotaExhaustedModalOpen(false);
          setUpgradeModalOpen(true);
        }}
      />

      {/* Force Lockdown Mode Overlay when credits are completely exhausted */}
      {isExhausted && (
        <LockdownOverlay 
          onOpenPricing={() => setUpgradeModalOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
      )}

      {/* Auth Modal for Onboarding */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingAuthAction(null);
        }}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          if (pendingAuthAction) {
            pendingAuthAction();
            setPendingAuthAction(null);
          }
        }}
      />

      <FirebaseProjectsModal 
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        onLoadProject={(proj) => {
          setLoadedMultiSpeakerProject(proj);
          setActiveMode('multispeaker');
          setIsCloudModalOpen(false);
        }}
        onLoadMonologue={(mono) => {
          setText(mono.text);
          if (mono.voice) setSelectedVoice(mono.voice);
          setActiveMode('intro');
          setIsCloudModalOpen(false);
        }}
      />

      {/* Mobile Persona Sheet Drawer (< md) using MobileBottomSheet */}
      <MobileBottomSheet
        isOpen={isMobilePersonaDrawerOpen}
        onClose={() => setIsMobilePersonaDrawerOpen(false)}
        title="Acoustic Inspector"
        subtitle={`${INTRO_STYLES.length + 1} voice personas & acoustic controls`}
      >
        <VoiceInspector 
          selectedStyle={selectedStyle}
          selectedVoice={selectedVoice}
          onOpenVoiceConfig={() => {
            setIsMobilePersonaDrawerOpen(false);
            setIsConfigOpen(true);
          }}
          onOpenPromptModal={() => {
            setIsMobilePersonaDrawerOpen(false);
            setIsPromptOpen(true);
          }}
          onSelectStyle={(style) => {
            handleSelectStyle(style);
            setIsMobilePersonaDrawerOpen(false);
          }}
          introStyles={INTRO_STYLES}
          emotionalMode={emotionalMode}
          onEmotionalModeChange={setEmotionalMode}
          lyricalMode={lyricalMode}
          onLyricalModeChange={setLyricalMode}
          speed={speed}
          onSpeedChange={setSpeed}
          allVoices={allAvailableVoices}
        />
      </MobileBottomSheet>

      {/* Diagnostic Drawer */}
      <TerminalDiagnosticDrawer 
        onTriggerSynth={handleGenerateSpeech}
        onTriggerPlay={handleMainActionClick}
        onTriggerExport={handleDownload}
      />

      {apiError && (
        <Toast
          message={apiError.message}
          type={apiError.type}
          onClose={() => setApiError(null)}
        />
      )}
    </div>
  );
};
export default StudioApp;
