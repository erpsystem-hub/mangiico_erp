export type ExportFormat = 'xlsx' | 'csv' | 'pdf';

export interface ExportColumn {
  key: string;
  label: string;
}

export interface ExportTableOptions {
  columns: ExportColumn[];
  rows: Record<string, unknown>[];
  /** Tên file không gồn phần mở rộng */
  fileName: string;
  /** Tiêu đề hiển thị trên PDF (tùy chọn) */
  title?: string;
  /** Dòng phụ dưới tiêu đề PDF (tùy chọn) */
  subtitle?: string;
}
