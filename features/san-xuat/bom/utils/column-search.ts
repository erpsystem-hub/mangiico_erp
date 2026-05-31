import type { BomItem } from '../core/types';

export function bomMatchesColumnSearch(
  item: BomItem,
  columnSearch: Record<string, string>,
): boolean {
  for (const [colId, term] of Object.entries(columnSearch)) {
    const t = term.trim().toLowerCase();
    if (!t) continue;
    let hay = '';
    switch (colId) {
      case 'ma_danh_muc':
        hay = item.ma_danh_muc;
        break;
      case 'ten_danh_muc':
        hay = item.ten_danh_muc;
        break;
      case 'ma_nguyen_lieu':
        hay = item.ma_nguyen_lieu;
        break;
      case 'ten_nguyen_lieu':
        hay = item.ten_nguyen_lieu;
        break;
      case 'don_vi_tinh':
        hay = item.don_vi_tinh;
        break;
      case 'ten_nhom_danh_muc':
        hay = item.ten_nhom_danh_muc;
        break;
      default:
        break;
    }
    if (!hay.toLowerCase().includes(t)) return false;
  }
  return true;
}

export function countBomColumnSearchActive(columnSearch: Record<string, string>): number {
  return Object.values(columnSearch).filter((v) => v.trim()).length;
}
