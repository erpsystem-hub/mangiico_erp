const LIST_COLS = [
  'id',
  'ten_chi_nhanh',
  'ma_chi_nhanh',
  'dia_chi',
  'dien_thoai',
  'email',
  'thu_tu',
  'trang_thai',
  'tg_tao',
  'tg_cap_nhat',
].join(',');

const FULL_COLS = [LIST_COLS, 'mo_ta'].join(',');

export const BRANCH_LIST_COLUMNS = LIST_COLS;
export const BRANCH_FULL_COLUMNS = FULL_COLS;

export const BRANCH_SELECT_LIST = LIST_COLS;
export const BRANCH_SELECT_FULL = FULL_COLS;
export const BRANCH_RETURNING_FULL = FULL_COLS;
export const BRANCH_RETURNING_STATUS_ONLY = 'id,ten_chi_nhanh,trang_thai,tg_cap_nhat';
