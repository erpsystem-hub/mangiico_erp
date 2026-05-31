import React, { useMemo, useState } from 'react';
import { txt } from '@/lib/text';
import { GitBranch, Plus, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';
import DetailSection from '@/components/shared/DetailSection';
import EmptyState from '@/components/shared/EmptyState';
import EmbeddedChildDataGrid from '@/components/shared/EmbeddedChildDataGrid';
import type { OrderLineBomItem } from '../core/order-line-bom-types';
import { OrderLineBomRowActions } from './order-line-bom-row-actions';

interface Props {
  items: OrderLineBomItem[];
  isLoading: boolean;
  isGenerating: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onView: (item: OrderLineBomItem) => void;
  onAdd: () => void;
  onEdit: (item: OrderLineBomItem) => void;
  onDelete: (id: string) => void;
  onGenerate: () => void;
}

const OrderLineBomSection: React.FC<Props> = ({
  items,
  isLoading,
  isGenerating,
  canEdit,
  canDelete,
  onView,
  onAdd,
  onEdit,
  onDelete,
  onGenerate,
}) => {
  const [rowMenuOpenId, setRowMenuOpenId] = useState<string | null>(null);
  const rows = useMemo(
    () =>
      [...items].sort((a, b) =>
        a.ten_nguyen_lieu.localeCompare(b.ten_nguyen_lieu, 'vi'),
      ),
    [items],
  );

  return (
    <DetailSection
      title={txt('productionOrder.lineBom.sectionTitle')}
      icon={<GitBranch size={14} />}
      variant="primary"
      headerRight={
        <>
          <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium tabular-nums text-primary">
            {rows.length} {txt('productionOrder.lineBom.recordCount')}
          </span>
          {canEdit ? (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isGenerating}
                onClick={onGenerate}
                className="h-8 shrink-0 px-3 text-xs"
              >
                <RefreshCw size={14} className={`mr-1.5 ${isGenerating ? 'animate-spin' : ''}`} />
                {txt('productionOrder.lineBom.generateFromCategory')}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={onAdd}
                className="h-8 shrink-0 bg-primary px-3 text-white shadow-sm hover:bg-primary/90"
              >
                <Plus size={14} className="mr-1.5" />
                {txt('productionOrder.lineBom.addLine')}
              </Button>
            </>
          ) : null}
        </>
      }
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{txt('productionOrder.lineBom.loading')}</p>
      ) : rows.length === 0 ? (
        <EmptyState
          title={txt('productionOrder.lineBom.empty')}
          description={txt('productionOrder.lineBom.emptyHint')}
          icon={<GitBranch className="h-10 w-10 text-muted-foreground" />}
          action={
            canEdit ? (
              <Button
                type="button"
                size="sm"
                disabled={isGenerating}
                onClick={onGenerate}
                className="bg-primary text-white hover:bg-primary/90"
              >
                <RefreshCw size={14} className={`mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                {txt('productionOrder.lineBom.generateFromCategory')}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <EmbeddedChildDataGrid<OrderLineBomItem>
          rows={rows}
          getRowKey={(b) => b.id}
          labelColumn={{
            header: txt('productionOrder.lineBom.materialCol'),
            minWidthClass: 'min-w-[140px]',
            renderCell: (b) => (
              <span className="font-medium text-foreground truncate">{b.ten_nguyen_lieu}</span>
            ),
          }}
          columns={[
            {
              id: 'code',
              header: txt('productionOrder.lineBom.materialCodeCol'),
              renderCell: (b) => (
                <span className="font-mono text-xs text-muted-foreground">{b.ma_nguyen_lieu}</span>
              ),
            },
            {
              id: 'qtyPerUnit',
              header: txt('productionOrder.lineBom.qtyPerUnitCol'),
              renderCell: (b) => (
                <span className="text-xs tabular-nums">
                  {b.so_luong_dinh_muc} {b.don_vi_tinh}
                </span>
              ),
            },
            {
              id: 'qtyTotal',
              header: txt('productionOrder.lineBom.qtyTotalCol'),
              renderCell: (b) => (
                <span className="text-xs tabular-nums font-medium text-primary">
                  {b.so_luong_tong} {b.don_vi_tinh}
                </span>
              ),
            },
          ]}
          actionsColumn={{
            header: txt('common.actions'),
            widthClass: 'w-[92px] min-w-[92px]',
            renderCell: (b) => (
              <OrderLineBomRowActions
                compact
                item={b}
                menuOpenId={rowMenuOpenId}
                onMenuOpenChange={setRowMenuOpenId}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                canEdit={canEdit}
                canDelete={canDelete}
              />
            ),
          }}
          onRowClick={onView}
          containerClassName="border-0 shadow-none"
        />
      )}
    </DetailSection>
  );
};

export default OrderLineBomSection;
