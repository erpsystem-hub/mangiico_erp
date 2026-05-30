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

const ProductionDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const matrixActive = usePermissionGrantStore((s) => s.matrixActive);
  const grantsByModule = usePermissionGrantStore((s) => s.grantsByModule);
  const chucVuCapBac = usePermissionGrantStore((s) => s.chucVuCapBac);

  const groups = useMemo((): ModuleGroup[] => {
    type Draft = Omit<ModuleItem, 'action'> & { path: string };
    const raw: { groupTitle: string; items: Draft[] }[] = [
      {
        groupTitle: txt('page.productionDashboard.productionGroup'),
        items: [
          {
            path: '/san-xuat/lenh-san-xuat',
            title: txt('page.productionDashboard.productionOrder'),
            description: txt('page.productionDashboard.productionOrderDesc'),
            icon: navPathIcon('/san-xuat/lenh-san-xuat'),
            color: 'bg-emerald-500',
          },
          {
            path: '/san-xuat/bao-cao-san-xuat',
            title: txt('page.productionDashboard.productionReport'),
            description: txt('page.productionDashboard.productionReportDesc'),
            icon: navPathIcon('/san-xuat/bao-cao-san-xuat'),
            color: 'bg-teal-500',
          },
        ],
      },
      {
        groupTitle: txt('page.productionDashboard.warehouseGroup'),
        items: [
          {
            path: '/san-xuat/phieu-kho',
            title: txt('page.productionDashboard.warehouseSlip'),
            description: txt('page.productionDashboard.warehouseSlipDesc'),
            icon: navPathIcon('/san-xuat/phieu-kho'),
            color: 'bg-cyan-500',
          },
          {
            path: '/san-xuat/bao-cao-kho',
            title: txt('page.productionDashboard.warehouseReport'),
            description: txt('page.productionDashboard.warehouseReportDesc'),
            icon: navPathIcon('/san-xuat/bao-cao-kho'),
            color: 'bg-sky-500',
          },
          {
            path: '/san-xuat/danh-sach-kho',
            title: txt('page.productionDashboard.warehouseList'),
            description: txt('page.productionDashboard.warehouseListDesc'),
            icon: navPathIcon('/san-xuat/danh-sach-kho'),
            color: 'bg-stone-500',
          },
        ],
      },
      {
        groupTitle: txt('page.productionDashboard.goodsGroup'),
        items: [
          {
            path: '/san-xuat/danh-muc-hang-hoa',
            title: txt('page.productionDashboard.productCategory'),
            description: txt('page.productionDashboard.productCategoryDesc'),
            icon: navPathIcon('/san-xuat/danh-muc-hang-hoa'),
            color: 'bg-lime-500',
          },
          {
            path: '/san-xuat/danh-sach-hang-hoa',
            title: txt('page.productionDashboard.productList'),
            description: txt('page.productionDashboard.productListDesc'),
            icon: navPathIcon('/san-xuat/danh-sach-hang-hoa'),
            color: 'bg-green-500',
          },
          {
            path: '/san-xuat/thuoc-tinh-hang-hoa',
            title: txt('page.productionDashboard.productAttributes'),
            description: txt('page.productionDashboard.productAttributesDesc'),
            icon: navPathIcon('/san-xuat/thuoc-tinh-hang-hoa'),
            color: 'bg-amber-500',
          },
          {
            path: '/san-xuat/thong-so-do',
            title: txt('page.productionDashboard.measurementSpec'),
            description: txt('page.productionDashboard.measurementSpecDesc'),
            icon: navPathIcon('/san-xuat/thong-so-do'),
            color: 'bg-orange-500',
          },
          {
            path: '/san-xuat/bom',
            title: txt('page.productionDashboard.bom'),
            description: txt('page.productionDashboard.bomDesc'),
            icon: navPathIcon('/san-xuat/bom'),
            color: 'bg-rose-500',
          },
        ],
      },
      {
        groupTitle: txt('page.productionDashboard.materialsGroup'),
        items: [
          {
            path: '/san-xuat/danh-muc-nguyen-lieu',
            title: txt('page.productionDashboard.materialCategory'),
            description: txt('page.productionDashboard.materialCategoryDesc'),
            icon: navPathIcon('/san-xuat/danh-muc-nguyen-lieu'),
            color: 'bg-violet-500',
          },
          {
            path: '/san-xuat/danh-sach-nguyen-lieu',
            title: txt('page.productionDashboard.materialList'),
            description: txt('page.productionDashboard.materialListDesc'),
            icon: navPathIcon('/san-xuat/danh-sach-nguyen-lieu'),
            color: 'bg-purple-500',
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
      submenuTitle={txt('nav.production')}
      submenuIcon={navPathIcon('/san-xuat')}
    />
  );
};

export default ProductionDashboard;
