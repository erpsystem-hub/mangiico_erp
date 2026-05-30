import type { LucideIcon } from 'lucide-react';
import { NAV_PATH_ICONS } from './nav-path-icons';

export interface MenuItem {
  path: string;
  nameKey: string;
  descriptionKey?: string;
  icon: LucideIcon;
  gradient: string;
}

/** Menu sidebar và thẻ Trang chủ — Trang chủ, submenu nghiệp vụ, Bản quyền */
export const SIDEBAR_MENU: MenuItem[] = [
  {
    path: '/',
    nameKey: 'nav.home',
    descriptionKey: 'page.home.systemModuleDesc',
    icon: NAV_PATH_ICONS['/'],
    gradient: 'bg-gradient-to-br from-primary/90 to-primary',
  },
  {
    path: '/kinh-doanh',
    nameKey: 'nav.business',
    descriptionKey: 'page.home.placeholderModuleDesc',
    icon: NAV_PATH_ICONS['/kinh-doanh'],
    gradient: 'bg-gradient-to-br from-sky-600 to-sky-800 dark:from-sky-500 dark:to-sky-700',
  },
  {
    path: '/san-xuat',
    nameKey: 'nav.production',
    descriptionKey: 'page.home.placeholderModuleDesc',
    icon: NAV_PATH_ICONS['/san-xuat'],
    gradient: 'bg-gradient-to-br from-emerald-600 to-emerald-800 dark:from-emerald-500 dark:to-emerald-700',
  },
  {
    path: '/tai-chinh',
    nameKey: 'nav.finance',
    descriptionKey: 'page.home.placeholderModuleDesc',
    icon: NAV_PATH_ICONS['/tai-chinh'],
    gradient: 'bg-gradient-to-br from-amber-600 to-amber-800 dark:from-amber-500 dark:to-amber-700',
  },
  {
    path: '/he-thong',
    nameKey: 'nav.system',
    descriptionKey: 'page.home.systemModuleDesc',
    icon: NAV_PATH_ICONS['/he-thong'],
    gradient: 'bg-gradient-to-br from-slate-600 to-slate-800 dark:from-slate-500 dark:to-slate-700',
  },
  {
    path: '/thong-tin-ban-quyen',
    nameKey: 'nav.licenseInfo',
    descriptionKey: 'page.home.licenseInfoDesc',
    icon: NAV_PATH_ICONS['/thong-tin-ban-quyen'],
    gradient: 'bg-gradient-to-br from-blue-600 to-blue-800',
  },
];
