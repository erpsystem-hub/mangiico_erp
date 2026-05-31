export const ORDER_LINE_BOM_SELECT = `
  id,
  don_hang_chi_tiet_id,
  nguyen_lieu_id,
  bom_mau_id,
  so_luong_dinh_muc,
  so_luong_tong,
  don_vi_tinh,
  ghi_chu,
  thu_tu,
  tg_tao,
  tg_cap_nhat,
  sx_danh_sach_nguyen_lieu (
    ma_nguyen_lieu,
    ten_nguyen_lieu,
    don_vi_tinh
  )
`;

export const ORDER_LINE_BOM_RETURNING = `
  id,
  don_hang_chi_tiet_id,
  nguyen_lieu_id,
  bom_mau_id,
  so_luong_dinh_muc,
  so_luong_tong,
  don_vi_tinh,
  ghi_chu,
  thu_tu,
  tg_tao,
  tg_cap_nhat
`;
