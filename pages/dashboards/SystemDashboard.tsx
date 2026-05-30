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

const SystemDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const matrixActive = usePermissionGrantStore((s) => s.matrixActive);
  const grantsByModule = usePermissionGrantStore((s) => s.grantsByModule);
  const chucVuCapBac = usePermissionGrantStore((s) => s.chucVuCapBac);

  const groups = useMemo((): ModuleGroup[] => {
    type Draft = Omit<ModuleItem, 'action'> & { path: string };
    const raw: { groupTitle: string; items: Draft[] }[] = [
      {
        groupTitle: txt('page.systemDashboard.orgChartGroup'),
        items: [
          {
            path: '/he-thong/phong-ban',
            title: txt('page.systemDashboard.department'),
            description: txt('page.systemDashboard.departmentDesc'),
            icon: navPathIcon('/he-thong/phong-ban'),
            color: 'bg-indigo-500',
          },
          {
            path: '/he-thong/chuc-vu',
            title: txt('page.systemDashboard.position'),
            description: txt('page.systemDashboard.positionDesc'),
            icon: navPathIcon('/he-thong/chuc-vu'),
            color: 'bg-blue-500',
          },
          {
            path: '/he-thong/nhan-vien',
            title: txt('page.systemDashboard.employee'),
            description: txt('page.systemDashboard.employeeDesc'),
            icon: navPathIcon('/he-thong/nhan-vien'),
            color: 'bg-emerald-500',
          },
        ],
      },
      {
        groupTitle: txt('page.systemDashboard.securityGroup'),
        items: [
          {
            path: '/he-thong/thong-tin-to-chuc',
            title: txt('page.systemDashboard.companyInfo'),
            description: txt('page.systemDashboard.companyInfoDesc'),
            icon: navPathIcon('/he-thong/thong-tin-to-chuc'),
            color: 'bg-violet-500',
          },
          {
            path: '/he-thong/chi-nhanh',
            title: txt('page.systemDashboard.branch'),
            description: txt('page.systemDashboard.branchDesc'),
            icon: navPathIcon('/he-thong/chi-nhanh'),
            color: 'bg-teal-500',
          },
          {
            path: '/he-thong/phan-quyen',
            title: txt('page.systemDashboard.permission'),
            description: txt('page.systemDashboard.permissionDesc'),
            icon: navPathIcon('/he-thong/phan-quyen'),
            color: 'bg-rose-500',
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

  return <ModuleDashboardLayout groups={groups} />;
};

export default SystemDashboard;
