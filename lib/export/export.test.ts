import { afterEach, describe, expect, it, vi } from 'vitest';
import { exportCsv } from './csv';
import { formatExportDisplayDate, formatExportFileDate } from './locale';
import { exportXlsx } from './xlsx';

const sampleColumns = [
  { key: 'ten', label: 'Tên phòng ban' },
  { key: 'trang_thai', label: 'Trạng thái' },
];
const sampleRows = [
  { ten: 'Phòng Hành chính', trang_thai: 'Đang hoạt động' },
  { ten: 'Nguyễn Văn A', trang_thai: 'Nghỉ phép' },
];

describe('lib/export locale', () => {
  it('formats dates for Vietnamese exports', () => {
    expect(formatExportFileDate()).toMatch(/^\d{2}-\d{2}-\d{4}$/);
    expect(formatExportDisplayDate()).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });
});

describe('exportCsv', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('writes UTF-8 BOM CSV with Vietnamese diacritics', async () => {
    const click = vi.fn();
    vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click,
    } as unknown as HTMLAnchorElement);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as unknown as Node);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as unknown as Node);
    URL.createObjectURL = vi.fn(() => 'blob:test');
    URL.revokeObjectURL = vi.fn();

    let blobContent = '';
    class BlobMock {
      size: number;
      constructor(parts: BlobPart[]) {
        blobContent = String(parts[0]);
        this.size = blobContent.length;
      }
    }
    vi.stubGlobal('Blob', BlobMock);

    await exportCsv({
      columns: sampleColumns,
      rows: sampleRows,
      fileName: 'Phong_Ban',
    });

    expect(blobContent.startsWith('\uFEFF')).toBe(true);
    expect(blobContent).toContain('Phòng Hành chính');
    expect(blobContent).toContain('Đang hoạt động');
    expect(blobContent).toContain('Nguyễn Văn A');
    expect(click).toHaveBeenCalled();
  });
});

describe('exportXlsx', () => {
  it('builds sheet with Vietnamese headers and Du_lieu sheet name', async () => {
    const writeFile = vi.fn();
    const bookAppendSheet = vi.fn();
    const aoaToSheet = vi.fn(() => ({ '!cols': [] }));
    vi.doMock('xlsx', () => ({
      default: {
        utils: {
          aoa_to_sheet: aoaToSheet,
          book_new: vi.fn(() => ({})),
          book_append_sheet: bookAppendSheet,
        },
        writeFile,
      },
    }));

    vi.resetModules();
    const { exportXlsx: exportXlsxFresh } = await import('./xlsx');

    await exportXlsxFresh({
      columns: sampleColumns,
      rows: sampleRows,
      fileName: 'Chuc_Vu',
    });

    expect(aoaToSheet).toHaveBeenCalledWith([
      ['Tên phòng ban', 'Trạng thái'],
      ['Phòng Hành chính', 'Đang hoạt động'],
      ['Nguyễn Văn A', 'Nghỉ phép'],
    ]);
    expect(bookAppendSheet).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      'Du_lieu',
    );
    expect(writeFile).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringMatching(/^Chuc_Vu_\d{2}-\d{2}-\d{4}\.xlsx$/),
    );
  });
});
