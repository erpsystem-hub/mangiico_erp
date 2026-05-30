import { describe, expect, it } from 'vitest';
import {
  parseEmployeeStatsServerPayload,
  trendMonthToLabel,
} from '@/features/he-thong/nhan-vien/utils/employee-stats-server';

describe('parseEmployeeStatsServerPayload', () => {
  it('coerces RPC JSONB to typed payload', () => {
    const result = parseEmployeeStatsServerPayload({
      summary: { tong: 100, hoat_dong: 80, khoa: 20 },
      new_in_period: 5,
      yoy: { tong: 90, hoat_dong: 70 },
      delta: { new_this_month: 3, new_prev_month: 2 },
      by_phong_ban: [{ id_phong_ban: 1, tong: 50, hoat_dong: 40, khoa: 10 }],
      by_chuc_vu: [{ id_chuc_vu: 2, so_nhan_vien: 30 }],
      trend_12m: [{ thang: '2026-05', so_luong: 4 }],
    });
    expect(result.summary.tong).toBe(100);
    expect(result.by_phong_ban[0]?.hoat_dong).toBe(40);
    expect(result.trend_12m[0]?.so_luong).toBe(4);
  });

  it('returns zeros for missing fields', () => {
    const result = parseEmployeeStatsServerPayload(null);
    expect(result.summary.tong).toBe(0);
    expect(result.by_phong_ban).toEqual([]);
  });
});

describe('trendMonthToLabel', () => {
  it('formats YYYY-MM as Tm/yy', () => {
    expect(trendMonthToLabel('2026-05')).toBe('T5/26');
  });
});
