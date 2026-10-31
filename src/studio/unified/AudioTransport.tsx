import React, { useRef, useState } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  Download, 
  Sparkles, 
  RotateCcw,
  Sliders,
  Check
} from 'lucide-react';

interface AudioTransportProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeek: (seconds: number) => void;
  currentTime: number;
  duration: number;
  hasAudio: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
  onDownloadWav?: () => void;
  onOpenMobileInspector?: () => void;
  waveformBuffer?: AudioBuffer | null;
}

export const AudioTransport: React.FC<AudioTransportProps> = ({
  isPlaying,
  onPlay,
  onPause,
  onStop,
  onSeek,
  currentTime,
  duration,
  hasAudio,
  isGenerating,
  onGenerate,
  onDownloadWav,
  onOpenMobileInspector,
  waveformBuffer
}) => {
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration || !progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(percent * duration);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="af-transport select-none">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center gap-3 md:gap-6 justify-between">
        
        {/* Left: Playback Controls & Timeline */}
        <div className="flex items-center gap-3 w-full md:w-auto md:flex-1 min-w-0">
          {/* Main Play/Pause Button */}
          <button
            onClick={isPlaying ? onPause : onPlay}
            disabled={!hasAudio || isGenerating}
            className="w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs active:scale-95"
            style={{
              backgroundColor: 'var(--af-accent, #C2410C)',
              color: 'var(--af-accent-text, #FFFFFF)'
            }}
            title={isPlaying ? "Pause Audio" : "Play Generated Audio"}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Stop Button */}
          <button
            onClick={onStop}
            disabled={!hasAudio || (!isPlaying && currentTime === 0)}
            className="w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              borderColor: 'var(--af-border, #E8D5C2)',
              backgroundColor: 'var(--af-raised, #F6EDE2)',
              color: 'var(--af-text-secondary, #7C2D12)'
            }}
            title="Stop Playback"
            aria-label="Stop"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>

          {/* Scrubber & Duration */}
          <div className="flex-1 flex flex-col gap-1 min-w-0">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span style={{ color: 'var(--af-text, #431407)' }}>
                {formatTime(currentTime)}
              </span>
              <span style={{ color: 'var(--af-text-muted, #9A5B32)' }}>
                {formatTime(duration)}
              </span>
            </div>

            {/* Interactive Timeline Bar */}
            <div
              ref={progressBarRef}
              onClick={handleSeekClick}
              className="h-2.5 rounded-full overflow-hidden cursor-pointer relative transition-all"
              style={{ backgroundColor: 'var(--af-raised, #F6EDE2)' }}
              role="progressbar"
              aria-valuenow={currentTime}
              aria-valuemin={0}
              aria-valuemax={duration || 1}
            >
              <div 
                className="h-full rounded-full transition-all duration-75 relative"
                style={{ 
                  width: `${progressPercent}%`,
                  backgroundColor: 'var(--af-accent, #C2410C)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Right: Audio Export, Mobile Inspector Trigger & Master Generate CTA */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end flex-shrink-0">
          
          {/* Download WAV button */}
          {hasAudio && onDownloadWav && (
            <button
              onClick={onDownloadWav}
              className="px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer hover:opacity-90"
              style={{
                borderColor: 'var(--af-border, #E8D5C2)',
                backgroundColor: 'var(--af-raised, #F6EDE2)',
                color: 'var(--af-text, #431407)'
              }}
              title="Download Master WAV Audio"
              aria-label="Download Audio"
            >
              <Download className="w-4 h-4" style={{ color: 'var(--af-accent, #C2410C)' }} />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {/* Mobile Inspector Opener (< 1024px) */}
          {onOpenMobileInspector && (
            <button
              onClick={onOpenMobileInspector}
              className="lg:hidden px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              style={{
                borderColor: 'var(--af-border, #E8D5C2)',
                backgroundColor: 'var(--af-raised, #F6EDE2)',
                color: 'var(--af-text-secondary, #7C2D12)'
              }}
              aria-label="Open Voice Settings"
            >
              <Sliders className="w-4 h-4" />
              <span>Voice</span>
            </button>
          )}

          {/* Primary Persistent Generate CTA */}
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer disabled:opacity-50 min-h-[44px]"
            style={{
              backgroundColor: 'var(--af-accent, #C2410C)',
              color: 'var(--af-accent-text, #FFFFFF)'
            }}
            aria-busy={isGenerating}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating Speech…</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Audio</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
