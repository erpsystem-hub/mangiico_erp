import type { User } from '@/types';
import type { ActionType } from '@/features/he-thong/phan-quyen/core/types';
import { usePermissionGrantStore } from '@/store/usePermissionGrantStore';
import { isPermissionMatrixEnabled } from '@/lib/permission-matrix-env';
import { isSupabase } from '@/lib/data/config';

/**
 * Hành động gắn với UI (nút, route) — mở rộng theo nghiệp vụ.
 * Khi có policy server-side, vẫn phải kiểm tra lại API.
 */
export type AppAction = 'view' | 'create' | 'edit' | 'delete' | 'export' | 'import';

/**
 * Tài nguyên (module) — thêm khi có module mới.
 */
export type AppResource =
  | 'employees'
  | 'departments'
  | 'positions'
  | 'company'
  | 'permissions'
  | 'profile'
  | 'notifications'
  | '*';

/**
 * Ánh xạ `AppResource` → `module_id` trong Phân quyền (vd. `he-thong/nhan-vien`).
 * Không có trong map → `can()` dùng luật legacy (profile, notifications, *).
 */
export const APP_RESOURCE_TO_MODULE: Partial<Record<AppResource, string>> = {
  employees: 'he-thong/nhan-vien',
  departments: 'he-thong/phong-ban',
  positions: 'he-thong/chuc-vu',
  company: 'he-thong/thong-tin-to-chuc',
  permissions: 'he-thong/phan-quyen',
};

/** Module id cũ (Thông tin công ty) — vẫn tính quyền khi ma trận chưa cập nhật. */
const COMPANY_MODULE_ID_LEGACY = 'he-thong/thong-tin-cong-ty';

/** Các action UI được bypass khi `cap_bac=1` trên mọi module trong map. */
const MODULE_UI_ACTIONS: AppAction[] = ['view', 'create', 'edit', 'delete', 'export', 'import'];

/** UI dùng `edit`; ma trận phân quyền dùng `update`. */
export function mapAppActionToActionType(action: AppAction): ActionType {
  if (action === 'edit') return 'update';
  return action as ActionType;
}

/**
 * Luật member (chưa hydrate matrix từ API chức vụ).
 */
function legacyCan(user: User, action: AppAction, resource: AppResource): boolean {
  void user;
  if (resource === 'profile' && (action === 'edit' || action === 'view')) return true;
  if (resource === 'notifications' && action === 'view') return true;
  if (action === 'view') return true;
  return false;
}

function grantsAllow(allowed: readonly string[], need: ReturnType<typeof mapAppActionToActionType>): boolean {
  if (allowed.includes('all') || allowed.includes('admin')) return true;
  return allowed.includes(need);
}

/**
 * `var_chuc_vu.cap_bac === 1` sau khi hydrate — dùng `Number` vì giá trị có thể là bigint/string từ API.
 * Dùng chung `can()` bypass và UI nhúng (vd. detail cán bộ).
 */
export function isChucVuCapBacOne(cap: number | null | undefined): boolean {
  if (cap == null) return false;
  const n = Number(cap);
  return Number.isFinite(n) && n === 1;
}

/**
 * Giám đốc (`cap_bac=1`): bypass view/create/edit/delete/export/import trên mọi module Hệ thống.
 */
export function isGlobalCapBacBypass(
  action: AppAction,
  resource: AppResource,
  capBac: number | null | undefined
): boolean {
  return (
    isChucVuCapBacOne(capBac) &&
    APP_RESOURCE_TO_MODULE[resource] !== undefined &&
    MODULE_UI_ACTIONS.includes(action)
  );
}

/**
 * Đối chiếu token ma trận cho một `module_id`.
 * `quan_tri` (admin) / `all` → mọi action; có `view` → thêm export/import.
 */
export function moduleGrantsAllow(
  action: AppAction,
  moduleId: string,
  grantsByModule: Record<string, ActionType[]>
): boolean {
  const need = mapAppActionToActionType(action);
  const allowed = grantsByModule[moduleId] ?? [];
  if ((action === 'export' || action === 'import') && grantsAllow(allowed, 'view')) {
    return true;
  }
  return grantsAllow(allowed, need);
}

/** Phòng ban: ma trận `admin`/`all`/token — cap_bac=1 xử lý ở bypass toàn cục trước. */
function canDepartmentsWithCapBac(
  user: User,
  action: AppAction,
  grantsByModule: Record<string, ActionType[]>
): boolean {
  void user;
  const moduleId = APP_RESOURCE_TO_MODULE.departments;
  if (!moduleId) return false;
  return moduleGrantsAllow(action, moduleId, grantsByModule);
}

function matrixCan(user: User, action: AppAction, resource: AppResource): boolean {
  void user;
  const moduleId = APP_RESOURCE_TO_MODULE[resource];
  if (moduleId === undefined) {
    return legacyCan(user, action, resource);
  }
  const need = mapAppActionToActionType(action);
  const { grantsByModule } = usePermissionGrantStore.getState();

  if (resource === 'company') {
    const ids = [moduleId, COMPANY_MODULE_ID_LEGACY];
    for (const id of ids) {
      const allowed = grantsByModule[id] ?? [];
      if (grantsAllow(allowed, need)) return true;
    }
    return false;
  }

  return moduleGrantsAllow(action, moduleId, grantsByModule);
}

/**
 * Kiểm tra quyền phía client (UX: ẩn nút). Không thay thế RLS / API.
 *
 * - Mock mode admin (`user.role === 'admin'`): toàn quyền UI (trừ xóa profile).
 * - Supabase mode: mọi user đều `role='user'`, quyền hoàn toàn từ `var_chuc_vu.cap_bac` + `var_phan_quyen`.
 * - Không có `id_chuc_vu` (matrix mode) → deny all.
 * - Khi `matrixActive === true`: đối chiếu `grantsByModule` theo `module_id` + `ActionType`.
 */
export function can(
  user: User | null | undefined,
  action: AppAction,
  resource: AppResource
): boolean {
  if (!user) return false;

  // Mock mode: admin toàn quyền UI. Supabase mode luôn `role='user'` — không tin cache mock cũ.
  if (user.role === 'admin' && !isSupabase()) {
    if (resource === 'profile' && action === 'delete') return false;
    return true;
  }

  // Matrix mode: không có chức vụ → không có quyền gì
  if (isPermissionMatrixEnabled() && !user.id_chuc_vu) {
    return false;
  }

  const { matrixActive, grantsByModule, chucVuCapBac } = usePermissionGrantStore.getState();
  if (matrixActive) {
    if (isGlobalCapBacBypass(action, resource, chucVuCapBac)) {
      return true;
    }

    if (resource === 'departments') {
      return canDepartmentsWithCapBac(user, action, grantsByModule);
    }
    // Có quyền xem module ⇒ được xuất/nhập (client-side; RLS/API vẫn là chuẩn bảo vệ dữ liệu).
    if (
      (action === 'export' || action === 'import') &&
      APP_RESOURCE_TO_MODULE[resource] !== undefined &&
      matrixCan(user, 'view', resource)
    ) {
      return true;
    }
    return matrixCan(user, action, resource);
  }

  return legacyCan(user, action, resource);
}
