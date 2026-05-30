import type { BadgeColor, BadgeConfig } from '@/components/ui/EnumBadge';
import {
  CHART_COLORS,
  CHART_COLORS_HSL,
  CHART_FILL_FALLBACK,
  CHART_HEIGHT,
  SEMANTIC_COLOR_CHART_FILL,
  type SemanticColor,
} from '@/lib/theme/tokens';

export {
  CHART_COLORS,
  CHART_COLORS_HSL,
  CHART_FILL_FALLBACK,
  CHART_HEIGHT,
};

/** @deprecated Use SEMANTIC_COLOR_CHART_FILL from lib/theme/tokens */
export const BADGE_COLOR_TO_CHART_FILL: Record<BadgeColor, string> =
  SEMANTIC_COLOR_CHART_FILL as Record<BadgeColor, string>;

export const GIOI_TINH_CHART_COLORS: Record<string, string> = {
  Nam: SEMANTIC_COLOR_CHART_FILL.blue,
  Nữ: SEMANTIC_COLOR_CHART_FILL.pink,
  Khác: SEMANTIC_COLOR_CHART_FILL.slate,
};

export function chartFillByIndex(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length] ?? CHART_COLORS[0];
}

export function chartFillByIndexHsl(index: number): string {
  return CHART_COLORS_HSL[index % CHART_COLORS_HSL.length] ?? CHART_COLORS_HSL[0];
}

export function chartFillFromBadgeConfig(
  config: BadgeConfig<string | number>,
  key: string | number | undefined | null,
): string {
  if (key == null || key === '' || key === '—') return CHART_FILL_FALLBACK;
  const item = config[key];
  if (!item) return CHART_FILL_FALLBACK;
  const color = item.color as SemanticColor;
  return SEMANTIC_COLOR_CHART_FILL[color] ?? CHART_FILL_FALLBACK;
}
