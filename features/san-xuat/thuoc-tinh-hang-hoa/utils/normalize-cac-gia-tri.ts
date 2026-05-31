/** Chuẩn hoá mảng giá trị thuộc tính: trim, bỏ rỗng, không trùng (không phân biệt hoa thường). */
export function normalizeCacGiaTri(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of raw) {
    const s = String(item ?? '').trim();
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(s);
  }
  return result;
}

export function formatCacGiaTriDisplay(values: string[] | undefined | null): string {
  const list = values ?? [];
  if (list.length === 0) return '';
  return list.join(', ');
}
