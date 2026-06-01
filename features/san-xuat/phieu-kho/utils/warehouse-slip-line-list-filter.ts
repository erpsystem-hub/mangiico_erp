import type { WarehouseSlipLineRow, WarehouseSlipLineFilters } from '../core/types';
import { matchesSearchTerm } from '@/lib/searchUtils';
import { WAREHOUSE_SLIP_LINE_SEARCHABLE_KEYS } from './search-keys';
import {
  resolveWarehouseSlipDateBounds,
  slipDateInRange,
} from './warehouse-slip-date-filter';

function lineMatchesColumnSearch(
  item: WarehouseSlipLineRow,
  columnSearch: Record<string, string>,
): boolean {
  for (const [colId, raw] of Object.entries(columnSearch)) {
    const q = raw?.trim();
    if (!q) continue;
    if (colId === 'so_luong') {
      if (!String(item.so_luong).includes(q)) return false;
      continue;
    }
    const val = item[colId as keyof WarehouseSlipLineRow];
    if (val == null) return false;
    if (!String(val).toLowerCase().includes(q.toLowerCase())) return false;
  }
  return true;
}

export function matchesWarehouseSlipLineFilters(
  item: WarehouseSlipLineRow,
  searchTerm: string,
  filters: WarehouseSlipLineFilters,
): boolean {
  if (
    !matchesSearchTerm(
      item as unknown as Record<string, unknown>,
      searchTerm,
      [...WAREHOUSE_SLIP_LINE_SEARCHABLE_KEYS],
    )
  ) {
    return false;
  }
  if (filters.status.length > 0 && !filters.status.includes(item.trang_thai)) return false;
  if (filters.loai_phieu.length > 0 && !filters.loai_phieu.includes(item.loai_phieu)) return false;
  if (filters.muc_dich.length > 0 && !filters.muc_dich.includes(item.muc_dich)) return false;
  if (filters.kho_ids.length > 0 && !filters.kho_ids.includes(item.kho_id)) return false;
  if (!lineMatchesColumnSearch(item, filters.columnSearch)) return false;
  const { from, to } = resolveWarehouseSlipDateBounds(filters.dateRange);
  if (!slipDateInRange(item.ngay_phieu, from, to)) return false;
  return true;
}
