import React from 'react';
import { txt } from '@/lib/text';
import ModulePlaceholder from '@/components/placeholder/ModulePlaceholder';
import { navPathIcon } from '@/lib/nav-path-icons';

export type FinanceModuleKey =
  | 'so-thu-chi'
  | 'tai-khoan'
  | 'danh-muc-tai-chinh'
  | 'tra-cuu-tai-khoan'
  | 'bao-cao-tai-chinh';

const TITLE_KEYS: Record<FinanceModuleKey, string> = {
  'so-thu-chi': 'page.financeDashboard.ledger',
  'tai-khoan': 'page.financeDashboard.account',
  'danh-muc-tai-chinh': 'page.financeDashboard.category',
  'tra-cuu-tai-khoan': 'page.financeDashboard.accountLookup',
  'bao-cao-tai-chinh': 'page.financeDashboard.financialReport',
};

const MODULE_PATHS: Record<FinanceModuleKey, string> = {
  'so-thu-chi': '/tai-chinh/so-thu-chi',
  'tai-khoan': '/tai-chinh/tai-khoan',
  'danh-muc-tai-chinh': '/tai-chinh/danh-muc-tai-chinh',
  'tra-cuu-tai-khoan': '/tai-chinh/tra-cuu-tai-khoan',
  'bao-cao-tai-chinh': '/tai-chinh/bao-cao-tai-chinh',
};

interface FinanceModulePlaceholderProps {
  moduleKey: FinanceModuleKey;
}

const FinanceModulePlaceholder: React.FC<FinanceModulePlaceholderProps> = ({ moduleKey }) => (
  <ModulePlaceholder
    submenuPath="/tai-chinh"
    submenuTitle={txt('nav.finance')}
    moduleTitle={txt(TITLE_KEYS[moduleKey])}
    icon={navPathIcon(MODULE_PATHS[moduleKey])}
  />
);

export default FinanceModulePlaceholder;
