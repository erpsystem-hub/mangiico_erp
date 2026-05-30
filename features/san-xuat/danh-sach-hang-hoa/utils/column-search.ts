import type { ProductCatalogItem } from '../core/types';

export function productCatalogMatchesColumnSearch(
  item: ProductCatalogItem,
  columnSearch: Record<string, string>,
): boolean {
  for (const [colId, term] of Object.entries(columnSearch)) {
    const t = term.trim().toLowerCase();
    if (!t) continue;
    let hay = '';
    switch (colId) {
      case 'ma_san_pham':
        hay = item.ma_san_pham;
        break;
      case 'ten_san_pham':
        hay = item.ten_san_pham;
        break;
      case 'ten_danh_muc':
        hay = item.ten_danh_muc;
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

export function countProductCatalogColumnSearchActive(columnSearch: Record<string, string>): number {
  return Object.values(columnSearch).filter((v) => v.trim()).length;
}
