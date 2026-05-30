import { matchesSearchTerm } from '@/lib/searchUtils';
import type { ProductCategory } from '../core/types';
import { PRODUCT_CATEGORY_SEARCHABLE_KEYS } from './search-keys';

export interface MatrixCategoryFilters {
  status: string[];
  id_danh_muc_goc: string[];
}

export function getVisibleCategoryIdsUnderRoots(
  categories: ProductCategory[],
  rootIds: string[],
): Set<string> {
  const visibleIds = new Set<string>();
  let current = new Set<string>(rootIds);
  while (current.size > 0) {
    current.forEach((id) => visibleIds.add(id));
    const next = new Set<string>();
    categories.forEach((d) => {
      if (d.cha_id && current.has(d.cha_id)) next.add(d.id);
    });
    current = next;
  }
  return visibleIds;
}

export function filterCategoriesForMatrix(
  categories: ProductCategory[],
  searchTerm: string,
  filters: MatrixCategoryFilters,
): ProductCategory[] {
  const parentNameById = new Map<string, string>();
  categories.forEach((d) => parentNameById.set(d.id, d.ten_danh_muc));

  const visibleUnderRoots =
    filters.id_danh_muc_goc.length > 0
      ? getVisibleCategoryIdsUnderRoots(categories, filters.id_danh_muc_goc)
      : null;

  return categories.filter((item) => {
    const parentName = item.cha_id ? (parentNameById.get(item.cha_id) ?? '') : '';
    const matchesSearch = matchesSearchTerm(
      { ...(item as unknown as Record<string, unknown>), ten_danh_muc_cha: parentName },
      searchTerm,
      [...PRODUCT_CATEGORY_SEARCHABLE_KEYS],
    );

    const statusKey = item.trang_thai === 'Đang hoạt động' ? 'Active' : 'Inactive';
    const matchesStatus =
      filters.status.length === 0 || filters.status.includes(statusKey);

    const matchesRoot =
      visibleUnderRoots == null || visibleUnderRoots.has(item.id);

    return matchesSearch && matchesStatus && matchesRoot;
  });
}
