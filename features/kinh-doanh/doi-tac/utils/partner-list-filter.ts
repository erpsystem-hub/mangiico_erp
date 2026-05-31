import { matchesSearchTerm } from '@/lib/searchUtils';
import type { PartnerCategory } from '../core/types';
import type { PartnerListItem, PartnerListFilters } from '../core/types';
import { PARTNER_LIST_SEARCHABLE_KEYS } from './search-keys';
import { getVisiblePartnerCategoryIdsUnderRoots } from './partner-category-filter';
import { partnerListMatchesColumnSearch } from './column-search';

export function matchesPartnerListFilters(
  item: PartnerListItem,
  categories: PartnerCategory[],
  searchTerm: string,
  filters: PartnerListFilters,
): boolean {
  const visibleUnderRoots =
    filters.id_danh_muc_goc.length > 0
      ? getVisiblePartnerCategoryIdsUnderRoots(categories, filters.id_danh_muc_goc)
      : null;

  const matchesSearch = matchesSearchTerm(
    item as unknown as Record<string, unknown>,
    searchTerm,
    [...PARTNER_LIST_SEARCHABLE_KEYS],
  );
  const statusKey = item.trang_thai === 'Đang hoạt động' ? 'Active' : 'Inactive';
  const matchesStatus = filters.status.length === 0 || filters.status.includes(statusKey);
  const matchesRoot = visibleUnderRoots == null || visibleUnderRoots.has(item.danh_muc_id);
  const matchesCol = partnerListMatchesColumnSearch(item, filters.columnSearch);
  return matchesSearch && matchesStatus && matchesRoot && matchesCol;
}
