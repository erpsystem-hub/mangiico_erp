import type { MaterialCategory } from '../core/types';

function parentName(item: MaterialCategory, all: MaterialCategory[]): string {
  if (!item.cha_id) return '';
  return all.find((p) => p.id === item.cha_id)?.ten_danh_muc ?? '';
}

export function compareMaterialCategories(
  a: MaterialCategory,
  b: MaterialCategory,
  column: string,
  all: MaterialCategory[],
): number {
  switch (column) {
    case 'thu_tu':
      return a.thu_tu - b.thu_tu;
    case 'ten_danh_muc':
    case 'ma_danh_muc':
      return a.ten_danh_muc.localeCompare(b.ten_danh_muc, 'vi');
    case 'ten_danh_muc_cha':
      return parentName(a, all).localeCompare(parentName(b, all), 'vi');
    case 'mo_ta':
      return (a.mo_ta ?? '').localeCompare(b.mo_ta ?? '', 'vi');
    case 'cap_do':
      return a.cap_do - b.cap_do;
    case 'trang_thai':
      return a.trang_thai.localeCompare(b.trang_thai, 'vi');
    case 'tg_cap_nhat':
      return (a.tg_cap_nhat ?? '').localeCompare(b.tg_cap_nhat ?? '', 'vi');
    default:
      return 0;
  }
}
