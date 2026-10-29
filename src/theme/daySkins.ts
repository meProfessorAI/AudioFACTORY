/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY 7 Unique Light Theme Skins (One for Each Day of the Week)
 * Pure Light Mode. Zero Dark Theme. Zero Google Theme.
 */

export type DaySkinId = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export interface DaySkin {
  id: DaySkinId;
  dayIndex: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  dayName: string;
  dayShort: string;
  themeName: string;
  tagline: string;
  description: string;
  palette: {
    bgApp: string;         // Full viewport background
    bgCard: string;        // Elevated card & window background
    bgSubtle: string;      // Input background, muted panels, toolbars
    bgHover: string;       // Hover state for interactive items
    border: string;        // Structural dividers & window borders
    borderStrong: string;  // Emphasized borders
    borderFocus: string;   // Input focus ring / border
    textPrimary: string;   // High-contrast primary text (WCAG AA)
    textSecondary: string; // Readable secondary labels and captions
    textMuted: string;     // Tertiary / timestamp text
    accent: string;        // Primary brand & action button color
    accentHover: string;   // Button hover state
    accentMuted: string;   // 10-15% light tint for active rows, badge backgrounds
    accentText: string;    // Text on accent button (#FFFFFF)
    waveform: string;      // Audio player & oscilloscope wave color
    shadow: string;        // Subtle elevated drop shadow
    ring: string;          // Focus outline ring
  };
}

export const DAY_SKINS: Record<DaySkinId, DaySkin> = {
  sunday: {
    id: 'sunday',
    dayIndex: 0,
    dayName: 'Sunday',
    dayShort: 'SUN',
    themeName: 'Solarium Amber',
    tagline: 'Warm Daylight & Golden Linen',
    description: 'Honey amber daylight with textured ivory linen and warm analog acoustics.',
    palette: {
      bgApp: '#FAF6EF',
      bgCard: '#FFFFFF',
      bgSubtle: '#F4ECE0',
      bgHover: '#EFE5D5',
      border: '#E6DAC7',
      borderStrong: '#D6C4AA',
      borderFocus: '#D97706',
      textPrimary: '#292524',
      textSecondary: '#6B6056',
      textMuted: '#96887B',
      accent: '#D97706',
      accentHover: '#B45309',
      accentMuted: '#FEF3C7',
      accentText: '#FFFFFF',
      waveform: '#D97706',
      shadow: '0 4px 16px -2px rgba(217, 119, 6, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
      ring: 'rgba(217, 119, 6, 0.35)',
    },
  },
  monday: {
    id: 'monday',
    dayIndex: 1,
    dayName: 'Monday',
    dayShort: 'MON',
    themeName: 'Nordic Slate',
    tagline: 'Crisp Porcelain & Glacier Sky',
    description: 'Razor-sharp Scandinavian studio minimalist with cool slate and alpine clarity.',
    palette: {
      bgApp: '#F8FAFC',
      bgCard: '#FFFFFF',
      bgSubtle: '#F1F5F9',
      bgHover: '#E2E8F0',
      border: '#CBD5E1',
      borderStrong: '#94A3B8',
      borderFocus: '#0284C7',
      textPrimary: '#0F172A',
      textSecondary: '#475569',
      textMuted: '#64748B',
      accent: '#0284C7',
      accentHover: '#0369A1',
      accentMuted: '#E0F2FE',
      accentText: '#FFFFFF',
      waveform: '#0284C7',
      shadow: '0 4px 16px -2px rgba(2, 132, 199, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
      ring: 'rgba(2, 132, 199, 0.35)',
    },
  },
  tuesday: {
    id: 'tuesday',
    dayIndex: 2,
    dayName: 'Tuesday',
    dayShort: 'TUE',
    themeName: 'Botanical Sage',
    tagline: 'Matcha Breeze & Natural Bamboo',
    description: 'Restorative matcha green with calming eucalyptus tones for deep focused narration.',
    palette: {
      bgApp: '#F4F8F5',
      bgCard: '#FFFFFF',
      bgSubtle: '#E8F2EA',
      bgHover: '#DCECE0',
      border: '#CDE1D3',
      borderStrong: '#A9CBB3',
      borderFocus: '#16A34A',
      textPrimary: '#14532D',
      textSecondary: '#365314',
      textMuted: '#4D7C5D',
      accent: '#16A34A',
      accentHover: '#15803D',
      accentMuted: '#DCFCE7',
      accentText: '#FFFFFF',
      waveform: '#16A34A',
      shadow: '0 4px 16px -2px rgba(22, 163, 74, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
      ring: 'rgba(22, 163, 74, 0.35)',
    },
  },
  wednesday: {
    id: 'wednesday',
    dayIndex: 3,
    dayName: 'Wednesday',
    dayShort: 'WED',
    themeName: 'Wisteria Lavender',
    tagline: 'Soft Lilac & Pearl Twilight',
    description: 'Contemplative amethyst and petal mist for cinematic storytelling and prose.',
    palette: {
      bgApp: '#FAF6FD',
      bgCard: '#FFFFFF',
      bgSubtle: '#F2ECFB',
      bgHover: '#E8DEFA',
      border: '#DECEF6',
      borderStrong: '#C5ACED',
      borderFocus: '#7C3AED',
      textPrimary: '#2E1065',
      textSecondary: '#5B21B6',
      textMuted: '#7E63A8',
      accent: '#7C3AED',
      accentHover: '#6D28D9',
      accentMuted: '#EDE9FE',
      accentText: '#FFFFFF',
      waveform: '#7C3AED',
      shadow: '0 4px 16px -2px rgba(124, 58, 237, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
      ring: 'rgba(124, 58, 237, 0.35)',
    },
  },
  thursday: {
    id: 'thursday',
    dayIndex: 4,
    dayName: 'Thursday',
    dayShort: 'THU',
    themeName: 'Tuscan Ochre',
    tagline: 'Sunbaked Dune & Terracotta',
    description: 'Analog tape warmth, Mediterranean sunbaked clay, and acoustic resonance.',
    palette: {
      bgApp: '#FDF8F3',
      bgCard: '#FFFFFF',
      bgSubtle: '#F6EDE2',
      bgHover: '#EFE1D2',
      border: '#E8D5C2',
      borderStrong: '#D7BCA3',
      borderFocus: '#C2410C',
      textPrimary: '#431407',
      textSecondary: '#7C2D12',
      textMuted: '#9A5B32',
      accent: '#C2410C',
      accentHover: '#9A3412',
      accentMuted: '#FFEDD5',
      accentText: '#FFFFFF',
      waveform: '#C2410C',
      shadow: '0 4px 16px -2px rgba(194, 65, 12, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
      ring: 'rgba(194, 65, 12, 0.35)',
    },
  },
  friday: {
    id: 'friday',
    dayIndex: 5,
    dayName: 'Friday',
    dayShort: 'FRI',
    themeName: 'Pacific Azure',
    tagline: 'Ocean Horizon & Electric Cyan',
    description: 'Vibrant coastal breeze, high-energy weekend launch, and pristine bright contrast.',
    palette: {
      bgApp: '#F0F9FF',
      bgCard: '#FFFFFF',
      bgSubtle: '#E0F2FE',
      bgHover: '#BAE6FD',
      border: '#B9E6FE',
      borderStrong: '#7DD3FC',
      borderFocus: '#0284C7',
      textPrimary: '#082F49',
      textSecondary: '#0369A1',
      textMuted: '#38BDF8',
      accent: '#0284C7',
      accentHover: '#0369A1',
      accentMuted: '#E0F2FE',
      accentText: '#FFFFFF',
      waveform: '#0284C7',
      shadow: '0 4px 16px -2px rgba(2, 132, 199, 0.09), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
      ring: 'rgba(2, 132, 199, 0.35)',
    },
  },
  saturday: {
    id: 'saturday',
    dayIndex: 6,
    dayName: 'Saturday',
    dayShort: 'SAT',
    themeName: 'Sunset Coral',
    tagline: 'Peach Blossom & Sparkling Coral',
    description: 'Warm weekend leisure, soft champagne golden tones, and rich emotional sound.',
    palette: {
      bgApp: '#FFF7F5',
      bgCard: '#FFFFFF',
      bgSubtle: '#FEECE7',
      bgHover: '#FEDBD2',
      border: '#FCD2C7',
      borderStrong: '#FBA998',
      borderFocus: '#E11D48',
      textPrimary: '#4C0519',
      textSecondary: '#881337',
      textMuted: '#BE123C',
      accent: '#E11D48',
      accentHover: '#BE123C',
      accentMuted: '#FFE4E6',
      accentText: '#FFFFFF',
      waveform: '#E11D48',
      shadow: '0 4px 16px -2px rgba(225, 29, 72, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
      ring: 'rgba(225, 29, 72, 0.35)',
    },
  },
};

export const DAY_ORDER: DaySkinId[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday'
];

/**
 * Returns today's skin ID based on the client system day
 */
export function getTodaySkinId(): DaySkinId {
  const day = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  return DAY_ORDER[day] || 'thursday';
}

/**
 * Apply Day Skin CSS Variables to document root
 */
export function applyDaySkinVariables(skin: DaySkin): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Ensure dark class is completely purged
  root.classList.remove('dark');
  root.setAttribute('data-day-skin', skin.id);

  // Set CSS Custom Properties for immediate reactive rendering
  root.style.setProperty('--skin-bg-app', skin.palette.bgApp);
  root.style.setProperty('--skin-bg-card', skin.palette.bgCard);
  root.style.setProperty('--skin-bg-subtle', skin.palette.bgSubtle);
  root.style.setProperty('--skin-bg-hover', skin.palette.bgHover);
  root.style.setProperty('--skin-border', skin.palette.border);
  root.style.setProperty('--skin-border-strong', skin.palette.borderStrong);
  root.style.setProperty('--skin-border-focus', skin.palette.borderFocus);
  root.style.setProperty('--skin-text-primary', skin.palette.textPrimary);
  root.style.setProperty('--skin-text-secondary', skin.palette.textSecondary);
  root.style.setProperty('--skin-text-muted', skin.palette.textMuted);
  root.style.setProperty('--skin-accent', skin.palette.accent);
  root.style.setProperty('--skin-accent-hover', skin.palette.accentHover);
  root.style.setProperty('--skin-accent-muted', skin.palette.accentMuted);
  root.style.setProperty('--skin-accent-text', skin.palette.accentText);
  root.style.setProperty('--skin-waveform', skin.palette.waveform);
  root.style.setProperty('--skin-shadow', skin.palette.shadow);
  root.style.setProperty('--skin-ring', skin.palette.ring);
}
