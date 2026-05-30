import { useHydratePositionPermissions } from '@/hooks/use-hydrate-position-permissions';

/** Hydrate quyền theo chức vụ sau đăng nhập (Supabase: bật mặc định). */
export function PermissionMatrixSynchronizer() {
  useHydratePositionPermissions();
  return null;
}
