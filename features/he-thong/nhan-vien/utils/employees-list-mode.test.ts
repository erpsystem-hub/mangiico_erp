import { describe, expect, it } from 'vitest';
import { SERVER_PAGINATION_THRESHOLD } from '@/lib/constants/list-pagination';
import {
  resolveEmployeesListMode,
  resolveEmployeesPageParams,
} from './employees-list-mode';

describe('resolveEmployeesListMode', () => {
  it('uses client mode at or below threshold', () => {
    expect(resolveEmployeesListMode(0)).toBe('client');
    expect(resolveEmployeesListMode(SERVER_PAGINATION_THRESHOLD)).toBe('client');
  });

  it('uses server mode above threshold', () => {
    expect(resolveEmployeesListMode(SERVER_PAGINATION_THRESHOLD + 1)).toBe('server');
  });
});

describe('resolveEmployeesPageParams', () => {
  const sort = { column: 'ho_va_ten', direction: 'desc' as const };

  it('client mode fetches full list window', () => {
    const params = resolveEmployeesPageParams('client', 2, 25, sort);
    expect(params.limit).toBeGreaterThan(500);
    expect(params.offset).toBe(0);
    expect(params.orderBy).toBe('ten_tai_khoan');
  });

  it('server mode paginates by page', () => {
    const params = resolveEmployeesPageParams('server', 3, 25, sort);
    expect(params.limit).toBe(25);
    expect(params.offset).toBe(50);
    expect(params.orderBy).toBe('ho_va_ten');
    expect(params.ascending).toBe(false);
  });
});
