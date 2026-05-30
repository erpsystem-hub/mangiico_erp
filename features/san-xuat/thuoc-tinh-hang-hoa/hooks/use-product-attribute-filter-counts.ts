import { useMemo } from 'react';
import type { ProductAttribute, ProductAttributeFilters } from '../core/types';
import { matchesSearchTerm } from '@/lib/searchUtils';
import { PRODUCT_ATTRIBUTE_SEARCHABLE_KEYS } from '../utils/search-keys';
import { productAttributeMatchesColumnSearch } from '../utils/column-search';

export function useProductAttributeFilterCounts(
  items: ProductAttribute[],
  searchTerm: string,
  filters: ProductAttributeFilters,
) {
  return useMemo(() => {
    const base = items.filter((item) => {
      const matchesSearch = matchesSearchTerm(
        item as unknown as Record<string, unknown>,
        searchTerm,
        [...PRODUCT_ATTRIBUTE_SEARCHABLE_KEYS],
      );
      const matchesCol = productAttributeMatchesColumnSearch(item, filters.columnSearch);
      return matchesSearch && matchesCol;
    });

    const statusCounts = { Active: 0, Inactive: 0 };
    for (const item of base) {
      if (item.trang_thai === 'Đang hoạt động') statusCounts.Active++;
      else statusCounts.Inactive++;
    }

    return { statusCounts };
  }, [items, searchTerm, filters.columnSearch]);
}
