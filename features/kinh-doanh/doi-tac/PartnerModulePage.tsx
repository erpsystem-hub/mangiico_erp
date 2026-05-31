import React, { useState } from 'react';
import { txt } from '@/lib/text';
import { FolderTree, Users } from 'lucide-react';
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

export interface PartnerModulePageProps {
  kind: PartnerKind;
}

const PartnerModulePage: React.FC<PartnerModulePageProps> = ({ kind }) => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const listResource = partnerListResource(kind);
  const canViewList = useCan('view', listResource);
  useResourcePermissions(listResource);
  const [activeTab, setActiveTab] = useTabSearchParam(['nhom', 'danh-sach'] as const, 'nhom');
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

  return (
    <div className="flex flex-col h-page relative">
      <div className="shrink-0 relative z-0">
        <TabGroup
          tabs={[
            { id: 'nhom', label: txt('partner.tabCategory'), icon: FolderTree },
            { id: 'danh-sach', label: txt('partner.tabList'), icon: Users },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      <div className="flex-1 min-h-0 flex flex-col mt-1.5">
        {activeTab === 'nhom' ? (
          <PartnerCategoryTab kind={kind} onNavigateToList={handleNavigateToList} />
        ) : (
          <PartnerListTab
            kind={kind}
            initialDanhMucIds={listDanhMucFilter.length ? listDanhMucFilter : undefined}
            onNavigateToList={handleNavigateToList}
          />
        )}
      </div>
    </div>
  );
};

export default PartnerModulePage;
