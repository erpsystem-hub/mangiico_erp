import { matchesSearchTerm } from '@/lib/searchUtils';
import type { MaterialCategory } from '@/features/san-xuat/danh-muc-nguyen-lieu/core/types';
import type { MaterialCatalogItem, MaterialCatalogFilters } from '../core/types';
import { MATERIAL_CATALOG_SEARCHABLE_KEYS } from './search-keys';
import { getVisibleMaterialCategoryIdsUnderRoots } from '@/features/san-xuat/danh-muc-nguyen-lieu/utils/material-category-filter';
import { materialCatalogMatchesColumnSearch } from './column-search';

export function matchesMaterialCatalogFilters(
  item: MaterialCatalogItem,
  categories: MaterialCategory[],
  searchTerm: string,
  filters: MaterialCatalogFilters,
): boolean {
  const visibleUnderRoots =
    filters.id_danh_muc_goc.length > 0
      ? getVisibleMaterialCategoryIdsUnderRoots(categories, filters.id_danh_muc_goc)
      : null;

  const matchesSearch = matchesSearchTerm(
    item as unknown as Record<string, unknown>,
    searchTerm,
    [...MATERIAL_CATALOG_SEARCHABLE_KEYS],
  );
  const statusKey = item.trang_thai === 'Đang hoạt động' ? 'Active' : 'Inactive';
  const matchesStatus = filters.status.length === 0 || filters.status.includes(statusKey);
  const matchesRoot = visibleUnderRoots == null || visibleUnderRoots.has(item.danh_muc_id);
  const matchesCol = materialCatalogMatchesColumnSearch(item, filters.columnSearch);
  return matchesSearch && matchesStatus && matchesRoot && matchesCol;
}
