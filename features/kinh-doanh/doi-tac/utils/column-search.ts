import type { PartnerCategory } from '../core/types';

export const PARTNER_CATEGORY_COLUMN_IDS_WITH_MULTISELECT = [
  'trang_thai',
  'ten_danh_muc',
] as const;

function columnIdToValue(
  colId: string,
  item: PartnerCategory,
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

export function countPartnerCategoryColumnSearchActive(
  columnSearch: Record<string, string> | undefined,
): number {
  if (!columnSearch) return 0;
  const skip = PARTNER_CATEGORY_COLUMN_IDS_WITH_MULTISELECT as readonly string[];
  let n = 0;
  for (const [colId, q] of Object.entries(columnSearch)) {
    if (!q.trim()) continue;
    if (skip.includes(colId)) continue;
    n += 1;
  }
  return n;
}

export function partnerCategoryMatchesColumnSearch(
  item: PartnerCategory,
  columnSearch: Record<string, string> | undefined,
  parentName: string,
): boolean {
  if (!columnSearch) return true;
  const skip = PARTNER_CATEGORY_COLUMN_IDS_WITH_MULTISELECT as readonly string[];
  for (const [colId, q] of Object.entries(columnSearch)) {
    if (skip.includes(colId)) continue;
    const trimmed = q.trim();
    if (!trimmed) continue;
    const str = columnIdToValue(colId, item, parentName);
    if (!str.toLowerCase().includes(trimmed.toLowerCase())) return false;
  }
  return true;
}

export function partnerListMatchesColumnSearch(
  item: import('../core/types').PartnerListItem,
  columnSearch: Record<string, string>,
): boolean {
  for (const [colId, term] of Object.entries(columnSearch)) {
    const t = term.trim().toLowerCase();
    if (!t) continue;
    let hay = '';
    switch (colId) {
      case 'ma_doi_tac':
        hay = item.ma_doi_tac;
        break;
      case 'ten_doi_tac':
        hay = item.ten_doi_tac;
        break;
      case 'ten_danh_muc':
        hay = item.ten_danh_muc;
        break;
      case 'ten_nhom_danh_muc':
        hay = item.ten_nhom_danh_muc;
        break;
      case 'dien_thoai':
        hay = item.dien_thoai ?? '';
        break;
      case 'email':
        hay = item.email ?? '';
        break;
      case 'nguoi_lien_he':
        hay = item.nguoi_lien_he ?? '';
        break;
      default:
        break;
    }
    if (!hay.toLowerCase().includes(t)) return false;
  }
  return true;
}

export function countPartnerListColumnSearchActive(columnSearch: Record<string, string>): number {
  return Object.values(columnSearch).filter((v) => v.trim()).length;
}
