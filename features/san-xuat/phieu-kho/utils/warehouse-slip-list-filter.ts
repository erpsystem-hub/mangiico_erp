import type { WarehouseSlipListItem, WarehouseSlipFilters } from '../core/types';
import { matchesSearchTerm } from '@/lib/searchUtils';
import { WAREHOUSE_SLIP_SEARCHABLE_KEYS } from './search-keys';
import { warehouseSlipMatchesColumnSearch } from './column-search';
import {
  resolveWarehouseSlipDateBounds,
  slipDateInRange,
} from './warehouse-slip-date-filter';

export function matchesWarehouseSlipFilters(
  item: WarehouseSlipListItem,
  searchTerm: string,
  filters: WarehouseSlipFilters,
): boolean {
  if (
    !matchesSearchTerm(
      item as unknown as Record<string, unknown>,
      searchTerm,
      [...WAREHOUSE_SLIP_SEARCHABLE_KEYS],
    )
  ) {
    return false;
  }
  if (filters.status.length > 0 && !filters.status.includes(item.trang_thai)) return false;
  if (filters.loai_phieu.length > 0 && !filters.loai_phieu.includes(item.loai_phieu)) return false;
  if (filters.muc_dich.length > 0 && !filters.muc_dich.includes(item.muc_dich)) return false;
  if (filters.kho_ids.length > 0 && !filters.kho_ids.includes(item.kho_id)) return false;
  if (!warehouseSlipMatchesColumnSearch(item, filters.columnSearch)) return false;
  const { from, to } = resolveWarehouseSlipDateBounds(filters.dateRange);
  if (!slipDateInRange(item.ngay_phieu, from, to)) return false;
  return true;
}
