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

const FinanceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const matrixActive = usePermissionGrantStore((s) => s.matrixActive);
  const grantsByModule = usePermissionGrantStore((s) => s.grantsByModule);
  const chucVuCapBac = usePermissionGrantStore((s) => s.chucVuCapBac);

  const groups = useMemo((): ModuleGroup[] => {
    type Draft = Omit<ModuleItem, 'action'> & { path: string };
    const raw: { groupTitle: string; items: Draft[] }[] = [
      {
        groupTitle: txt('page.financeDashboard.incomeExpenseGroup'),
        items: [
          {
            path: '/tai-chinh/so-thu-chi',
            title: txt('page.financeDashboard.ledger'),
            description: txt('page.financeDashboard.ledgerDesc'),
            icon: navPathIcon('/tai-chinh/so-thu-chi'),
            color: 'bg-amber-500',
          },
          {
            path: '/tai-chinh/tai-khoan',
            title: txt('page.financeDashboard.account'),
            description: txt('page.financeDashboard.accountDesc'),
            icon: navPathIcon('/tai-chinh/tai-khoan'),
            color: 'bg-orange-500',
          },
          {
            path: '/tai-chinh/danh-muc-tai-chinh',
            title: txt('page.financeDashboard.category'),
            description: txt('page.financeDashboard.categoryDesc'),
            icon: navPathIcon('/tai-chinh/danh-muc-tai-chinh'),
            color: 'bg-yellow-500',
          },
        ],
      },
      {
        groupTitle: txt('page.financeDashboard.reportsGroup'),
        items: [
          {
            path: '/tai-chinh/tra-cuu-tai-khoan',
            title: txt('page.financeDashboard.accountLookup'),
            description: txt('page.financeDashboard.accountLookupDesc'),
            icon: navPathIcon('/tai-chinh/tra-cuu-tai-khoan'),
            color: 'bg-teal-500',
          },
          {
            path: '/tai-chinh/bao-cao-tai-chinh',
            title: txt('page.financeDashboard.financialReport'),
            description: txt('page.financeDashboard.financialReportDesc'),
            icon: navPathIcon('/tai-chinh/bao-cao-tai-chinh'),
            color: 'bg-cyan-500',
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
            })
          ),
      }))
      .filter((g) => g.items.length > 0);
  }, [user, matrixActive, grantsByModule, chucVuCapBac, navigate]);

  return (
    <ModuleDashboardLayout
      groups={groups}
      backTo="/"
      submenuTitle={txt('nav.finance')}
      submenuIcon={navPathIcon('/tai-chinh')}
    />
  );
};

export default FinanceDashboard;
