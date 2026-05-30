import { useMemo } from 'react';
import type { Branch } from '../core/types';
import type { BranchFilters } from '../core/types';
import { matchesSearchTerm } from '../../../../lib/searchUtils';
import { BRANCH_SEARCHABLE_KEYS } from '../utils/search-keys';
import { branchMatchesColumnSearch } from '../utils/column-search';

export function useBranchFilterCounts(
  branches: Branch[],
  searchTerm: string,
  filters: BranchFilters,
) {
  return useMemo(() => {
    const base = branches.filter((item) => {
      const matchesSearch = matchesSearchTerm(
        item as unknown as Record<string, unknown>,
        searchTerm,
        BRANCH_SEARCHABLE_KEYS,
      );
      const matchesCol = branchMatchesColumnSearch(item, filters.columnSearch);
      return matchesSearch && matchesCol;
    });

    const statusCounts = { Active: 0, Inactive: 0 };
    for (const item of base) {
      if (item.trang_thai === 'Đang hoạt động') statusCounts.Active++;
      else statusCounts.Inactive++;
    }

    return { statusCounts };
  }, [branches, searchTerm, filters.columnSearch]);
}
