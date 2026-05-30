import type { MaterialCatalogItem } from '../core/types';

export function materialCatalogMatchesColumnSearch(
  item: MaterialCatalogItem,
  columnSearch: Record<string, string>,
): boolean {
  for (const [colId, term] of Object.entries(columnSearch)) {
    const t = term.trim().toLowerCase();
    if (!t) continue;
    let hay = '';
    switch (colId) {
      case 'ma_nguyen_lieu':
        hay = item.ma_nguyen_lieu;
        break;
      case 'ten_nguyen_lieu':
        hay = item.ten_nguyen_lieu;
        break;
      case 'ten_danh_muc':
        hay = item.ten_danh_muc;
        break;
      case 'ten_nhom_danh_muc':
        hay = item.ten_nhom_danh_muc;
        break;
      case 'mau_sac':
        hay = item.mau_sac ?? '';
        break;
      case 'don_vi_tinh':
        hay = item.don_vi_tinh;
        break;
      default:
        break;
    }
    if (!hay.toLowerCase().includes(t)) return false;
  }
  return true;
}

export function countMaterialCatalogColumnSearchActive(columnSearch: Record<string, string>): number {
  return Object.values(columnSearch).filter((v) => v.trim()).length;
}
