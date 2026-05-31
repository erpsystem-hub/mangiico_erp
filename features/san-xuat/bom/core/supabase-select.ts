export const BOM_SELECT_LIST =
  'id,danh_muc_id,nguyen_lieu_id,so_luong,don_vi_tinh,ghi_chu,thu_tu,trang_thai,tg_tao,tg_cap_nhat,' +
  'sx_danh_muc_hang_hoa(ten_danh_muc,ma_danh_muc,cha_id),' +
  'sx_danh_sach_nguyen_lieu(ma_nguyen_lieu,ten_nguyen_lieu,don_vi_tinh)';

export const BOM_RETURNING_FULL =
  'id,danh_muc_id,nguyen_lieu_id,so_luong,don_vi_tinh,ghi_chu,thu_tu,trang_thai,tg_tao,tg_cap_nhat';

export const BOM_RETURNING_STATUS_ONLY =
  'id,danh_muc_id,nguyen_lieu_id,trang_thai,tg_cap_nhat';
