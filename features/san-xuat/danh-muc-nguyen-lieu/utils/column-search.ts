import type { MaterialCategory } from '../core/types';

export const MATERIAL_CATEGORY_COLUMN_IDS_WITH_MULTISELECT = [
  'trang_thai',
  'ten_danh_muc',
] as const;

function columnIdToValue(
  colId: string,
  item: MaterialCategory,
  parentName: string,
): string {
  switch (colId) {
    case 'thu_tu':
      return String(item.thu_tu);
    case 'ten_danh_muc':
      return item.ten_danh_muc;
    case 'ma_danh_muc':
      return item.ma_danh_muc ?? '';
    case 'mo_ta':
      return item.mo_ta ?? '';
    case 'cap_do':
      return String(item.cap_do);
    case 'ten_danh_muc_cha':
      return parentName;
    case 'tg_cap_nhat':
      return item.tg_cap_nhat ?? '';
    default:
      return '';
  }
}

export function countMaterialCategoryColumnSearchActive(
  columnSearch: Record<string, string> | undefined,
): number {
  if (!columnSearch) return 0;
  const skip = MATERIAL_CATEGORY_COLUMN_IDS_WITH_MULTISELECT as readonly string[];
  let n = 0;
  for (const [colId, q] of Object.entries(columnSearch)) {
    if (!q.trim()) continue;
    if (skip.includes(colId)) continue;
    n += 1;
  }
  return n;
}

export function materialCategoryMatchesColumnSearch(
  item: MaterialCategory,
  columnSearch: Record<string, string> | undefined,
  parentName: string,
): boolean {
  if (!columnSearch) return true;
  const skip = MATERIAL_CATEGORY_COLUMN_IDS_WITH_MULTISELECT as readonly string[];
  for (const [colId, q] of Object.entries(columnSearch)) {
    if (skip.includes(colId)) continue;
    const trimmed = q.trim();
    if (!trimmed) continue;
    const str = columnIdToValue(colId, item, parentName);
    if (!str.toLowerCase().includes(trimmed.toLowerCase())) return false;
  }
  return true;
}
