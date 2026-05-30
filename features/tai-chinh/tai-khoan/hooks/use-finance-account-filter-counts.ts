import { useMemo } from 'react';
import type { FinanceAccount } from '../core/types';
import type { FinanceAccountFilters } from '../core/types';
import { matchesSearchTerm } from '@/lib/searchUtils';
import { FINANCE_ACCOUNT_SEARCHABLE_KEYS } from '../utils/search-keys';
import { financeAccountMatchesColumnSearch } from '../utils/column-search';

export function useFinanceAccountFilterCounts(
  accounts: FinanceAccount[],
  searchTerm: string,
  filters: FinanceAccountFilters,
) {
  return useMemo(() => {
    const base = accounts.filter((item) => {
      const matchesSearch = matchesSearchTerm(
        item as unknown as Record<string, unknown>,
        searchTerm,
        [...FINANCE_ACCOUNT_SEARCHABLE_KEYS],
      );
      const matchesCol = financeAccountMatchesColumnSearch(item, filters.columnSearch);
      return matchesSearch && matchesCol;
    });

    const loaiCounts: Record<string, number> = {};
    const branchCounts: Record<string, number> = {};
    const statusCounts: Record<string, number> = { Active: 0, Inactive: 0 };

    for (const item of base) {
      loaiCounts[item.loai_quy] = (loaiCounts[item.loai_quy] ?? 0) + 1;
      if (item.chi_nhanh_id) {
        branchCounts[item.chi_nhanh_id] = (branchCounts[item.chi_nhanh_id] ?? 0) + 1;
      }
      const sk = item.trang_thai === 'Đang hoạt động' ? 'Active' : 'Inactive';
      statusCounts[sk] = (statusCounts[sk] ?? 0) + 1;
    }

    return {
      loaiCounts,
      branchCounts,
      statusCounts: {
        Active: statusCounts.Active ?? 0,
        Inactive: statusCounts.Inactive ?? 0,
      },
    };
  }, [accounts, searchTerm, filters.columnSearch]);
}
