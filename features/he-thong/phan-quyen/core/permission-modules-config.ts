/**
 * Ma trận phân quyền: submenu (cấp sidebar), nhóm và trang con — khớp
 * `lib/sidebar-menu.tsx` + các dashboard `pages/dashboards/*Dashboard.tsx`.
 * Nhãn module/nhóm dùng chung key với dashboard (`page.*Dashboard.*`) để luôn đồng bộ với app.
 */

export interface PermissionModuleItem {
  id: string;
  nameKey: string;
  /** Key lưu `var_phan_quyen.module_key` (ngắn). Mặc định = segment sau `/` cuối của `id`. */
  storageKey?: string;
}

export interface PermissionModuleGroup {
  groupTitleKey: string;
  modules: PermissionModuleItem[];
}

export interface PermissionFunction {
  id: string;
  nameKey: string;
  color: string;
  groups: PermissionModuleGroup[];
}

export const PERMISSION_ACTIONS = ['view', 'create', 'update', 'delete', 'admin', 'all'] as const;
export type PermissionActionType = (typeof PERMISSION_ACTIONS)[number];

/** Thứ tự submenu = thứ tự mục trong sidebar (sau Trang chủ), bỏ qua bản quyền. */
export const PERMISSION_FUNCTIONS: PermissionFunction[] = [
  {
    id: 'he-thong',
    nameKey: 'nav.system',
    color: 'slate',
    groups: [
      {
        groupTitleKey: 'page.systemDashboard.orgChartGroup',
        modules: [
          { id: 'he-thong/phong-ban', nameKey: 'page.systemDashboard.department' },
          { id: 'he-thong/chuc-vu', nameKey: 'page.systemDashboard.position' },
          { id: 'he-thong/nhan-vien', nameKey: 'page.systemDashboard.employee' },
        ],
      },
      {
        groupTitleKey: 'page.systemDashboard.securityGroup',
        modules: [
          { id: 'he-thong/thong-tin-to-chuc', nameKey: 'page.systemDashboard.companyInfo' },
          { id: 'he-thong/phan-quyen', nameKey: 'page.systemDashboard.permission' },
        ],
      },
    ],
  },
];

export function getAllPermissionModules(): { id: string; nameKey: string }[] {
  const list: { id: string; nameKey: string }[] = [];
  PERMISSION_FUNCTIONS.forEach((fn) => {
    fn.groups.forEach((gr) => {
      gr.modules.forEach((m) => list.push({ id: m.id, nameKey: m.nameKey }));
    });
  });
  return list;
}
