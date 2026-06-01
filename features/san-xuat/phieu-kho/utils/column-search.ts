import type { WarehouseSlipListItem } from '../core/types';

export function warehouseSlipMatchesColumnSearch(
  item: WarehouseSlipListItem,
  columnSearch: Record<string, string>,
): boolean {
  for (const [colId, raw] of Object.entries(columnSearch)) {
    const q = raw?.trim().toLowerCase();
    if (!q) continue;
    let hay = '';
    switch (colId) {
      case 'ma_phieu_kho':
        hay = item.ma_phieu_kho;
        break;
      case 'loai_phieu':
        hay = item.loai_phieu;
        break;
      case 'muc_dich':
        hay = item.muc_dich;
        break;
      case 'ten_kho':
        hay = `${item.ten_kho} ${item.ma_kho}`;
        break;
      case 'ma_don_hang':
        hay = item.ma_don_hang ?? '';
        break;
      case 'ma_don_mua':
        hay = item.ma_don_mua ?? '';
        break;
      case 'so_dong':
        hay = String(item.so_dong);
        break;
      case 'trang_thai':
        hay = item.trang_thai;
        break;
      case 'ngay_phieu':
        hay = item.ngay_phieu;
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
