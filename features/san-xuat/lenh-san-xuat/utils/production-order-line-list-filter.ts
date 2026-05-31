import type { ProductionOrderLineRow, ProductionOrderLineFilters } from '../core/types';
import { matchesSearchTerm } from '@/lib/searchUtils';
import {
  orderDateInRange,
  resolveProductionOrderDateBounds,
} from './production-order-date-filter';

const LINE_SEARCHABLE_KEYS = [
  'ma_don_hang',
  'ten_khach_hang',
  'ma_danh_muc',
  'ten_danh_muc',
  'ten_nhom_danh_muc',
  'ghi_chu',
] as const;

function lineMatchesColumnSearch(
  item: ProductionOrderLineRow,
  columnSearch: Record<string, string>,
): boolean {
  for (const [colId, raw] of Object.entries(columnSearch)) {
    const q = raw?.trim();
    if (!q) continue;
    const val = item[colId as keyof ProductionOrderLineRow];
    if (val == null) return false;
    if (!String(val).toLowerCase().includes(q.toLowerCase())) return false;
  }
  return true;
}

export function matchesProductionOrderLineFilters(
  item: ProductionOrderLineRow,
  searchTerm: string,
  filters: ProductionOrderLineFilters,
): boolean {
  if (
    !matchesSearchTerm(
      item as unknown as Record<string, unknown>,
      searchTerm,
      [...LINE_SEARCHABLE_KEYS],
    )
  ) {
    return false;
  }
  if (filters.status.length > 0 && !filters.status.includes(item.trang_thai)) return false;
  if (
    filters.khach_hang_ids.length > 0 &&
    !filters.khach_hang_ids.includes(item.khach_hang_id)
  ) {
    return false;
  }
  if (!lineMatchesColumnSearch(item, filters.columnSearch)) return false;
  const { from, to } = resolveProductionOrderDateBounds(filters.dateRange);
  if (!orderDateInRange(item.ngay_dat, from, to)) return false;
  return true;
}
