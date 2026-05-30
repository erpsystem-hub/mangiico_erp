const BASE_COLS = [
  'id',
  'ten_danh_muc',
  'ma_danh_muc',
  'mo_ta',
  'cha_id',
  'cap_do',
  'duong_dan',
  'trang_thai',
  'thu_tu',
  'tg_tao',
  'tg_cap_nhat',
].join(',');

export const PRODUCT_CATEGORY_SELECT_FULL = BASE_COLS;
export const PRODUCT_CATEGORY_RETURNING_FULL = BASE_COLS;
export const PRODUCT_CATEGORY_RETURNING_STATUS_ONLY =
  'id,ten_danh_muc,trang_thai,tg_cap_nhat';
