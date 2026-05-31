import type { SalesOrder, SalesOrderFilters } from '../core/types';
import { matchesSearchTerm } from '@/lib/searchUtils';
import { SALES_ORDER_SEARCHABLE_KEYS } from './search-keys';
import { salesOrderMatchesColumnSearch } from './column-search';
import { orderDateInRange, resolveSalesOrderDateBounds } from './order-date-filter';

export function matchesSalesOrderFilters(
  item: SalesOrder,
  searchTerm: string,
  filters: SalesOrderFilters,
): boolean {
  if (
    !matchesSearchTerm(
      item as unknown as Record<string, unknown>,
      searchTerm,
      [...SALES_ORDER_SEARCHABLE_KEYS],
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
  if (!salesOrderMatchesColumnSearch(item, filters.columnSearch)) return false;
  const { from, to } = resolveSalesOrderDateBounds(filters.dateRange);
  if (!orderDateInRange(item.ngay_dat, from, to)) return false;
  return true;
}
