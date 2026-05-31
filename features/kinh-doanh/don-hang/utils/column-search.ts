import type { SalesOrder } from '../core/types';
import { formatCurrency } from '@/lib/utils';

export function salesOrderMatchesColumnSearch(
  item: SalesOrder,
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
      case 'ngay_dat':
        hay = item.ngay_dat;
        break;
      case 'tong_tien':
        hay = formatCurrency(item.tong_tien);
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
