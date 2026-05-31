export const PURCHASE_ORDER_SELECT_LIST = `
  id,
  ma_don_mua,
  nha_cung_cap_id,
  chi_nhanh_id,
  nhan_vien_id,
  ngay_dat,
  ngay_giao_du_kien,
  dia_chi_nhan,
  ghi_chu,
  trang_thai,
  tong_tien,
  tg_tao,
  tg_cap_nhat,
  nha_cung_cap:kd_danh_sach_doi_tac!kd_don_mua_nha_cung_cap_id_fkey (
    ma_doi_tac,
    ten_doi_tac
  ),
  chi_nhanh:var_chi_nhanh (
    ten_chi_nhanh
  )
`;

export const PURCHASE_ORDER_LINE_SELECT = `
  id,
  don_mua_id,
  nguyen_lieu_id,
  so_luong,
  don_vi_tinh,
  don_gia,
  thanh_tien,
  ghi_chu,
  thu_tu,
  tg_tao,
  tg_cap_nhat,
  nguyen_lieu:sx_danh_sach_nguyen_lieu (
    ma_nguyen_lieu,
    ten_nguyen_lieu
  )
`;

export const PURCHASE_ORDER_SELECT_DETAIL = `
  ${PURCHASE_ORDER_SELECT_LIST},
  lines:kd_don_mua_chi_tiet (
    ${PURCHASE_ORDER_LINE_SELECT}
  )
`;
