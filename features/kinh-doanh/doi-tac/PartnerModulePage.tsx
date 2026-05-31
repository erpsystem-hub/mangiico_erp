import React, { useState } from 'react';
import { txt } from '@/lib/text';
import { BadgeDollarSign, FolderTree, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useStore';
import { useCan } from '@/hooks/use-can';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';
import { useTabSearchParam } from '@/hooks/use-tab-search-param';
import TabGroup from '@/components/ui/TabGroup';
import type { PartnerKind } from './core/types';
import { partnerListResource, partnerModuleBackPath } from './core/constants';
import PartnerCategoryTab from './PartnerCategoryTab';
import PartnerListTab from './PartnerListTab';
import CustomerPriceMatrixTab from './gia-kh/CustomerPriceMatrixTab';

export interface PartnerModulePageProps {
  kind: PartnerKind;
}

const PartnerModulePage: React.FC<PartnerModulePageProps> = ({ kind }) => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const listResource = partnerListResource(kind);
  const canViewList = useCan('view', listResource);
  useResourcePermissions(listResource);
  const isCustomer = kind === 'khach_hang';
  const tabIds = isCustomer
    ? (['nhom', 'danh-sach', 'cai-dat-gia'] as const)
    : (['nhom', 'danh-sach'] as const);
  const [activeTab, setActiveTab] = useTabSearchParam(tabIds, 'nhom');
  const [listDanhMucFilter, setListDanhMucFilter] = useState<string[]>([]);

  React.useEffect(() => {
    if (!user || canViewList) return;
    toast.error(txt('partnerList.noViewPermission'));
    navigate(partnerModuleBackPath(kind), { replace: true });
  }, [user, canViewList, kind, navigate]);

  const handleNavigateToList = (danhMucIds: string[]) => {
    setListDanhMucFilter(danhMucIds);
    setActiveTab('danh-sach');
  };

  if (!canViewList) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[40vh] px-4"
        aria-busy="true"
      />
    );
  }

  const tabs = [
    { id: 'nhom' as const, label: txt('partner.tabCategory'), icon: FolderTree },
    { id: 'danh-sach' as const, label: txt('partner.tabList'), icon: Users },
    ...(isCustomer
      ? [{ id: 'cai-dat-gia' as const, label: txt('partner.tabPriceSettings'), icon: BadgeDollarSign }]
      : []),
  ];

  return (
    <div className="flex flex-col h-page relative">
      <div className="shrink-0 relative z-0">
        <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="flex-1 min-h-0 flex flex-col mt-1.5">
        {activeTab === 'nhom' ? (
          <PartnerCategoryTab kind={kind} onNavigateToList={handleNavigateToList} />
        ) : activeTab === 'danh-sach' ? (
          <PartnerListTab
            kind={kind}
            initialDanhMucIds={listDanhMucFilter.length ? listDanhMucFilter : undefined}
            onNavigateToList={handleNavigateToList}
          />
        ) : isCustomer ? (
          <CustomerPriceMatrixTab />
        ) : null}
      </div>
    </div>
  );
};

export default PartnerModulePage;
