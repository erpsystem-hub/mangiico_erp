import React from 'react';
import { txt } from '@/lib/text';
import { GitBranch, FlaskConical, Hash, ListOrdered, FileText, Calendar } from 'lucide-react';
import Button from '@/components/ui/Button';
import GenericDrawer from '@/components/shared/GenericDrawer';
import { DRAWER_WIDTH_DETAIL_SMALL } from '@/lib/dialog-sizes';
import DetailSummaryCard, { DetailSummaryIconTile } from '@/components/shared/DetailSummaryCard';
import DetailSection from '@/components/shared/DetailSection';
import DetailField from '@/components/shared/DetailField';
import DetailFieldGrid from '@/components/shared/DetailFieldGrid';
import DetailToolbar, { DetailToolbarAction } from '@/components/shared/DetailToolbar';
import { BTN_CLOSE, BTN_EDIT, BTN_DELETE } from '@/lib/button-labels';
import { formatDateTimeShort } from '@/lib/utils';
import type { OrderLineBomItem } from '../core/order-line-bom-types';

interface Props {
  data: OrderLineBomItem;
  canEdit: boolean;
  canDelete: boolean;
  onClose: () => void;
  onEdit: (item: OrderLineBomItem) => void;
  onDelete: (id: string) => void;
  maxWidthClass?: string;
  stackLevel?: number;
}

const OrderLineBomDetail: React.FC<Props> = ({
  data,
  canEdit,
  canDelete,
  onClose,
  onEdit,
  onDelete,
  maxWidthClass = DRAWER_WIDTH_DETAIL_SMALL,
  stackLevel = 2,
}) => {
  const toolbarActions: DetailToolbarAction[] = [
    ...(canEdit
      ? [
          {
            label: BTN_EDIT(),
            icon: <GitBranch size={16} />,
            onClick: () => onEdit(data),
            variant: 'info' as const,
          },
        ]
      : []),
    ...(canDelete
      ? [
          {
            label: BTN_DELETE(),
            icon: <GitBranch size={16} />,
            onClick: () => onDelete(data.id),
            variant: 'danger' as const,
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
    </div>
  );

  return (
    <GenericDrawer
      title={txt('productionOrder.lineBom.detailTitle')}
      subtitle={data.ten_nguyen_lieu}
      icon={<GitBranch size={20} />}
      onClose={onClose}
      footer={renderFooter}
      maxWidthClass={maxWidthClass}
      stackLevel={stackLevel}
    >
      <div className="space-y-5">
        <DetailSummaryCard
          leading={
            <DetailSummaryIconTile>
              <FlaskConical size={28} />
            </DetailSummaryIconTile>
          }
          title={data.ten_nguyen_lieu}
          subtitle={data.ma_nguyen_lieu}
        >
          <p className="text-lg font-semibold text-primary tabular-nums">
            {data.so_luong_tong} {data.don_vi_tinh}
          </p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {data.so_luong_dinh_muc} {data.don_vi_tinh} / SP
          </p>
        </DetailSummaryCard>

        {toolbarActions.length > 0 ? (
          <DetailToolbar actions={toolbarActions} className="bg-card rounded-xl border border-border" />
        ) : null}

        <DetailSection title={txt('productionOrder.lineBom.sectionTitle')} icon={<FlaskConical size={14} />}>
          <DetailFieldGrid>
            <DetailField
              label={txt('productionOrder.lineBom.materialCodeCol')}
              value={data.ma_nguyen_lieu}
              icon={<Hash size={12} />}
            />
            <DetailField
              label={txt('productionOrder.lineBom.qtyPerUnitCol')}
              value={`${data.so_luong_dinh_muc} ${data.don_vi_tinh}`}
              icon={<ListOrdered size={12} />}
            />
            <DetailField
              label={txt('productionOrder.lineBom.qtyTotalCol')}
              value={`${data.so_luong_tong} ${data.don_vi_tinh}`}
              icon={<ListOrdered size={12} />}
            />
            <DetailField
              label={txt('productionOrder.lineBom.noteCol')}
              value={data.ghi_chu ?? undefined}
              icon={<FileText size={12} />}
            />
          </DetailFieldGrid>
        </DetailSection>

        <DetailSection title={txt('productionOrder.detail.systemInfo')} icon={<Calendar size={14} />}>
          <DetailFieldGrid>
            <DetailField
              label={txt('partnerCategory.detail.createdAt')}
              value={formatDateTimeShort(data.tg_tao)}
            />
            <DetailField
              label={txt('partnerCategory.detail.updated')}
              value={formatDateTimeShort(data.tg_cap_nhat)}
            />
          </DetailFieldGrid>
        </DetailSection>
      </div>
    </GenericDrawer>
  );
};

export default OrderLineBomDetail;
