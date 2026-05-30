/**
 * Compute start/end dates for stats date range presets.
 */
import type { DateRangePresetId } from '../core/stats-constants';
import type { StatsDateRange } from '../core/stats-types';
import { getNowAsLocalDate } from '@/lib/utils';
import { txt } from '@/lib/text';

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfQuarter(d: Date): Date {
  const q = Math.floor(d.getMonth() / 3) + 1;
  return new Date(d.getFullYear(), (q - 1) * 3, 1);
}

function endOfQuarter(d: Date): Date {
  const q = Math.floor(d.getMonth() / 3) + 1;
  return new Date(d.getFullYear(), q * 3, 0);
}

function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1);
}

function endOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 11, 31);
}

function formatShort(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

export function getDateRangeFromPreset(
  preset: DateRangePresetId,
  customStart?: Date,
  customEnd?: Date,
): StatsDateRange {
  const now = getNowAsLocalDate();
  let start: Date;
  let end: Date;
  let label: string;

  switch (preset) {
    case 'all': {
      start = new Date(2000, 0, 1);
      end = endOfDay(now);
      label = txt('employee.stats.preset.all');
      break;
    }
    case 'this_week': {
      const day = now.getDay();
      const mon = now.getDate() - (day === 0 ? 6 : day - 1);
      start = new Date(now.getFullYear(), now.getMonth(), mon);
      end = new Date(start);
      end.setDate(end.getDate() + 6);
      label = `${txt('employee.stats.dateRange.week')} ${start.getDate()}/${start.getMonth() + 1} – ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`;
      break;
    }
    case 'last_week': {
      const day = now.getDay();
      const mon = now.getDate() - (day === 0 ? 6 : day - 1) - 7;
      start = new Date(now.getFullYear(), now.getMonth(), mon);
      end = new Date(start);
      end.setDate(end.getDate() + 6);
      label = `${txt('employee.stats.dateRange.week')} ${start.getDate()}/${start.getMonth() + 1} – ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`;
      break;
    }
    case 'this_month': {
      start = startOfMonth(now);
      end = endOfMonth(now);
      label = `${txt('employee.stats.dateRange.month')} ${now.getMonth() + 1}/${now.getFullYear()}`;
      break;
    }
    case 'last_month': {
      const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      start = startOfMonth(last);
      end = endOfMonth(last);
      label = `${txt('employee.stats.dateRange.month')} ${last.getMonth() + 1}/${last.getFullYear()}`;
      break;
    }
    case 'this_quarter': {
      start = startOfQuarter(now);
      end = endOfQuarter(now);
      const q = Math.floor(now.getMonth() / 3) + 1;
      label = `${txt('employee.stats.dateRange.quarter')} ${q}/${now.getFullYear()}`;
      break;
    }
    case 'last_quarter': {
      const lastQ = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      start = startOfQuarter(lastQ);
      end = endOfQuarter(lastQ);
      const q = Math.floor(lastQ.getMonth() / 3) + 1;
      label = `${txt('employee.stats.dateRange.quarter')} ${q}/${lastQ.getFullYear()}`;
      break;
    }
    case 'this_year': {
      start = startOfYear(now);
      end = endOfYear(now);
      label = `${txt('employee.stats.dateRange.year')} ${now.getFullYear()}`;
      break;
    }
    case 'custom':
    default: {
      start = customStart ? new Date(customStart) : startOfMonth(now);
      end = customEnd ? new Date(customEnd) : endOfMonth(now);
      label =
        customStart && customEnd
          ? `${formatShort(customStart)} – ${formatShort(customEnd)}`
          : txt('employee.stats.dateRange.custom');
      break;
    }
  }

  return { preset, start, end, label };
}

/** Employee existed as of date if tg_tao <= end of asAt day. */
export function isCreatedOnOrBefore(tgTao: string | undefined, asAt: Date): boolean {
  if (!tgTao) return false;
  const created = new Date(tgTao);
  if (Number.isNaN(created.getTime())) return false;
  return created <= endOfDay(asAt);
}

/** tg_tao falls within [rangeStart, rangeEnd] inclusive. */
export function isCreatedInRange(
  tgTao: string | undefined,
  rangeStart: Date,
  rangeEnd: Date,
): boolean {
  if (!tgTao) return false;
  const created = new Date(tgTao);
  if (Number.isNaN(created.getTime())) return false;
  return created >= startOfDay(rangeStart) && created <= endOfDay(rangeEnd);
}

/** Month key YYYY-MM from ISO timestamp. */
export function getMonthKeyFromTimestamp(tgTao: string | undefined): string | null {
  if (!tgTao) return null;
  const d = new Date(tgTao);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function getMonthKeysEndingAt(endDate: Date, months: number): { key: string; label: string }[] {
  const result: { key: string; label: string }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `T${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`;
    result.push({ key, label });
  }
  return result;
}
