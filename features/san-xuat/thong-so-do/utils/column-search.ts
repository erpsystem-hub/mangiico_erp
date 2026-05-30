import type { MeasurementSpec } from '../core/types';

export function measurementSpecMatchesColumnSearch(
  item: MeasurementSpec,
  columnSearch: Record<string, string>,
): boolean {
  for (const [colId, raw] of Object.entries(columnSearch)) {
    const term = raw?.trim().toLowerCase();
    if (!term) continue;
    let hay = '';
    switch (colId) {
      case 'ten_hien_thi':
        hay = item.ten_hien_thi;
        break;
      case 'don_vi':
        hay = item.don_vi;
        break;
      default:
        continue;
    }
    if (!hay.toLowerCase().includes(term)) return false;
  }
  return true;
}

export function countColumnSearchActive(columnSearch: Record<string, string>): number {
  return Object.values(columnSearch).filter((v) => v.trim() !== '').length;
}
