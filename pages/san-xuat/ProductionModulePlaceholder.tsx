import React from 'react';
import { txt } from '@/lib/text';
import ModulePlaceholder from '@/components/placeholder/ModulePlaceholder';
import { navPathIcon } from '@/lib/nav-path-icons';

export type ProductionModuleKey =
  | 'lenh-san-xuat'
  | 'bao-cao-san-xuat'
  | 'phieu-kho'
  | 'bao-cao-kho'
  | 'danh-muc-hang-hoa'
  | 'thuoc-tinh-hang-hoa'
  | 'thong-so-do'
  | 'danh-sach-kho'
  | 'danh-muc-nguyen-lieu'
  | 'danh-sach-nguyen-lieu'
  | 'bom';

const TITLE_KEYS: Record<ProductionModuleKey, string> = {
  'lenh-san-xuat': 'page.productionDashboard.productionOrder',
  'bao-cao-san-xuat': 'page.productionDashboard.productionReport',
  'phieu-kho': 'page.productionDashboard.warehouseSlip',
  'bao-cao-kho': 'page.productionDashboard.warehouseReport',
  'danh-muc-hang-hoa': 'page.productionDashboard.productCategory',
  'thuoc-tinh-hang-hoa': 'page.productionDashboard.productAttributes',
  'thong-so-do': 'page.productionDashboard.measurementSpec',
  'danh-sach-kho': 'page.productionDashboard.warehouseList',
  'danh-muc-nguyen-lieu': 'page.productionDashboard.materialCategory',
  'danh-sach-nguyen-lieu': 'page.productionDashboard.materialList',
  bom: 'page.productionDashboard.bom',
};

const MODULE_PATHS: Record<ProductionModuleKey, string> = {
  'lenh-san-xuat': '/san-xuat/lenh-san-xuat',
  'bao-cao-san-xuat': '/san-xuat/bao-cao-san-xuat',
  'phieu-kho': '/san-xuat/phieu-kho',
  'bao-cao-kho': '/san-xuat/bao-cao-kho',
  'danh-muc-hang-hoa': '/san-xuat/danh-muc-hang-hoa',
  'thuoc-tinh-hang-hoa': '/san-xuat/thuoc-tinh-hang-hoa',
  'thong-so-do': '/san-xuat/thong-so-do',
  'danh-sach-kho': '/san-xuat/danh-sach-kho',
  'danh-muc-nguyen-lieu': '/san-xuat/danh-muc-nguyen-lieu',
  'danh-sach-nguyen-lieu': '/san-xuat/danh-sach-nguyen-lieu',
  bom: '/san-xuat/bom',
};

interface ProductionModulePlaceholderProps {
  moduleKey: ProductionModuleKey;
}

const ProductionModulePlaceholder: React.FC<ProductionModulePlaceholderProps> = ({ moduleKey }) => (
  <ModulePlaceholder
    submenuPath="/san-xuat"
    submenuTitle={txt('nav.production')}
    moduleTitle={txt(TITLE_KEYS[moduleKey])}
    icon={navPathIcon(MODULE_PATHS[moduleKey])}
  />
);

export default ProductionModulePlaceholder;
