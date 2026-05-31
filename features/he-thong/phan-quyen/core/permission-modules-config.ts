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
    id: 'kinh-doanh',
    nameKey: 'nav.business',
    color: 'sky',
    groups: [
      {
        groupTitleKey: 'page.businessDashboard.salesGroup',
        modules: [
          { id: 'kinh-doanh/don-hang', nameKey: 'page.businessDashboard.salesOrder' },
          { id: 'kinh-doanh/bao-cao-ban-hang', nameKey: 'page.businessDashboard.salesReport' },
        ],
      },
      {
        groupTitleKey: 'page.businessDashboard.purchaseGroup',
        modules: [
          { id: 'kinh-doanh/mua-nguyen-lieu', nameKey: 'page.businessDashboard.materialPurchase' },
        ],
      },
      {
        groupTitleKey: 'page.businessDashboard.customerGroup',
        modules: [
          { id: 'kinh-doanh/danh-sach-khach-hang', nameKey: 'page.businessDashboard.customerList' },
          {
            id: 'kinh-doanh/bao-cao-cong-no-khach-hang',
            nameKey: 'page.businessDashboard.customerDebtReport',
          },
        ],
      },
      {
        groupTitleKey: 'page.businessDashboard.supplierGroup',
        modules: [
          { id: 'kinh-doanh/danh-sach-nha-cung-cap', nameKey: 'page.businessDashboard.supplierList' },
          {
            id: 'kinh-doanh/bao-cao-cong-no-nha-cung-cap',
            nameKey: 'page.businessDashboard.supplierDebtReport',
          },
        ],
      },
    ],
  },
  {
    id: 'san-xuat',
    nameKey: 'nav.production',
    color: 'emerald',
    groups: [
      {
        groupTitleKey: 'page.productionDashboard.productionGroup',
        modules: [
          { id: 'san-xuat/lenh-san-xuat', nameKey: 'page.productionDashboard.productionOrder' },
          { id: 'san-xuat/bao-cao-san-xuat', nameKey: 'page.productionDashboard.productionReport' },
        ],
      },
      {
        groupTitleKey: 'page.productionDashboard.warehouseGroup',
        modules: [
          { id: 'san-xuat/phieu-kho', nameKey: 'page.productionDashboard.warehouseSlip' },
          { id: 'san-xuat/bao-cao-kho', nameKey: 'page.productionDashboard.warehouseReport' },
          { id: 'san-xuat/danh-sach-kho', nameKey: 'page.productionDashboard.warehouseList' },
        ],
      },
      {
        groupTitleKey: 'page.productionDashboard.goodsGroup',
        modules: [
          { id: 'san-xuat/danh-muc-hang-hoa', nameKey: 'page.productionDashboard.productCategory' },
          { id: 'san-xuat/danh-sach-hang-hoa', nameKey: 'page.productionDashboard.productList' },
          { id: 'san-xuat/thuoc-tinh-hang-hoa', nameKey: 'page.productionDashboard.productAttributes' },
          { id: 'san-xuat/thong-so-do', nameKey: 'page.productionDashboard.measurementSpec' },
          { id: 'san-xuat/bom', nameKey: 'page.productionDashboard.bom' },
        ],
      },
      {
        groupTitleKey: 'page.productionDashboard.materialsGroup',
        modules: [
          { id: 'san-xuat/danh-muc-nguyen-lieu', nameKey: 'page.productionDashboard.materialCategory' },
          { id: 'san-xuat/danh-sach-nguyen-lieu', nameKey: 'page.productionDashboard.materialList' },
        ],
      },
    ],
  },
  {
    id: 'tai-chinh',
    nameKey: 'nav.finance',
    color: 'amber',
    groups: [
      {
        groupTitleKey: 'page.financeDashboard.incomeExpenseGroup',
        modules: [
          { id: 'tai-chinh/so-thu-chi', nameKey: 'page.financeDashboard.ledger' },
          { id: 'tai-chinh/tai-khoan', nameKey: 'page.financeDashboard.account' },
          { id: 'tai-chinh/danh-muc-tai-chinh', nameKey: 'page.financeDashboard.category' },
        ],
      },
      {
        groupTitleKey: 'page.financeDashboard.reportsGroup',
        modules: [
          { id: 'tai-chinh/tra-cuu-tai-khoan', nameKey: 'page.financeDashboard.accountLookup' },
          { id: 'tai-chinh/bao-cao-tai-chinh', nameKey: 'page.financeDashboard.financialReport' },
        ],
      },
    ],
  },
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
          { id: 'he-thong/chi-nhanh', nameKey: 'page.systemDashboard.branch' },
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
