/**
 * Generic stats report export (xlsx / pdf / docx) — reusable across modules.
 */
import { txt } from '@/lib/text';
import { formatExportFileDate } from './locale';

export interface StatsReportKpi {
  label: string;
  value: string;
  ratio?: string;
}

export interface StatsReportSection {
  title: string;
  columns: string[];
  rows: (string | number)[][];
}

export interface StatsReport {
  fileBaseName: string;
  meta: { title: string; lines: [string, string][]; exportedAt: string };
  kpis: StatsReportKpi[];
  sections: StatsReportSection[];
}

export type StatsExportFormat = 'xlsx' | 'pdf' | 'docx';

const PRIMARY_COLOR: [number, number, number] = [59, 130, 246];
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

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function buildFileName(baseName: string, ext: string): string {
  return `${baseName}_${formatExportFileDate()}.${ext}`;
}

async function exportStatsXlsx(report: StatsReport): Promise<void> {
  const XLSX = await import('xlsx');

  const overviewRows: (string | number)[][] = [
    [report.meta.title, ''],
    ...report.meta.lines.map(([k, v]) => [k, v]),
    [txt('employee.report.exportDate'), report.meta.exportedAt],
    ['', ''],
    [txt('employee.report.indicator'), txt('employee.report.value'), txt('employee.report.ratio')],
    ...report.kpis.map((k) => [k.label, k.value, k.ratio ?? '']),
  ];

  const wsOverview = XLSX.utils.aoa_to_sheet(overviewRows);
  wsOverview['!cols'] = [{ wch: 22 }, { wch: 12 }, { wch: 10 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsOverview, txt('employee.report.overviewSheet'));

  for (const section of report.sections) {
    const sectionRows: (string | number)[][] = [section.columns, ...section.rows];
    const ws = XLSX.utils.aoa_to_sheet(sectionRows);
    ws['!cols'] = section.columns.map((_, i) => ({ wch: i === 0 ? 24 : 10 }));
    const sheetName = section.title.slice(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  XLSX.writeFile(wb, buildFileName(report.fileBaseName, 'xlsx'));
}

async function exportStatsPdf(report: StatsReport): Promise<void> {
  const [{ jsPDF }, autoTableModule, fontBase64] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
    loadNotoSansBase64(),
  ]);
  const autoTable = autoTableModule.default;

  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  doc.addFileToVFS(NOTO_VFS_NAME, fontBase64);
  doc.addFont(NOTO_VFS_NAME, NOTO_FAMILY, 'normal');
  doc.setFont(NOTO_FAMILY, 'normal');

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 14;
  let y = 14;

  doc.setFontSize(14);
  doc.text(report.meta.title, pageWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(9);
  doc.setTextColor(100);
  const periodLine = report.meta.lines.find(([k]) => k === txt('employee.report.period'));
  doc.text(
    `${periodLine ? `${periodLine[0]} ${periodLine[1]}  •  ` : ''}${txt('employee.report.pdfExportDate')} ${report.meta.exportedAt}`,
    pageWidth / 2,
    y,
    { align: 'center' },
  );
  doc.setTextColor(0);
  y += 6;

  const filterLines = report.meta.lines.filter(
    ([k]) => k !== txt('employee.report.period'),
  );
  if (filterLines.length > 0) {
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
      filterLines.map(([k, v]) => `${k} ${v}`).join('  •  '),
      marginX,
      y,
    );
    doc.setTextColor(0);
    y += 5;
  }

  y += 2;

  autoTable(doc, {
    startY: y,
    head: [[txt('employee.report.indicator'), txt('employee.report.value'), txt('employee.report.ratio')]],
    body: report.kpis.map((k) => [k.label, k.value, k.ratio ?? '—']),
    theme: 'grid',
    styles: { font: NOTO_FAMILY, fontStyle: 'normal', fontSize: 8, cellPadding: 2 },
    headStyles: {
      font: NOTO_FAMILY,
      fontStyle: 'normal',
      fillColor: PRIMARY_COLOR,
      fontSize: 8,
      textColor: 255,
    },
    margin: { left: marginX, right: marginX },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 8;

  for (const section of report.sections) {
    if (section.rows.length === 0) continue;
    if (y > 220) {
      doc.addPage();
      y = 14;
    }
    doc.setFontSize(10);
    doc.text(section.title, marginX, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [section.columns],
      body: section.rows.map((row) => row.map(String)),
      theme: 'grid',
      styles: { font: NOTO_FAMILY, fontStyle: 'normal', fontSize: 7, cellPadding: 2 },
      headStyles: {
        font: NOTO_FAMILY,
        fontStyle: 'normal',
        fillColor: PRIMARY_COLOR,
        fontSize: 7,
        textColor: 255,
      },
      margin: { left: marginX, right: marginX },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  const pdfBlob = doc.output('blob');
  downloadBlob(pdfBlob, buildFileName(report.fileBaseName, 'pdf'));
}

async function exportStatsDocx(report: StatsReport): Promise<void> {
  const {
    Document,
    Packer,
    Paragraph,
    Table,
    TableRow,
    TableCell,
    HeadingLevel,
    TextRun,
    WidthType,
    AlignmentType,
  } = await import('docx');

  const metaParagraphs = [
    new Paragraph({
      text: report.meta.title,
      heading: HeadingLevel.HEADING_1,
    }),
    ...report.meta.lines.map(
      ([k, v]) =>
        new Paragraph({
          children: [
            new TextRun({ text: `${k} `, bold: true }),
            new TextRun(v),
          ],
        }),
    ),
    new Paragraph({
      children: [
        new TextRun({ text: `${txt('employee.report.exportDate')} `, bold: true }),
        new TextRun(report.meta.exportedAt),
      ],
    }),
    new Paragraph({ text: '' }),
  ];

  const kpiHeader = new TableRow({
    children: [
      txt('employee.report.indicator'),
      txt('employee.report.value'),
      txt('employee.report.ratio'),
    ].map(
      (text) =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
          width: { size: 33, type: WidthType.PERCENTAGE },
        }),
    ),
  });

  const kpiRows = report.kpis.map(
    (k) =>
      new TableRow({
        children: [k.label, k.value, k.ratio ?? '—'].map(
          (text) =>
            new TableCell({
              children: [new Paragraph(String(text))],
            }),
        ),
      }),
  );

  const kpiTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [kpiHeader, ...kpiRows],
  });

  const sectionBlocks = report.sections.flatMap((section) => {
    if (section.rows.length === 0) return [];
    const header = new TableRow({
      children: section.columns.map(
        (col) =>
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: col, bold: true })] })],
          }),
      ),
    });
    const dataRows = section.rows.map(
      (row) =>
        new TableRow({
          children: row.map(
            (cell) =>
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun(String(cell))],
                    alignment: typeof cell === 'number' ? AlignmentType.CENTER : AlignmentType.LEFT,
                  }),
                ],
              }),
          ),
        }),
    );
    return [
      new Paragraph({ text: section.title, heading: HeadingLevel.HEADING_2 }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [header, ...dataRows],
      }),
      new Paragraph({ text: '' }),
    ];
  });

  const doc = new Document({
    sections: [
      {
        children: [...metaParagraphs, kpiTable, new Paragraph({ text: '' }), ...sectionBlocks],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, buildFileName(report.fileBaseName, 'docx'));
}

export async function exportStatsReport(
  format: StatsExportFormat,
  report: StatsReport,
): Promise<void> {
  switch (format) {
    case 'xlsx':
      await exportStatsXlsx(report);
      break;
    case 'pdf':
      await exportStatsPdf(report);
      break;
    case 'docx':
      await exportStatsDocx(report);
      break;
    default: {
      const _exhaustive: never = format;
      return _exhaustive;
    }
  }
}
