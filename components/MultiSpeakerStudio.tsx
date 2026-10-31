import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Play, 
  Pause, 
  Download, 
  RefreshCw, 
  Volume2, 
  Wand2, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Trash2,
  FastForward,
  Cloud,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Users,
  Square,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { SceneSpeaker, DialogueLine, Voice, SavedAudioProject } from '../types';
import { ALL_VOICES } from '../voices';
import { 
  generateSpeech, 
  generateScript, 
  analyzeScriptContent, 
  stitchAudioBuffers, 
  audioBufferToWavBlob 
} from '../services/geminiService';
import { 
  getElevenLabsVoices, 
  generateSpeechElevenLabs, 
  isElevenLabsKeyAvailable,
  DEFAULT_ELEVENLABS_VOICES 
} from '../services/elevenLabsService';
import { BauhausButton } from './BauhausComponents';
import { useFirebase } from '../services/firebaseContext';
import { useLiveblocks } from '../services/liveblocksContext';
import { LivePresenceBar } from './LivePresenceBar';
import { QuotaExhaustedBanner } from './QuotaExhaustedBanner';
import { downloadAudioBlob } from '../src/utils/audioDownloader';
import { useTerminal } from './terminal/TerminalContext';

interface MultiSpeakerStudioProps {
  onBgmOverlay?: (buffer: AudioBuffer) => void;
  onOpenCloudModal?: () => void;
  loadedProject?: SavedAudioProject | null;
  onRequireAuth?: (action?: () => void) => void;
}

const SPEAKER_COLOR_MAP: Record<string, { bg: string; text: string; dot: string; ring: string; lightBg: string }> = {
  yellow: { 
    bg: 'bg-amber-400', 
    text: 'text-zinc-950', 
    dot: 'bg-amber-500', 
    ring: 'ring-amber-400',
    lightBg: 'bg-amber-50/70'
  },
  blue: { 
    bg: 'bg-sky-600', 
    text: 'text-white', 
    dot: 'bg-sky-500', 
    ring: 'ring-sky-500',
    lightBg: 'bg-sky-50/70'
  },
  red: { 
    bg: 'bg-rose-600', 
    text: 'text-white', 
    dot: 'bg-rose-500', 
    ring: 'ring-rose-500',
    lightBg: 'bg-rose-50/70'
  },
  green: { 
    bg: 'bg-emerald-600', 
    text: 'text-white', 
    dot: 'bg-emerald-500', 
    ring: 'ring-emerald-500',
    lightBg: 'bg-emerald-50/70'
  },
  black: { 
    bg: 'bg-zinc-800', 
    text: 'text-white', 
    dot: 'bg-zinc-700', 
    ring: 'ring-zinc-600',
    lightBg: 'bg-zinc-50'
  },
};

const EMOTION_PRESETS = [
  'Natural',
  'Excited',
  'Confident',
  'Intrigued',
  'Dramatic',
  'Whispering',
  'Skeptical',
  'Humorous'
];

export const MultiSpeakerStudio: React.FC<MultiSpeakerStudioProps> = ({
  onBgmOverlay,
  onOpenCloudModal,
  loadedProject,
  onRequireAuth
}) => {
  const { savedProjects, saveProjectToCloud, isSaving, user } = useFirebase();
  const { isTerminalMode, activeSkin } = useTerminal();
  const { collaborators, broadcastAudioPlay, setActiveEditingLine } = useLiveblocks();
  const [justSaved, setJustSaved] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(undefined);

  // Layout & Responsive States
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [mobileTab, setMobileTab] = useState<'script' | 'cast' | 'ai'>('script');
  const [activeTool, setActiveTool] = useState<'generator' | 'analyzer' | null>(null);
  const [collapsedLineIds, setCollapsedLineIds] = useState<Record<string, boolean>>({});

  // Studio Setup State
  const [topic, setTopic] = useState('');
  const [format, setFormat] = useState('Podcast Dialogue');
  const [styleTone, setStyleTone] = useState('High Stakes & Dramatic');
  const [speakerCount, setSpeakerCount] = useState(2);
  const [isScriptGenerating, setIsScriptGenerating] = useState(false);

  // Content analysis state
  const [rawTextToAnalyze, setRawTextToAnalyze] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Project state
  const [projectTitle, setProjectTitle] = useState('Multi-Speaker Audio Drama');
  const [projectSummary, setProjectSummary] = useState('An engaging conversation between multiple voices.');
  const [speakers, setSpeakers] = useState<SceneSpeaker[]>([
    { name: 'Alex (Host)', voice: 'Algieba', provider: 'gemini', gender: 'MALE', color: 'yellow' },
    { name: 'Dr. Jordan (Guest)', voice: 'Leda', provider: 'gemini', gender: 'FEMALE', color: 'blue' }
  ]);

  const [lines, setLines] = useState<DialogueLine[]>([
    {
      id: 'line-1',
      speaker: 'Alex (Host)',
      text: 'Welcome back everyone. Today we are diving into one of the most contentious topics in modern audio engineering.',
      scene: 'Scene 1: Introduction',
      emotion: 'Excited and Welcoming',
      status: 'idle'
    },
    {
      id: 'line-2',
      speaker: 'Dr. Jordan (Guest)',
      text: 'Thanks for having me, Alex. The breakthrough we made this week changes everything we thought was possible.',
      scene: 'Scene 1: Introduction',
      emotion: 'Confident and Authoritative',
      status: 'idle'
    },
    {
      id: 'line-3',
      speaker: 'Alex (Host)',
      text: 'Tell us straight: is artificial voice synthesis finally indistinguishable from human vocal timbre?',
      scene: 'Scene 2: The Core Question',
      emotion: 'Intrigued and Inquisitive',
      status: 'idle'
    },
    {
      id: 'line-4',
      speaker: 'Dr. Jordan (Guest)',
      text: 'Not only indistinguishable—it captures the subtle breaths, micro-hesitations, and raw emotion of real conversation.',
      scene: 'Scene 2: The Core Question',
      emotion: 'Passionate and Direct',
      status: 'idle'
    }
  ]);

  // ElevenLabs available voices
  const [elevenLabsVoices, setElevenLabsVoices] = useState<Voice[]>(DEFAULT_ELEVENLABS_VOICES);
  const hasElevenLabsKey = isElevenLabsKeyAvailable();

  // Audio Playback State
  const [playingLineId, setPlayingLineId] = useState<string | null>(null);
  const [isPlayingFullSequence, setIsPlayingFullSequence] = useState(false);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeAudioSource, setActiveAudioSource] = useState<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Load ElevenLabs voices on mount
  useEffect(() => {
    getElevenLabsVoices().then(v => {
      if (v && v.length > 0) setElevenLabsVoices(v);
    });
  }, []);

  // Sync loaded project from Firebase Cloud
  useEffect(() => {
    if (loadedProject) {
      setCurrentProjectId(loadedProject.id);
      setProjectTitle(loadedProject.title);
      setProjectSummary(loadedProject.summary || '');
      if (loadedProject.format) setFormat(loadedProject.format);
      if (loadedProject.style) setStyleTone(loadedProject.style);
      if (loadedProject.speakers && loadedProject.speakers.length > 0) {
        setSpeakers(loadedProject.speakers);
      }
      if (loadedProject.lines && loadedProject.lines.length > 0) {
        setLines(loadedProject.lines.map(l => ({
          ...l,
          status: 'idle',
          audioBuffer: null,
          audioUrl: null
        })));
      }
    }
  }, [loadedProject]);

  const handleSaveToCloud = async () => {
    try {
      const savedId = await saveProjectToCloud({
        id: currentProjectId,
        title: projectTitle,
        summary: projectSummary,
        format,
        style: styleTone,
        speakerCount: speakers.length,
        speakers,
        lines: lines.map(l => ({
          id: l.id,
          speaker: l.speaker,
          text: l.text,
          scene: l.scene,
          emotion: l.emotion,
        })),
      });
      setCurrentProjectId(savedId);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 3000);
    } catch (err: any) {
      console.error("Save to cloud failed:", err);
      setErrorMessage(err.message || "Failed to save project to Firebase.");
    }
  };

  // Audio Context singleton
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
    }
    return audioContextRef.current;
  };

  // Stop currently active audio
  const stopCurrentPlayback = () => {
    if (activeAudioSource) {
      try {
        activeAudioSource.stop();
      } catch (e) {}
      setActiveAudioSource(null);
    }
    setPlayingLineId(null);
    setIsPlayingFullSequence(false);
  };

  // Play a single line's AudioBuffer
  const playLineAudio = (lineId: string, buffer: AudioBuffer, onEndedCallback?: () => void) => {
    stopCurrentPlayback();
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => {
      setPlayingLineId(null);
      if (onEndedCallback) {
        onEndedCallback();
      }
    };
    source.start(0);
    setActiveAudioSource(source);
    setPlayingLineId(lineId);

    // Broadcast live playing line to Liveblocks room
    const targetLineIndex = lines.findIndex(l => l.id === lineId);
    const targetLine = lines[targetLineIndex];
    if (targetLine) {
      broadcastAudioPlay(targetLine.speaker, targetLineIndex);
    }
  };

  // Generate audio for one line
  const handleGenerateLine = async (lineId: string, skipAuthCheck = false) => {
    if (!user && !skipAuthCheck) {
      if (onRequireAuth) onRequireAuth(() => handleGenerateLine(lineId, true));
      return;
    }

    const line = lines.find(l => l.id === lineId);
    if (!line) return;

    setErrorMessage(null);
    setLines(prev => prev.map(l => l.id === lineId ? { ...l, status: 'generating', errorMessage: undefined } : l));

    const speaker = speakers.find(s => s.name === line.speaker) || speakers[0];

    try {
      let buffer: AudioBuffer;
      let audioUrl: string;

      if (speaker.provider === 'elevenlabs') {
        if (!hasElevenLabsKey) {
          const fallbackVoice = ALL_VOICES.find(v => v.ssmlGender.toUpperCase() === (speaker.gender || 'MALE'))?.name || 'Algieba';
          const instruction = `Speak in character as ${speaker.name}. Emotion: ${line.emotion || 'Natural'}.`;
          const res = await generateSpeech(line.text, fallbackVoice, instruction);
          buffer = res.buffer;
          const wavBlob = audioBufferToWavBlob(buffer);
          audioUrl = URL.createObjectURL(wavBlob);
          setErrorMessage(`ElevenLabs service is not active on server, so we generated this voice using Gemini's ${fallbackVoice} neural voice.`);
        } else {
          const res = await generateSpeechElevenLabs(line.text, speaker.voice);
          buffer = res.buffer;
          const wavBlob = new Blob([res.rawData], { type: 'audio/mpeg' });
          audioUrl = URL.createObjectURL(wavBlob);
        }
      } else {
        const instruction = `Speak in character as ${speaker.name}. Emotion: ${line.emotion || 'Natural'}. Scene: ${line.scene || 'Drama'}.`;
        const res = await generateSpeech(line.text, speaker.voice, instruction);
        buffer = res.buffer;
        const wavBlob = audioBufferToWavBlob(buffer);
        audioUrl = URL.createObjectURL(wavBlob);
      }

      setLines(prev => prev.map(l => l.id === lineId ? {
        ...l,
        status: 'ready',
        audioBuffer: buffer,
        audioUrl: audioUrl
      } : l));

    } catch (err: any) {
      console.error("Line audio generation failed:", err);
      const msg = err.message || "Failed to generate speech for line.";
      setLines(prev => prev.map(l => l.id === lineId ? {
        ...l,
        status: 'error',
        errorMessage: msg
      } : l));
      setErrorMessage(`Error on "${line.speaker}": ${msg}`);
    }
  };

  // Generate All lines (Combined sequence)
  const handleGenerateAllLines = async (skipAuthCheck = false) => {
    if (!user && !skipAuthCheck) {
      if (onRequireAuth) onRequireAuth(() => handleGenerateAllLines(true));
      return;
    }

    stopCurrentPlayback();
    setIsBatchGenerating(true);
    setErrorMessage(null);
    const ungenerated = lines.filter(l => l.status !== 'ready' || !l.audioBuffer);
    setBatchProgress({ current: 0, total: ungenerated.length });

    let count = 0;
    for (const line of lines) {
      if (line.status === 'ready' && line.audioBuffer) continue;
      
      setLines(prev => prev.map(l => l.id === line.id ? { ...l, status: 'generating' } : l));
      const speaker = speakers.find(s => s.name === line.speaker) || speakers[0];

      try {
        let buffer: AudioBuffer;
        let audioUrl: string;

        if (speaker.provider === 'elevenlabs' && hasElevenLabsKey) {
          const res = await generateSpeechElevenLabs(line.text, speaker.voice);
          buffer = res.buffer;
          const wavBlob = new Blob([res.rawData], { type: 'audio/mpeg' });
          audioUrl = URL.createObjectURL(wavBlob);
        } else {
          const voiceToUse = speaker.provider === 'elevenlabs' 
            ? (ALL_VOICES.find(v => v.ssmlGender.toUpperCase() === (speaker.gender || 'MALE'))?.name || 'Algieba')
            : speaker.voice;
          const instruction = `Speak in character as ${speaker.name}. Emotion: ${line.emotion || 'Natural'}.`;
          const res = await generateSpeech(line.text, voiceToUse, instruction);
          buffer = res.buffer;
          const wavBlob = audioBufferToWavBlob(buffer);
          audioUrl = URL.createObjectURL(wavBlob);
        }

        setLines(prev => prev.map(l => l.id === line.id ? {
          ...l,
          status: 'ready',
          audioBuffer: buffer,
          audioUrl: audioUrl
        } : l));

        count++;
        setBatchProgress({ current: count, total: ungenerated.length });
        await new Promise(r => setTimeout(r, 400));
      } catch (err: any) {
        console.error("Batch line error:", err);
        setLines(prev => prev.map(l => l.id === line.id ? {
          ...l,
          status: 'error',
          errorMessage: err.message || 'Error'
        } : l));
      }
    }

    setIsBatchGenerating(false);
  };

  // Play full combined scene sequentially
  const handlePlayFullScene = () => {
    stopCurrentPlayback();
    const readyLines = lines.filter(l => l.audioBuffer != null);
    if (readyLines.length === 0) {
      setErrorMessage("No ready audio lines found. Please generate audio first!");
      return;
    }

    setIsPlayingFullSequence(true);
    let index = 0;

    const playNext = () => {
      if (index >= readyLines.length) {
        setIsPlayingFullSequence(false);
        setPlayingLineId(null);
        return;
      }
      const current = readyLines[index];
      index++;
      playLineAudio(current.id, current.audioBuffer!, () => {
        setTimeout(playNext, 300);
      });
    };

    playNext();
  };

  // Download stitched master WAV with mobile share & Android download support
  const handleDownloadCombinedWav = async () => {
    const buffers = lines.map(l => l.audioBuffer).filter((b): b is AudioBuffer => b != null);
    if (buffers.length === 0) {
      setErrorMessage("Generate at least one line before downloading combined audio.");
      return;
    }

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const combinedBuffer = await stitchAudioBuffers(buffers, audioContext);
      const wavBlob = audioBufferToWavBlob(combinedBuffer);
      const filename = `${projectTitle.toLowerCase().replace(/\s+/g, '_')}_combined.wav`;
      await downloadAudioBlob(wavBlob, filename, `AudioFACTORY - ${projectTitle}`);
    } catch (err: any) {
      setErrorMessage(`Failed to export audio: ${err.message}`);
    }
  };

  // Download single dialogue turn audio with mobile share support
  const handleDownloadSingleLine = async (line: DialogueLine, idx: number) => {
    if (!line.audioBuffer && !line.audioUrl) return;
    try {
      let blob: Blob;
      if (line.audioBuffer) {
        blob = audioBufferToWavBlob(line.audioBuffer);
      } else if (line.audioUrl) {
        const res = await fetch(line.audioUrl);
        blob = await res.blob();
      } else {
        return;
      }
      const filename = `${line.speaker.toLowerCase().replace(/\s+/g, '_')}_turn_${idx + 1}.wav`;
      await downloadAudioBlob(blob, filename, `AudioFACTORY - ${line.speaker} Turn #${idx + 1}`);
    } catch (err: any) {
      setErrorMessage(`Failed to download turn audio: ${err.message}`);
    }
  };

  // AI Script Generation
  const handleGenerateScriptWithAI = async (skipAuthCheck = false) => {
    if (!user && !skipAuthCheck) {
      if (onRequireAuth) onRequireAuth(() => handleGenerateScriptWithAI(true));
      return;
    }

    if (!topic.trim()) return;
    setIsScriptGenerating(true);
    setErrorMessage(null);
    try {
      const res = await generateScript({
        topic,
        durationMinutes: 1,
        format,
        style: styleTone,
        speakersCount: speakerCount
      });
      setProjectTitle(res.title);
      setProjectSummary(res.summary);
      setSpeakers(res.speakers);
      setLines(res.lines);
      setActiveTool(null);
    } catch (err: any) {
      setErrorMessage(`Failed to generate script: ${err.message}`);
    } finally {
      setIsScriptGenerating(false);
    }
  };

  // Auto-Detect & Analyze Script Content
  const handleAnalyzeContent = async () => {
    if (!rawTextToAnalyze.trim()) return;
    setIsAnalyzing(true);
    setErrorMessage(null);
    try {
      const res = await analyzeScriptContent(rawTextToAnalyze);
      setProjectTitle(res.title);
      setProjectSummary(res.summary);
      if (res.speakers.length > 0) setSpeakers(res.speakers);
      if (res.lines.length > 0) setLines(res.lines);
      setActiveTool(null);
      setRawTextToAnalyze('');
    } catch (err: any) {
      setErrorMessage(`Failed to analyze content: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper to add a manual line
  const handleAddLine = () => {
    const newLine: DialogueLine = {
      id: `line-${Date.now()}`,
      speaker: speakers[0]?.name || 'Speaker 1',
      text: 'Enter spoken dialogue here...',
      scene: `Scene ${Math.max(1, new Set(lines.map(l => l.scene)).size)}`,
      emotion: 'Natural',
      status: 'idle'
    };
    setLines([...lines, newLine]);
  };

  // Helper to remove a line
  const handleRemoveLine = (id: string) => {
    setLines(lines.filter(l => l.id !== id));
  };

  // Move line reordering
  const handleMoveLine = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= lines.length) return;
    const reordered = [...lines];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    setLines(reordered);
  };

  // Toggle collapse state for a line
  const toggleLineCollapse = (id: string) => {
    setCollapsedLineIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Toggle collapse all
  const toggleCollapseAll = () => {
    const allCollapsed = lines.every(l => collapsedLineIds[l.id]);
    const newState: Record<string, boolean> = {};
    if (!allCollapsed) {
      lines.forEach(l => { newState[l.id] = true; });
    }
    setCollapsedLineIds(newState);
  };

  // Add a new speaker
  const handleAddSpeaker = () => {
    const colors = ['yellow', 'blue', 'red', 'green', 'black'];
    const usedColors = speakers.map(s => s.color);
    const availableColor = colors.find(c => !usedColors.includes(c)) || 'yellow';
    const num = speakers.length + 1;
    const newSp: SceneSpeaker = {
      name: `Speaker ${num}`,
      voice: 'Puck',
      provider: 'gemini',
      gender: 'MALE',
      color: availableColor
    };
    setSpeakers([...speakers, newSp]);
  };

  // Speaker voice change
  const handleSpeakerVoiceChange = (speakerName: string, newVoice: string, provider: 'gemini' | 'elevenlabs') => {
    setSpeakers(prev => prev.map(s => s.name === speakerName ? { ...s, voice: newVoice, provider } : s));
  };

  const readyCount = lines.filter(l => l.status === 'ready').length;
  const currentSpeakingLine = lines.find(l => l.id === playingLineId);

  return (
    <div 
      className="af-canvas select-none custom-scrollbar min-h-full flex flex-col gap-3 pb-24 sm:pb-12"
      style={{
        backgroundColor: 'var(--af-canvas, var(--skin-bg-app, #FAF6EF))',
        color: 'var(--af-text, var(--skin-text-primary, #431407))'
      }}
    >
      {/* Collaboration Live Presence */}
      <div className="flex-shrink-0">
        <LivePresenceBar />
      </div>

      {/* Quota Exhaustion & Upgrade Prompt */}
      <QuotaExhaustedBanner actionName="scene generation" />

      {/* Main Studio Card */}
      <div 
        className="flex-1 min-h-[420px] rounded-2xl border shadow-sm flex flex-col overflow-hidden"
        style={{
          backgroundColor: 'var(--af-surface, #FFFFFF)',
          borderColor: 'var(--af-border, #E8D5C2)'
        }}
      >
        {/* Card Header Bar */}
        <div 
          className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2.5"
          style={{
            backgroundColor: 'var(--af-raised, #F6EDE2)',
            borderColor: 'var(--af-border, #E8D5C2)'
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsInspectorOpen(!isInspectorOpen)}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg border text-xs transition-colors hover:opacity-80"
              style={{
                borderColor: 'var(--af-border, #E8D5C2)',
                backgroundColor: 'var(--af-surface, #FFFFFF)',
                color: 'var(--af-text, #431407)'
              }}
              title={isInspectorOpen ? "Collapse Cast Inspector" : "Expand Cast Inspector"}
            >
              {isInspectorOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span 
                  className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider border"
                  style={{
                    backgroundColor: 'var(--skin-accent-muted, #FFEDD5)',
                    borderColor: 'var(--skin-border, #E8D5C2)',
                    color: 'var(--skin-accent, #C2410C)'
                  }}
                >
                  Multi-Speaker
                </span>
                <span 
                  className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase border"
                  style={{
                    backgroundColor: 'var(--af-surface, #FFFFFF)',
                    borderColor: 'var(--af-border, #E8D5C2)',
                    color: 'var(--af-text-secondary, #7C2D12)'
                  }}
                >
                  {format}
                </span>
                <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono opacity-80">
                  • {styleTone}
                </span>
              </div>
              <h1 className="text-sm md:text-base font-bold tracking-tight truncate mt-0.5" style={{ color: 'var(--af-text, #431407)' }}>
                {projectTitle}
              </h1>
            </div>
          </div>

        {/* Studio Top Action Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Key Control on Top: Play Full Scene */}
          <button
            onClick={() => {
              if (isPlayingFullSequence) {
                stopCurrentPlayback();
              } else {
                handlePlayFullScene();
              }
            }}
            disabled={readyCount === 0 || isBatchGenerating}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
              isPlayingFullSequence ? 'animate-pulse' : ''
            }`}
            style={{
              backgroundColor: isPlayingFullSequence ? '#EF4444' : 'var(--af-accent, #C2410C)',
              color: 'var(--af-accent-text, #FFFFFF)',
              opacity: (readyCount === 0 || isBatchGenerating) ? 0.45 : 1
            }}
            title={isPlayingFullSequence ? 'Stop Scene' : 'Play Full Scene'}
          >
            {isPlayingFullSequence ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Scene</span>
              </>
            )}
          </button>

          {/* Key Control on Top: Batch Synthesize */}
          {lines.length > readyCount && (
            <button
              onClick={() => handleGenerateAllLines()}
              disabled={isBatchGenerating}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              style={{
                backgroundColor: 'var(--af-raised, #F6EDE2)',
                borderColor: 'var(--af-border, #E8D5C2)',
                color: 'var(--af-accent, #C2410C)'
              }}
              title={`Synthesize all ${lines.length - readyCount} remaining lines`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBatchGenerating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Synth All ({lines.length - readyCount})</span>
              <span className="sm:hidden">Synth ({lines.length - readyCount})</span>
            </button>
          )}

          {/* Key Control on Top: Export WAV */}
          <button
            onClick={handleDownloadCombinedWav}
            disabled={readyCount === 0 || isBatchGenerating}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-40 transition-colors"
            style={{
              backgroundColor: 'var(--af-surface, #FFFFFF)',
              borderColor: 'var(--af-border, #E8D5C2)',
              color: 'var(--af-text, #431407)'
            }}
            title="Export Master continuous WAV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export WAV</span>
            <span className="sm:hidden">WAV</span>
          </button>

          <div className="h-4 w-[1px] hidden sm:block mx-0.5" style={{ backgroundColor: 'var(--af-border, #E8D5C2)' }} />

          <button
            onClick={() => setActiveTool(activeTool === 'generator' ? null : 'generator')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer"
            style={{
              backgroundColor: activeTool === 'generator' ? 'var(--af-accent, #C2410C)' : 'var(--af-surface, #FFFFFF)',
              color: activeTool === 'generator' ? 'var(--af-accent-text, #FFFFFF)' : 'var(--af-text, #431407)',
              borderColor: 'var(--af-border, #E8D5C2)'
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Generator</span>
            <span className="sm:hidden">AI</span>
          </button>

          <button
            onClick={() => setActiveTool(activeTool === 'analyzer' ? null : 'analyzer')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer"
            style={{
              backgroundColor: activeTool === 'analyzer' ? 'var(--af-accent, #C2410C)' : 'var(--af-surface, #FFFFFF)',
              color: activeTool === 'analyzer' ? 'var(--af-accent-text, #FFFFFF)' : 'var(--af-text, #431407)',
              borderColor: 'var(--af-border, #E8D5C2)'
            }}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Auto-Detect</span>
            <span className="sm:hidden">Detect</span>
          </button>

          <div className="h-4 w-[1px] hidden sm:block mx-0.5" style={{ backgroundColor: 'var(--af-border, #E8D5C2)' }} />

          <button
            onClick={handleSaveToCloud}
            disabled={isSaving || lines.length === 0}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-40"
            style={{
              backgroundColor: justSaved ? 'rgba(16, 185, 129, 0.15)' : 'var(--af-surface, #FFFFFF)',
              borderColor: justSaved ? '#10B981' : 'var(--af-border, #E8D5C2)',
              color: justSaved ? '#059669' : 'var(--af-text, #431407)'
            }}
            title="Save this scene to Firebase Firestore"
          >
            {justSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Cloud className="w-3.5 h-3.5" />}
            <span>{isSaving ? 'Saving...' : justSaved ? 'Saved' : 'Save'}</span>
          </button>

          {onOpenCloudModal && (
            <button
              onClick={onOpenCloudModal}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 cursor-pointer"
              style={{
                backgroundColor: 'var(--af-surface, #FFFFFF)',
                borderColor: 'var(--af-border, #E8D5C2)',
                color: 'var(--af-text, #431407)'
              }}
              title="Open saved projects from Firebase"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Projects</span>
              <span 
                className="text-[10px] px-1.5 py-0.2 rounded-full font-bold border"
                style={{
                  backgroundColor: 'var(--af-raised, #F6EDE2)',
                  borderColor: 'var(--af-border, #E8D5C2)',
                  color: 'var(--af-accent, #C2410C)'
                }}
              >
                {savedProjects.length}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* MOBILE SEGMENTED CONTROL TABS (< md) */}
      <div 
        className="flex md:hidden border-b p-1.5 gap-1.5"
        style={{
          backgroundColor: 'var(--af-raised, #F6EDE2)',
          borderColor: 'var(--af-border, #E8D5C2)'
        }}
      >
        <button
          onClick={() => setMobileTab('script')}
          className="flex-1 py-1.5 text-xs font-mono font-bold rounded-lg text-center transition-all"
          style={{
            backgroundColor: mobileTab === 'script' ? 'var(--af-surface, #FFFFFF)' : 'transparent',
            color: mobileTab === 'script' ? 'var(--af-accent, #C2410C)' : 'var(--af-text-muted, #9A5B32)',
            boxShadow: mobileTab === 'script' ? 'var(--skin-shadow)' : 'none'
          }}
        >
          Dialogue ({lines.length})
        </button>
        <button
          onClick={() => setMobileTab('cast')}
          className="flex-1 py-1.5 text-xs font-mono font-bold rounded-lg text-center transition-all"
          style={{
            backgroundColor: mobileTab === 'cast' ? 'var(--af-surface, #FFFFFF)' : 'transparent',
            color: mobileTab === 'cast' ? 'var(--af-accent, #C2410C)' : 'var(--af-text-muted, #9A5B32)',
            boxShadow: mobileTab === 'cast' ? 'var(--skin-shadow)' : 'none'
          }}
        >
          Cast ({speakers.length})
        </button>
        <button
          onClick={() => setMobileTab('ai')}
          className="flex-1 py-1.5 text-xs font-mono font-bold rounded-lg text-center transition-all"
          style={{
            backgroundColor: mobileTab === 'ai' ? 'var(--af-surface, #FFFFFF)' : 'transparent',
            color: mobileTab === 'ai' ? 'var(--af-accent, #C2410C)' : 'var(--af-text-muted, #9A5B32)',
            boxShadow: mobileTab === 'ai' ? 'var(--skin-shadow)' : 'none'
          }}
        >
          AI Tools
        </button>
      </div>

      {/* ERROR NOTICE TOAST */}
      {errorMessage && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 text-xs font-mono text-rose-800 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-800 font-bold p-1">✕</button>
        </div>
      )}

      {/* COLLAPSIBLE ACCORDION 1: AI SCRIPT GENERATOR */}
      {activeTool === 'generator' && (
        <div 
          className="border-b p-4 md:p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 z-10 shadow-xs"
          style={{
            backgroundColor: 'var(--af-surface, #FFFFFF)',
            borderColor: 'var(--af-border, #E8D5C2)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: 'var(--af-accent, #C2410C)' }} />
              <h2 className="text-xs uppercase font-bold tracking-wider" style={{ color: 'var(--af-text, #431407)' }}>
                AI Script Generator
              </h2>
            </div>
            <button 
              onClick={() => setActiveTool(null)}
              className="text-xs p-1 cursor-pointer hover:opacity-80"
              style={{ color: 'var(--af-text-muted, #9A5B32)' }}
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-mono uppercase mb-1" style={{ color: 'var(--af-text-muted, #9A5B32)' }}>
                Scene Prompt / Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. A founder pitching a skeptical venture capitalist..."
                className="w-full px-3 py-2 border rounded-lg text-xs outline-none"
                style={{
                  backgroundColor: 'var(--af-raised, #F6EDE2)',
                  borderColor: 'var(--af-border, #E8D5C2)',
                  color: 'var(--af-text, #431407)'
                }}
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase mb-1" style={{ color: 'var(--af-text-muted, #9A5B32)' }}>
                Format
              </label>
              <select
                value={format}
                onChange={e => setFormat(e.target.value)}
                className="w-full px-2.5 py-2 border rounded-lg text-xs outline-none cursor-pointer"
                style={{
                  backgroundColor: 'var(--af-raised, #F6EDE2)',
                  borderColor: 'var(--af-border, #E8D5C2)',
                  color: 'var(--af-text, #431407)'
                }}
              >
                <option value="Podcast Dialogue">Podcast Dialogue</option>
                <option value="All-Hands Kickoff">All-Hands Kickoff</option>
                <option value="Movie Scene">Cinematic Scene</option>
                <option value="Tech Debate">Tech Debate</option>
                <option value="Comedy Sketch">Comedy Sketch</option>
                <option value="News Interview">News Interview</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase mb-1" style={{ color: 'var(--af-text-muted, #9A5B32)' }}>
                Style Tone
              </label>
              <select
                value={styleTone}
                onChange={e => setStyleTone(e.target.value)}
                className="w-full px-2.5 py-2 border rounded-lg text-xs outline-none cursor-pointer"
                style={{
                  backgroundColor: 'var(--af-raised, #F6EDE2)',
                  borderColor: 'var(--af-border, #E8D5C2)',
                  color: 'var(--af-text, #431407)'
                }}
              >
                <option value="High Stakes & Dramatic">High Stakes & Dramatic</option>
                <option value="Casual & Conversational">Casual & Conversational</option>
                <option value="Hyper Energized & Hype">Hyper Energized & Hype</option>
                <option value="Playful & Witty">Playful & Witty</option>
                <option value="Suspenseful & Mysterious">Suspenseful & Mysterious</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--af-text-muted, #9A5B32)' }}>Speakers:</span>
              {[2, 3, 4].map(num => {
                const isSelected = speakerCount === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSpeakerCount(num)}
                    className="w-7 h-7 rounded-lg border text-xs font-bold transition-colors cursor-pointer"
                    style={{
                      backgroundColor: isSelected ? 'var(--af-accent, #C2410C)' : 'var(--af-surface, #FFFFFF)',
                      color: isSelected ? 'var(--af-accent-text, #FFFFFF)' : 'var(--af-text, #431407)',
                      borderColor: isSelected ? 'var(--af-accent, #C2410C)' : 'var(--af-border, #E8D5C2)'
                    }}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handleGenerateScriptWithAI()}
              disabled={isScriptGenerating || !topic.trim()}
              className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-95"
              style={{
                backgroundColor: 'var(--af-accent, #C2410C)',
                color: 'var(--af-accent-text, #FFFFFF)'
              }}
            >
              {isScriptGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating Script...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Write Script with AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* COLLAPSIBLE ACCORDION 2: CONTENT AUTO-DETECTION */}
      {activeTool === 'analyzer' && (
        <div 
          className="border-b p-4 md:p-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 z-10 shadow-xs"
          style={{
            backgroundColor: 'var(--af-raised, #F6EDE2)',
            borderColor: 'var(--af-border, #E8D5C2)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" style={{ color: 'var(--af-accent, #C2410C)' }} />
              <h2 className="text-xs uppercase font-bold tracking-wider" style={{ color: 'var(--af-text, #431407)' }}>
                Auto-Detection & Speaker Extraction Engine
              </h2>
            </div>
            <button 
              onClick={() => setActiveTool(null)}
              className="text-xs p-1 cursor-pointer hover:opacity-80"
              style={{ color: 'var(--af-text-muted, #9A5B32)' }}
            >
              ✕ Close
            </button>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--af-text-muted, #9A5B32)' }}>
            Paste any article excerpt, screenplay dialogue, or meeting transcript below. Gemini will automatically decompose the text into distinct speakers, emotions, and structured dialogue scenes.
          </p>
          <textarea
            value={rawTextToAnalyze}
            onChange={e => setRawTextToAnalyze(e.target.value)}
            placeholder="Paste your dialogue script (e.g. 'Sarah: Did you review the numbers?\nMark: Not yet, but I have the summary ready.') or article excerpt here..."
            className="w-full h-32 p-3 border rounded-xl text-xs outline-none resize-y"
            style={{
              backgroundColor: 'var(--af-surface, #FFFFFF)',
              borderColor: 'var(--af-border, #E8D5C2)',
              color: 'var(--af-text, #431407)'
            }}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setActiveTool(null)}
              className="px-3 py-1.5 rounded-lg border text-xs cursor-pointer hover:opacity-80"
              style={{
                backgroundColor: 'var(--af-surface, #FFFFFF)',
                borderColor: 'var(--af-border, #E8D5C2)',
                color: 'var(--af-text, #431407)'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAnalyzeContent}
              disabled={isAnalyzing || !rawTextToAnalyze.trim()}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-95"
              style={{
                backgroundColor: 'var(--af-accent, #C2410C)',
                color: 'var(--af-accent-text, #FFFFFF)'
              }}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing Content...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Analyze & Parse Speakers</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN 3-ZONE WORKSPACE CONTAINER */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* ZONE A: COLLAPSIBLE LEFT INSPECTOR (Cast, Voice Matrix, Scene Nav) */}
        <aside 
          className={`
            ${isInspectorOpen ? 'w-72 lg:w-80' : 'w-14'}
            hidden md:flex flex-col border-r flex-shrink-0 transition-all duration-200 overflow-hidden
          `}
          style={{
            backgroundColor: 'var(--af-surface, #FFFFFF)',
            borderColor: 'var(--af-border, #E8D5C2)'
          }}
        >
          {isInspectorOpen ? (
            <div className="flex flex-col h-full overflow-hidden" style={{ color: 'var(--af-text, #431407)' }}>
              <div 
                className="p-3.5 border-b flex items-center justify-between"
                style={{
                  backgroundColor: 'var(--af-raised, #F6EDE2)',
                  borderColor: 'var(--af-border, #E8D5C2)'
                }}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" style={{ color: 'var(--af-accent, #C2410C)' }} />
                  <span className="text-xs uppercase font-bold tracking-wider" style={{ color: 'var(--af-text, #431407)' }}>
                    Cast & Voice Roster
                  </span>
                </div>
                <button
                  onClick={handleAddSpeaker}
                  className="text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  style={{ color: 'var(--af-accent, #C2410C)' }}
                  title="Add another speaker"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {/* Speaker List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {speakers.map((sp, idx) => {
                  const theme = SPEAKER_COLOR_MAP[sp.color || 'yellow'] || SPEAKER_COLOR_MAP.yellow;
                  return (
                    <div 
                      key={idx} 
                      className="p-3 rounded-xl border shadow-2xs space-y-2.5"
                      style={{
                        backgroundColor: 'var(--af-raised, #F6EDE2)',
                        borderColor: 'var(--af-border, #E8D5C2)'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-3 h-3 rounded-full ${theme.dot} flex-shrink-0`} />
                          <span className="text-xs font-bold truncate" style={{ color: 'var(--af-text, #431407)' }}>
                            {sp.name}
                          </span>
                        </div>
                        <span 
                          className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border"
                          style={{
                            backgroundColor: 'var(--af-surface, #FFFFFF)',
                            borderColor: 'var(--af-border, #E8D5C2)',
                            color: 'var(--af-text-muted, #9A5B32)'
                          }}
                        >
                          {sp.gender || 'MALE'}
                        </span>
                      </div>

                      {/* Provider Switcher */}
                      <div 
                        className="flex rounded-lg border p-0.5 text-[10px]"
                        style={{
                          backgroundColor: 'var(--af-surface, #FFFFFF)',
                          borderColor: 'var(--af-border, #E8D5C2)'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleSpeakerVoiceChange(sp.name, 'Algieba', 'gemini')}
                          className="flex-1 py-1 rounded text-center transition-colors cursor-pointer"
                          style={{
                            backgroundColor: sp.provider === 'gemini' ? 'var(--af-accent, #C2410C)' : 'transparent',
                            color: sp.provider === 'gemini' ? 'var(--af-accent-text, #FFFFFF)' : 'var(--af-text, #431407)',
                            fontWeight: sp.provider === 'gemini' ? 'bold' : 'normal'
                          }}
                        >
                          Gemini TTS
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSpeakerVoiceChange(sp.name, '21m00Tcm4TlvDq8ikWAM', 'elevenlabs')}
                          className="flex-1 py-1 rounded text-center transition-colors cursor-pointer"
                          style={{
                            backgroundColor: sp.provider === 'elevenlabs' ? 'var(--af-accent, #C2410C)' : 'transparent',
                            color: sp.provider === 'elevenlabs' ? 'var(--af-accent-text, #FFFFFF)' : 'var(--af-text, #431407)',
                            fontWeight: sp.provider === 'elevenlabs' ? 'bold' : 'normal'
                          }}
                        >
                          ElevenLabs
                        </button>
                      </div>

                      {/* Voice Dropdown */}
                      <div>
                        {sp.provider === 'gemini' ? (
                          <select
                            value={sp.voice}
                            onChange={e => handleSpeakerVoiceChange(sp.name, e.target.value, 'gemini')}
                            className="w-full p-1.5 border rounded-lg text-xs outline-none cursor-pointer"
                            style={{
                              backgroundColor: 'var(--af-surface, #FFFFFF)',
                              borderColor: 'var(--af-border, #E8D5C2)',
                              color: 'var(--af-text, #431407)'
                            }}
                          >
                            {ALL_VOICES.map(v => (
                              <option key={v.name} value={v.name}>
                                {v.name} ({v.style})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <select
                            value={sp.voice}
                            onChange={e => handleSpeakerVoiceChange(sp.name, e.target.value, 'elevenlabs')}
                            className="w-full p-1.5 border rounded-lg text-xs outline-none cursor-pointer"
                            style={{
                              backgroundColor: 'var(--af-surface, #FFFFFF)',
                              borderColor: 'var(--af-border, #E8D5C2)',
                              color: 'var(--af-text, #431407)'
                            }}
                          >
                            {elevenLabsVoices.map(v => (
                              <option key={v.id} value={v.id}>
                                {v.name} ({v.gender})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Project Overview Card */}
                <div 
                  className="p-3 rounded-xl border space-y-2 mt-4 text-xs"
                  style={{
                    backgroundColor: 'var(--af-raised, #F6EDE2)',
                    borderColor: 'var(--af-border, #E8D5C2)'
                  }}
                >
                  <div className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--af-text-muted, #9A5B32)' }}>
                    Session Diagnostics
                  </div>
                  <div className="flex justify-between" style={{ color: 'var(--af-text, #431407)' }}>
                    <span>Dialogue Turns:</span>
                    <span className="font-bold">{lines.length}</span>
                  </div>
                  <div className="flex justify-between" style={{ color: 'var(--af-text, #431407)' }}>
                    <span>Synthesized:</span>
                    <span className="font-bold text-emerald-600">{readyCount} / {lines.length}</span>
                  </div>
                  <div className="flex justify-between" style={{ color: 'var(--af-text, #431407)' }}>
                    <span>ElevenLabs Key:</span>
                    <span className={`font-bold ${hasElevenLabsKey ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {hasElevenLabsKey ? 'Detected' : 'Fallback'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* RAIL MODE (Collapsed Inspector) */
            <div className="flex flex-col items-center py-4 space-y-4">
              <button
                onClick={() => setIsInspectorOpen(true)}
                className="w-8 h-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer hover:opacity-80"
                style={{
                  backgroundColor: 'var(--af-raised, #F6EDE2)',
                  borderColor: 'var(--af-border, #E8D5C2)',
                  color: 'var(--af-text, #431407)'
                }}
                title="Expand Inspector"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="w-6 h-[1px]" style={{ backgroundColor: 'var(--af-border, #E8D5C2)' }} />
              {speakers.map((sp, idx) => {
                const theme = SPEAKER_COLOR_MAP[sp.color || 'yellow'] || SPEAKER_COLOR_MAP.yellow;
                return (
                  <div
                    key={idx}
                    className={`w-7 h-7 rounded-full ${theme.bg} ${theme.text} flex items-center justify-center font-mono font-bold text-xs shadow-xs`}
                    title={`${sp.name} (${sp.voice})`}
                  >
                    {sp.name.charAt(0)}
                  </div>
                );
              })}
            </div>
          )}
        </aside>

        {/* ZONE B: MAIN ARRANGER / SCRIPT TIMELINE WORKSPACE */}
        <main 
          className="flex-1 flex flex-col min-w-0 overflow-hidden"
          style={{
            backgroundColor: 'var(--af-canvas, #FDF8F3)'
          }}
        >
          {/* SCRIPT WORKSPACE ACTION BAR */}
          <div 
            className="border-b px-4 md:px-6 py-2.5 flex items-center justify-between text-xs flex-shrink-0"
            style={{
              backgroundColor: 'var(--af-raised, #F6EDE2)',
              borderColor: 'var(--af-border, #E8D5C2)',
              color: 'var(--af-text, #431407)'
            }}
          >
            <div className="flex items-center gap-3">
              <span className="font-bold">Script Timeline</span>
              <span className="opacity-40">•</span>
              <span className="text-[11px] opacity-80 font-mono">{lines.length} dialogue turns</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleCollapseAll}
                className="text-[11px] flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer"
                style={{
                  backgroundColor: 'var(--af-surface, #FFFFFF)',
                  borderColor: 'var(--af-border, #E8D5C2)',
                  color: 'var(--af-text, #431407)'
                }}
                title="Toggle expand/collapse on all cards"
              >
                {lines.every(l => collapsedLineIds[l.id]) ? (
                  <>
                    <Maximize2 className="w-3 h-3" /> Expand All
                  </>
                ) : (
                  <>
                    <Minimize2 className="w-3 h-3" /> Collapse All
                  </>
                )}
              </button>

              <button
                onClick={handleAddLine}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                style={{
                  backgroundColor: 'var(--af-surface, #FFFFFF)',
                  borderColor: 'var(--af-border, #E8D5C2)',
                  color: 'var(--af-accent, #C2410C)'
                }}
              >
                <Plus className="w-3 h-3" /> Add Turn
              </button>
            </div>
          </div>

          {/* SCRIPT CARDS SCROLLABLE CONTAINER */}
          <div 
            className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 space-y-3 custom-scrollbar"
            style={{
              backgroundColor: 'var(--af-canvas, #FDF8F3)'
            }}
          >
            {/* MOBILE ONLY VIEW FOR CAST TAB */}
            {mobileTab === 'cast' && (
              <div className="md:hidden space-y-3 pb-6">
                <div 
                  className="flex justify-between items-center pb-2 border-b"
                  style={{ borderColor: 'var(--af-border, #E8D5C2)' }}
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--af-text, #431407)' }}>
                    Cast & Voice Settings
                  </h3>
                  <button 
                    onClick={handleAddSpeaker} 
                    className="text-xs font-bold cursor-pointer"
                    style={{ color: 'var(--af-accent, #C2410C)' }}
                  >
                    + Add Speaker
                  </button>
                </div>
                {speakers.map((sp, idx) => {
                  const theme = SPEAKER_COLOR_MAP[sp.color || 'yellow'] || SPEAKER_COLOR_MAP.yellow;
                  return (
                    <div 
                      key={idx} 
                      className="p-3.5 rounded-xl border space-y-2.5 shadow-2xs"
                      style={{
                        backgroundColor: 'var(--af-surface, #FFFFFF)',
                        borderColor: 'var(--af-border, #E8D5C2)'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${theme.dot}`} />
                        <span className="text-xs font-bold" style={{ color: 'var(--af-text, #431407)' }}>{sp.name}</span>
                      </div>
                      <div 
                        className="flex border rounded-lg p-0.5 text-[10px]"
                        style={{
                          backgroundColor: 'var(--af-raised, #F6EDE2)',
                          borderColor: 'var(--af-border, #E8D5C2)'
                        }}
                      >
                        <button
                          onClick={() => handleSpeakerVoiceChange(sp.name, 'Algieba', 'gemini')}
                          className="flex-1 py-1 rounded text-center transition-colors cursor-pointer"
                          style={{
                            backgroundColor: sp.provider === 'gemini' ? 'var(--af-accent, #C2410C)' : 'transparent',
                            color: sp.provider === 'gemini' ? 'var(--af-accent-text, #FFFFFF)' : 'var(--af-text, #431407)',
                            fontWeight: sp.provider === 'gemini' ? 'bold' : 'normal'
                          }}
                        >
                          Gemini
                        </button>
                        <button
                          onClick={() => handleSpeakerVoiceChange(sp.name, '21m00Tcm4TlvDq8ikWAM', 'elevenlabs')}
                          className="flex-1 py-1 rounded text-center transition-colors cursor-pointer"
                          style={{
                            backgroundColor: sp.provider === 'elevenlabs' ? 'var(--af-accent, #C2410C)' : 'transparent',
                            color: sp.provider === 'elevenlabs' ? 'var(--af-accent-text, #FFFFFF)' : 'var(--af-text, #431407)',
                            fontWeight: sp.provider === 'elevenlabs' ? 'bold' : 'normal'
                          }}
                        >
                          ElevenLabs
                        </button>
                      </div>
                      <select
                        value={sp.voice}
                        onChange={e => handleSpeakerVoiceChange(sp.name, e.target.value, sp.provider)}
                        className="w-full p-2 border rounded-lg text-xs outline-none cursor-pointer"
                        style={{
                          backgroundColor: 'var(--af-raised, #F6EDE2)',
                          borderColor: 'var(--af-border, #E8D5C2)',
                          color: 'var(--af-text, #431407)'
                        }}
                      >
                        {sp.provider === 'gemini'
                          ? ALL_VOICES.map(v => <option key={v.name} value={v.name}>{v.name} ({v.style})</option>)
                          : elevenLabsVoices.map(v => <option key={v.id} value={v.id}>{v.name} ({v.gender})</option>)
                        }
                      </select>
                    </div>
                  );
                })}
              </div>
            )}

            {/* DIALOGUE LINES (Always visible on desktop or when mobileTab === 'script') */}
            {(mobileTab === 'script' || window.innerWidth >= 768) && (
              <>
                {lines.map((line, idx) => {
                  const sp = speakers.find(s => s.name === line.speaker) || speakers[0];
                  const theme = SPEAKER_COLOR_MAP[sp?.color || 'yellow'] || SPEAKER_COLOR_MAP.yellow;
                  const isPlayingThis = playingLineId === line.id;
                  const isGeneratingThis = line.status === 'generating';
                  const isCollapsed = collapsedLineIds[line.id];

                  return (
                    <div 
                      key={line.id} 
                      className="rounded-xl border transition-all duration-150 overflow-hidden shadow-xs"
                      style={{
                        backgroundColor: isPlayingThis ? 'var(--af-raised, #F6EDE2)' : 'var(--af-surface, #FFFFFF)',
                        borderColor: isPlayingThis ? 'var(--af-accent, #C2410C)' : 'var(--af-border, #E8D5C2)',
                        boxShadow: isPlayingThis ? '0 0 0 2px var(--af-accent, #C2410C)' : undefined
                      }}
                    >
                      {/* CARD HEADER BAR */}
                      <div 
                        className="px-3.5 py-2.5 border-b flex items-center justify-between gap-2 flex-wrap"
                        style={{
                          backgroundColor: 'var(--af-raised, #F6EDE2)',
                          borderColor: 'var(--af-border, #E8D5C2)'
                        }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Reordering Up/Down */}
                          <div className="flex items-center" style={{ color: 'var(--af-text-muted, #9A5B32)' }}>
                            <button
                              onClick={() => handleMoveLine(idx, 'up')}
                              disabled={idx === 0}
                              className="p-0.5 hover:opacity-80 disabled:opacity-20 transition-colors cursor-pointer"
                              title="Move Turn Up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveLine(idx, 'down')}
                              disabled={idx === lines.length - 1}
                              className="p-0.5 hover:opacity-80 disabled:opacity-20 transition-colors cursor-pointer"
                              title="Move Turn Down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--af-text-muted, #9A5B32)' }}>
                            #{idx + 1}
                          </span>

                          {/* Speaker Selector Pill */}
                          <div 
                            className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 border shadow-2xs"
                            style={{
                              backgroundColor: 'var(--af-surface, #FFFFFF)',
                              borderColor: 'var(--af-border, #E8D5C2)'
                            }}
                          >
                            <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
                            <select
                              value={line.speaker}
                              onChange={e => {
                                const newSp = e.target.value;
                                setLines(prev => prev.map(l => l.id === line.id ? { ...l, speaker: newSp } : l));
                              }}
                              className="text-[11px] font-bold bg-transparent outline-none cursor-pointer pr-1"
                              style={{ color: 'var(--af-text, #431407)' }}
                            >
                              {speakers.map(s => (
                                <option key={s.name} value={s.name}>
                                  {s.name} ({s.provider === 'gemini' ? s.voice : '11Labs'})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Emotion Tag */}
                          <input
                            type="text"
                            value={line.emotion || ''}
                            onChange={e => {
                              const newEm = e.target.value;
                              setLines(prev => prev.map(l => l.id === line.id ? { ...l, emotion: newEm } : l));
                            }}
                            placeholder="Emotion (e.g. Whispering, Bold)"
                            className="hidden sm:inline-block text-[10px] rounded-lg border px-2 py-0.5 max-w-[140px] outline-none"
                            style={{
                              backgroundColor: 'var(--af-surface, #FFFFFF)',
                              borderColor: 'var(--af-border, #E8D5C2)',
                              color: 'var(--af-text, #431407)'
                            }}
                          />

                          <span className="hidden md:inline-block text-[10px] font-mono" style={{ color: 'var(--af-text-muted, #9A5B32)' }}>
                            {line.scene || 'Scene 1'}
                          </span>
                        </div>

                        {/* Status, Play micro-button, and Collapse */}
                        <div className="flex items-center gap-1.5">
                          {line.status === 'ready' && (
                            <span 
                              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border font-semibold"
                              style={{
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                borderColor: 'rgba(16, 185, 129, 0.3)',
                                color: '#059669'
                              }}
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span className="hidden sm:inline">Ready</span>
                            </span>
                          )}
                          {line.status === 'generating' && (
                            <span 
                              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border font-semibold animate-pulse"
                              style={{
                                backgroundColor: 'rgba(2, 132, 199, 0.1)',
                                borderColor: 'rgba(2, 132, 199, 0.3)',
                                color: '#0284C7'
                              }}
                            >
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span className="hidden sm:inline">Synthesizing...</span>
                            </span>
                          )}

                          {/* Quick Play Line */}
                          {line.audioBuffer && (
                            <button
                              onClick={() => {
                                if (isPlayingThis) {
                                  stopCurrentPlayback();
                                } else {
                                  playLineAudio(line.id, line.audioBuffer!);
                                }
                              }}
                              className="p-1.5 rounded-lg border text-xs transition-colors cursor-pointer"
                              style={{
                                backgroundColor: isPlayingThis ? '#EF4444' : 'var(--af-surface, #FFFFFF)',
                                borderColor: isPlayingThis ? '#EF4444' : 'var(--af-border, #E8D5C2)',
                                color: isPlayingThis ? '#FFFFFF' : 'var(--af-text, #431407)'
                              }}
                              title={isPlayingThis ? 'Pause' : 'Play Turn'}
                            >
                              {isPlayingThis ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                            </button>
                          )}

                          {/* Collapse Line Toggle */}
                          <button
                            onClick={() => toggleLineCollapse(line.id)}
                            className="p-1.5 rounded-lg transition-colors cursor-pointer hover:opacity-80"
                            style={{ color: 'var(--af-text-muted, #9A5B32)' }}
                            title={isCollapsed ? "Expand Dialogue" : "Collapse Dialogue"}
                          >
                            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                          </button>

                          {/* Delete Turn */}
                          <button
                            onClick={() => handleRemoveLine(line.id)}
                            className="p-1.5 rounded-lg transition-colors cursor-pointer hover:text-rose-600"
                            style={{ color: 'var(--af-text-muted, #9A5B32)' }}
                            title="Delete Turn"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* CARD BODY (COLLAPSIBLE) */}
                      {!isCollapsed && (
                        <div className="p-3.5 space-y-3">
                          {/* Text Area */}
                          <textarea
                            value={line.text}
                            onChange={e => {
                              const newText = e.target.value;
                              setLines(prev => prev.map(l => l.id === line.id ? { 
                                ...l, 
                                text: newText, 
                                status: 'idle', 
                                audioBuffer: null, 
                                audioUrl: null 
                              } : l));
                            }}
                            rows={2}
                            className="w-full p-3 rounded-xl border text-xs outline-none resize-y leading-relaxed"
                            style={{
                              backgroundColor: 'var(--af-raised, #F6EDE2)',
                              borderColor: 'var(--af-border, #E8D5C2)',
                              color: 'var(--af-text, #431407)'
                            }}
                            placeholder="Enter character dialogue..."
                          />

                          {/* Emotion Quick Presets */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px]" style={{ color: 'var(--af-text-muted, #9A5B32)' }}>Tone:</span>
                            {EMOTION_PRESETS.slice(0, 5).map(em => {
                              const isSelected = line.emotion === em;
                              return (
                                <button
                                  key={em}
                                  type="button"
                                  onClick={() => {
                                    setLines(prev => prev.map(l => l.id === line.id ? { ...l, emotion: em } : l));
                                  }}
                                  className="text-[10px] px-2 py-0.5 rounded-lg border transition-colors cursor-pointer"
                                  style={{
                                    backgroundColor: isSelected ? 'var(--af-accent, #C2410C)' : 'var(--af-surface, #FFFFFF)',
                                    color: isSelected ? 'var(--af-accent-text, #FFFFFF)' : 'var(--af-text, #431407)',
                                    borderColor: isSelected ? 'var(--af-accent, #C2410C)' : 'var(--af-border, #E8D5C2)',
                                    fontWeight: isSelected ? 'bold' : 'normal'
                                  }}
                                >
                                  {em}
                                </button>
                              );
                            })}
                          </div>

                          {/* Action Toolbar for this line */}
                          <div 
                            className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t"
                            style={{ borderColor: 'var(--af-border, #E8D5C2)' }}
                          >
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleGenerateLine(line.id)}
                                disabled={isGeneratingThis || isBatchGenerating || !line.text.trim()}
                                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                                style={{
                                  backgroundColor: 'var(--af-accent, #C2410C)',
                                  color: 'var(--af-accent-text, #FFFFFF)'
                                }}
                              >
                                {isGeneratingThis ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Volume2 className="w-3 h-3" />
                                )}
                                <span>{line.status === 'ready' ? 'Regenerate' : 'Synthesize Voice'}</span>
                              </button>

                              {(line.audioBuffer || line.audioUrl) && (
                                <button
                                  onClick={() => handleDownloadSingleLine(line, idx)}
                                  className="px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                  style={{
                                    backgroundColor: 'var(--af-surface, #FFFFFF)',
                                    borderColor: 'var(--af-border, #E8D5C2)',
                                    color: 'var(--af-text, #431407)'
                                  }}
                                  title="Export dialogue turn WAV"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">WAV</span>
                                </button>
                              )}
                            </div>

                            {/* Audio Duration & Equalizer wave bars */}
                            {line.audioBuffer && (
                              <div className="flex items-center gap-2">
                                <div className="flex gap-0.5 items-center h-3.5">
                                  {[4, 8, 12, 6, 14, 10, 6, 12].map((h, i) => (
                                    <div 
                                      key={i} 
                                      style={{ 
                                        height: `${isPlayingThis ? h : 4}px`,
                                        backgroundColor: isPlayingThis ? 'var(--af-accent, #C2410C)' : 'var(--af-border, #E8D5C2)'
                                      }} 
                                      className={`w-0.5 rounded-full transition-all ${isPlayingThis ? 'animate-pulse' : ''}`}
                                    />
                                  ))}
                                </div>
                                <span className="text-[10px] font-mono" style={{ color: 'var(--af-text-muted, #9A5B32)' }}>
                                  {(line.audioBuffer.duration).toFixed(1)}s
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Bottom Add Turn trigger button */}
                <button
                  onClick={handleAddLine}
                  className="w-full py-3.5 rounded-xl border-2 border-dashed text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer hover:opacity-80"
                  style={{
                    backgroundColor: 'var(--af-surface, #FFFFFF)',
                    borderColor: 'var(--af-border, #E8D5C2)',
                    color: 'var(--af-text, #431407)'
                  }}
                >
                  <Plus className="w-4 h-4" style={{ color: 'var(--af-accent, #C2410C)' }} /> Add Next Dialogue Turn
                </button>
              </>
            )}
          </div>
        </main>
      </div>

      {/* 3. SLEEK BENTO TIMELINE RIBBON (Compact Scrubber) */}
      <footer 
        className="border-t px-3 sm:px-6 py-2.5 flex-shrink-0 flex items-center justify-between gap-3 shadow-xs z-30"
        style={{
          backgroundColor: 'var(--af-raised, #F6EDE2)',
          borderColor: 'var(--af-border, #E8D5C2)',
          color: 'var(--af-text, #431407)'
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {isPlayingFullSequence && currentSpeakingLine ? (
            <div 
              className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-lg border"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'rgba(239, 68, 68, 0.25)',
                color: '#DC2626'
              }}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="truncate">Live: {currentSpeakingLine.speaker}</span>
            </div>
          ) : isBatchGenerating ? (
            <div 
              className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-lg border"
              style={{
                backgroundColor: 'rgba(2, 132, 199, 0.1)',
                borderColor: 'rgba(2, 132, 199, 0.25)',
                color: '#0284C7'
              }}
            >
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Batch {batchProgress.current}/{batchProgress.total}</span>
            </div>
          ) : (
            <span className="text-xs hidden sm:inline" style={{ color: 'var(--af-text-muted, #9A5B32)' }}>
              Ready: <strong style={{ color: 'var(--af-text, #431407)' }}>{readyCount}</strong>/{lines.length} turns
            </span>
          )}
        </div>

        {/* Center Interactive Timeline Scrubber */}
        <div className="flex-1 max-w-md flex flex-col gap-0.5">
          <div 
            className="flex items-center gap-1 h-3.5 rounded-lg p-0.5 border overflow-hidden"
            style={{
              backgroundColor: 'var(--af-surface, #FFFFFF)',
              borderColor: 'var(--af-border, #E8D5C2)'
            }}
          >
            {lines.map((line, i) => {
              const isPlaying = playingLineId === line.id;
              const isReady = line.status === 'ready';
              const isGen = line.status === 'generating';

              return (
                <button
                  key={line.id}
                  onClick={() => {
                    if (line.audioBuffer) playLineAudio(line.id, line.audioBuffer);
                  }}
                  className={`flex-1 h-full rounded-xs transition-all cursor-pointer ${
                    isPlaying 
                      ? 'animate-pulse' 
                      : isGen 
                      ? 'animate-pulse' 
                      : ''
                  }`}
                  style={{
                    backgroundColor: isPlaying
                      ? '#F59E0B'
                      : isReady
                      ? '#10B981'
                      : isGen
                      ? '#38BDF8'
                      : 'var(--af-raised, #F6EDE2)'
                  }}
                  title={`#${i + 1} ${line.speaker} (${line.status})`}
                />
              );
            })}
          </div>
        </div>

        <div className="text-[11px] font-mono hidden sm:block" style={{ color: 'var(--af-text-muted, #9A5B32)' }}>
          Audition bar
        </div>
      </footer>

      </div> {/* End Main Studio Card */}
    </div>
  );
};
