import { txt } from '@/lib/text';
import type { ExportTableOptions } from './types';
import { formatExportFileDate } from './locale';

export async function exportXlsx(options: ExportTableOptions): Promise<void> {
  const { columns, rows, fileName } = options;
  const mod = await import('xlsx');
  const XLSX = mod.default ?? mod;

  const wsData = [
    columns.map((c) => c.label),
    ...rows.map((row) => columns.map((c) => row[c.key] ?? '')),
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = columns.map((col) => ({
    wch:
      Math.max(
        col.label.length,
        ...rows.slice(0, 50).map((r) => String(r[col.key] ?? '').length),
      ) + 2,
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, txt('shared.export.sheetName'));
  XLSX.writeFile(wb, `${fileName}_${formatExportFileDate()}.xlsx`);
}
