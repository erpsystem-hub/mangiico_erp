export const WAREHOUSE_SELECT = `
  id,
  ma_kho,
  ten_kho,
  chi_nhanh_id,
  dia_chi,
  trang_thai,
  thu_tu
`;

export const WAREHOUSE_SLIP_SELECT_LIST = `
  id,
  ma_phieu_kho,
  loai_phieu,
  muc_dich,
  kho_id,
  kho_dich_id,
  ngay_phieu,
  chi_nhanh_id,
  nhan_vien_id,
  don_hang_id,
  don_mua_id,
  ghi_chu,
  trang_thai,
  da_post_ton,
  tg_tao,
  tg_cap_nhat,
  kho:sx_danh_sach_kho!sx_phieu_kho_kho_id_fkey (
    ma_kho,
    ten_kho
  ),
  kho_dich:sx_danh_sach_kho!sx_phieu_kho_kho_dich_id_fkey (
    ma_kho,
    ten_kho
  ),
  chi_nhanh:var_chi_nhanh (
    ten_chi_nhanh
  ),
  don_hang:kd_don_hang (
    ma_don_hang
  ),
  don_mua:kd_don_mua (
    ma_don_mua
  ),
  lines:sx_phieu_kho_chi_tiet (count)
`;

export const WAREHOUSE_SLIP_LINE_SELECT = `
  id,
  phieu_kho_id,
  loai_hang,
  nguyen_lieu_id,
  danh_muc_id,
  so_luong,
  don_vi_tinh,
  ghi_chu,
  thu_tu,
  tg_tao,
  tg_cap_nhat,
  nguyen_lieu:sx_danh_sach_nguyen_lieu (
    ma_nguyen_lieu,
    ten_nguyen_lieu
  ),
  danh_muc:sx_danh_muc_hang_hoa (
    ma_danh_muc,
    ten_danh_muc
  )
`;

export const WAREHOUSE_SLIP_SELECT_DETAIL = `
  id,
  ma_phieu_kho,
  loai_phieu,
  muc_dich,
  kho_id,
  kho_dich_id,
  ngay_phieu,
  chi_nhanh_id,
  nhan_vien_id,
  don_hang_id,
  don_mua_id,
  ghi_chu,
  trang_thai,
  da_post_ton,
  tg_tao,
  tg_cap_nhat,
  kho:sx_danh_sach_kho!sx_phieu_kho_kho_id_fkey (
    ma_kho,
    ten_kho
  ),
  kho_dich:sx_danh_sach_kho!sx_phieu_kho_kho_dich_id_fkey (
    ma_kho,
    ten_kho
  ),
  chi_nhanh:var_chi_nhanh (
    ten_chi_nhanh
  ),
  don_hang:kd_don_hang (
    ma_don_hang
  ),
  don_mua:kd_don_mua (
    ma_don_mua
  ),
  lines:sx_phieu_kho_chi_tiet (
    ${WAREHOUSE_SLIP_LINE_SELECT}
  )
`;
