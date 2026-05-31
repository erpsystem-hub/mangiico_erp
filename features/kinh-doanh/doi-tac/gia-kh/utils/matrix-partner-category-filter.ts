import { matchesSearchTerm } from '@/lib/searchUtils';
import type { PartnerCategory } from '../../core/types';
import { PARTNER_CATEGORY_SEARCHABLE_KEYS } from '../../utils/search-keys';

export interface MatrixPartnerCategoryFilters {
  status: string[];
  id_danh_muc_goc: string[];
}

export function getVisiblePartnerCategoryIdsUnderRoots(
  categories: PartnerCategory[],
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

export function filterPartnerCategoriesForMatrix(
  categories: PartnerCategory[],
  searchTerm: string,
  filters: MatrixPartnerCategoryFilters,
): PartnerCategory[] {
  const parentNameById = new Map<string, string>();
  categories.forEach((d) => parentNameById.set(d.id, d.ten_danh_muc));

  const visibleUnderRoots =
    filters.id_danh_muc_goc.length > 0
      ? getVisiblePartnerCategoryIdsUnderRoots(categories, filters.id_danh_muc_goc)
      : null;

  return categories.filter((item) => {
    const parentName = item.cha_id ? (parentNameById.get(item.cha_id) ?? '') : '';
    const matchesSearch = matchesSearchTerm(
      { ...(item as unknown as Record<string, unknown>), ten_danh_muc_cha: parentName },
      searchTerm,
      [...PARTNER_CATEGORY_SEARCHABLE_KEYS],
    );

    const statusKey = item.trang_thai === 'Đang hoạt động' ? 'Active' : 'Inactive';
    const matchesStatus =
      filters.status.length === 0 || filters.status.includes(statusKey);

    const matchesRoot =
      visibleUnderRoots == null || visibleUnderRoots.has(item.id);

    return matchesSearch && matchesStatus && matchesRoot;
  });
}
