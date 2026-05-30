export const LOAI_DANH_MUC = ['Thu', 'Chi'] as const;
export type LoaiDanhMuc = (typeof LOAI_DANH_MUC)[number];

export function parseLoaiDanhMucImport(raw: unknown): LoaiDanhMuc {
  const s = String(raw ?? '').trim();
  if (s === 'Chi' || s.toLowerCase() === 'chi') return 'Chi';
  return 'Thu';
}

export function isLoaiDanhMuc(raw: unknown): raw is LoaiDanhMuc {
  return raw === 'Thu' || raw === 'Chi';
}
