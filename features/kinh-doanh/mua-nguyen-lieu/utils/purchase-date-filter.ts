import type { DateRangeValue } from '@/components/ui/DateRangePicker';
import { txt } from '@/lib/text';
import { getNowAsLocalDate } from '@/lib/utils';

export const PURCHASE_ORDER_DATE_PRESETS = [
  { id: 'all', label: txt('purchaseOrder.filter.dateAll') },
  { id: 'this_month', label: txt('purchaseOrder.filter.dateThisMonth') },
  { id: 'last_month', label: txt('purchaseOrder.filter.dateLastMonth') },
  { id: 'custom', label: txt('purchaseOrder.filter.dateCustom') },
] as const;

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function purchaseOrderDateRangeLabel(range: DateRangeValue): string {
  const preset = PURCHASE_ORDER_DATE_PRESETS.find((p) => p.id === range.preset);
  if (range.preset === 'custom' && range.customStart && range.customEnd) {
    return `${range.customStart} – ${range.customEnd}`;
  }
  return preset?.label ?? txt('purchaseOrder.filter.dateAll');
}

export function resolvePurchaseOrderDateBounds(
  range: DateRangeValue,
): { from: string; to: string } {
  if (!range.preset || range.preset === 'all') {
    return { from: '', to: '' };
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
      from: range.customStart?.trim() ?? '',
      to: range.customEnd?.trim() ?? '',
    };
  }

  return { from: '', to: '' };
}

export function orderDateInRange(ngayDat: string, from: string, to: string): boolean {
  if (from && ngayDat < from) return false;
  if (to && ngayDat > to) return false;
  return true;
}
