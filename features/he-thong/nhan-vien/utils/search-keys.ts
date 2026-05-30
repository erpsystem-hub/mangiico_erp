/**
 * Các trường cho ô tìm kiếm tổng (toolbar).
 * Gồm mọi cột hiển thị + trường enrich FK (ten_phong_ban, ten_chuc_vu…)
 * để tìm theo tên dù cột lưu id.
 */
export const NHAN_VIEN_SEARCHABLE_KEYS: string[] = [
  'ten_tai_khoan',
  'ho_va_ten',
  'ten_phong_ban',
  'ten_bo_phan',
  'ten_chuc_vu',
  'ten_chi_nhanh',
  'trang_thai',
];
