import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { masterDataQueryOptions } from '@/lib/supabase/query-config';
import { getEmployeeStatsFiltered } from '../services/nhan-vien-service';
import type { EmployeeStatsFilterParams } from '../core/stats-types';
import {
  statsDateToEndOfDayIso,
  statsDateToStartOfDayIso,
} from '../utils/employee-stats-server';

export type UseEmployeeStatsQueryParams = EmployeeStatsFilterParams & {
  enabled?: boolean;
};

export function useEmployeeStatsQuery({
  asAt,
  rangeStart,
  rangeEnd,
  filterDept,
  filterStatus,
  enabled = true,
}: UseEmployeeStatsQueryParams) {
  const asAtIso = statsDateToEndOfDayIso(asAt);
  const rangeStartIso = statsDateToStartOfDayIso(rangeStart);
  const rangeEndIso = statsDateToEndOfDayIso(rangeEnd);

  return useQuery({
    queryKey: queryKeys.employees.stats({
      asAt: asAtIso,
      rangeStart: rangeStartIso,
      rangeEnd: rangeEndIso,
      filterDept: [...filterDept].sort(),
      filterStatus: [...filterStatus].sort(),
    }),
    queryFn: () =>
      getEmployeeStatsFiltered({
        asAt,
        rangeStart,
        rangeEnd,
        filterDept,
        filterStatus,
      }),
    enabled,
    ...masterDataQueryOptions,
    staleTime: 60_000,
  });
}
