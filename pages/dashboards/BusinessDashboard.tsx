import React, { useMemo } from 'react';
import { txt } from '../../lib/text';
import { useNavigate } from 'react-router-dom';
import ModuleDashboardLayout from '../../components/dashboard/ModuleDashboardLayout';
import type { ModuleGroup } from '../../components/dashboard/ModuleDashboardLayout';
import type { ModuleItem } from '../../components/dashboard/SubModuleCard';
import { useAuthStore } from '../../store/useStore';
import { usePermissionGrantStore } from '../../store/usePermissionGrantStore';
import { can } from '../../lib/permissions';
import { appResourceForDashboardNavigatePath } from '../../lib/nav-module-visibility';
import { navPathIcon } from '../../lib/nav-path-icons';

const BusinessDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const matrixActive = usePermissionGrantStore((s) => s.matrixActive);
  const grantsByModule = usePermissionGrantStore((s) => s.grantsByModule);
  const chucVuCapBac = usePermissionGrantStore((s) => s.chucVuCapBac);

  const groups = useMemo((): ModuleGroup[] => {
    type Draft = Omit<ModuleItem, 'action'> & { path: string };
    const raw: { groupTitle: string; items: Draft[] }[] = [
      {
        groupTitle: txt('page.businessDashboard.salesGroup'),
        items: [
          {
            path: '/kinh-doanh/don-hang',
            title: txt('page.businessDashboard.salesOrder'),
            description: txt('page.businessDashboard.salesOrderDesc'),
            icon: navPathIcon('/kinh-doanh/don-hang'),
            color: 'bg-sky-500',
          },
          {
            path: '/kinh-doanh/bao-cao-ban-hang',
            title: txt('page.businessDashboard.salesReport'),
            description: txt('page.businessDashboard.salesReportDesc'),
            icon: navPathIcon('/kinh-doanh/bao-cao-ban-hang'),
            color: 'bg-blue-500',
          },
        ],
      },
      {
        groupTitle: txt('page.businessDashboard.purchaseGroup'),
        items: [
          {
            path: '/kinh-doanh/mua-nguyen-lieu',
            title: txt('page.businessDashboard.materialPurchase'),
            description: txt('page.businessDashboard.materialPurchaseDesc'),
            icon: navPathIcon('/kinh-doanh/mua-nguyen-lieu'),
            color: 'bg-indigo-500',
          },
        ],
      },
      {
        groupTitle: txt('page.businessDashboard.customerGroup'),
        items: [
          {
            path: '/kinh-doanh/danh-sach-khach-hang',
            title: txt('page.businessDashboard.customerList'),
            description: txt('page.businessDashboard.customerListDesc'),
            icon: navPathIcon('/kinh-doanh/danh-sach-khach-hang'),
            color: 'bg-teal-500',
          },
          {
            path: '/kinh-doanh/bao-cao-cong-no-khach-hang',
            title: txt('page.businessDashboard.customerDebtReport'),
            description: txt('page.businessDashboard.customerDebtReportDesc'),
            icon: navPathIcon('/kinh-doanh/bao-cao-cong-no-khach-hang'),
            color: 'bg-emerald-500',
          },
        ],
      },
      {
        groupTitle: txt('page.businessDashboard.supplierGroup'),
        items: [
          {
            path: '/kinh-doanh/danh-sach-nha-cung-cap',
            title: txt('page.businessDashboard.supplierList'),
            description: txt('page.businessDashboard.supplierListDesc'),
            icon: navPathIcon('/kinh-doanh/danh-sach-nha-cung-cap'),
            color: 'bg-purple-500',
          },
          {
            path: '/kinh-doanh/bao-cao-cong-no-nha-cung-cap',
            title: txt('page.businessDashboard.supplierDebtReport'),
            description: txt('page.businessDashboard.supplierDebtReportDesc'),
            icon: navPathIcon('/kinh-doanh/bao-cao-cong-no-nha-cung-cap'),
            color: 'bg-fuchsia-500',
          },
        ],
      },
    ];

    return raw
      .map((g) => ({
        groupTitle: g.groupTitle,
        items: g.items
          .filter((item) => {
            const res = appResourceForDashboardNavigatePath(item.path);
            if (!user || res == null) return true;
            return can(user, 'view', res);
          })
          .map(
            (item): ModuleItem => ({
              title: item.title,
              description: item.description,
              icon: item.icon,
              color: item.color,
              action: () => navigate(item.path),
            }),
          ),
      }))
      .filter((g) => g.items.length > 0);
  }, [user, matrixActive, grantsByModule, chucVuCapBac, navigate]);

  return (
    <ModuleDashboardLayout
      groups={groups}
      backTo="/"
      submenuTitle={txt('nav.business')}
      submenuIcon={navPathIcon('/kinh-doanh')}
    />
  );
};

export default BusinessDashboard;
