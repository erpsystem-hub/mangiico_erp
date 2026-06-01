import React, { useMemo } from 'react';
import { txt } from '@/lib/text';
import { GitBranch } from 'lucide-react';
import DetailSection from '@/components/shared/DetailSection';
import EmptyState from '@/components/shared/EmptyState';
import EmbeddedChildDataGrid from '@/components/shared/EmbeddedChildDataGrid';
import type { ProductionOrder, ProductionOrderLine } from '../core/types';
import type { OrderLineBomItem } from '../core/order-line-bom-types';
import { useProductionOrderBom } from '../hooks/use-order-line-bom';

interface BomAggregateRow extends OrderLineBomItem {
  ten_danh_muc: string;
  ma_danh_muc: string;
}

interface Props {
  order: ProductionOrder;
  enabled?: boolean;
  onViewLine?: (order: ProductionOrder, line: ProductionOrderLine) => void;
}

const ProductionOrderBomSection: React.FC<Props> = ({ order, enabled = true, onViewLine }) => {
  const lines = order.lines ?? [];
  const lineIds = useMemo(() => lines.map((ln) => ln.id), [lines]);
  const lineById = useMemo(() => new Map(lines.map((ln) => [ln.id, ln])), [lines]);

  const { data: bomItems = [], isLoading } = useProductionOrderBom(order.id, lineIds, {
    enabled: enabled && lineIds.length > 0,
  });

  const rows = useMemo((): BomAggregateRow[] => {
    return bomItems.map((b) => {
      const line = lineById.get(b.don_hang_chi_tiet_id);
      return {
        ...b,
        ten_danh_muc: line?.ten_danh_muc ?? '—',
        ma_danh_muc: line?.ma_danh_muc ?? '',
      };
    });
  }, [bomItems, lineById]);

  const handleRowClick = onViewLine
    ? (row: BomAggregateRow) => {
        const line = lineById.get(row.don_hang_chi_tiet_id);
        if (line) onViewLine(order, line);
      }
    : undefined;

  return (
    <DetailSection
      title={txt('productionOrder.lineBom.sectionTitle')}
      icon={<GitBranch size={14} />}
      variant="primary"
      headerRight={
        <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium tabular-nums text-primary">
          {rows.length} {txt('productionOrder.lineBom.recordCount')}
        </span>
      }
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{txt('productionOrder.lineBom.loading')}</p>
      ) : rows.length === 0 ? (
        <EmptyState
          title={txt('productionOrder.detail.orderBomEmpty')}
          description={txt('productionOrder.detail.orderBomEmptyHint')}
          icon={<GitBranch className="h-10 w-10 text-muted-foreground" />}
        />
      ) : (
        <EmbeddedChildDataGrid<BomAggregateRow>
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
              id: 'product',
              header: txt('productionOrder.detail.orderBomProductCol'),
              headerClassName: 'min-w-[160px]',
              renderCell: (b) => (
                <span className="text-xs text-muted-foreground truncate">{b.ten_danh_muc}</span>
              ),
            },
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
            header: '',
            widthClass: 'w-8 min-w-[32px]',
            renderCell: () => null,
          }}
          onRowClick={handleRowClick}
          containerClassName="border-0 shadow-none"
        />
      )}
    </DetailSection>
  );
};

export default ProductionOrderBomSection;
