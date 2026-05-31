export const PRODUCTION_ORDER_SELECT_LIST = `
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

export const PRODUCTION_ORDER_LINE_SELECT = `
  id,
  don_hang_id,
  danh_muc_id,
  so_luong,
  don_vi_tinh,
  ghi_chu,
  thu_tu,
  tg_tao,
  tg_cap_nhat,
  danh_muc:sx_danh_muc_hang_hoa (
    ma_danh_muc,
    ten_danh_muc,
    cha_id
  ),
  thuoc_tinh_values:kd_don_hang_chi_tiet_thuoc_tinh (
    thuoc_tinh_id,
    gia_tri,
    sx_thuoc_tinh_hang_hoa (
      ten_hien_thi
    )
  ),
  thong_so_do_values:kd_don_hang_chi_tiet_thong_so_do (
    thong_so_do_id,
    gia_tri,
    sx_thong_so_do (
      ten_hien_thi,
      don_vi
    )
  )
`;

export const PRODUCTION_ORDER_SELECT_DETAIL = `
  ${PRODUCTION_ORDER_SELECT_LIST},
  lines:kd_don_hang_chi_tiet (
    ${PRODUCTION_ORDER_LINE_SELECT}
  )
`;
