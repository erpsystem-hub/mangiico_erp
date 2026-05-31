const CATEGORY_BASE_COLS = [
  'id',
  'loai_doi_tac',
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

export const PARTNER_CATEGORY_SELECT_FULL = CATEGORY_BASE_COLS;
export const PARTNER_CATEGORY_RETURNING_FULL = CATEGORY_BASE_COLS;
export const PARTNER_CATEGORY_RETURNING_STATUS_ONLY =
  'id,ten_danh_muc,trang_thai,tg_cap_nhat';

export const PARTNER_LIST_SELECT_LIST =
  'id,loai_doi_tac,ma_doi_tac,ten_doi_tac,danh_muc_id,dien_thoai,email,dia_chi,ma_so_thue,nguoi_lien_he,mo_ta,trang_thai,tg_tao,tg_cap_nhat,kd_danh_muc_doi_tac(ten_danh_muc,ma_danh_muc,cha_id)';

export const PARTNER_LIST_SELECT_FULL =
  'id,loai_doi_tac,ma_doi_tac,ten_doi_tac,danh_muc_id,dien_thoai,email,dia_chi,ma_so_thue,nguoi_lien_he,mo_ta,trang_thai,tg_tao,tg_cap_nhat';

export const PARTNER_LIST_RETURNING_FULL = PARTNER_LIST_SELECT_FULL;

export const PARTNER_LIST_RETURNING_STATUS_ONLY =
  'id,ma_doi_tac,ten_doi_tac,danh_muc_id,trang_thai,tg_cap_nhat';
