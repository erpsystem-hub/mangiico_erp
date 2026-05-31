export const BOM_SELECT_LIST =
  'id,san_pham_id,nguyen_lieu_id,so_luong,don_vi_tinh,ghi_chu,thu_tu,trang_thai,tg_tao,tg_cap_nhat,' +
  'sx_danh_sach_san_pham(ma_san_pham,ten_san_pham,danh_muc_id,sx_danh_muc_hang_hoa(ten_danh_muc,ma_danh_muc,cha_id)),' +
  'sx_danh_sach_nguyen_lieu(ma_nguyen_lieu,ten_nguyen_lieu,don_vi_tinh)';

export const BOM_SELECT_FULL =
  'id,san_pham_id,nguyen_lieu_id,so_luong,don_vi_tinh,ghi_chu,thu_tu,trang_thai,tg_tao,tg_cap_nhat';

export const BOM_RETURNING_FULL = BOM_SELECT_FULL;

export const BOM_RETURNING_STATUS_ONLY =
  'id,san_pham_id,nguyen_lieu_id,trang_thai,tg_cap_nhat';
