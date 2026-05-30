import type { Branch } from '../core/types';

export function branchMatchesColumnSearch(item: Branch, columnSearch: Record<string, string>): boolean {
  for (const [key, raw] of Object.entries(columnSearch)) {
    const q = raw.trim().toLowerCase();
    if (!q) continue;
    const val = String((item as Record<string, unknown>)[key] ?? '').toLowerCase();
    if (!val.includes(q)) return false;
  }
  return true;
}

export function countColumnSearchActive(columnSearch: Record<string, string>): number {
  return Object.values(columnSearch).filter((v) => v.trim() !== '').length;
}
