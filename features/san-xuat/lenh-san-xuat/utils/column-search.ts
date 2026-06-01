import type { ProductionOrderListItem } from '../core/types';

export function productionOrderMatchesColumnSearch(
  item: ProductionOrderListItem,
  columnSearch: Record<string, string>,
): boolean {
  for (const [colId, raw] of Object.entries(columnSearch)) {
    const q = raw?.trim().toLowerCase();
    if (!q) continue;
    let hay = '';
    switch (colId) {
      case 'ma_don_hang':
        hay = item.ma_don_hang;
        break;
      case 'ten_khach_hang':
        hay = `${item.ten_khach_hang} ${item.ma_khach_hang}`;
        break;
      case 'so_dong_sp':
        hay = String(item.so_dong_sp);
        break;
      case 'ngay_dat':
        hay = item.ngay_dat;
        break;
      case 'ngay_giao_du_kien':
        hay = item.ngay_giao_du_kien ?? '';
        break;
      case 'trang_thai':
        hay = item.trang_thai;
        break;
      case 'tg_cap_nhat':
        hay = item.tg_cap_nhat;
        break;
      default:
        hay = String((item as unknown as Record<string, unknown>)[colId] ?? '');
    }
    if (!hay.toLowerCase().includes(q)) return false;
  }
  return true;
}
