import type { ExportTableOptions } from './types';
import { formatExportFileDate } from './locale';

export async function exportCsv(options: ExportTableOptions): Promise<void> {
  const { columns, rows, fileName } = options;
  const headers = columns.map((c) => c.label);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      columns
        .map((col) => {
          const raw = row[col.key];
          let cell = raw === null || raw === undefined ? '' : String(raw);
          cell = cell.replace(/"/g, '""');
          if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
          return cell;
        })
        .join(','),
    ),
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}_${formatExportFileDate()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
