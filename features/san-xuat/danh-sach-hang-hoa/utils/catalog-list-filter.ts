import { matchesSearchTerm } from '@/lib/searchUtils';
import type { ProductCategory } from '@/features/san-xuat/danh-muc-hang-hoa/core/types';
import type { ProductCatalogItem, ProductCatalogFilters } from '../core/types';
import { PRODUCT_CATALOG_SEARCHABLE_KEYS } from './search-keys';
import { getVisibleCategoryIdsUnderRoots } from '@/features/san-xuat/danh-muc-hang-hoa/utils/matrix-category-filter';
import { productCatalogMatchesColumnSearch } from './column-search';

export function matchesProductCatalogFilters(
  item: ProductCatalogItem,
  categories: ProductCategory[],
  searchTerm: string,
  filters: ProductCatalogFilters,
): boolean {
  const visibleUnderRoots =
    filters.id_danh_muc_goc.length > 0
      ? getVisibleCategoryIdsUnderRoots(categories, filters.id_danh_muc_goc)
      : null;

  const matchesSearch = matchesSearchTerm(
    item as unknown as Record<string, unknown>,
    searchTerm,
    [...PRODUCT_CATALOG_SEARCHABLE_KEYS],
  );
  const statusKey = item.trang_thai === 'Đang hoạt động' ? 'Active' : 'Inactive';
  const matchesStatus = filters.status.length === 0 || filters.status.includes(statusKey);
  const matchesRoot = visibleUnderRoots == null || visibleUnderRoots.has(item.danh_muc_id);
  const matchesCol = productCatalogMatchesColumnSearch(item, filters.columnSearch);
  return matchesSearch && matchesStatus && matchesRoot && matchesCol;
}

export function filterProductCatalogList(
  items: ProductCatalogItem[],
  categories: ProductCategory[],
  searchTerm: string,
  filters: ProductCatalogFilters,
): ProductCatalogItem[] {
  return items.filter((item) =>
    matchesProductCatalogFilters(item, categories, searchTerm, filters),
  );
}
