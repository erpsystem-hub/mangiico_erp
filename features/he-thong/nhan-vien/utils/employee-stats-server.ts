/**
 * Mock client-side aggregate — cùng shape với RPC `get_nhan_vien_stats`.
 */
import { txt } from '@/lib/text';
import type { Employee } from '../core/types';
import type { EmployeeStatsFilterParams, EmployeeStatsServerPayload } from '../core/stats-types';
import {
  isCreatedOnOrBefore,
  isCreatedInRange,
  getMonthKeyFromTimestamp,
  getMonthKeysEndingAt,
} from './stats-date-range';

function matchesDeptStatus(
  emp: Employee,
  filterDept: string[],
  filterStatus: string[],
): boolean {
  const matchDept =
    filterDept.length === 0 ||
    (emp.id_phong_ban != null && filterDept.includes(String(emp.id_phong_ban)));
  const matchStatus =
    filterStatus.length === 0 || filterStatus.includes(emp.trang_thai);
  return matchDept && matchStatus;
}

export function computeEmployeeStatsPayloadFromRows(
  employees: Employee[],
  params: EmployeeStatsFilterParams,
): EmployeeStatsServerPayload {
  const { asAt, rangeStart, rangeEnd, filterDept, filterStatus } = params;

  const base = employees.filter((e) => matchesDeptStatus(e, filterDept, filterStatus));
  const filtered = base.filter((e) => isCreatedOnOrBefore(e.tg_tao, asAt));

  const asAtYoY = new Date(asAt);
  asAtYoY.setFullYear(asAtYoY.getFullYear() - 1);
  const yoyFiltered = base.filter((e) => isCreatedOnOrBefore(e.tg_tao, asAtYoY));

  const tong = filtered.length;
  const hoat_dong = filtered.filter((e) => e.trang_thai === 'Hoạt động').length;
  const khoa = filtered.filter((e) => e.trang_thai === 'Khóa').length;

  const yoyTong = yoyFiltered.length;
  const yoyHoatDong = yoyFiltered.filter((e) => e.trang_thai === 'Hoạt động').length;

  const new_in_period = base.filter((e) =>
    isCreatedInRange(e.tg_tao, rangeStart, rangeEnd),
  ).length;

  const end = asAt;
  const thisMonth = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}`;
  const prevDate = new Date(end.getFullYear(), end.getMonth() - 1, 1);
  const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  const new_this_month = filtered.filter(
    (e) => getMonthKeyFromTimestamp(e.tg_tao) === thisMonth,
  ).length;
  const new_prev_month = filtered.filter(
    (e) => getMonthKeyFromTimestamp(e.tg_tao) === prevMonth,
  ).length;

  const deptMap = new Map<
    string | null,
    { tong: number; hoat_dong: number; khoa: number }
  >();
  for (const e of filtered) {
    const key = e.id_phong_ban != null ? String(e.id_phong_ban) : null;
    const idNum = key != null ? Number(key) : null;
    const bucket = deptMap.get(key) ?? { tong: 0, hoat_dong: 0, khoa: 0 };
    bucket.tong++;
    if (e.trang_thai === 'Hoạt động') bucket.hoat_dong++;
    else bucket.khoa++;
    deptMap.set(key, bucket);
  }

  const by_phong_ban = Array.from(deptMap.entries())
    .map(([key, stats]) => ({
      id_phong_ban: key != null ? Number(key) : null,
      ...stats,
    }))
    .sort((a, b) => b.tong - a.tong);

  const posMap = new Map<string, number>();
  for (const e of filtered) {
    if (!e.id_chuc_vu) continue;
    posMap.set(String(e.id_chuc_vu), (posMap.get(String(e.id_chuc_vu)) ?? 0) + 1);
  }
  const by_chuc_vu = Array.from(posMap.entries())
    .map(([id, so_nhan_vien]) => ({ id_chuc_vu: Number(id), so_nhan_vien }))
    .sort((a, b) => b.so_nhan_vien - a.so_nhan_vien);

  const monthKeys = getMonthKeysEndingAt(asAt, 12);
  const trend_12m = monthKeys.map(({ key }) => ({
    thang: key,
    so_luong: base.filter((e) => getMonthKeyFromTimestamp(e.tg_tao) === key).length,
  }));

  return {
    summary: { tong, hoat_dong, khoa },
    new_in_period,
    yoy: { tong: yoyTong, hoat_dong: yoyHoatDong },
    delta: { new_this_month, new_prev_month },
    by_phong_ban,
    by_chuc_vu,
    trend_12m,
  };
}

/** Parse raw RPC JSONB — defensive number coercion. */
export function parseEmployeeStatsServerPayload(raw: unknown): EmployeeStatsServerPayload {
  const o = (raw ?? {}) as Record<string, unknown>;
  const summary = (o.summary ?? {}) as Record<string, unknown>;
  const yoy = (o.yoy ?? {}) as Record<string, unknown>;
  const delta = (o.delta ?? {}) as Record<string, unknown>;

  return {
    summary: {
      tong: Number(summary.tong ?? 0),
      hoat_dong: Number(summary.hoat_dong ?? 0),
      khoa: Number(summary.khoa ?? 0),
    },
    new_in_period: Number(o.new_in_period ?? 0),
    yoy: {
      tong: Number(yoy.tong ?? 0),
      hoat_dong: Number(yoy.hoat_dong ?? 0),
    },
    delta: {
      new_this_month: Number(delta.new_this_month ?? 0),
      new_prev_month: Number(delta.new_prev_month ?? 0),
    },
    by_phong_ban: Array.isArray(o.by_phong_ban)
      ? (o.by_phong_ban as Record<string, unknown>[]).map((r) => ({
          id_phong_ban: r.id_phong_ban != null ? Number(r.id_phong_ban) : null,
          tong: Number(r.tong ?? 0),
          hoat_dong: Number(r.hoat_dong ?? 0),
          khoa: Number(r.khoa ?? 0),
        }))
      : [],
    by_chuc_vu: Array.isArray(o.by_chuc_vu)
      ? (o.by_chuc_vu as Record<string, unknown>[]).map((r) => ({
          id_chuc_vu: Number(r.id_chuc_vu),
          so_nhan_vien: Number(r.so_nhan_vien ?? 0),
        }))
      : [],
    trend_12m: Array.isArray(o.trend_12m)
      ? (o.trend_12m as Record<string, unknown>[]).map((r) => ({
          thang: String(r.thang ?? ''),
          so_luong: Number(r.so_luong ?? 0),
        }))
      : [],
  };
}

export function statsDateToEndOfDayIso(d: Date): string {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).toISOString();
}

export function statsDateToStartOfDayIso(d: Date): string {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).toISOString();
}

/** Label tháng cho trend chart: T6/25 */
export function trendMonthToLabel(thang: string): string {
  const [y, m] = thang.split('-');
  if (!y || !m) return thang;
  return `T${Number(m)}/${y.slice(2)}`;
}

export function deptNameFromId(
  id: number | null,
  deptNameById: Map<string, string>,
): string {
  if (id == null) return txt('employee.unassigned');
  return deptNameById.get(String(id))?.trim() || txt('employee.unassigned');
}

export function positionNameFromId(
  id: number,
  posNameById: Map<string, string>,
): string {
  return posNameById.get(String(id))?.trim() || txt('employee.unassigned');
}
