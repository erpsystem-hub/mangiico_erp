import type { Employee } from '../core/types';
import type { Position } from '../../chuc-vu/core/types';

type PositionChucVuSlice = Pick<Position, 'id' | 'ten_chuc_vu'>;

/** Gắn tên chức vụ nếu thiếu — từ master Chức vụ. */
export function mergeEmployeeChucVuFromPositions(
  emp: Employee,
  positions: readonly PositionChucVuSlice[],
): Employee {
  if (emp.id_chuc_vu == null || String(emp.id_chuc_vu).trim() === '') {
    return emp;
  }
  const want = String(emp.id_chuc_vu).trim();
  const p = positions.find((x) => String(x.id).trim() === want);
  if (!p) return emp;
  const tenCv = (p.ten_chuc_vu ?? '').trim();
  return {
    ...emp,
    ...(emp.ten_chuc_vu == null || String(emp.ten_chuc_vu).trim() === ''
      ? tenCv
        ? { ten_chuc_vu: tenCv }
        : {}
      : {}),
  };
}
