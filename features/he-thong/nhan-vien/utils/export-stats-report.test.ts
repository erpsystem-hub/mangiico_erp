import { describe, expect, it } from 'vitest';
import { Users } from 'lucide-react';
import { buildEmployeeStatsReport } from '@/features/he-thong/nhan-vien/utils/export-stats-report';
import type { KpiItem } from '@/features/he-thong/nhan-vien/core/stats-types';

const sampleKpis: KpiItem[] = [
  {
    id: 'total',
    label: 'Tổng nhân viên',
    value: 42,
    pct: '100%',
    icon: Users,
    color: 'text-primary',
    bg: 'bg-primary/10',
    delta: null,
  },
  {
    id: 'active',
    label: 'Hoạt động',
    value: 40,
    pct: '95%',
    icon: Users,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    delta: 2,
  },
];
describe('buildEmployeeStatsReport', () => {
  it('builds StatsReport with meta, kpis and department section', () => {
    const report = buildEmployeeStatsReport(
      {
        dateRangeLabel: 'Tất cả',
        filterDeptLabels: [],
        filterStatusLabels: ['Hoạt động'],
        exportedAt: '30/05/2026 10:00',
      },
      sampleKpis,
      [
        { name: 'Phòng Hành chính', total: 10, active: 9, locked: 1, rate: '90' },
        { name: 'Phòng Kế toán', total: 5, active: 5, locked: 0, rate: '100' },
      ],
    );

    expect(report.fileBaseName).toBe('Bao_cao_Thong_ke_Nhan_su');
    expect(report.meta.title).toBeTruthy();
    expect(report.meta.lines).toHaveLength(3);
    expect(report.meta.lines[0][1]).toBe('Tất cả');
    expect(report.kpis).toHaveLength(2);
    expect(report.kpis[0].value).toBe('42');
    expect(report.sections).toHaveLength(1);
    expect(report.sections[0].rows).toHaveLength(2);
    expect(report.sections[0].rows[0][0]).toBe('Phòng Hành chính');
  });
});

describe('getStatsTableScrollMaxHeight', () => {
  it('returns css max-height for visible rows', async () => {
    const { getStatsTableScrollMaxHeight } = await import(
      '@/components/shared/stats/table-scroll'
    );
    expect(getStatsTableScrollMaxHeight(10)).toContain('10 *');
    expect(getStatsTableScrollMaxHeight(5)).toContain('5 *');
  });
});
