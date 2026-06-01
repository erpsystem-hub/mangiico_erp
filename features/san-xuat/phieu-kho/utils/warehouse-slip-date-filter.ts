import type { DateRangeValue } from '@/components/ui/DateRangePicker';
import { txt } from '@/lib/text';
import { getNowAsLocalDate } from '@/lib/utils';

export const WAREHOUSE_SLIP_DATE_PRESETS = [
  { id: 'all', label: txt('warehouseSlip.filter.dateAll') },
  { id: 'this_month', label: txt('warehouseSlip.filter.dateThisMonth') },
  { id: 'last_month', label: txt('warehouseSlip.filter.dateLastMonth') },
  { id: 'custom', label: txt('warehouseSlip.filter.dateCustom') },
] as const;

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function warehouseSlipDateRangeLabel(range: DateRangeValue): string {
  const preset = WAREHOUSE_SLIP_DATE_PRESETS.find((p) => p.id === range.preset);
  if (range.preset === 'custom' && range.customStart && range.customEnd) {
    return `${range.customStart} – ${range.customEnd}`;
  }
  return preset?.label ?? txt('warehouseSlip.filter.dateAll');
}

export function resolveWarehouseSlipDateBounds(range: DateRangeValue): {
  from: string | null;
  to: string | null;
} {
  if (!range.preset || range.preset === 'all') {
    return { from: null, to: null };
  }

  const now = getNowAsLocalDate();

  if (range.preset === 'this_month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: toIsoDate(start), to: toIsoDate(end) };
  }

  if (range.preset === 'last_month') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { from: toIsoDate(start), to: toIsoDate(end) };
  }

  if (range.preset === 'custom') {
    return {
      from: range.customStart?.trim() || null,
      to: range.customEnd?.trim() || null,
    };
  }

  return { from: null, to: null };
}

export function slipDateInRange(date: string, from: string | null, to: string | null): boolean {
  if (!from && !to) return true;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}
