import React, { useMemo } from 'react';
import { txt } from '@/lib/text';
import { Edit, Trash2, FlaskConical, Power, Hash, FolderTree, Calendar, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';
import EnumBadge from '@/components/ui/EnumBadge';
import type { BadgeConfig } from '@/components/ui/EnumBadge';
import type { MaterialCatalogItem } from '../core/types';
import { formatDate, formatDateTimeShort } from '@/lib/utils';
import GenericDrawer, { DRAWER_WIDTH_DETAIL } from '@/components/shared/GenericDrawer';
import DetailSummaryCard, { DetailSummaryIconTile } from '@/components/shared/DetailSummaryCard';
import DetailSection from '@/components/shared/DetailSection';
import DetailField from '@/components/shared/DetailField';
import DetailFieldGrid from '@/components/shared/DetailFieldGrid';
import DetailToolbar, { DetailToolbarAction } from '@/components/shared/DetailToolbar';
import { BTN_CLOSE, BTN_EDIT, BTN_DELETE } from '@/lib/button-labels';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';
import { MaterialSpecFieldsDetailSection } from './material-spec-fields-section';

interface Props {
  data: MaterialCatalogItem;
  onClose: () => void;
  onEdit: (item: MaterialCatalogItem) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (item: MaterialCatalogItem) => void;
}

const MaterialCatalogDetail: React.FC<Props> = ({
  data,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const { canEdit, canDelete } = useResourcePermissions('materialCatalog');
  const isActive = data.trang_thai === 'Đang hoạt động';

  const trangThaiBadgeConfig = useMemo((): BadgeConfig<string> => ({
    'Đang hoạt động': { label: txt('common.activeStatus'), color: 'emerald' },
    'Ngừng hoạt động': { label: txt('common.inactiveStatus'), color: 'slate' },
  }), []);

  const toolbarActions: DetailToolbarAction[] = [
    ...(onStatusChange && canEdit
      ? [
          {
            label: isActive
              ? txt('materialCatalog.detail.deactivate')
              : txt('materialCatalog.detail.activate'),
            icon: <Power size={16} />,
            onClick: () => onStatusChange(data),
            variant: 'info' as const,
          },
        ]
      : []),
  ];

  const renderFooter = (
    <div className="flex items-center justify-between w-full gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground border border-border"
      >
        {BTN_CLOSE()}
      </Button>
      {canEdit || canDelete ? (
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button
              size="sm"
              onClick={() => {
                onEdit(data);
                onClose();
              }}
              className="h-8 px-3 text-xs bg-primary text-white shadow-sm hover:bg-primary/90"
            >
              <Edit className="w-3.5 h-3.5 mr-1.5 shrink-0" />
              {BTN_EDIT()}
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onDelete(data.id);
                onClose();
              }}
              className="h-8 px-3 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/50 dark:text-rose-400 border border-rose-200 hover:border-rose-300 dark:border-rose-800 dark:hover:border-rose-700"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5 shrink-0" />
              {BTN_DELETE()}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );

  return (
    <GenericDrawer
      title={txt('materialCatalog.detail.title')}
      subtitle={txt('materialCatalog.detail.subtitle')}
      icon={<FlaskConical size={18} />}
      onClose={onClose}
      footer={renderFooter}
      footerCompact
      maxWidthClass={DRAWER_WIDTH_DETAIL}
    >
      <div className="space-y-5">
        <DetailSummaryCard
          leading={
            <DetailSummaryIconTile>
              <FlaskConical size={26} className="text-white" />
            </DetailSummaryIconTile>
          }
          title={data.ten_nguyen_lieu}
          subtitle={data.ma_nguyen_lieu}
          badge={<EnumBadge value={data.trang_thai} config={trangThaiBadgeConfig} />}
        />

        {toolbarActions.length > 0 ? (
          <DetailToolbar actions={toolbarActions} className="bg-card rounded-xl border border-border" />
        ) : null}

        <DetailSection title={txt('materialCatalog.detail.basicInfo')} icon={<FlaskConical size={14} />}>
          <DetailFieldGrid>
            <DetailField label={txt('materialCatalog.form.code')} value={data.ma_nguyen_lieu} icon={Hash} />
            <DetailField
              label={txt('materialCatalog.detail.categoryGroup')}
              value={data.ten_nhom_danh_muc || '—'}
              icon={FolderTree}
            />
            <DetailField
              label={txt('materialCatalog.detail.category')}
              value={data.ten_danh_muc}
              icon={FolderTree}
            />
            <DetailField
              label={txt('common.status')}
              value={<EnumBadge value={data.trang_thai} config={trangThaiBadgeConfig} />}
            />
            {data.mo_ta ? (
              <div className="sm:col-span-2">
                <DetailField label={txt('materialCatalog.form.description')} value={data.mo_ta} />
              </div>
            ) : null}
          </DetailFieldGrid>
        </DetailSection>

        <MaterialSpecFieldsDetailSection data={data} />

        <DetailSection title={txt('materialCatalog.detail.systemInfo')} icon={<Clock size={14} />}>
          <DetailFieldGrid>
            <DetailField
              label={txt('materialCatalog.detail.createdAt')}
              value={formatDate(data.tg_tao)}
              icon={Calendar}
            />
            <DetailField
              label={txt('materialCatalog.detail.updated')}
              value={formatDateTimeShort(data.tg_cap_nhat)}
              icon={Clock}
            />
          </DetailFieldGrid>
        </DetailSection>
      </div>
    </GenericDrawer>
  );
};

export default MaterialCatalogDetail;
