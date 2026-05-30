import { useMemo, useEffect, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { SortState } from '@/store/createGenericStore';
import { queryKeys } from '@/lib/query-keys';
import { transactionalCrudListQueryOptions, supabaseListQueryRetryOptions } from '@/lib/supabase/query-config';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import { useSessionStatus } from '@/hooks/use-auth-session';
import { getEmployeesPage } from '../services/nhan-vien-service';
import type { Employee } from '../core/types';
import {
  resolveEmployeesListMode,
  resolveEmployeesPageParams,
  type EmployeesListMode,
} from '../utils/employees-list-mode';

export type { EmployeesListMode };

export type UseEmployeesListParams = {
  page: number;
  pageSize: number;
  sort: SortState;
  enabled?: boolean;
};

export type UseEmployeesListResult = {
  employees: Employee[];
  total: number;
  mode: EmployeesListMode;
  isLoading: boolean;
  isFetching: boolean;
  isServerPaginated: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
};

export function useEmployeesList({
  page,
  pageSize,
  sort,
  enabled = true,
}: UseEmployeesListParams): UseEmployeesListResult {
  const queryEnabled = useSupabaseReady(enabled);
  const sessionStatus = useSessionStatus();
  const [resolvedTotal, setResolvedTotal] = useState<number | undefined>(undefined);

  const mode = resolveEmployeesListMode(resolvedTotal ?? 0);

  const pageParams = useMemo(
    () => resolveEmployeesPageParams(mode, page, pageSize, sort),
    [mode, page, pageSize, sort],
  );

  const listQuery = useQuery({
    queryKey: queryKeys.employees.page(pageParams),
    queryFn: () => getEmployeesPage(pageParams),
    placeholderData: keepPreviousData,
    enabled: queryEnabled,
    ...transactionalCrudListQueryOptions,
    ...supabaseListQueryRetryOptions,
  });

  useEffect(() => {
    if (listQuery.data?.total != null) {
      setResolvedTotal(listQuery.data.total);
    }
  }, [listQuery.data?.total]);

  useEffect(() => {
    setResolvedTotal(undefined);
  }, [sort.column, sort.direction, pageSize]);

  const employees = listQuery.data?.items ?? [];
  const total = listQuery.data?.total ?? resolvedTotal ?? 0;
  const effectiveMode = resolveEmployeesListMode(total);
  const isLoading =
    (listQuery.isFetching && listQuery.data === undefined) ||
    (sessionStatus === 'initializing' && listQuery.data === undefined);

  return {
    employees,
    total,
    mode: effectiveMode,
    isLoading,
    isFetching: listQuery.isFetching,
    isServerPaginated: effectiveMode === 'server',
    isError: listQuery.isError,
    error: (listQuery.error ?? null) as Error | null,
    refetch: () => {
      void listQuery.refetch();
    },
  };
}
