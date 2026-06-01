import React, { useMemo } from 'react';
import { txt } from '@/lib/text';
import { useNavigate } from 'react-router-dom';
import {
  Edit,
  Trash2,
  ScrollText,
  Calendar,
  Warehouse,
  FileText,
  ClipboardList,
  Package,
  Clock,
  Printer,
  Ban,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import EnumBadge from '@/components/ui/EnumBadge';
import EmptyState from '@/components/shared/EmptyState';
import {
  warehouseSlipStatusBadgeConfig,
  warehouseSlipTypeBadgeConfig,
} from '../utils/warehouse-slip-badges';
import type { WarehouseSlip } from '../core/types';
import {
  canCancelWarehouseSlip,
  canDeleteWarehouseSlip,
  canEditWarehouseSlip,
} from '../core/constants';
import { formatDate, formatDateTimeShort } from '@/lib/utils';
import GenericDrawer, { DRAWER_WIDTH_DETAIL } from '@/components/shared/GenericDrawer';
import DetailSummaryCard, { DetailSummaryIconTile } from '@/components/shared/DetailSummaryCard';
import DetailSection from '@/components/shared/DetailSection';
import DetailField from '@/components/shared/DetailField';
import DetailFieldGrid from '@/components/shared/DetailFieldGrid';
import DetailToolbar, { DetailToolbarAction } from '@/components/shared/DetailToolbar';
import EmbeddedChildDataGrid from '@/components/shared/EmbeddedChildDataGrid';
import { BTN_CLOSE, BTN_EDIT, BTN_DELETE } from '@/lib/button-labels';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';

interface Props {
  data: WarehouseSlip;
  onClose: () => void;
  onEdit: (item: WarehouseSlip) => void;
  onDelete: (id: string) => void;
  onPrint: (item: WarehouseSlip) => void;
  onCancel?: (item: WarehouseSlip) => void;
  maxWidthClass?: string;
  stackLevel?: number;
}

const PhieuKhoDetail: React.FC<Props> = ({
  data,
  onClose,
  onEdit,
  onDelete,
  onPrint,
  onCancel,
  maxWidthClass = DRAWER_WIDTH_DETAIL,
  stackLevel = 0,
}) => {
  const navigate = useNavigate();
  const { canEdit, canDelete: canDeletePerm } = useResourcePermissions('warehouseSlips');
  const canDelete = canDeletePerm && canDeleteWarehouseSlip(data.trang_thai, data.da_post_ton);
  const canEditSlip = canEdit && canEditWarehouseSlip(data.trang_thai, data.da_post_ton);
  const canCancelSlip = canEdit && canCancelWarehouseSlip(data.trang_thai) && Boolean(onCancel);
  const statusBadgeConfig = useMemo(() => warehouseSlipStatusBadgeConfig(), []);
  const typeBadgeConfig = useMemo(() => warehouseSlipTypeBadgeConfig(), []);
  const lines = data.lines ?? [];

  const toolbarActions: DetailToolbarAction[] = [
    {
      label: txt('warehouseSlip.detail.print'),
      icon: <Printer size={16} />,
      onClick: () => onPrint(data),
      variant: 'default' as const,
    },
    ...(canCancelSlip
      ? [
          {
            label: txt('warehouseSlip.detail.cancelSlip'),
            icon: <Ban size={16} />,
            onClick: () => onCancel?.(data),
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
      {canEditSlip || canDelete ? (
        <div className="flex items-center gap-2">
          {canEditSlip && (
            <Button
              size="sm"
              onClick={() => onEdit(data)}
              className="h-8 px-3 text-xs bg-primary text-white shadow-sm hover:bg-primary/90"
            >
              <Edit size={14} className="mr-1.5" />
              {BTN_EDIT()}
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(data.id)}
              className="h-8 px-3 text-xs text-destructive hover:bg-destructive/10 border border-destructive/30"
            >
              <Trash2 size={14} className="mr-1.5" />
              {BTN_DELETE()}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );

  return (
    <GenericDrawer
      title={txt('warehouseSlip.detail.title')}
      subtitle={data.ma_phieu_kho}
      icon={<ScrollText size={20} />}
      onClose={onClose}
      footer={renderFooter}
      maxWidthClass={maxWidthClass}
      stackLevel={stackLevel}
    >
      <div className="space-y-5">
        <DetailSummaryCard
          leading={
            <DetailSummaryIconTile>
              <ScrollText size={28} />
            </DetailSummaryIconTile>
          }
          title={data.ma_phieu_kho}
          subtitle={`${data.muc_dich} · ${data.ten_kho}`}
          badge={<EnumBadge value={data.trang_thai} config={statusBadgeConfig} />}
        >
          <EnumBadge value={data.loai_phieu} config={typeBadgeConfig} />
        </DetailSummaryCard>

        {toolbarActions.length > 0 ? (
          <DetailToolbar actions={toolbarActions} className="bg-card rounded-xl border border-border" />
        ) : null}

        <DetailSection title={txt('warehouseSlip.detail.slipInfo')} icon={<ScrollText size={14} />}>
          <DetailFieldGrid>
            <DetailField
              label={txt('warehouseSlip.store.typeCol')}
              value={data.loai_phieu}
              icon={<ScrollText size={12} />}
            />
            <DetailField
              label={txt('warehouseSlip.store.purposeCol')}
              value={data.muc_dich}
              icon={<FileText size={12} />}
            />
            <DetailField
              label={txt('warehouseSlip.store.warehouseCol')}
              value={data.ten_kho}
              icon={<Warehouse size={12} />}
            />
            {data.ten_kho_dich ? (
              <DetailField
                label={txt('warehouseSlip.store.destWarehouseCol')}
                value={data.ten_kho_dich}
                icon={<Warehouse size={12} />}
              />
            ) : null}
            <DetailField
              label={txt('warehouseSlip.store.dateCol')}
              value={formatDate(data.ngay_phieu)}
              icon={<Calendar size={12} />}
            />
            {data.ma_don_hang ? (
              <DetailField
                label={txt('warehouseSlip.store.productionOrderCol')}
                value={data.ma_don_hang}
                icon={<ClipboardList size={12} />}
                trailing={
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => navigate('/san-xuat/lenh-san-xuat')}
                  >
                    {txt('warehouseSlip.store.productionOrderCol')}
                  </Button>
                }
              />
            ) : null}
            {data.ma_don_mua ? (
              <DetailField
                label={txt('warehouseSlip.store.purchaseOrderCol')}
                value={data.ma_don_mua}
                icon={<Package size={12} />}
              />
            ) : null}
            <DetailField
              label={txt('warehouseSlip.form.note')}
              value={data.ghi_chu ?? undefined}
              icon={<FileText size={12} />}
            />
          </DetailFieldGrid>
        </DetailSection>

        <DetailSection
          title={txt('warehouseSlip.detail.linesSection')}
          icon={<Package size={14} />}
          headerRight={
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {lines.length} {txt('warehouseSlip.footerLineRecords')}
            </span>
          }
        >
          {lines.length === 0 ? (
            <EmptyState
              title={txt('warehouseSlip.detail.noLines')}
              description={txt('warehouseSlip.form.addLineHint')}
              icon={<Package className="h-10 w-10 text-muted-foreground" />}
            />
          ) : (
            <EmbeddedChildDataGrid
              rows={lines}
              getRowKey={(ln) => ln.id}
              labelColumn={{
                header: txt('warehouseSlip.store.itemNameCol'),
                minWidthClass: 'min-w-[180px]',
                renderCell: (ln) => (
                  <span className="font-medium text-foreground">{ln.ten_hang}</span>
                ),
              }}
              columns={[
                {
                  id: 'code',
                  header: txt('warehouseSlip.store.itemCodeCol'),
                  headerClassName: 'min-w-[100px]',
                  renderCell: (ln) => (
                    <span className="font-mono text-xs text-muted-foreground">{ln.ma_hang}</span>
                  ),
                },
                {
                  id: 'qty',
                  header: txt('warehouseSlip.store.qtyCol'),
                  renderCell: (ln) => (
                    <span className="tabular-nums">
                      {ln.so_luong} {ln.don_vi_tinh}
                    </span>
                  ),
                },
                {
                  id: 'type',
                  header: txt('warehouseSlip.store.itemTypeCol'),
                  renderCell: (ln) => (
                    <span className="text-xs text-muted-foreground">
                      {ln.loai_hang === 'nguyen_lieu'
                        ? txt('warehouseSlip.form.itemTypeMaterial')
                        : txt('warehouseSlip.form.itemTypeProduct')}
                    </span>
                  ),
                },
              ]}
              actionsColumn={{ header: '', widthClass: 'w-0 p-0', renderCell: () => null }}
            />
          )}
        </DetailSection>

        <DetailSection title={txt('warehouseSlip.detail.systemInfo')} icon={<Clock size={14} />}>
          <DetailFieldGrid>
            <DetailField
              label={txt('warehouseSlip.store.updatedCol')}
              value={formatDateTimeShort(data.tg_cap_nhat)}
              icon={<Clock size={12} />}
            />
          </DetailFieldGrid>
        </DetailSection>
      </div>
    </GenericDrawer>
  );
};

export default PhieuKhoDetail;
