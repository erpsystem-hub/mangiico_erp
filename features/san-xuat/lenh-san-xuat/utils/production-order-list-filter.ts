import type { ProductionOrder, ProductionOrderFilters } from '../core/types';
import { matchesSearchTerm } from '@/lib/searchUtils';
import { PRODUCTION_ORDER_SEARCHABLE_KEYS } from './search-keys';
import { productionOrderMatchesColumnSearch } from './column-search';
import {
  orderDateInRange,
  resolveProductionOrderDateBounds,
} from './production-order-date-filter';

export function matchesProductionOrderFilters(
  item: ProductionOrder,
  searchTerm: string,
  filters: ProductionOrderFilters,
): boolean {
  if (
    !matchesSearchTerm(
      item as unknown as Record<string, unknown>,
      searchTerm,
      [...PRODUCTION_ORDER_SEARCHABLE_KEYS],
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
  if (!productionOrderMatchesColumnSearch(item, filters.columnSearch)) return false;
  const { from, to } = resolveProductionOrderDateBounds(filters.dateRange);
  if (!orderDateInRange(item.ngay_dat, from, to)) return false;
  return true;
}
