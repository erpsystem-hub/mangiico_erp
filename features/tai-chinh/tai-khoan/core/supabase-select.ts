const LIST_COLS = [
  'id',
  'ten_quy',
  'loai_quy',
  'chi_nhanh_id',
  'ngan_hang',
  'ma_ngan_hang_bin',
  'so_tai_khoan',
  'chu_tai_khoan',
  'so_du_khoi_dau',
  'trang_thai',
  'tg_tao',
  'tg_cap_nhat',
].join(',');

const EMBED_CN = 'cn:var_chi_nhanh!chi_nhanh_id(ten_chi_nhanh,ma_chi_nhanh)';

export const FINANCE_ACCOUNT_SELECT_LIST = `${LIST_COLS},${EMBED_CN}`;
export const FINANCE_ACCOUNT_SELECT_FULL = FINANCE_ACCOUNT_SELECT_LIST;
export const FINANCE_ACCOUNT_RETURNING_FULL = LIST_COLS;
export const FINANCE_ACCOUNT_RETURNING_STATUS_ONLY =
  'id,ten_quy,trang_thai,tg_cap_nhat';
