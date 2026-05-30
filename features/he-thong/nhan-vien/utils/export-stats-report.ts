/**
 * Adapter: build Employee Stats report and export via lib/export/stats-report.
 */
import type { StatsExportMeta, DeptSummaryRow, KpiItem } from '../core/stats-types';
import {
  exportStatsReport,
  type StatsReport,
  type StatsExportFormat,
} from '@/lib/export/stats-report';
import { txt } from '@/lib/text';

export type { StatsExportFormat };

export function buildEmployeeStatsReport(
  meta: StatsExportMeta,
  kpis: KpiItem[],
  deptSummary: DeptSummaryRow[],
): StatsReport {
  return {
    fileBaseName: 'Bao_cao_Thong_ke_Nhan_su',
    meta: {
      title: txt('employee.report.pdfTitle'),
      lines: [
        [txt('employee.report.period'), meta.dateRangeLabel],
        [
          txt('employee.report.departmentFilter'),
          meta.filterDeptLabels.length
            ? meta.filterDeptLabels.join(', ')
            : txt('employee.report.allFilter'),
        ],
        [
          txt('employee.report.statusFilter'),
          meta.filterStatusLabels.length
            ? meta.filterStatusLabels.join(', ')
            : txt('employee.report.allFilter'),
        ],
      ],
      exportedAt: meta.exportedAt,
    },
    kpis: kpis.map((k) => ({
      label: k.label,
      value: String(k.value),
      ratio: k.pct ?? undefined,
    })),
    sections: [
      {
        title: txt('employee.report.pdfByDepartment'),
        columns: [
          txt('employee.stats.department'),
          txt('employee.stats.total'),
          txt('employee.stats.workingShort'),
          txt('employee.stats.lockedShort'),
          txt('employee.report.activeRatePercent'),
        ],
        rows: deptSummary.map((r) => [r.name, r.total, r.active, r.locked, r.rate]),
      },
    ],
  };
}

export async function exportEmployeeStats(
  format: StatsExportFormat,
  meta: StatsExportMeta,
  kpis: KpiItem[],
  deptSummary: DeptSummaryRow[],
): Promise<void> {
  const report = buildEmployeeStatsReport(meta, kpis, deptSummary);
  await exportStatsReport(format, report);
}

/** @deprecated Use exportEmployeeStats('xlsx', ...) */
export async function exportStatsToExcel(
  meta: StatsExportMeta,
  kpis: KpiItem[],
  deptSummary: DeptSummaryRow[],
): Promise<void> {
  await exportEmployeeStats('xlsx', meta, kpis, deptSummary);
}

/** @deprecated Use exportEmployeeStats('pdf', ...) */
export async function exportStatsToPdf(
  meta: StatsExportMeta,
  kpis: KpiItem[],
  deptSummary: DeptSummaryRow[],
): Promise<void> {
  await exportEmployeeStats('pdf', meta, kpis, deptSummary);
}
