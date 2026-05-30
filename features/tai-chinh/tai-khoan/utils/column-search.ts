import type { FinanceAccount } from '../core/types';

export function financeAccountMatchesColumnSearch(
  item: FinanceAccount,
  columnSearch: Record<string, string>,
): boolean {
  for (const [colId, raw] of Object.entries(columnSearch)) {
    const term = raw?.trim().toLowerCase();
    if (!term) continue;
    let hay = '';
    switch (colId) {
      case 'ten_quy':
        hay = item.ten_quy;
        break;
      case 'loai_quy':
        hay = item.loai_quy;
        break;
      case 'ten_chi_nhanh':
        hay = item.ten_chi_nhanh ?? '';
        break;
      case 'ngan_hang':
        hay = item.ngan_hang ?? '';
        break;
      case 'so_tai_khoan':
        hay = item.so_tai_khoan ?? '';
        break;
      case 'chu_tai_khoan':
        hay = item.chu_tai_khoan ?? '';
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
