import { SERVER_PAGINATION_THRESHOLD } from '@/lib/constants/list-pagination';
import { EMPLOYEES_LIST_QUERY_PARAMS } from '@/lib/query-keys';
import type { SortState } from '@/store/createGenericStore';

export type EmployeesListMode = 'client' | 'server';

export function resolveEmployeesListMode(total: number): EmployeesListMode {
  return total > SERVER_PAGINATION_THRESHOLD ? 'server' : 'client';
}

export function sortToEmployeesQuery(sort: SortState) {
  const orderBy =
    sort.column && sort.column.length > 0 ? sort.column : EMPLOYEES_LIST_QUERY_PARAMS.orderBy;
  const ascending = sort.direction !== 'desc';
  return { orderBy, ascending };
}

export function resolveEmployeesPageParams(
  mode: EmployeesListMode,
  page: number,
  pageSize: number,
  sort: SortState,
) {
  const { orderBy, ascending } = sortToEmployeesQuery(sort);
  if (mode === 'server') {
    return {
      limit: pageSize,
      offset: (page - 1) * pageSize,
      orderBy,
      ascending,
    };
  }
  return {
    limit: EMPLOYEES_LIST_QUERY_PARAMS.limit,
    offset: EMPLOYEES_LIST_QUERY_PARAMS.offset,
    orderBy: EMPLOYEES_LIST_QUERY_PARAMS.orderBy,
    ascending: EMPLOYEES_LIST_QUERY_PARAMS.ascending,
  };
}
