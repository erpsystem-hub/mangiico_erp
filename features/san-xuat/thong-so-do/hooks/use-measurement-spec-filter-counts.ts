import { useMemo } from 'react';
import type { MeasurementSpec, MeasurementSpecFilters } from '../core/types';
import { matchesSearchTerm } from '@/lib/searchUtils';
import { MEASUREMENT_SPEC_SEARCHABLE_KEYS } from '../utils/search-keys';
import { measurementSpecMatchesColumnSearch } from '../utils/column-search';

export function useMeasurementSpecFilterCounts(
  items: MeasurementSpec[],
  searchTerm: string,
  filters: MeasurementSpecFilters,
) {
  return useMemo(() => {
    const base = items.filter((item) => {
      const matchesSearch = matchesSearchTerm(
        item as unknown as Record<string, unknown>,
        searchTerm,
        [...MEASUREMENT_SPEC_SEARCHABLE_KEYS],
      );
      const matchesCol = measurementSpecMatchesColumnSearch(item, filters.columnSearch);
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
