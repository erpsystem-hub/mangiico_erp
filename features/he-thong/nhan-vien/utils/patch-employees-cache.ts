import type { QueryClient } from '@tanstack/react-query';
import type { Employee } from '../core/types';
import { queryKeys } from '@/lib/query-keys';

export type EmployeesPageCache = { items: Employee[]; total: number };

function isPageCache(value: unknown): value is EmployeesPageCache {
  return (
    value != null &&
    typeof value === 'object' &&
    'items' in value &&
    Array.isArray((value as EmployeesPageCache).items)
  );
}

/** Patch mọi cache list/page nhân viên (client array hoặc server page result). */
export function patchEmployeesListCaches(
  queryClient: QueryClient,
  patchRows: (rows: Employee[]) => Employee[],
  totalDelta = 0,
): void {
  queryClient.setQueriesData({ queryKey: queryKeys.employees.all }, (old: unknown) => {
    if (Array.isArray(old)) return patchRows(old as Employee[]);
    if (isPageCache(old)) {
      return {
        items: patchRows(old.items),
        total: Math.max(0, old.total + totalDelta),
      };
    }
    return old;
  });
}

export function invalidateEmployeesCount(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: queryKeys.employees.count });
}

/** Tab Thống kê — aggregate RPC; invalidate sau CRUD nhân viên. */
export function invalidateEmployeesStats(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: ['employees', 'stats'] });
}
