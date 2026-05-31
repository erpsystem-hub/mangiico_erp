export const SALES_ORDER_SELECT_LIST = `
  id,
  ma_don_hang,
  khach_hang_id,
  chi_nhanh_id,
  nhan_vien_id,
  ngay_dat,
  ngay_giao_du_kien,
  dia_chi_giao,
  ghi_chu,
  trang_thai,
  tong_tien,
  tg_tao,
  tg_cap_nhat,
  khach_hang:kd_danh_sach_doi_tac!kd_don_hang_khach_hang_id_fkey (
    ma_doi_tac,
    ten_doi_tac
  ),
  chi_nhanh:var_chi_nhanh (
    ten_chi_nhanh
  )
`;

export const SALES_ORDER_LINE_SELECT = `
  id,
  don_hang_id,
  san_pham_id,
  so_luong,
  don_vi_tinh,
  don_gia,
  thanh_tien,
  ghi_chu,
  thu_tu,
  tg_tao,
  tg_cap_nhat,
  san_pham:sx_danh_sach_san_pham (
    ma_san_pham,
    ten_san_pham
  )
`;

export const SALES_ORDER_SELECT_DETAIL = `
  ${SALES_ORDER_SELECT_LIST},
  lines:kd_don_hang_chi_tiet (
    ${SALES_ORDER_LINE_SELECT}
  )
`;
