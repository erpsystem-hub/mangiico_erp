export const PRODUCT_CATALOG_SELECT_LIST =
  'id,ma_san_pham,ten_san_pham,danh_muc_id,mo_ta,trang_thai,tg_tao,tg_cap_nhat,sx_danh_muc_hang_hoa(ten_danh_muc,ma_danh_muc,cha_id)';

export const PRODUCT_CATALOG_SELECT_FULL =
  'id,ma_san_pham,ten_san_pham,danh_muc_id,mo_ta,trang_thai,tg_tao,tg_cap_nhat';

export const PRODUCT_CATALOG_RETURNING_FULL = PRODUCT_CATALOG_SELECT_FULL;

export const PRODUCT_CATALOG_RETURNING_STATUS_ONLY =
  'id,ma_san_pham,ten_san_pham,danh_muc_id,trang_thai,tg_cap_nhat';

export const PRODUCT_ATTRIBUTE_VALUE_SELECT =
  'thuoc_tinh_id,gia_tri,sx_thuoc_tinh_hang_hoa(ten_hien_thi)';
