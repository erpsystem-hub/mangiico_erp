/**
 * PostgREST `.select()` cho bảng `var_nhan_vien` — không dùng `*`.
 * Đối chiếu user qua `ten_tai_khoan` + email Auth giả; không persist Auth UUID.
 *
 * `hinh_anh` chỉ ship khi mở detail/form sửa (`SELECT_FULL`). Trong list (`SELECT_LIST`),
 * dùng avatar fallback (`getAvatarUrl(ho_va_ten)`) — `hinh_anh` path bucket private.
 */
const LIST_COLS = [
  'id',
  'ten_tai_khoan',
  'ho_va_ten',
  'id_phong_ban',
  'id_bo_phan',
  'id_chuc_vu',
  'trang_thai',
  'tg_tao',
  'tg_cap_nhat',
].join(',');

const FULL_COLS = [
  'id',
  'ten_tai_khoan',
  'ho_va_ten',
  'hinh_anh',
  'id_phong_ban',
  'id_bo_phan',
  'id_chuc_vu',
  'trang_thai',
  'tg_tao',
  'tg_cap_nhat',
].join(',');

/** Cột list/detail không embed — dùng khi FK chưa có hoặc schema cache chưa cập nhật. */
export const EMPLOYEE_LIST_COLUMNS = LIST_COLS;

export const EMPLOYEE_FULL_COLUMNS = FULL_COLS;

/** @deprecated dùng `EMPLOYEE_SELECT_LIST` hoặc `EMPLOYEE_SELECT_FULL` thay thế. */
export const VAR_NHAN_VIEN_ROW_COLUMNS = FULL_COLS;

const BRANCH_EMBED =
  'nvcn:var_nhan_vien_chi_nhanh(chi_nhanh_id,cn:var_chi_nhanh!chi_nhanh_id(ten_chi_nhanh,thu_tu))';

/** List: embed tên phòng ban / chức vụ / chi nhánh — tránh fetch master data riêng. */
export const EMPLOYEE_SELECT_LIST = `${LIST_COLS},pb:var_phong_ban!id_phong_ban(ten_phong_ban),bp:var_phong_ban!id_bo_phan(ten_phong_ban),cv:var_chuc_vu!id_chuc_vu(ten_chuc_vu),${BRANCH_EMBED}`;

export const EMPLOYEE_SELECT_FULL = `${FULL_COLS},pb:var_phong_ban!id_phong_ban(ten_phong_ban),bp:var_phong_ban!id_bo_phan(ten_phong_ban),cv:var_chuc_vu!id_chuc_vu(ten_chuc_vu),${BRANCH_EMBED}`;
export const EMPLOYEE_RETURNING_FULL = EMPLOYEE_SELECT_FULL;
export const EMPLOYEE_RETURNING_STATUS_ONLY = 'id,trang_thai,tg_cap_nhat';
