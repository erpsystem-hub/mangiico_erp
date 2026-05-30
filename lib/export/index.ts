export type { ExportColumn, ExportFormat, ExportTableOptions } from './types';
export { formatExportDisplayDate, formatExportFileDate } from './locale';
export { exportXlsx } from './xlsx';
export { exportCsv } from './csv';
export { exportPdf } from './pdf';
export {
  exportStatsReport,
  type StatsReport,
  type StatsReportKpi,
  type StatsReportSection,
  type StatsExportFormat,
} from './stats-report';

import type { ExportFormat, ExportTableOptions } from './types';
import { exportCsv } from './csv';
import { exportPdf } from './pdf';
import { exportXlsx } from './xlsx';

export async function exportTable(format: ExportFormat, options: ExportTableOptions): Promise<void> {
  switch (format) {
    case 'xlsx':
      await exportXlsx(options);
      break;
    case 'csv':
      await exportCsv(options);
      break;
    case 'pdf':
      await exportPdf(options);
      break;
    default: {
      const _exhaustive: never = format;
      return _exhaustive;
    }
  }
}
