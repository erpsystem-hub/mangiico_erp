/**
 * Design tokens — single source of truth for theme defaults, colors, typography.
 * `public/theme-boot.js` mirrors PRIMARY_COLOR_MAP + defaults for pre-React boot.
 */

/** Default primary preset key — must match store/useStore.ts */
export const DEFAULT_PRIMARY_COLOR = 'blue' as const;

/** Default UI font — must match store/useStore.ts and index.css @theme */
export const DEFAULT_FONT_FAMILY = 'Be Vietnam Pro' as const;

/** HSL components (no hsl() wrapper) for user-selectable primary accents */
export const PRIMARY_COLOR_MAP: Record<string, string> = {
  blue: '221.2 83.2% 53.3%',
  violet: '262.1 83.3% 57.8%',
  emerald: '142.1 76.2% 36.3%',
  rose: '346.8 77.2% 49.8%',
  amber: '37.7 92.1% 50.2%',
  orange: '24.6 95% 53.1%',
  cyan: '188.7 94.5% 42.7%',
  slate: '215.4 16.3% 46.9%',
};

export function getPrimaryHsl(key: string): string {
  return PRIMARY_COLOR_MAP[key] ?? PRIMARY_COLOR_MAP[DEFAULT_PRIMARY_COLOR];
}

/* ------------------------------------------------------------------ */
/*  Semantic badge / status colors                                     */
/* ------------------------------------------------------------------ */

export type SemanticColor =
  | 'primary'
  | 'emerald'
  | 'blue'
  | 'amber'
  | 'rose'
  | 'indigo'
  | 'pink'
  | 'violet'
  | 'sky'
  | 'slate'
  | 'cyan';

/** Tailwind classes for EnumBadge */
export const BADGE_COLOR_CLASSES: Record<SemanticColor, string> = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  emerald:
    'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900',
  blue:
    'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900',
  amber:
    'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900',
  rose:
    'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900',
  indigo:
    'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900',
  pink:
    'bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-950/30 dark:text-pink-400 dark:border-pink-900',
  violet:
    'bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-900',
  sky:
    'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900',
  slate: 'bg-muted text-muted-foreground border-border',
  cyan:
    'bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-900',
};

/** Selected-state classes for RadioGroup */
export const RADIO_SELECTED_COLOR_CLASSES: Record<SemanticColor, string> = {
  primary: 'bg-primary/10 text-primary border-primary/30 ring-primary/20',
  emerald:
    'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-200/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800 dark:ring-emerald-900/30',
  blue:
    'bg-blue-50 text-blue-700 border-blue-200 ring-blue-200/50 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800 dark:ring-blue-900/30',
  amber:
    'bg-amber-50 text-amber-700 border-amber-200 ring-amber-200/50 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800 dark:ring-amber-900/30',
  rose:
    'bg-rose-50 text-rose-700 border-rose-200 ring-rose-200/50 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800 dark:ring-rose-900/30',
  indigo:
    'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-200/50 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800 dark:ring-indigo-900/30',
  pink:
    'bg-pink-50 text-pink-700 border-pink-200 ring-pink-200/50 dark:bg-pink-950/30 dark:text-pink-400 dark:border-pink-800 dark:ring-pink-900/30',
  violet:
    'bg-violet-50 text-violet-700 border-violet-200 ring-violet-200/50 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800 dark:ring-violet-900/30',
  sky:
    'bg-sky-50 text-sky-700 border-sky-200 ring-sky-200/50 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-800 dark:ring-sky-900/30',
  slate: 'bg-muted text-foreground border-border ring-border/50',
  cyan:
    'bg-cyan-50 text-cyan-700 border-cyan-200 ring-cyan-200/50 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-800 dark:ring-cyan-900/30',
};

/** Hex dots for RadioGroup color indicators */
export const SEMANTIC_COLOR_DOT_HEX: Record<SemanticColor, string> = {
  primary: '#3b82f6',
  emerald: '#10b981',
  blue: '#3b82f6',
  amber: '#f59e0b',
  rose: '#f43f5e',
  indigo: '#6366f1',
  pink: '#ec4899',
  violet: '#8b5cf6',
  sky: '#0ea5e9',
  slate: '#94a3b8',
  cyan: '#06b6d4',
};

/** Chart fill HSL aligned with semantic badge colors */
export const SEMANTIC_COLOR_CHART_FILL: Record<SemanticColor, string> = {
  primary: 'hsl(221.2 83.2% 53.3%)',
  emerald: 'hsl(142 71% 45%)',
  blue: 'hsl(217 91% 60%)',
  amber: 'hsl(38 92% 50%)',
  rose: 'hsl(0 72% 51%)',
  indigo: 'hsl(243 75% 59%)',
  pink: 'hsl(330 81% 60%)',
  violet: 'hsl(262 83% 58%)',
  sky: 'hsl(199 89% 48%)',
  slate: 'hsl(215 20% 55%)',
  cyan: 'hsl(199 89% 48%)',
};

export const CHART_FILL_FALLBACK = SEMANTIC_COLOR_CHART_FILL.slate;

/** Multi-series chart palette (hex) */
export const CHART_COLORS = [
  '#3b82f6',
  '#06b6d4',
  '#f59e0b',
  '#ef4444',
  '#10b981',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
] as const;

export const CHART_COLORS_HSL = [
  'hsl(221.2 83.2% 53.3%)',
  'hsl(199 89% 48%)',
  'hsl(38 92% 50%)',
  'hsl(0 72% 51%)',
  'hsl(142 71% 45%)',
  'hsl(262 83% 58%)',
  'hsl(330 81% 60%)',
  'hsl(173 58% 39%)',
  'hsl(24 95% 53%)',
] as const;

export const CHART_HEIGHT = 240;

/* ------------------------------------------------------------------ */
/*  Typography scale                                                   */
/* ------------------------------------------------------------------ */

export const TEXT_SIZE_ROOT_PX = {
  small: '14px',
  medium: '16px',
  large: '18px',
} as const;

export const TYPOGRAPHY = {
  caption: { size: '11px', lineHeight: '16px' },
  bodySm: { size: '13px', lineHeight: '20px' },
  body: { size: '1rem', lineHeight: '1.5' },
} as const;
