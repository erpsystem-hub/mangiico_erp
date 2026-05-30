import { useMemo, useEffect, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { SortState } from '@/store/createGenericStore';
import { queryKeys, EMPLOYEES_LIST_QUERY_PARAMS } from '@/lib/query-keys';
import { transactionalCrudListQueryOptions, supabaseListQueryRetryOptions } from '@/lib/supabase/query-config';
import { isSupabase } from '@/lib/data/config';
import { useSupabaseListEnabled } from '@/lib/supabase/use-supabase-list-enabled';
import {
  getEmployeeCount,
  getEmployees,
  getEmployeesPage,
} from '../services/nhan-vien-service';
import type { Employee } from '../core/types';
import {
  resolveEmployeesListMode,
  resolveEmployeesPageParams,
  sortToEmployeesQuery,
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

function useMockEmployeesList(
  page: number,
  pageSize: number,
  sort: SortState,
  queryEnabled: boolean,
) {
  const countQuery = useQuery({
    queryKey: queryKeys.employees.count,
    queryFn: getEmployeeCount,
    enabled: queryEnabled,
    ...transactionalCrudListQueryOptions,
    ...supabaseListQueryRetryOptions,
  });

  const totalCount = countQuery.data ?? 0;
  const mode = resolveEmployeesListMode(totalCount);
  const { orderBy, ascending } = sortToEmployeesQuery(sort);

  const clientKey = queryKeys.employees.list({
    limit: EMPLOYEES_LIST_QUERY_PARAMS.limit,
    offset: EMPLOYEES_LIST_QUERY_PARAMS.offset,
    orderBy: EMPLOYEES_LIST_QUERY_PARAMS.orderBy,
    ascending: EMPLOYEES_LIST_QUERY_PARAMS.ascending,
  });

  const serverKey = queryKeys.employees.page({
    limit: pageSize,
    offset: (page - 1) * pageSize,
    orderBy,
    ascending,
  });

  const listQuery = useQuery({
    queryKey: mode === 'server' ? serverKey : clientKey,
    queryFn: async () => {
      if (mode === 'server') {
        return getEmployeesPage({
          limit: pageSize,
          offset: (page - 1) * pageSize,
          orderBy,
          ascending,
        });
      }
      return getEmployees();
    },
    placeholderData: keepPreviousData,
    enabled: queryEnabled,
    ...transactionalCrudListQueryOptions,
    ...supabaseListQueryRetryOptions,
  });

  const { employees, total } = useMemo(() => {
    if (mode === 'server') {
      const pageResult = listQuery.data as { items: Employee[]; total: number } | undefined;
      return {
        employees: pageResult?.items ?? [],
        total: pageResult?.total ?? totalCount,
      };
    }
    const rows = (listQuery.data as Employee[] | undefined) ?? [];
    return { employees: rows, total: rows.length };
  }, [mode, listQuery.data, totalCount]);

  const isLoading =
    (countQuery.isPending && countQuery.data === undefined) ||
    (listQuery.isPending && listQuery.data === undefined);

  return {
    employees,
    total,
    mode,
    isLoading,
    isFetching: listQuery.isFetching || countQuery.isFetching,
    isError: countQuery.isError || listQuery.isError,
    error: (countQuery.error ?? listQuery.error ?? null) as Error | null,
    refetch: () => {
      void countQuery.refetch();
      void listQuery.refetch();
    },
  };
}

function useSupabaseEmployeesList(
  page: number,
  pageSize: number,
  sort: SortState,
  queryEnabled: boolean,
) {
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

  const isLoading = listQuery.isPending && listQuery.data === undefined;

  return {
    employees,
    total,
    mode: effectiveMode,
    isLoading,
    isFetching: listQuery.isFetching,
    isError: listQuery.isError,
    error: (listQuery.error ?? null) as Error | null,
    refetch: () => {
      void listQuery.refetch();
    },
  };
}

export function useEmployeesList({
  page,
  pageSize,
  sort,
  enabled = true,
}: UseEmployeesListParams): UseEmployeesListResult {
  const queryEnabled = useSupabaseListEnabled(enabled);

  const mockResult = useMockEmployeesList(page, pageSize, sort, queryEnabled && !isSupabase());
  const supabaseResult = useSupabaseEmployeesList(page, pageSize, sort, queryEnabled && isSupabase());

  const result = isSupabase() ? supabaseResult : mockResult;

  return {
    ...result,
    isServerPaginated: result.mode === 'server',
  };
}
