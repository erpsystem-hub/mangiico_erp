import type { Employee, TrangThaiNhanVien } from '../core/types';
import type { EmployeeFormValues } from '../core/schema';
import { employeeToFormValues } from '../utils/employee-to-form';
import { getDepartments } from '../../phong-ban/services/phong-ban-service';
import { createRepository } from '@/lib/data/create-repository';
import { EMPLOYEES_LIST_QUERY_PARAMS } from '@/lib/query-keys';
import { txt } from '../../../../lib/text';
import { isSupabase } from '@/lib/data/config';
import {
  AuthUserConflictError,
  createAuthUser,
  deleteAuthUser,
  resetAuthUserPassword,
} from '@/lib/supabase/admin-user';
import {
  EMPLOYEE_FULL_COLUMNS,
  EMPLOYEE_LIST_COLUMNS,
  EMPLOYEE_RETURNING_FULL,
  EMPLOYEE_SELECT_FULL,
  EMPLOYEE_SELECT_LIST,
} from '../core/supabase-select';
import { isPostgrestRelationshipError, isPostgrestRpcMissingError } from '@/lib/supabase/postgrest-errors';
import { getSupabase } from '@/lib/supabase/client';
import { handleSupabaseError } from '@/lib/supabase/errors';
import { uploadEmployeeAvatarIfDataUrl } from './avatar-storage';
import { normalizeCapQuanLyInput } from '../../chuc-vu/utils/cap-quan-ly';
import type { RepositoryListResult } from '@/lib/data/repository';
import type { EmployeeStatsFilterParams, EmployeeStatsServerPayload } from '../core/stats-types';
import {
  computeEmployeeStatsPayloadFromRows,
  parseEmployeeStatsServerPayload,
  statsDateToEndOfDayIso,
  statsDateToStartOfDayIso,
} from '../utils/employee-stats-server';

/**
 * Lỗi báo trước khi tạo / đổi `ten_tai_khoan`: email Auth tương ứng đã tồn tại.
 * UI catch để hỏi admin xử lý: reset password (về 123456) hay giữ nguyên.
 */
export class AuthUserExistsError extends Error {
  readonly username: string;
  constructor(username: string) {
    super(`Email Auth ${username}@gmail.com đã tồn tại`);
    this.name = 'AuthUserExistsError';
    this.username = username;
  }
}

export type AuthConflictDecision = 'reset' | 'keep';

const now = () => new Date().toISOString();

const repo = createRepository<Employee>({
  tableName: 'var_nhan_vien',
  select: EMPLOYEE_SELECT_FULL,
  delay: 200,
});

export type GetEmployeesParams = {
  limit?: number;
  offset?: number;
  orderBy?: string;
  ascending?: boolean;
};

export type EmployeesListResult = {
  items: Employee[];
  total: number;
};

/** Flatten PostgREST embed response → Employee shape. */
function flattenSupabaseRow(row: Record<string, unknown>): Employee {
  const pb = row.pb as { ten_phong_ban?: string } | null | undefined;
  const bp = row.bp as { ten_phong_ban?: string } | null | undefined;
  const cv = row.cv as { ten_chuc_vu?: string; cap_quan_ly?: string | null } | null | undefined;
  const { pb: _pb, bp: _bp, cv: _cv, ...rest } = row;
  const cap_quan_ly = normalizeCapQuanLyInput(cv?.cap_quan_ly);
  return normalizeEmployeeRow({
    ...(rest as unknown as Employee),
    ten_phong_ban: pb?.ten_phong_ban,
    ten_bo_phan: bp?.ten_phong_ban,
    ten_chuc_vu: cv?.ten_chuc_vu,
    cap_quan_ly: cap_quan_ly ?? null,
  });
}

/** Chuẩn hoá id / FK int8 từ PostgREST (number hoặc chuỗi số). */
function normalizeEmployeeRow(raw: Employee): Employee {
  return {
    ...raw,
    id: String(raw.id),
    id_phong_ban: raw.id_phong_ban == null ? null : String(raw.id_phong_ban),
    id_bo_phan: raw.id_bo_phan == null ? null : String(raw.id_bo_phan),
    id_chuc_vu: raw.id_chuc_vu == null ? null : String(raw.id_chuc_vu),
  };
}

type PositionLookupRow = { id: string; ten_chuc_vu: string; cap_quan_ly?: string | null };

function rowNeedsDisplayEnrich(row: Employee): boolean {
  if (row.id_phong_ban && row.ten_phong_ban == null) return true;
  if (row.id_bo_phan && row.ten_bo_phan == null) return true;
  if (row.id_chuc_vu && (row.ten_chuc_vu == null || row.cap_quan_ly == null)) return true;
  return false;
}

async function enrichEmployeeRowsBatch(list: Employee[]): Promise<Employee[]> {
  if (list.length === 0) return list;
  const normalized = list.map((row) => normalizeEmployeeRow(row));
  if (!normalized.some(rowNeedsDisplayEnrich)) return normalized;

  const { getPositionLookupMap } = await import('../../chuc-vu/services/chuc-vu-service');
  const [depts, positionMap] = await Promise.all([getDepartments(), getPositionLookupMap()]);
  const deptById = new Map(depts.map((d) => [d.id, d]));

  return normalized.map((row) => {
    const cvId = row.id_chuc_vu == null ? '' : String(row.id_chuc_vu).trim();
    const pos: PositionLookupRow | undefined = cvId ? positionMap.get(cvId) : undefined;
    const cap_quan_ly = normalizeCapQuanLyInput(pos?.cap_quan_ly as string | null | undefined);
    return {
      ...row,
      ten_phong_ban: row.ten_phong_ban ?? (row.id_phong_ban ? deptById.get(row.id_phong_ban)?.ten_phong_ban : undefined),
      ten_bo_phan: row.ten_bo_phan ?? (row.id_bo_phan ? deptById.get(row.id_bo_phan)?.ten_phong_ban : undefined),
      ten_chuc_vu: row.ten_chuc_vu ?? pos?.ten_chuc_vu,
      cap_quan_ly: row.cap_quan_ly ?? cap_quan_ly ?? null,
    };
  });
}

function rowHasPostgrestEmbed(row: Record<string, unknown>): boolean {
  return 'pb' in row || 'bp' in row || 'cv' in row;
}

async function mapEmployeeRow(row: Employee | Record<string, unknown>): Promise<Employee> {
  const record = row as Record<string, unknown>;
  if (isSupabase() && rowHasPostgrestEmbed(record)) {
    return flattenSupabaseRow(record);
  }
  const [mapped] = await enrichEmployeeRowsBatch([row as Employee]);
  return mapped;
}

async function mapEmployeeRows(list: Employee[]): Promise<Employee[]> {
  if (list.length === 0) return list;
  const first = list[0] as unknown as Record<string, unknown>;
  if (isSupabase() && rowHasPostgrestEmbed(first)) {
    return (list as unknown as Record<string, unknown>[]).map(flattenSupabaseRow);
  }
  return enrichEmployeeRowsBatch(list);
}

async function getEmployeeRepositoryPage(
  options: Parameters<typeof repo.getPage>[0],
  embedSelect: string,
  plainSelect: string,
): Promise<RepositoryListResult<Employee>> {
  try {
    return await repo.getPage({ ...options, select: embedSelect });
  } catch (err) {
    if (!isPostgrestRelationshipError(err)) throw err;
    return repo.getPage({ ...options, select: plainSelect });
  }
}

async function getEmployeeRepositoryById(
  id: string,
  embedSelect: string,
  plainSelect: string,
): Promise<Employee | null> {
  try {
    return await repo.getById(id, { select: embedSelect });
  } catch (err) {
    if (!isPostgrestRelationshipError(err)) throw err;
    return repo.getById(id, { select: plainSelect });
  }
}

type NhanVienPageRpcRow = {
  id: number;
  ten_tai_khoan: string;
  ho_va_ten: string;
  id_phong_ban: number | null;
  id_bo_phan: number | null;
  id_chuc_vu: number | null;
  trang_thai: string;
  tg_tao: string;
  tg_cap_nhat: string;
  ten_phong_ban: string | null;
  ten_bo_phan: string | null;
  ten_chuc_vu: string | null;
  cap_quan_ly: string | null;
  total_count: number;
};

function mapRpcPageRowToEmployee(row: NhanVienPageRpcRow): Employee {
  return normalizeEmployeeRow({
    id: String(row.id),
    ten_tai_khoan: row.ten_tai_khoan,
    ho_va_ten: row.ho_va_ten,
    hinh_anh: null,
    id_phong_ban: row.id_phong_ban == null ? null : String(row.id_phong_ban),
    id_bo_phan: row.id_bo_phan == null ? null : String(row.id_bo_phan),
    id_chuc_vu: row.id_chuc_vu == null ? null : String(row.id_chuc_vu),
    trang_thai: row.trang_thai as TrangThaiNhanVien,
    tg_tao: row.tg_tao,
    tg_cap_nhat: row.tg_cap_nhat,
    ten_phong_ban: row.ten_phong_ban ?? undefined,
    ten_bo_phan: row.ten_bo_phan ?? undefined,
    ten_chuc_vu: row.ten_chuc_vu ?? undefined,
    cap_quan_ly: normalizeCapQuanLyInput(row.cap_quan_ly) ?? null,
  });
}

async function getEmployeesPageViaRpc(
  params: Required<Pick<GetEmployeesParams, 'limit' | 'offset' | 'orderBy' | 'ascending'>>,
): Promise<EmployeesListResult> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { data, error } = await supabase.rpc('get_nhan_vien_page', {
    p_search: null,
    p_limit: params.limit,
    p_offset: params.offset,
    p_trang_thai: null,
    p_id_phong_ban: null,
    p_id_chuc_vu: null,
    p_order_by: params.orderBy,
    p_ascending: params.ascending,
  });

  if (error) {
    if (isPostgrestRpcMissingError(error)) throw error;
    handleSupabaseError(error);
  }

  const rows = (data ?? []) as NhanVienPageRpcRow[];
  const total = rows.length > 0 ? Number(rows[0].total_count) : 0;
  return {
    items: rows.map(mapRpcPageRowToEmployee),
    total,
  };
}

async function getEmployeesPageViaRepository(
  params: GetEmployeesParams,
): Promise<EmployeesListResult> {
  const limit = params.limit ?? EMPLOYEES_LIST_QUERY_PARAMS.limit;
  const offset = params.offset ?? EMPLOYEES_LIST_QUERY_PARAMS.offset;
  const orderBy = params.orderBy ?? EMPLOYEES_LIST_QUERY_PARAMS.orderBy;
  const ascending = params.ascending ?? EMPLOYEES_LIST_QUERY_PARAMS.ascending;
  const { items, total }: RepositoryListResult<Employee> = await getEmployeeRepositoryPage(
    { limit, offset, orderBy, ascending },
    EMPLOYEE_SELECT_LIST,
    EMPLOYEE_LIST_COLUMNS,
  );
  return { items: await mapEmployeeRows(items), total };
}

export const getEmployeeCount = async (): Promise<number> => repo.count();

export const getEmployeesPage = async (
  params: GetEmployeesParams = {},
): Promise<EmployeesListResult> => {
  const limit = params.limit ?? EMPLOYEES_LIST_QUERY_PARAMS.limit;
  const offset = params.offset ?? EMPLOYEES_LIST_QUERY_PARAMS.offset;
  const orderBy = params.orderBy ?? EMPLOYEES_LIST_QUERY_PARAMS.orderBy;
  const ascending = params.ascending ?? EMPLOYEES_LIST_QUERY_PARAMS.ascending;

  if (isSupabase()) {
    try {
      return await getEmployeesPageViaRpc({ limit, offset, orderBy, ascending });
    } catch (err) {
      if (!isPostgrestRpcMissingError(err)) throw err;
    }
  }

  return getEmployeesPageViaRepository({ limit, offset, orderBy, ascending });
};

/**
 * List nhân viên — `EMPLOYEE_SELECT_LIST` (không có `hinh_anh`) + embed tên PB/CV.
 */
export const getEmployees = async (params: GetEmployeesParams = {}): Promise<Employee[]> => {
  const { items } = await getEmployeesPage({
    ...params,
    limit: params.limit ?? EMPLOYEES_LIST_QUERY_PARAMS.limit,
    offset: params.offset ?? EMPLOYEES_LIST_QUERY_PARAMS.offset,
  });
  return items;
};

/** `null` khi không có bản ghi — TanStack Query v5 cấm `queryFn` trả về `undefined`. */
export const getEmployeeById = async (id: string): Promise<Employee | null> => {
  const row = await getEmployeeRepositoryById(id, EMPLOYEE_SELECT_FULL, EMPLOYEE_FULL_COLUMNS);
  if (!row) return null;
  return mapEmployeeRow(row);
};

function normInt8Fk(v: string | null | undefined): number | null {
  const s = v == null || v === '' ? '' : String(v).trim();
  if (!s || !/^\d+$/.test(s)) return null;
  return Number(s);
}

/** Form → payload Supabase (int8 FK; chuỗi không phải số → null). */
function toRowPayload(data: EmployeeFormValues) {
  const normText = (v: string | null | undefined) => (v === undefined || v === null || v === '' ? null : v);
  return {
    ten_tai_khoan: data.ten_tai_khoan.trim().toLowerCase(),
    ho_va_ten: data.ho_va_ten,
    hinh_anh: normText(data.hinh_anh ?? null),
    id_phong_ban: normInt8Fk(data.id_phong_ban),
    id_bo_phan: normInt8Fk(data.id_bo_phan),
    id_chuc_vu: normInt8Fk(data.id_chuc_vu),
    trang_thai: data.trang_thai as TrangThaiNhanVien,
  };
}

async function insertEmployeeRow(data: EmployeeFormValues): Promise<Employee> {
  const payload = toRowPayload(data);
  const hinhAnhRaw = payload.hinh_anh;
  let inserted: Employee;
  try {
    inserted = await repo.insert(
      { ...payload, hinh_anh: null } as unknown as Omit<Employee, 'id'> & { id?: string },
      { returningSelect: EMPLOYEE_RETURNING_FULL },
    );
  } catch (err) {
    if (!isPostgrestRelationshipError(err)) throw err;
    inserted = await repo.insert(
      { ...payload, hinh_anh: null } as unknown as Omit<Employee, 'id'> & { id?: string },
      { returningSelect: EMPLOYEE_FULL_COLUMNS },
    );
  }
  const insertedId = String((inserted as Employee).id);
  const url = await uploadEmployeeAvatarIfDataUrl(hinhAnhRaw, insertedId);
  let row = inserted;
  if (url !== null) {
    row = await repo.update(
      insertedId,
      { hinh_anh: url, tg_cap_nhat: now() } as unknown as Partial<Employee>,
      { returningSelect: EMPLOYEE_RETURNING_FULL },
    );
  }
  return mapEmployeeRow(row);
}

async function updateEmployeeRow(id: string, data: EmployeeFormValues): Promise<Employee> {
  const payload = toRowPayload(data);
  payload.hinh_anh = await uploadEmployeeAvatarIfDataUrl(payload.hinh_anh, id);
  let updated: Employee;
  try {
    updated = await repo.update(
      id,
      {
        ...payload,
        tg_cap_nhat: now(),
      } as unknown as Partial<Employee>,
      { returningSelect: EMPLOYEE_RETURNING_FULL },
    );
  } catch (err) {
    if (!isPostgrestRelationshipError(err)) throw err;
    updated = await repo.update(
      id,
      {
        ...payload,
        tg_cap_nhat: now(),
      } as unknown as Partial<Employee>,
      { returningSelect: EMPLOYEE_FULL_COLUMNS },
    );
  }
  return mapEmployeeRow(updated);
}

function mapAuthConflict(err: unknown, username: string): never {
  if (err instanceof AuthUserConflictError) {
    throw new AuthUserExistsError(username);
  }
  throw err;
}

/**
 * Tạo nhân viên mới. Gọi Auth trực tiếp — 409 → {@link AuthUserExistsError}.
 * Khi mock (chưa nối Supabase) thì bỏ qua bước Auth.
 */
export const createEmployee = async (data: EmployeeFormValues): Promise<Employee> => {
  if (isSupabase()) {
    const username = data.ten_tai_khoan.trim().toLowerCase();
    try {
      await createAuthUser(username);
    } catch (err) {
      mapAuthConflict(err, username);
    }
  }
  return insertEmployeeRow(data);
};

/** Tiếp tục tạo nhân viên sau khi admin đã chọn xử lý conflict. */
export const createEmployeeWithAuthDecision = async (
  data: EmployeeFormValues,
  decision: AuthConflictDecision,
): Promise<Employee> => {
  if (isSupabase()) {
    const username = data.ten_tai_khoan.trim().toLowerCase();
    if (decision === 'reset') {
      await resetAuthUserPassword(username);
    }
  }
  return insertEmployeeRow(data);
};

/**
 * Cập nhật nhân viên. Nếu `ten_tai_khoan` thay đổi:
 *  - Auth user mới đã tồn tại → throw {@link AuthUserExistsError}.
 *  - Auth user mới chưa có    → tạo user mới + xoá user cũ.
 */
export const updateEmployee = async (
  id: string,
  data: EmployeeFormValues,
): Promise<Employee> => {
  const existing = await repo.getById(id);
  if (!existing) throw new Error(txt('employee.service.notFound'));

  if (isSupabase()) {
    const oldUsername = String(existing.ten_tai_khoan ?? '').trim().toLowerCase();
    const newUsername = data.ten_tai_khoan.trim().toLowerCase();
    if (oldUsername !== newUsername) {
      try {
        await createAuthUser(newUsername);
      } catch (err) {
        mapAuthConflict(err, newUsername);
      }
      if (oldUsername) {
        try {
          await deleteAuthUser(oldUsername);
        } catch {
          // Không chặn cập nhật nếu xoá Auth cũ thất bại.
        }
      }
    }
  }

  return updateEmployeeRow(id, data);
};

/** Tiếp tục cập nhật sau khi admin chọn xử lý Auth conflict (đổi username). */
export const updateEmployeeWithAuthDecision = async (
  id: string,
  data: EmployeeFormValues,
  decision: AuthConflictDecision,
): Promise<Employee> => {
  const existing = await repo.getById(id);
  if (!existing) throw new Error(txt('employee.service.notFound'));

  if (isSupabase()) {
    const oldUsername = String(existing.ten_tai_khoan ?? '').trim().toLowerCase();
    const newUsername = data.ten_tai_khoan.trim().toLowerCase();
    if (oldUsername !== newUsername) {
      if (decision === 'reset') {
        await resetAuthUserPassword(newUsername);
      }
      if (oldUsername) {
        try {
          await deleteAuthUser(oldUsername);
        } catch {
          // Bỏ qua lỗi xoá Auth cũ.
        }
      }
    }
  }

  return updateEmployeeRow(id, data);
};

export const updateEmployeeStatus = async (
  ids: string[],
  status: TrangThaiNhanVien,
): Promise<void> => {
  if (ids.length === 0) return;
  const timestamp = now();
  await repo.updateMany(ids, {
    trang_thai: status,
    tg_cap_nhat: timestamp,
  } as unknown as Partial<Employee>);
};

async function safeDeleteAuthUsersByIds(ids: string[]): Promise<void> {
  if (!isSupabase() || ids.length === 0) return;
  const rows = await Promise.all(ids.map((id) => repo.getById(id).catch(() => null)));
  const usernames = rows
    .map((row) => String((row as Employee | null)?.ten_tai_khoan ?? '').trim().toLowerCase())
    .filter(Boolean);
  await Promise.all(
    usernames.map((u) =>
      deleteAuthUser(u).catch(() => {
        // không chặn xoá nhân viên nếu xoá Auth thất bại.
      }),
    ),
  );
}

export const deleteEmployee = async (id: string): Promise<void> => {
  await safeDeleteAuthUsersByIds([id]);
  await repo.remove([id]);
};

export const deleteEmployees = async (ids: string[]): Promise<void> => {
  await safeDeleteAuthUsersByIds(ids);
  await repo.remove(ids);
};

/** Khôi phục nhân viên đã xóa (undo) — insert lại không giữ id cũ. */
export const restoreEmployees = async (employees: Employee[]): Promise<void> => {
  for (const emp of employees) {
    await repo.insert(
      toRowPayload(employeeToFormValues(emp)) as unknown as Omit<Employee, 'id'> & { id?: string },
      { returningSelect: EMPLOYEE_RETURNING_FULL },
    );
  }
};

/** RPC stats — tổng / hoạt động / khóa. */
export type EmployeeSummaryStats = { tong: number; hoat_dong: number; khoa: number };

export async function getEmployeeSummaryStats(): Promise<EmployeeSummaryStats> {
  if (!isSupabase()) {
    const all = await getEmployees();
    const hoat_dong = all.filter((e) => e.trang_thai === 'Hoạt động').length;
    return { tong: all.length, hoat_dong, khoa: all.length - hoat_dong };
  }
  const { getSupabase } = await import('@/lib/supabase/client');
  const { handleSupabaseError } = await import('@/lib/supabase/errors');
  const supabase = getSupabase();
  if (!supabase) return { tong: 0, hoat_dong: 0, khoa: 0 };
  const { data, error } = await supabase.rpc('get_nhan_vien_summary');
  if (error) handleSupabaseError(error);
  const row = (data as { tong?: number; hoat_dong?: number; khoa?: number }[] | null)?.[0] ?? {};
  return {
    tong: Number(row.tong ?? 0),
    hoat_dong: Number(row.hoat_dong ?? 0),
    khoa: Number(row.khoa ?? 0),
  };
}

export type CountByKey = { id: string; so_nhan_vien: number };

export async function getEmployeeCountByPhongBan(): Promise<CountByKey[]> {
  if (!isSupabase()) {
    const all = await getEmployees();
    const map = new Map<string, number>();
    for (const e of all) {
      if (!e.id_phong_ban) continue;
      map.set(e.id_phong_ban, (map.get(e.id_phong_ban) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([id, so_nhan_vien]) => ({ id, so_nhan_vien }));
  }
  const { getSupabase } = await import('@/lib/supabase/client');
  const { handleSupabaseError } = await import('@/lib/supabase/errors');
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc('get_nhan_vien_count_by_phong_ban');
  if (error) handleSupabaseError(error);
  return ((data ?? []) as { id_phong_ban: number; so_nhan_vien: number }[]).map((r) => ({
    id: String(r.id_phong_ban),
    so_nhan_vien: Number(r.so_nhan_vien),
  }));
}

export async function getEmployeeCountByChucVu(): Promise<CountByKey[]> {
  if (!isSupabase()) {
    const all = await getEmployees();
    const map = new Map<string, number>();
    for (const e of all) {
      if (!e.id_chuc_vu) continue;
      map.set(e.id_chuc_vu, (map.get(e.id_chuc_vu) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([id, so_nhan_vien]) => ({ id, so_nhan_vien }));
  }
  const { getSupabase } = await import('@/lib/supabase/client');
  const { handleSupabaseError } = await import('@/lib/supabase/errors');
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc('get_nhan_vien_count_by_chuc_vu');
  if (error) handleSupabaseError(error);
  return ((data ?? []) as { id_chuc_vu: number; so_nhan_vien: number }[]).map((r) => ({
    id: String(r.id_chuc_vu),
    so_nhan_vien: Number(r.so_nhan_vien),
  }));
}

const EMPTY_STATS_PAYLOAD: EmployeeStatsServerPayload = {
  summary: { tong: 0, hoat_dong: 0, khoa: 0 },
  new_in_period: 0,
  yoy: { tong: 0, hoat_dong: 0 },
  delta: { new_this_month: 0, new_prev_month: 0 },
  by_phong_ban: [],
  by_chuc_vu: [],
  trend_12m: [],
};

/** RPC aggregate có filter — tab Thống kê (scale >500 rows). */
export async function getEmployeeStatsFiltered(
  params: EmployeeStatsFilterParams,
): Promise<EmployeeStatsServerPayload> {
  if (!isSupabase()) {
    const all = await getEmployees();
    return computeEmployeeStatsPayloadFromRows(all, params);
  }
  const { getSupabase } = await import('@/lib/supabase/client');
  const { handleSupabaseError } = await import('@/lib/supabase/errors');
  const supabase = getSupabase();
  if (!supabase) return EMPTY_STATS_PAYLOAD;

  const p_id_phong_ban =
    params.filterDept.length > 0
      ? params.filterDept.map((id) => Number(id)).filter((n) => !Number.isNaN(n))
      : null;
  const p_trang_thai =
    params.filterStatus.length > 0 ? params.filterStatus : null;

  const { data, error } = await supabase.rpc('get_nhan_vien_stats', {
    p_as_at: statsDateToEndOfDayIso(params.asAt),
    p_range_start: statsDateToStartOfDayIso(params.rangeStart),
    p_range_end: statsDateToEndOfDayIso(params.rangeEnd),
    p_id_phong_ban,
    p_trang_thai,
  });
  if (error) handleSupabaseError(error);
  return parseEmployeeStatsServerPayload(data);
}
