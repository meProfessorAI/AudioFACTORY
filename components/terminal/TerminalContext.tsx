import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  DAY_SKINS, 
  DaySkin, 
  DaySkinId, 
  DAY_ORDER, 
  getTodaySkinId, 
  applyDaySkinVariables 
} from '../../src/theme/daySkins';

export type { DaySkin, DaySkinId };
export { DAY_SKINS, DAY_ORDER };

export interface TerminalLogEntry {
  id: string;
  timestamp: string;
  level: 'SYS' | 'AUDIO' | 'SYNTH' | 'NET' | 'WARN' | 'ERR';
  color: 'blue' | 'red' | 'yellow' | 'green' | 'zinc';
  module: string;
  message: string;
}

interface TerminalContextValue {
  isTerminalMode: boolean;
  setIsTerminalMode: (val: boolean) => void;
  toggleTerminalMode: () => void;
  scanlinesEnabled: boolean;
  setScanlinesEnabled: (val: boolean) => void;
  toggleScanlines: () => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (val: boolean) => void;
  toggleDrawer: () => void;
  logs: TerminalLogEntry[];
  addLog: (level: TerminalLogEntry['level'], module: string, message: string) => void;
  clearLogs: () => void;
  isAudioActive: boolean;
  setIsAudioActive: (val: boolean) => void;
  
  // 7 Unique Light Day Theme Skins
  selectedSkinId: DaySkinId | 'auto';
  setSelectedSkinId: (val: DaySkinId | 'auto') => void;
  activeSkin: DaySkin;
  isAutoDaySkin: boolean;
}

const TerminalContext = createContext<TerminalContextValue | undefined>(undefined);

const INITIAL_LOGS: TerminalLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '00:00:01',
    level: 'SYS',
    color: 'blue',
    module: 'CORE',
    message: 'AudioFACTORY studio engine initialized. Light theme active.'
  },
  {
    id: 'log-2',
    timestamp: '00:00:02',
    level: 'SYNTH',
    color: 'yellow',
    module: 'GEMINI',
    message: 'Neural TTS voice pipeline armed: 24kHz studio PCM.'
  },
  {
    id: 'log-3',
    timestamp: '00:00:03',
    level: 'AUDIO',
    color: 'green',
    module: 'BGM',
    message: 'Algorithmic procedural soundscapes and audio stems ready.'
  }
];

export const TerminalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTerminalMode, setIsTerminalMode] = useState<boolean>(false);

  const [scanlinesEnabled, setScanlinesEnabled] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [logs, setLogs] = useState<TerminalLogEntry[]>(INITIAL_LOGS);
  const [isAudioActive, setIsAudioActive] = useState<boolean>(false);

  // Day Skin state: 'auto' means automatically follow today's day of week
  const [selectedSkinId, setSelectedSkinId] = useState<DaySkinId | 'auto'>(() => {
    const saved = localStorage.getItem('audiofactory_day_skin');
    if (saved && (saved === 'auto' || DAY_ORDER.includes(saved as DaySkinId))) {
      return saved as DaySkinId | 'auto';
    }
    return 'auto'; // Default to auto matching today's day!
  });

  const isAutoDaySkin = selectedSkinId === 'auto';

  // Resolved active skin
  const activeSkin = useMemo<DaySkin>(() => {
    const targetId: DaySkinId = isAutoDaySkin ? getTodaySkinId() : selectedSkinId;
    return DAY_SKINS[targetId] || DAY_SKINS.thursday;
  }, [selectedSkinId, isAutoDaySkin]);

  // Apply CSS Variables and strip dark mode
  useEffect(() => {
    applyDaySkinVariables(activeSkin);
    localStorage.setItem('audiofactory_day_skin', selectedSkinId);
  }, [activeSkin, selectedSkinId]);

  // Keep terminal mode flag saved without ever enabling dark mode
  useEffect(() => {
    localStorage.setItem('g_terminal_mode', String(isTerminalMode));
    document.documentElement.classList.remove('dark');
  }, [isTerminalMode]);

  const toggleTerminalMode = () => setIsTerminalMode(prev => !prev);
  const toggleScanlines = () => setScanlinesEnabled(prev => !prev);
  const toggleDrawer = () => setIsDrawerOpen(prev => !prev);

  const addLog = (level: TerminalLogEntry['level'], module: string, message: string) => {
    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    
    let color: TerminalLogEntry['color'] = 'blue';
    if (level === 'ERR') color = 'red';
    else if (level === 'WARN') color = 'yellow';
    else if (level === 'SYNTH') color = 'yellow';
    else if (level === 'NET' || level === 'AUDIO') color = 'green';

    setLogs(prev => [
      ...prev.slice(-99),
      {
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        timestamp,
        level,
        color,
        module,
        message
      }
    ]);
  };

  const clearLogs = () => setLogs([]);

  return (
    <TerminalContext.Provider
      value={{
        isTerminalMode,
        setIsTerminalMode,
        toggleTerminalMode,
        scanlinesEnabled,
        setScanlinesEnabled,
        toggleScanlines,
        isDrawerOpen,
        setIsDrawerOpen,
        toggleDrawer,
        logs,
        addLog,
        clearLogs,
        isAudioActive,
        setIsAudioActive,
        selectedSkinId,
        setSelectedSkinId,
        activeSkin,
        isAutoDaySkin,
      }}
    >
      {children}
    </TerminalContext.Provider>
  );
};

export const useTerminal = () => {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error('useTerminal must be used within a TerminalProvider');
  }
  return context;
};
