import type { User } from '@/types';
import { can, APP_RESOURCE_TO_MODULE, type AppResource } from '@/lib/permissions';

const HE_THONG_PREFIX = 'he-thong/';
const TAI_CHINH_PREFIX = 'tai-chinh/';
const SAN_XUAT_PREFIX = 'san-xuat/';
const KINH_DOANH_PREFIX = 'kinh-doanh/';

/** Các `AppResource` thuộc nhóm Hệ thống (prefix `he-thong/` trong ma trận). */
export function getHeThongAppResources(): AppResource[] {
  return (Object.entries(APP_RESOURCE_TO_MODULE) as [AppResource, string][])
    .filter(([, mod]) => typeof mod === 'string' && mod.startsWith(HE_THONG_PREFIX))
    .map(([res]) => res);
}

export function getTaiChinhAppResources(): AppResource[] {
  return (Object.entries(APP_RESOURCE_TO_MODULE) as [AppResource, string][])
    .filter(([, mod]) => typeof mod === 'string' && mod.startsWith(TAI_CHINH_PREFIX))
    .map(([res]) => res);
}

export function getSanXuatAppResources(): AppResource[] {
  return (Object.entries(APP_RESOURCE_TO_MODULE) as [AppResource, string][])
    .filter(([, mod]) => typeof mod === 'string' && mod.startsWith(SAN_XUAT_PREFIX))
    .map(([res]) => res);
}

export function getKinhDoanhAppResources(): AppResource[] {
  return (Object.entries(APP_RESOURCE_TO_MODULE) as [AppResource, string][])
    .filter(([, mod]) => typeof mod === 'string' && mod.startsWith(KINH_DOANH_PREFIX))
    .map(([res]) => res);
}

/**
 * Danh sách resource dùng để quyết định **có hiện mục sidebar / thẻ Trang chủ** không (`can('view', …)`).
 * `null` = chưa áp dụng lọc theo resource (luôn hiện nếu đã qua các điều kiện khác).
 */
export function getSidebarPathGateResources(path: string): AppResource[] | null {
  if (path === '/he-thong') {
    return getHeThongAppResources();
  }
  if (path === '/tai-chinh') {
    return getTaiChinhAppResources();
  }
  if (path === '/san-xuat') {
    return getSanXuatAppResources();
  }
  if (path === '/kinh-doanh') {
    return getKinhDoanhAppResources();
  }
  return null; // `/`, `/thong-tin-ban-quyen` → luôn hiện
}

/** `/`, submenu placeholder và bản quyền luôn hiện (chưa gắn ma trận quyền). */
export function isSidebarPathAlwaysVisible(path: string): boolean {
  return (
    path === '/' ||
    path === '/thong-tin-ban-quyen'
  );
}

export function isSidebarPathVisibleForUser(user: User | null | undefined, path: string): boolean {
  if (!user) return false;
  if (isSidebarPathAlwaysVisible(path)) return true;
  const gated = getSidebarPathGateResources(path);
  if (gated == null) return true;
  return gated.some((r) => can(user, 'view', r));
}

/** `navigate('/x')` với `/x` === '/' + `module_id` từ `APP_RESOURCE_TO_MODULE`. */
export function appResourceForDashboardNavigatePath(navPath: string): AppResource | null {
  const key = navPath.startsWith('/') ? navPath.slice(1) : navPath;
  const entry = (Object.entries(APP_RESOURCE_TO_MODULE) as [AppResource, string][]).find(([, mod]) => mod === key);
  return entry?.[0] ?? null;
}
