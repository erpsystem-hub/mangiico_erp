import { useUIStore } from '../store/useStore';
import {
  DEFAULT_PRIMARY_COLOR,
  PRIMARY_COLOR_MAP,
  getPrimaryHsl,
} from './theme/tokens';

export {
  DEFAULT_PRIMARY_COLOR,
  DEFAULT_FONT_FAMILY,
  PRIMARY_COLOR_MAP,
  getPrimaryHsl,
  BADGE_COLOR_CLASSES,
  RADIO_SELECTED_COLOR_CLASSES,
  SEMANTIC_COLOR_DOT_HEX,
  SEMANTIC_COLOR_CHART_FILL,
  CHART_COLORS,
  CHART_COLORS_HSL,
  CHART_FILL_FALLBACK,
  CHART_HEIGHT,
  TEXT_SIZE_ROOT_PX,
  TYPOGRAPHY,
  type SemanticColor,
} from './theme/tokens';

/* ------------------------------------------------------------------ */
/*  HSL ↔ Hex conversion helpers                                      */
/* ------------------------------------------------------------------ */

/** Parse an HSL string like "221.2 83.2% 53.3%" into { h, s, l } (all numbers). */
function parseHSL(hslStr: string): { h: number; s: number; l: number } {
  const parts = hslStr.replace(/%/g, '').split(/\s+/).map(Number);
  return { h: parts[0], s: parts[1], l: parts[2] };
}

/** Convert individual H, S, L values (h in 0-360, s/l in 0-100) to a hex string. */
function hslToHexRaw(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Convert an HSL string ("221.2 83.2% 53.3%") to a hex color ("#3b82f6"). */
export function hslToHex(hslStr: string): string {
  const { h, s, l } = parseHSL(hslStr);
  return hslToHexRaw(h, s, l);
}

/**
 * Generate a lighter variant of an HSL string by mixing towards white.
 */
export function lightenHSL(hslStr: string, amount: number): string {
  const { h, s, l } = parseHSL(hslStr);
  const newL = l + (100 - l) * amount;
  return `${h} ${s}% ${Math.min(newL, 100).toFixed(1)}%`;
}

/**
 * Generate a darker variant of an HSL string.
 */
export function darkenHSL(hslStr: string, amount: number): string {
  const { h, s, l } = parseHSL(hslStr);
  const newL = l * (1 - amount);
  return `${h} ${s}% ${Math.max(newL, 0).toFixed(1)}%`;
}

/* ------------------------------------------------------------------ */
/*  React hook                                                         */
/* ------------------------------------------------------------------ */

export interface PrimaryColorInfo {
  hsl: string;
  hex: string;
  cssHsl: string;
}

/**
 * Hook that returns the current primary color in multiple formats.
 */
export function usePrimaryColor(): PrimaryColorInfo {
  const primaryColor = useUIStore((s) => s.primaryColor);
  const hsl = getPrimaryHsl(primaryColor);
  return {
    hsl,
    hex: hslToHex(hsl),
    cssHsl: `hsl(${hsl})`,
  };
}
