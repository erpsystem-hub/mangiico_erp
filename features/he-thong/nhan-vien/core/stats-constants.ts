/**
 * Constants for Employee Stats / Dashboard (Mangiico)
 */
import { txt } from '@/lib/text';
import { getStatsTableScrollMaxHeight } from '@/components/shared/stats/table-scroll';
import type { TrangThaiNhanVien } from './constants';

export type DateRangePresetId =
  | 'all'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'last_quarter'
  | 'this_year'
  | 'custom';

export const DATE_RANGE_PRESETS: { id: DateRangePresetId; label: string }[] = [
  { id: 'all', get label() { return txt('employee.stats.preset.all'); } },
  { id: 'this_week', get label() { return txt('employee.stats.preset.thisWeek'); } },
  { id: 'last_week', get label() { return txt('employee.stats.preset.lastWeek'); } },
  { id: 'this_month', get label() { return txt('employee.stats.preset.thisMonth'); } },
  { id: 'last_month', get label() { return txt('employee.stats.preset.lastMonth'); } },
  { id: 'this_quarter', get label() { return txt('employee.stats.preset.thisQuarter'); } },
  { id: 'last_quarter', get label() { return txt('employee.stats.preset.lastQuarter'); } },
  { id: 'this_year', get label() { return txt('employee.stats.preset.thisYear'); } },
  { id: 'custom', get label() { return txt('employee.stats.preset.custom'); } },
];

export const DEPT_COLORS = [
  '#6366f1', '#06b6d4', '#f59e0b', '#ef4444', '#10b981',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
];

export const POSITION_COLORS = [
  '#6366f1', '#06b6d4', '#f59e0b', '#10b981', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#ef4444',
];

export const STATUS_COLORS: Record<TrangThaiNhanVien, string> = {
  'Hoạt động': '#10b981',
  'Khóa': '#f43f5e',
};

export const STATUS_LABELS: Record<TrangThaiNhanVien, string> = {
  get 'Hoạt động'() { return txt('employee.statusActive'); },
  get 'Khóa'() { return txt('employee.statusLocked'); },
};

/** KPI ids used for visibility config (localStorage) */
export const DEFAULT_KPI_IDS = ['total', 'active', 'locked'] as const;
export const STATS_KPI_STORAGE_KEY = 'nhan-vien-stats-kpi';

/** Max months non-admin can select for date range */
export const MAX_DATE_RANGE_MONTHS_NON_ADMIN = 12;

export const STATS_CHART_HEIGHT = 200;
export const STATS_CHART_HEIGHT_MOBILE = 232;

export const DEPT_STATS_TABLE_BODY_VISIBLE_ROWS = 10;

export function getDeptStatsTableScrollMaxHeightCss(): string {
  return getStatsTableScrollMaxHeight(DEPT_STATS_TABLE_BODY_VISIBLE_ROWS);
}
