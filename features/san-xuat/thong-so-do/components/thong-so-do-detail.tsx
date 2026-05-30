import React, { useMemo } from 'react';
import { txt } from '@/lib/text';
import { Edit, Trash2, Ruler, Power, Type, Hash, Calendar, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';
import EnumBadge from '@/components/ui/EnumBadge';
import type { BadgeConfig } from '@/components/ui/EnumBadge';
import type { MeasurementSpec } from '../core/types';
import { formatDate, formatDateTimeShort } from '@/lib/utils';
import GenericDrawer, { DRAWER_WIDTH_DETAIL } from '@/components/shared/GenericDrawer';
import DetailSummaryCard, { DetailSummaryIconTile } from '@/components/shared/DetailSummaryCard';
import DetailSection from '@/components/shared/DetailSection';
import DetailField from '@/components/shared/DetailField';
import DetailFieldGrid from '@/components/shared/DetailFieldGrid';
import DetailToolbar, { DetailToolbarAction } from '@/components/shared/DetailToolbar';
import { BTN_CLOSE, BTN_EDIT, BTN_DELETE } from '@/lib/button-labels';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';

interface Props {
  data: MeasurementSpec;
  onClose: () => void;
  onEdit: (item: MeasurementSpec) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (item: MeasurementSpec) => void;
}

const MeasurementSpecDetail: React.FC<Props> = ({
  data,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const { canEdit, canDelete } = useResourcePermissions('measurementSpecs');
  const isActive = data.trang_thai === 'Đang hoạt động';

  const trangThaiBadgeConfig = useMemo((): BadgeConfig<string> => ({
    'Đang hoạt động': { label: txt('measurementSpec.active'), color: 'emerald' },
    'Ngừng hoạt động': { label: txt('measurementSpec.inactive'), color: 'slate' },
  }), []);

  const toolbarActions: DetailToolbarAction[] = [
    ...(onStatusChange && canEdit
      ? [
          {
            label: isActive
              ? txt('measurementSpec.detail.deactivate')
              : txt('measurementSpec.detail.activate'),
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
      title={txt('measurementSpec.detail.title')}
      subtitle={txt('measurementSpec.detail.subtitle')}
      icon={<Ruler size={18} />}
      onClose={onClose}
      footer={renderFooter}
      footerCompact
      maxWidthClass={DRAWER_WIDTH_DETAIL}
    >
      <div className="space-y-5">
        <DetailSummaryCard
          leading={
            <DetailSummaryIconTile>
              <Ruler size={26} className="text-white" />
            </DetailSummaryIconTile>
          }
          title={data.ten_hien_thi}
          badge={<EnumBadge value={data.trang_thai} config={trangThaiBadgeConfig} />}
          subtitle={
            <p className="m-0 truncate text-muted-foreground">
              {txt('measurementSpec.form.unit')}: {data.don_vi}
            </p>
          }
        />

        {toolbarActions.length > 0 && (
          <DetailToolbar actions={toolbarActions} className="bg-card rounded-xl border border-border" />
        )}

        <DetailSection
          title={txt('measurementSpec.detail.basicInfo')}
          icon={<Ruler size={14} />}
          variant="primary"
        >
          <DetailFieldGrid>
            <DetailField
              label={txt('measurementSpec.form.displayName')}
              value={data.ten_hien_thi}
              icon={<Type size={12} />}
            />
            <DetailField
              label={txt('measurementSpec.form.unit')}
              value={data.don_vi}
              icon={<Hash size={12} />}
            />
            <DetailField
              label={txt('common.status')}
              value={isActive ? txt('measurementSpec.active') : txt('measurementSpec.inactive')}
              icon={<Power size={12} />}
            />
          </DetailFieldGrid>
        </DetailSection>

        <DetailSection
          title={txt('measurementSpec.detail.systemInfo')}
          icon={<Clock size={14} />}
          variant="primary"
        >
          <DetailFieldGrid>
            <DetailField
              label={txt('measurementSpec.detail.createdAt')}
              value={formatDateTimeShort(data.tg_tao)}
              icon={<Calendar size={12} />}
            />
            <DetailField
              label={txt('measurementSpec.detail.updated')}
              value={formatDate(data.tg_cap_nhat)}
              icon={<Calendar size={12} />}
            />
          </DetailFieldGrid>
        </DetailSection>
      </div>
    </GenericDrawer>
  );
};

export default MeasurementSpecDetail;
