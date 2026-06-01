import React, { useMemo } from 'react';
import { txt } from '@/lib/text';
import { Package } from 'lucide-react';
import DetailSection from '@/components/shared/DetailSection';
import EmptyState from '@/components/shared/EmptyState';
import EmbeddedChildDataGrid from '@/components/shared/EmbeddedChildDataGrid';
import type { ProductionOrder, ProductionOrderLine } from '../core/types';
import { getTienDo } from './lenh-san-xuat-lines-table';

const TIEN_DO_CLASS: Record<string, string> = {
  'Chưa sản xuất': 'bg-muted text-muted-foreground border border-border',
  'Nhập 1 phần': 'bg-amber-50 text-amber-700 border border-amber-200',
  'Hoàn thành': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

interface Props {
  order: ProductionOrder;
  onViewLine?: (order: ProductionOrder, line: ProductionOrderLine) => void;
  /** Key = danh_muc_id → SL đã nhập (từ phiếu Nhập sản xuất Hoàn thành) */
  receivedQtyMap?: Map<string, number>;
}

const ProductionOrderProductsSection: React.FC<Props> = ({ order, onViewLine, receivedQtyMap }) => {
  const lines = useMemo(
    () => [...(order.lines ?? [])].sort((a, b) => a.thu_tu - b.thu_tu || a.id.localeCompare(b.id)),
    [order.lines],
  );

  return (
    <DetailSection
      title={txt('productionOrder.detail.productsSection')}
      icon={<Package size={14} />}
      variant="primary"
      headerRight={
        <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium tabular-nums text-primary">
          {lines.length} {txt('productionOrder.footerLineRecords')}
        </span>
      }
    >
      {lines.length === 0 ? (
        <EmptyState
          title={txt('productionOrder.detail.noLines')}
          icon={<Package className="h-10 w-10 text-muted-foreground" />}
        />
      ) : (
        <EmbeddedChildDataGrid<ProductionOrderLine>
          rows={lines}
          getRowKey={(ln) => ln.id}
          labelColumn={{
            header: txt('salesOrder.form.category'),
            minWidthClass: 'min-w-[180px]',
            renderCell: (ln) => (
              <span className="font-medium text-foreground truncate">{ln.ten_danh_muc}</span>
            ),
          }}
          columns={[
            {
              id: 'code',
              header: txt('partnerList.store.codeCol'),
              headerClassName: 'min-w-[100px]',
              renderCell: (ln) => (
                <span className="font-mono text-xs text-muted-foreground">{ln.ma_danh_muc}</span>
              ),
            },
            {
              id: 'qty',
              header: txt('salesOrder.form.qty'),
              headerClassName: 'min-w-[96px] text-right',
              cellClassName: 'text-right',
              renderCell: (ln) => (
                <span className="tabular-nums text-sm">
                  {ln.so_luong} {ln.don_vi_tinh}
                </span>
              ),
            },
            {
              id: 'sl_da_nhap',
              header: txt('productionOrder.store.slReceivedCol'),
              headerClassName: 'min-w-[96px] text-right',
              cellClassName: 'text-right',
              renderCell: (ln) => {
                const slDaNhap = receivedQtyMap?.get(ln.danh_muc_id) ?? 0;
                return (
                  <span className={`tabular-nums text-sm ${slDaNhap > 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {slDaNhap > 0 ? slDaNhap.toLocaleString('vi-VN') : '—'}
                  </span>
                );
              },
            },
            {
              id: 'sl_con_lai',
              header: txt('productionOrder.store.slRemainingCol'),
              headerClassName: 'min-w-[96px] text-right',
              cellClassName: 'text-right',
              renderCell: (ln) => {
                const slDaNhap = receivedQtyMap?.get(ln.danh_muc_id) ?? 0;
                const conLai = Math.max(0, ln.so_luong - slDaNhap);
                return (
                  <span className={`tabular-nums text-sm ${conLai === 0 ? 'text-muted-foreground' : conLai < ln.so_luong ? 'text-amber-600 font-medium' : 'text-foreground'}`}>
                    {conLai.toLocaleString('vi-VN')}
                  </span>
                );
              },
            },
            {
              id: 'tien_do',
              header: txt('productionOrder.store.tienDoCol'),
              headerClassName: 'min-w-[120px]',
              renderCell: (ln) => {
                const slDaNhap = receivedQtyMap?.get(ln.danh_muc_id) ?? 0;
                const tienDo = getTienDo(ln.so_luong, slDaNhap);
                return (
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TIEN_DO_CLASS[tienDo] ?? ''}`}>
                    {tienDo}
                  </span>
                );
              },
            },
          ]}
          actionsColumn={{ header: '', widthClass: 'w-0 p-0', renderCell: () => null }}
          onRowClick={onViewLine ? (ln) => onViewLine(order, ln) : undefined}
          containerClassName="border-0 shadow-none"
        />
      )}
    </DetailSection>
  );
};

export default ProductionOrderProductsSection;
