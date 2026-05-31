import React, { useMemo } from 'react';
import { txt } from '@/lib/text';
import { Edit, Trash2, GitBranch, Power, Package, FlaskConical, Calendar, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';
import EnumBadge from '@/components/ui/EnumBadge';
import { bomTrangThaiBadgeConfig } from '../utils/bom-badges';
import type { BomItem } from '../core/types';
import { formatDate, formatDateTimeShort } from '@/lib/utils';
import GenericDrawer, { DRAWER_WIDTH_DETAIL } from '@/components/shared/GenericDrawer';
import { DRAWER_WIDTH_DETAIL_SMALL } from '@/lib/dialog-sizes';
import DetailSummaryCard, { DetailSummaryIconTile } from '@/components/shared/DetailSummaryCard';
import DetailSection from '@/components/shared/DetailSection';
import DetailField from '@/components/shared/DetailField';
import DetailFieldGrid from '@/components/shared/DetailFieldGrid';
import DetailToolbar, { DetailToolbarAction } from '@/components/shared/DetailToolbar';
import { BTN_CLOSE, BTN_EDIT, BTN_DELETE } from '@/lib/button-labels';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';

interface Props {
  data: BomItem;
  onClose: () => void;
  onEdit: (item: BomItem) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (item: BomItem) => void;
  maxWidthClass?: string;
  stackLevel?: number;
}

const BomDetail: React.FC<Props> = ({
  data,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  maxWidthClass = DRAWER_WIDTH_DETAIL,
  stackLevel = 0,
}) => {
  const { canEdit, canDelete } = useResourcePermissions('bom');
  const isActive = data.trang_thai === 'Đang hoạt động';
  const trangThaiBadgeConfig = useMemo(() => bomTrangThaiBadgeConfig(), []);

  const toolbarActions: DetailToolbarAction[] = [
    ...(onStatusChange && canEdit
      ? [
          {
            label: isActive ? txt('bom.detail.deactivate') : txt('bom.detail.activate'),
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
      title={txt('bom.detail.title')}
      subtitle={txt('bom.detail.subtitle')}
      icon={<GitBranch size={18} />}
      onClose={onClose}
      footer={renderFooter}
      footerCompact
      maxWidthClass={maxWidthClass ?? (stackLevel > 0 ? DRAWER_WIDTH_DETAIL_SMALL : DRAWER_WIDTH_DETAIL)}
      stackLevel={stackLevel}
    >
      <div className="space-y-5">
        <DetailSummaryCard
          leading={
            <DetailSummaryIconTile>
              <GitBranch size={26} className="text-white" />
            </DetailSummaryIconTile>
          }
          title={`${data.ten_san_pham} — ${data.ten_nguyen_lieu}`}
          subtitle={`${data.ma_san_pham} · ${data.ma_nguyen_lieu}`}
          badge={<EnumBadge value={data.trang_thai} config={trangThaiBadgeConfig} />}
        />

        {toolbarActions.length > 0 ? <DetailToolbar actions={toolbarActions} /> : null}

        <DetailSection title={txt('bom.detail.productSection')} icon={<Package size={14} />}>
          <DetailFieldGrid>
            <DetailField label={txt('bom.store.productCodeCol')} value={data.ma_san_pham} />
            <DetailField label={txt('bom.store.productNameCol')} value={data.ten_san_pham} />
            <DetailField label={txt('bom.detail.categoryGroup')} value={data.ten_nhom_danh_muc_sp || '—'} />
            <DetailField label={txt('bom.detail.category')} value={data.ten_danh_muc_sp || '—'} />
          </DetailFieldGrid>
        </DetailSection>

        <DetailSection title={txt('bom.detail.materialSection')} icon={<FlaskConical size={14} />}>
          <DetailFieldGrid>
            <DetailField label={txt('bom.store.materialCodeCol')} value={data.ma_nguyen_lieu} />
            <DetailField label={txt('bom.store.materialNameCol')} value={data.ten_nguyen_lieu} />
            <DetailField label={txt('bom.store.quantityCol')} value={String(data.so_luong)} />
            <DetailField label={txt('bom.store.unitCol')} value={data.don_vi_tinh || '—'} />
            <DetailField label={txt('bom.form.lineNote')} value={data.ghi_chu || '—'} />
          </DetailFieldGrid>
        </DetailSection>

        <DetailSection title={txt('bom.detail.systemInfo')} icon={<Calendar size={14} />}>
          <DetailFieldGrid>
            <DetailField
              label={txt('bom.detail.createdAt')}
              value={formatDate(data.tg_tao)}
              icon={<Calendar size={12} />}
            />
            <DetailField
              label={txt('bom.detail.updated')}
              value={formatDateTimeShort(data.tg_cap_nhat)}
              icon={<Clock size={12} />}
            />
          </DetailFieldGrid>
        </DetailSection>
      </div>
    </GenericDrawer>
  );
};

export default BomDetail;
