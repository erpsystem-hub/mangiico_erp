import type { PurchaseOrder, PurchaseOrderFilters } from '../core/types';
import { matchesSearchTerm } from '@/lib/searchUtils';
import { PURCHASE_ORDER_SEARCHABLE_KEYS } from './search-keys';
import { purchaseOrderMatchesColumnSearch } from './column-search';
import { orderDateInRange, resolvePurchaseOrderDateBounds } from './purchase-date-filter';

export function matchesPurchaseOrderFilters(
  item: PurchaseOrder,
  searchTerm: string,
  filters: PurchaseOrderFilters,
): boolean {
  if (
    !matchesSearchTerm(
      item as unknown as Record<string, unknown>,
      searchTerm,
      [...PURCHASE_ORDER_SEARCHABLE_KEYS],
    )
  ) {
    return false;
  }
  if (filters.status.length > 0 && !filters.status.includes(item.trang_thai)) return false;
  if (
    filters.nha_cung_cap_ids.length > 0 &&
    !filters.nha_cung_cap_ids.includes(item.nha_cung_cap_id)
  ) {
    return false;
  }
  if (!purchaseOrderMatchesColumnSearch(item, filters.columnSearch)) return false;
  const { from, to } = resolvePurchaseOrderDateBounds(filters.dateRange);
  if (!orderDateInRange(item.ngay_dat, from, to)) return false;
  return true;
}
