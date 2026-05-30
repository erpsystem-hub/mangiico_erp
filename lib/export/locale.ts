import dayjs from 'dayjs';

/** Ngày trong tên file: DD-MM-YYYY */
export function formatExportFileDate(): string {
  return dayjs().format('DD-MM-YYYY');
}

/** Ngày hiển thị trong báo cáo: DD/MM/YYYY */
export function formatExportDisplayDate(): string {
  return dayjs().format('DD/MM/YYYY');
}
