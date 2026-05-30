/**
 * Ma trận quyền theo chức vụ (`var_phan_quyen` + `cap_bac`).
 * Mặc định bật; ghi đè: `VITE_USE_PERMISSION_MATRIX=false`.
 */
export function isPermissionMatrixEnabled(): boolean {
  const raw = import.meta.env.VITE_USE_PERMISSION_MATRIX;
  if (typeof raw === 'string') {
    const v = raw.trim().toLowerCase();
    if (v === 'false') return false;
    if (v === 'true') return true;
  }
  return true;
}
