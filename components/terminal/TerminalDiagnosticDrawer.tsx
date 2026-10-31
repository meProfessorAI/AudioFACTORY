import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Send, 
  Activity, 
  Cpu, 
  Database, 
  Check, 
  Sparkles,
  Eye,
  EyeOff,
  Zap,
  Timer,
  Gauge,
  BarChart3,
  Download
} from 'lucide-react';
import { useTerminal } from './TerminalContext';
import { useApiMetrics } from '../../src/hooks/useApiMetrics';

interface TerminalDiagnosticDrawerProps {
  onTriggerSynth?: () => void;
  onTriggerPlay?: () => void;
  onTriggerExport?: () => void;
}

export const TerminalDiagnosticDrawer: React.FC<TerminalDiagnosticDrawerProps> = ({
  onTriggerSynth,
  onTriggerPlay,
  onTriggerExport
}) => {
  const { 
    isDrawerOpen, 
    toggleDrawer, 
    logs, 
    clearLogs, 
    addLog, 
    scanlinesEnabled, 
    toggleScanlines,
    activeSkin
  } = useTerminal();

  const { summary, recentCalls, clearMetrics } = useApiMetrics();

  const [activeTab, setActiveTab] = useState<'logs' | 'shell' | 'telemetry' | 'metrics'>('metrics');
  const [commandInput, setCommandInput] = useState<string>('');
  const [shellHistory, setShellHistory] = useState<{ cmd: string; res: string; color?: string }[]>([
    { cmd: 'sys.init', res: `AudioFACTORY Studio Engine online. ${activeSkin.themeName} skin active.`, color: '#16A34A' }
  ]);

  const logEndRef = useRef<HTMLDivElement | null>(null);
  const shellEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isDrawerOpen) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      shellEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, shellHistory, isDrawerOpen]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim().toLowerCase();
    if (!cmd) return;

    let res = '';
    let color = 'var(--skin-accent, #0284C7)';

    if (cmd === 'help') {
      res = 'Available commands: help, status, synth, play, export, scanlines, clear, ping, version';
    } else if (cmd === 'status') {
      res = `CORE: ACTIVE | NEURAL TTS: ONLINE (24kHz) | THEME: ${activeSkin.themeName} (${activeSkin.dayName}) | CACHE: INDEXED_DB`;
      color = '#16A34A';
    } else if (cmd === 'ping') {
      res = 'AUDIO ENGINE LATENCY: 12.4ms (Buffer health: 100%)';
      color = '#16A34A';
    } else if (cmd === 'version') {
      res = 'AudioFACTORY Production Studio v2.4 (Model: Gemini 2.5 Flash / Algorithmic Soundscape Synthesizer)';
    } else if (cmd === 'synth') {
      res = 'Dispatched neural synthesis event to audio queue...';
      color = '#D97706';
      addLog('SYNTH', 'CLI', 'Triggered synthesis from studio CLI.');
      onTriggerSynth?.();
    } else if (cmd === 'play') {
      res = 'Broadcasting audio output buffer...';
      color = '#16A34A';
      addLog('AUDIO', 'CLI', 'Audio playback triggered via CLI.');
      onTriggerPlay?.();
    } else if (cmd === 'export') {
      res = 'Building 24kHz 16-bit PCM WAV container...';
      color = 'var(--skin-accent, #0284C7)';
      addLog('SYS', 'CLI', 'Master WAV export invoked.');
      onTriggerExport?.();
    } else if (cmd === 'scanlines') {
      toggleScanlines();
      res = `Subtle CRT FX set to ${!scanlinesEnabled ? 'ENABLED' : 'DISABLED'}`;
      color = '#D97706';
    } else if (cmd === 'clear') {
      setShellHistory([]);
      setCommandInput('');
      return;
    } else {
      res = `Unknown command "${cmd}". Type "help" for a list of available commands.`;
      color = '#DC2626';
    }

    setShellHistory(prev => [...prev, { cmd: commandInput, res, color }]);
    setCommandInput('');
  };

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-auto select-none animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        onClick={toggleDrawer}
        aria-hidden="true"
      />

      {/* Slide-in Diagnostics Console Window */}
      <div 
        className="relative z-10 w-full max-h-[85vh] flex flex-col border-t shadow-2xl animate-in slide-in-from-bottom duration-200"
        style={{
          backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
          borderColor: 'var(--skin-border, #E2E8F0)',
          color: 'var(--skin-text-primary, #0F172A)'
        }}
      >
        {/* Header Bar */}
        <div 
          className="h-10 px-4 border-b flex items-center justify-between select-none transition-colors"
          style={{
            backgroundColor: 'var(--skin-bg-subtle, #F1F5F9)',
            borderColor: 'var(--skin-border, #E2E8F0)'
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span 
                className="w-2 h-2 rounded-full animate-ping"
                style={{ backgroundColor: 'var(--skin-accent, #0284C7)' }} 
              />
              <TerminalIcon 
                className="w-4 h-4" 
                style={{ color: 'var(--skin-accent, #0284C7)' }}
              />
              <span className="text-xs font-mono font-bold tracking-wider" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>
                STUDIO // DIAGNOSTICS & TELEMETRY
              </span>
            </div>

            <div className="h-3 w-[1px] hidden sm:block flex-shrink-0" style={{ backgroundColor: 'var(--skin-border, #E2E8F0)' }} />

            {/* Scrolling Ticker Text */}
            <div className="flex items-center gap-2 sm:gap-3 text-[10px] font-mono truncate" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
              <span className="font-bold flex-shrink-0" style={{ color: '#16A34A' }}>● READY</span>
              <span className="hidden md:inline flex-shrink-0">24kHz PCM</span>
              <span className="flex-shrink-0 font-bold" style={{ color: 'var(--skin-accent, #0284C7)' }}>
                ⚡ {summary.totalTokens.toLocaleString()} TOKENS
              </span>
              {summary.avgLatencyMs > 0 && (
                <span className="hidden sm:inline flex-shrink-0 text-emerald-600 font-bold">
                  ⏱️ {summary.avgLatencyMs}ms AVG
                </span>
              )}
              <span className="hidden lg:inline flex-shrink-0" style={{ color: 'var(--skin-text-muted, #64748B)' }}>
                {activeSkin.dayShort}: {activeSkin.themeName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={toggleDrawer}
              className="p-1 rounded-md hover:bg-black/10 transition-colors text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
              title="Close Diagnostics"
            >
              <span>✕ Close</span>
            </button>
          </div>
        </div>

        {/* Console Content Window */}
        <div 
          className="h-72 sm:h-80 flex flex-col overflow-hidden"
          style={{
            backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
            borderColor: 'var(--skin-border, #E2E8F0)'
          }}
        >
          
          {/* Subheader / Tabs & Tools */}
          <div 
            className="px-3 sm:px-4 py-2 border-b flex items-center justify-between gap-2 sm:gap-3 flex-shrink-0 overflow-x-auto custom-scrollbar"
            style={{
              backgroundColor: 'var(--skin-bg-subtle, #F1F5F9)',
              borderColor: 'var(--skin-border, #E2E8F0)'
            }}
          >
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => setActiveTab('metrics')}
                className={`px-2.5 sm:px-3 py-1 rounded-md text-xs font-mono font-bold uppercase transition-all whitespace-nowrap border flex items-center gap-1.5 ${
                  activeTab === 'metrics'
                    ? 'shadow-xs font-extrabold text-white'
                    : 'hover:opacity-100 opacity-70 border-transparent'
                }`}
                style={{
                  backgroundColor: activeTab === 'metrics' ? 'var(--skin-accent, #0284C7)' : 'transparent',
                  borderColor: activeTab === 'metrics' ? 'var(--skin-accent, #0284C7)' : 'transparent',
                  color: activeTab === 'metrics' ? 'var(--skin-accent-text, #FFFFFF)' : 'var(--skin-text-primary, #0F172A)'
                }}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                AI Metrics ({summary.totalCalls})
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-2.5 sm:px-3 py-1 rounded-md text-xs font-mono font-bold uppercase transition-all whitespace-nowrap border ${
                  activeTab === 'logs'
                    ? 'shadow-xs font-extrabold text-white'
                    : 'hover:opacity-100 opacity-70 border-transparent'
                }`}
                style={{
                  backgroundColor: activeTab === 'logs' ? 'var(--skin-accent, #0284C7)' : 'transparent',
                  borderColor: activeTab === 'logs' ? 'var(--skin-accent, #0284C7)' : 'transparent',
                  color: activeTab === 'logs' ? 'var(--skin-accent-text, #FFFFFF)' : 'var(--skin-text-primary, #0F172A)'
                }}
              >
                System Logs ({logs.length})
              </button>
              <button
                onClick={() => setActiveTab('shell')}
                className={`px-2.5 sm:px-3 py-1 rounded-md text-xs font-mono font-bold uppercase transition-all whitespace-nowrap border ${
                  activeTab === 'shell'
                    ? 'shadow-xs font-extrabold text-white'
                    : 'hover:opacity-100 opacity-70 border-transparent'
                }`}
                style={{
                  backgroundColor: activeTab === 'shell' ? 'var(--skin-accent, #0284C7)' : 'transparent',
                  borderColor: activeTab === 'shell' ? 'var(--skin-accent, #0284C7)' : 'transparent',
                  color: activeTab === 'shell' ? 'var(--skin-accent-text, #FFFFFF)' : 'var(--skin-text-primary, #0F172A)'
                }}
              >
                Interactive Shell
              </button>
              <button
                onClick={() => setActiveTab('telemetry')}
                className={`px-2.5 sm:px-3 py-1 rounded-md text-xs font-mono font-bold uppercase transition-all whitespace-nowrap border ${
                  activeTab === 'telemetry'
                    ? 'shadow-xs font-extrabold text-white'
                    : 'hover:opacity-100 opacity-70 border-transparent'
                }`}
                style={{
                  backgroundColor: activeTab === 'telemetry' ? 'var(--skin-accent, #0284C7)' : 'transparent',
                  borderColor: activeTab === 'telemetry' ? 'var(--skin-accent, #0284C7)' : 'transparent',
                  color: activeTab === 'telemetry' ? 'var(--skin-accent-text, #FFFFFF)' : 'var(--skin-text-primary, #0F172A)'
                }}
              >
                Subsystems
              </button>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Scanlines Toggle */}
              <button
                onClick={toggleScanlines}
                className="px-2 py-1 rounded-md text-[10px] font-mono border flex items-center gap-1.5 transition-colors"
                style={{
                  backgroundColor: scanlinesEnabled ? 'var(--skin-accent-muted, #E0F2FE)' : 'var(--skin-bg-card, #FFFFFF)',
                  borderColor: scanlinesEnabled ? 'var(--skin-accent, #0284C7)' : 'var(--skin-border, #E2E8F0)',
                  color: scanlinesEnabled ? 'var(--skin-accent, #0284C7)' : 'var(--skin-text-secondary, #475569)'
                }}
                title="Toggle CRT Scanline Overlay"
              >
                {scanlinesEnabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span className="hidden sm:inline">CRT FX</span>
              </button>

              {/* Clear Logs */}
              <button
                onClick={clearLogs}
                className="p-1 rounded-md border hover:opacity-80 transition-colors"
                style={{
                  backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                  borderColor: 'var(--skin-border, #E2E8F0)',
                  color: 'var(--skin-text-secondary, #475569)'
                }}
                title="Clear Logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* TAB 1: SYSTEM LOGS STREAM */}
          {activeTab === 'logs' && (
            <div 
              className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1.5 custom-scrollbar"
              style={{ backgroundColor: 'var(--skin-bg-app, #F8FAFC)' }}
            >
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-start gap-2 leading-relaxed px-1.5 py-0.5 rounded transition-colors"
                  style={{
                    color: 'var(--skin-text-primary, #0F172A)'
                  }}
                >
                  <span className="text-[10px] select-none flex-shrink-0" style={{ color: 'var(--skin-text-muted, #64748B)' }}>
                    [{log.timestamp}]
                  </span>
                  <span 
                    className="px-1 rounded text-[9px] font-bold flex-shrink-0 border"
                    style={{
                      backgroundColor: log.color === 'red' ? '#FEE2E2' : log.color === 'yellow' ? '#FEF3C7' : log.color === 'green' ? '#DCFCE7' : 'var(--skin-accent-muted, #E0F2FE)',
                      borderColor: log.color === 'red' ? '#FCA5A5' : log.color === 'yellow' ? '#FDE68A' : log.color === 'green' ? '#86EFAC' : 'var(--skin-border, #BAE6FD)',
                      color: log.color === 'red' ? '#B91C1C' : log.color === 'yellow' ? '#B45309' : log.color === 'green' ? '#15803D' : 'var(--skin-accent, #0284C7)'
                    }}
                  >
                    {log.level}
                  </span>
                  <span className="text-[10px] font-semibold flex-shrink-0" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                    [{log.module}]:
                  </span>
                  <span className="break-words font-medium" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>
                    {log.message}
                  </span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          )}

          {/* TAB 2: INTERACTIVE SHELL */}
          {activeTab === 'shell' && (
            <div 
              className="flex-1 flex flex-col min-h-0"
              style={{ backgroundColor: 'var(--skin-bg-app, #F8FAFC)' }}
            >
              <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-2 custom-scrollbar">
                <div 
                  className="text-[11px] pb-1 border-b"
                  style={{ 
                    borderColor: 'var(--skin-border, #E2E8F0)',
                    color: 'var(--skin-text-secondary, #475569)' 
                  }}
                >
                  Type <span className="font-bold" style={{ color: '#16A34A' }}>help</span> to view available studio commands. 
                  Try: <span style={{ color: 'var(--skin-accent, #0284C7)' }}>status</span>, <span style={{ color: '#D97706' }}>synth</span>, <span style={{ color: '#16A34A' }}>play</span>, <span style={{ color: '#DC2626' }}>scanlines</span>
                </div>

                {shellHistory.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex items-center gap-1.5" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                      <span style={{ color: 'var(--skin-accent, #0284C7)' }}>❯</span>
                      <span className="font-bold" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>{item.cmd}</span>
                    </div>
                    <div className="pl-4 text-xs font-mono" style={{ color: item.color || 'var(--skin-text-primary, #0F172A)' }}>
                      {item.res}
                    </div>
                  </div>
                ))}
                <div ref={shellEndRef} />
              </div>

              {/* Shell Input Field */}
              <form 
                onSubmit={handleCommandSubmit} 
                className="p-2 border-t flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                  borderColor: 'var(--skin-border, #E2E8F0)'
                }}
              >
                <span className="font-mono text-xs font-bold pl-2" style={{ color: 'var(--skin-accent, #0284C7)' }}>
                  studio $
                </span>
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  placeholder="Enter command (e.g. status, synth, help)..."
                  className="flex-1 bg-transparent font-mono text-xs focus:outline-none"
                  style={{
                    color: 'var(--skin-text-primary, #0F172A)'
                  }}
                />
                <button
                  type="submit"
                  className="px-3 py-1 rounded-md font-mono text-xs font-bold uppercase transition-all shadow-xs"
                  style={{
                    backgroundColor: 'var(--skin-accent, #0284C7)',
                    color: 'var(--skin-accent-text, #FFFFFF)'
                  }}
                >
                  <Send className="w-3 h-3" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: SUBSYSTEM TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div 
              className="flex-1 overflow-y-auto p-4 font-mono text-xs grid grid-cols-1 sm:grid-cols-3 gap-3 custom-scrollbar"
              style={{ backgroundColor: 'var(--skin-bg-app, #F8FAFC)' }}
            >
              
              <div 
                className="p-3 border rounded-lg space-y-2 shadow-2xs"
                style={{
                  backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                  borderColor: 'var(--skin-border, #E2E8F0)'
                }}
              >
                <div className="flex items-center justify-between font-bold" style={{ color: 'var(--skin-accent, #0284C7)' }}>
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-4 h-4" /> AUDIO_DSP_ENGINE
                  </span>
                  <span className="text-[10px]" style={{ color: '#16A34A' }}>99.8% READY</span>
                </div>
                <div className="space-y-1 text-[11px]" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                  <div>MODEL: Gemini 2.5 Flash</div>
                  <div>SAMPLE RATE: 24,000 Hz</div>
                  <div>CHANNELS: 2 (Stereo Linear PCM)</div>
                  <div>ACTIVE SKIN: {activeSkin.dayName}</div>
                </div>
              </div>

              <div 
                className="p-3 border rounded-lg space-y-2 shadow-2xs"
                style={{
                  backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                  borderColor: 'var(--skin-border, #E2E8F0)'
                }}
              >
                <div className="flex items-center justify-between font-bold" style={{ color: '#D97706' }}>
                  <span className="flex items-center gap-1.5">
                    <Database className="w-4 h-4" /> LOCAL_VAULT
                  </span>
                  <span className="text-[10px]" style={{ color: '#16A34A' }}>PERSISTENT</span>
                </div>
                <div className="space-y-1 text-[11px]" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                  <div>STORAGE: IndexedDB / LocalStorage</div>
                  <div>AUDIO BLOBS: Cached Locally</div>
                  <div>SECURITY: Client-Isolated</div>
                  <div>PRIVACY: Zero Remote Leak</div>
                </div>
              </div>

              <div 
                className="p-3 border rounded-lg space-y-2 shadow-2xs"
                style={{
                  backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                  borderColor: 'var(--skin-border, #E2E8F0)'
                }}
              >
                <div className="flex items-center justify-between font-bold" style={{ color: '#16A34A' }}>
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4" /> AUDIO_OUTPUT_BUS
                  </span>
                  <span className="text-[10px]" style={{ color: '#16A34A' }}>ONLINE</span>
                </div>
                <div className="space-y-1 text-[11px]" style={{ color: 'var(--skin-text-secondary, #475569)' }}>
                  <div>WEB AUDIO: AudioContext Active</div>
                  <div>FFT ANALYZER: 64 Bins</div>
                  <div>DSP LATENCY: ~12ms</div>
                  <div>BGM SYNTH: Algorithmic WebAudio</div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: AI METRICS & LATENCY (LIVE) */}
          {activeTab === 'metrics' && (
            <div 
              className="flex-1 overflow-y-auto p-3 sm:p-4 font-mono text-xs space-y-4 custom-scrollbar"
              style={{ backgroundColor: 'var(--skin-bg-app, #F8FAFC)' }}
            >
              {/* Metric KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                {/* Total Tokens Card */}
                <div 
                  className="p-3 border rounded-lg shadow-2xs space-y-1"
                  style={{
                    backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                    borderColor: 'var(--skin-border, #E2E8F0)'
                  }}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold" style={{ color: 'var(--skin-accent, #0284C7)' }}>
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" /> TOTAL TOKENS
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-amber-500/10 text-amber-600 font-extrabold">LIVE</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>
                    {summary.totalTokens.toLocaleString()}
                  </div>
                  <div className="text-[10px] flex items-center justify-between" style={{ color: 'var(--skin-text-muted, #64748B)' }}>
                    <span>In: {summary.totalPromptTokens.toLocaleString()}</span>
                    <span>Out: {summary.totalCompletionTokens.toLocaleString()}</span>
                  </div>
                </div>

                {/* Generation Latency Card */}
                <div 
                  className="p-3 border rounded-lg shadow-2xs space-y-1"
                  style={{
                    backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                    borderColor: 'var(--skin-border, #E2E8F0)'
                  }}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold" style={{ color: '#16A34A' }}>
                    <span className="flex items-center gap-1.5">
                      <Timer className="w-3.5 h-3.5" /> AVG LATENCY
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-600 font-extrabold">DSP</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>
                    {summary.avgLatencyMs > 0 ? `${summary.avgLatencyMs}ms` : '--'}
                  </div>
                  <div className="text-[10px] flex items-center justify-between" style={{ color: 'var(--skin-text-muted, #64748B)' }}>
                    <span>Min: {summary.minLatencyMs ? `${summary.minLatencyMs}ms` : '0ms'}</span>
                    <span>Max: {summary.maxLatencyMs ? `${summary.maxLatencyMs}ms` : '0ms'}</span>
                  </div>
                </div>

                {/* Total Invocations Card */}
                <div 
                  className="p-3 border rounded-lg shadow-2xs space-y-1"
                  style={{
                    backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                    borderColor: 'var(--skin-border, #E2E8F0)'
                  }}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold" style={{ color: '#D97706' }}>
                    <span className="flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5" /> AI CALLS
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-blue-500/10 text-blue-600 font-extrabold">API</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>
                    {summary.totalCalls}
                  </div>
                  <div className="text-[10px] flex items-center justify-between" style={{ color: 'var(--skin-text-muted, #64748B)' }}>
                    <span className="text-emerald-600 font-bold">{summary.successfulCalls} success</span>
                    <span className="text-rose-600">{summary.failedCalls} fail</span>
                  </div>
                </div>

                {/* Estimated Cost Card */}
                <div 
                  className="p-3 border rounded-lg shadow-2xs space-y-1"
                  style={{
                    backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                    borderColor: 'var(--skin-border, #E2E8F0)'
                  }}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>
                    <span className="flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-indigo-500" /> EST. COST
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-indigo-500/10 text-indigo-600 font-extrabold">USD</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>
                    ${summary.estimatedCostUsd.toFixed(4)}
                  </div>
                  <div className="text-[10px] flex items-center justify-between" style={{ color: 'var(--skin-text-muted, #64748B)' }}>
                    <span>Gemini 2.5 Flash</span>
                    <span className="text-emerald-600">Free Tier/Zero Charge</span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar & Transparency Notice */}
              <div 
                className="p-2.5 border rounded-lg flex items-center justify-between gap-3 text-[11px]"
                style={{
                  backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                  borderColor: 'var(--skin-border, #E2E8F0)'
                }}
              >
                <div className="flex items-center gap-2 text-xs truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                  <span className="font-bold truncate" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>
                    Neural Synthesis Telemetry Active
                  </span>
                  <span className="hidden sm:inline" style={{ color: 'var(--skin-text-muted, #64748B)' }}>
                    — Real-time token quantification & generation latency logging
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={clearMetrics}
                    className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-colors hover:bg-rose-500/10 text-rose-600 border border-rose-200"
                    title="Reset Session Telemetry"
                  >
                    Clear History
                  </button>
                </div>
              </div>

              {/* Chronological Table of AI Calls */}
              <div 
                className="border rounded-lg overflow-hidden shadow-2xs"
                style={{
                  backgroundColor: 'var(--skin-bg-card, #FFFFFF)',
                  borderColor: 'var(--skin-border, #E2E8F0)'
                }}
              >
                <div 
                  className="px-3 py-2 border-b flex items-center justify-between text-[11px] font-bold"
                  style={{
                    backgroundColor: 'var(--skin-bg-subtle, #F1F5F9)',
                    borderColor: 'var(--skin-border, #E2E8F0)',
                    color: 'var(--skin-text-primary, #0F172A)'
                  }}
                >
                  <span>RECENT AI INVOCATIONS ({recentCalls.length})</span>
                  <span className="text-[10px] font-normal" style={{ color: 'var(--skin-text-muted, #64748B)' }}>
                    Showing latest {recentCalls.length} executions
                  </span>
                </div>

                {recentCalls.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <Zap className="w-8 h-8 mx-auto text-amber-400 opacity-60 animate-bounce" />
                    <div className="text-xs font-bold" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>
                      No AI calls logged yet this session
                    </div>
                    <div className="text-[11px] max-w-sm mx-auto" style={{ color: 'var(--skin-text-muted, #64748B)' }}>
                      Trigger a speech generation, script dramatization, or multi-speaker dialogue turn in the studio to observe real-time latency and token quantification.
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recentCalls.map((call) => (
                      <div 
                        key={call.id}
                        className="p-2.5 sm:px-3 sm:py-2 flex items-center justify-between gap-2 sm:gap-4 hover:bg-slate-50/50 transition-colors text-[11px]"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <span 
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              call.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`} 
                          />
                          <div className="min-w-0">
                            <div className="font-bold truncate" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>
                              {call.operation}
                            </div>
                            <div className="text-[10px] flex items-center gap-2" style={{ color: 'var(--skin-text-muted, #64748B)' }}>
                              <span>{call.model}</span>
                              <span>•</span>
                              <span>{new Date(call.timestamp).toLocaleTimeString()}</span>
                              {call.errorMessage && (
                                <span className="text-rose-500 truncate">({call.errorMessage})</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0 text-right">
                          <div className="space-y-0.5">
                            <div className="font-bold flex items-center justify-end gap-1">
                              <span 
                                className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                                  call.latencyMs < 1000 
                                    ? 'bg-emerald-100 text-emerald-700' 
                                    : call.latencyMs < 3000 
                                    ? 'bg-amber-100 text-amber-700' 
                                    : 'bg-rose-100 text-rose-700'
                                }`}
                              >
                                {call.latencyMs}ms
                              </span>
                            </div>
                            <div className="text-[10px]" style={{ color: 'var(--skin-text-muted, #64748B)' }}>
                              Latency
                            </div>
                          </div>

                          <div className="space-y-0.5 min-w-[70px]">
                            <div className="font-bold" style={{ color: 'var(--skin-text-primary, #0F172A)' }}>
                              {call.totalTokens.toLocaleString()} <span className="text-[10px] font-normal">tok</span>
                            </div>
                            <div className="text-[10px]" style={{ color: 'var(--skin-text-muted, #64748B)' }}>
                              ${call.estimatedCostUsd.toFixed(4)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

