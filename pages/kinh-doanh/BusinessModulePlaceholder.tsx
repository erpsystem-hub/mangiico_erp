import React from 'react';
import { txt } from '@/lib/text';
import ModulePlaceholder from '@/components/placeholder/ModulePlaceholder';
import { navPathIcon } from '@/lib/nav-path-icons';

export type BusinessModuleKey =
  | 'don-hang'
  | 'bao-cao-ban-hang'
  | 'bao-cao-cong-no-khach-hang'
  | 'bao-cao-cong-no-nha-cung-cap';

const TITLE_KEYS: Record<BusinessModuleKey, string> = {
  'don-hang': 'page.businessDashboard.salesOrder',
  'bao-cao-ban-hang': 'page.businessDashboard.salesReport',
  'bao-cao-cong-no-khach-hang': 'page.businessDashboard.customerDebtReport',
  'bao-cao-cong-no-nha-cung-cap': 'page.businessDashboard.supplierDebtReport',
};

const MODULE_PATHS: Record<BusinessModuleKey, string> = {
  'don-hang': '/kinh-doanh/don-hang',
  'bao-cao-ban-hang': '/kinh-doanh/bao-cao-ban-hang',
  'bao-cao-cong-no-khach-hang': '/kinh-doanh/bao-cao-cong-no-khach-hang',
  'bao-cao-cong-no-nha-cung-cap': '/kinh-doanh/bao-cao-cong-no-nha-cung-cap',
};

interface BusinessModulePlaceholderProps {
  moduleKey: BusinessModuleKey;
}

const BusinessModulePlaceholder: React.FC<BusinessModulePlaceholderProps> = ({ moduleKey }) => (
  <ModulePlaceholder
    submenuPath="/kinh-doanh"
    submenuTitle={txt('nav.business')}
    moduleTitle={txt(TITLE_KEYS[moduleKey])}
    icon={navPathIcon(MODULE_PATHS[moduleKey])}
  />
);

export default BusinessModulePlaceholder;
