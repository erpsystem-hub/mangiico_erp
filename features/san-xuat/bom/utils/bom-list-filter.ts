import { matchesSearchTerm } from '@/lib/searchUtils';
import type { ProductCategory } from '@/features/san-xuat/danh-muc-hang-hoa/core/types';
import { getVisibleCategoryIdsUnderRoots } from '@/features/san-xuat/danh-muc-hang-hoa/utils/matrix-category-filter';
import type { BomItem, BomFilters } from '../core/types';
import { BOM_SEARCHABLE_KEYS } from './search-keys';
import { bomMatchesColumnSearch } from './column-search';

export function matchesBomFilters(
  item: BomItem,
  productCategories: ProductCategory[],
  searchTerm: string,
  filters: BomFilters,
): boolean {
  const spDanhMucId = item.danh_muc_id_sp;
  const visibleUnderRoots =
    filters.id_danh_muc_goc.length > 0
      ? getVisibleCategoryIdsUnderRoots(productCategories, filters.id_danh_muc_goc)
      : null;

  const matchesSearch = matchesSearchTerm(
    item as unknown as Record<string, unknown>,
    searchTerm,
    [...BOM_SEARCHABLE_KEYS],
  );
  const statusKey = item.trang_thai === 'Đang hoạt động' ? 'Active' : 'Inactive';
  const matchesStatus = filters.status.length === 0 || filters.status.includes(statusKey);
  const matchesRoot =
    visibleUnderRoots == null || visibleUnderRoots.has(spDanhMucId);
  const matchesCol = bomMatchesColumnSearch(item, filters.columnSearch);
  return matchesSearch && matchesStatus && matchesRoot && matchesCol;
}
