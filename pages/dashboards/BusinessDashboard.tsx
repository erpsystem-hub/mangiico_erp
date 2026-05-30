import React from 'react';
import { txt } from '../../lib/text';
import ModuleDashboardLayout from '../../components/dashboard/ModuleDashboardLayout';
import { navPathIcon } from '../../lib/nav-path-icons';

const BusinessDashboard: React.FC = () => (
  <ModuleDashboardLayout
    groups={[]}
    submenuTitle={txt('nav.business')}
    submenuIcon={navPathIcon('/kinh-doanh')}
  />
);

export default BusinessDashboard;
