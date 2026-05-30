import { txt } from '@/lib/text';
import type { ExportTableOptions } from './types';
import { formatExportDisplayDate, formatExportFileDate } from './locale';

const NOTO_FONT_PATH = '/fonts/NotoSans-Regular.ttf';
const NOTO_VFS_NAME = 'NotoSans-Regular.ttf';
const NOTO_FAMILY = 'NotoSans';

let notoBase64Promise: Promise<string> | null = null;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function loadNotoSansBase64(): Promise<string> {
  if (!notoBase64Promise) {
    notoBase64Promise = fetch(NOTO_FONT_PATH)
      .then((res) => {
        if (!res.ok) throw new Error(`Không tải được font ${NOTO_FONT_PATH}`);
        return res.arrayBuffer();
      })
      .then(arrayBufferToBase64);
  }
  return notoBase64Promise;
}

export async function exportPdf(options: ExportTableOptions): Promise<void> {
  const { columns, rows, fileName, title, subtitle } = options;
  const [jspdfMod, autoTableMod, fontBase64] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
    loadNotoSansBase64(),
  ]);

  const { jsPDF } = jspdfMod;
  const autoTable = (autoTableMod as { default: typeof import('jspdf-autotable').default }).default;

  const doc = new jsPDF({
    orientation: columns.length > 5 ? 'l' : 'p',
    unit: 'mm',
    format: 'a4',
  });

  doc.addFileToVFS(NOTO_VFS_NAME, fontBase64);
  doc.addFont(NOTO_VFS_NAME, NOTO_FAMILY, 'normal');
  doc.setFont(NOTO_FAMILY, 'normal');

  const displayTitle = title ?? fileName.replace(/_/g, ' ');
  doc.setFontSize(12);
  doc.text(displayTitle, 14, 15);

  doc.setFontSize(8);
  doc.setTextColor(128);
  const sub =
    subtitle ??
    txt('shared.export.pdfHeader', {
      date: formatExportDisplayDate(),
      count: rows.length,
    });
  doc.text(sub, 14, 21);
  doc.setTextColor(0);

  autoTable(doc, {
    head: [columns.map((c) => c.label)],
    body: rows.map((row) => columns.map((c) => String(row[c.key] ?? ''))),
    startY: 26,
    styles: { font: NOTO_FAMILY, fontStyle: 'normal', fontSize: 7, cellPadding: 2 },
    headStyles: {
      font: NOTO_FAMILY,
      fontStyle: 'normal',
      fillColor: [59, 130, 246],
      fontSize: 7,
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  doc.save(`${fileName}_${formatExportFileDate()}.pdf`);
}
