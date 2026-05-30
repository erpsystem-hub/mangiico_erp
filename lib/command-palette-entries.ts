/**
 * Các mục điều hướng nhanh cho Command Palette (Cmd/Ctrl+K).
 * `nameKey` tra qua `txt()` — giữ đồng bộ với nhãn sidebar / dashboard.
 */
export interface CommandPaletteEntry {
  path: string;
  nameKey: string;
  /** Key nhóm (hiển thị section trong palette) — `nav.commandPalette.group*` */
  groupKey: string;
}

export const COMMAND_PALETTE_ENTRIES: readonly CommandPaletteEntry[] = [
  { path: '/', nameKey: 'nav.home', groupKey: 'nav.commandPalette.groupGeneral' },
  { path: '/thong-tin-ban-quyen', nameKey: 'nav.licenseInfo', groupKey: 'nav.commandPalette.groupGeneral' },
  { path: '/kinh-doanh', nameKey: 'nav.business', groupKey: 'nav.commandPalette.groupBusiness' },
  { path: '/san-xuat', nameKey: 'nav.production', groupKey: 'nav.commandPalette.groupProduction' },
  {
    path: '/san-xuat/lenh-san-xuat',
    nameKey: 'page.productionDashboard.productionOrder',
    groupKey: 'nav.commandPalette.groupProduction',
  },
  {
    path: '/san-xuat/bao-cao-san-xuat',
    nameKey: 'page.productionDashboard.productionReport',
    groupKey: 'nav.commandPalette.groupProduction',
  },
  {
    path: '/san-xuat/phieu-kho',
    nameKey: 'page.productionDashboard.warehouseSlip',
    groupKey: 'nav.commandPalette.groupProduction',
  },
  {
    path: '/san-xuat/bao-cao-kho',
    nameKey: 'page.productionDashboard.warehouseReport',
    groupKey: 'nav.commandPalette.groupProduction',
  },
  {
    path: '/san-xuat/danh-sach-kho',
    nameKey: 'page.productionDashboard.warehouseList',
    groupKey: 'nav.commandPalette.groupProduction',
  },
  {
    path: '/san-xuat/danh-muc-hang-hoa',
    nameKey: 'page.productionDashboard.productCategory',
    groupKey: 'nav.commandPalette.groupProduction',
  },
  {
    path: '/san-xuat/danh-sach-hang-hoa',
    nameKey: 'page.productionDashboard.productList',
    groupKey: 'nav.commandPalette.groupProduction',
  },
  {
    path: '/san-xuat/thuoc-tinh-hang-hoa',
    nameKey: 'page.productionDashboard.productAttributes',
    groupKey: 'nav.commandPalette.groupProduction',
  },
  {
    path: '/san-xuat/thong-so-do',
    nameKey: 'page.productionDashboard.measurementSpec',
    groupKey: 'nav.commandPalette.groupProduction',
  },
  {
    path: '/san-xuat/bom',
    nameKey: 'page.productionDashboard.bom',
    groupKey: 'nav.commandPalette.groupProduction',
  },
  {
    path: '/san-xuat/danh-muc-nguyen-lieu',
    nameKey: 'page.productionDashboard.materialCategory',
    groupKey: 'nav.commandPalette.groupProduction',
  },
  {
    path: '/san-xuat/danh-sach-nguyen-lieu',
    nameKey: 'page.productionDashboard.materialList',
    groupKey: 'nav.commandPalette.groupProduction',
  },
  { path: '/tai-chinh', nameKey: 'nav.finance', groupKey: 'nav.commandPalette.groupFinance' },
  { path: '/tai-chinh/so-thu-chi', nameKey: 'page.financeDashboard.ledger', groupKey: 'nav.commandPalette.groupFinance' },
  { path: '/tai-chinh/tai-khoan', nameKey: 'page.financeDashboard.account', groupKey: 'nav.commandPalette.groupFinance' },
  {
    path: '/tai-chinh/danh-muc-tai-chinh',
    nameKey: 'page.financeDashboard.category',
    groupKey: 'nav.commandPalette.groupFinance',
  },
  {
    path: '/tai-chinh/tra-cuu-tai-khoan',
    nameKey: 'page.financeDashboard.accountLookup',
    groupKey: 'nav.commandPalette.groupFinance',
  },
  {
    path: '/tai-chinh/bao-cao-tai-chinh',
    nameKey: 'page.financeDashboard.financialReport',
    groupKey: 'nav.commandPalette.groupFinance',
  },
  { path: '/he-thong', nameKey: 'nav.system', groupKey: 'nav.commandPalette.groupSystem' },
  { path: '/he-thong/nhan-vien', nameKey: 'page.systemDashboard.employee', groupKey: 'nav.commandPalette.groupSystem' },
  { path: '/he-thong/phong-ban', nameKey: 'page.systemDashboard.department', groupKey: 'nav.commandPalette.groupSystem' },
  { path: '/he-thong/chuc-vu', nameKey: 'page.systemDashboard.position', groupKey: 'nav.commandPalette.groupSystem' },
  { path: '/he-thong/thong-tin-to-chuc', nameKey: 'page.systemDashboard.companyInfo', groupKey: 'nav.commandPalette.groupSystem' },
  { path: '/he-thong/chi-nhanh', nameKey: 'page.systemDashboard.branch', groupKey: 'nav.commandPalette.groupSystem' },
  { path: '/he-thong/phan-quyen', nameKey: 'page.systemDashboard.permission', groupKey: 'nav.commandPalette.groupSystem' },
  { path: '/ho-so', nameKey: 'nav.profile', groupKey: 'nav.commandPalette.groupAccount' },
  { path: '/cai-dat', nameKey: 'nav.settings', groupKey: 'nav.commandPalette.groupAccount' },
  { path: '/thong-bao', nameKey: 'nav.notification', groupKey: 'nav.commandPalette.groupAccount' },
] as const;
