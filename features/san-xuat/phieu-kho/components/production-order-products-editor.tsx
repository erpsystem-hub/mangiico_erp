import React, { useCallback } from 'react';
import { txt } from '@/lib/text';
import { Package, RefreshCw } from 'lucide-react';
import Input from '@/components/ui/Input';
import GenericSubTableSection from '@/components/shared/GenericSubTableSection';
import type { ProductionOrderProductLine } from '../hooks/use-phieu-kho';

export interface ProductQtyMap {
  [danh_muc_id: string]: number;
}

interface Props {
  products: ProductionOrderProductLine[];
  receivedByProduct: Map<string, number>;
  value: ProductQtyMap;
  onChange: (next: ProductQtyMap) => void;
}

const ProductionOrderProductsEditor: React.FC<Props> = ({
  products,
  receivedByProduct,
  value,
  onChange,
}) => {
  const getRemaining = useCallback(
    (p: ProductionOrderProductLine) => {
      const received = receivedByProduct.get(p.danh_muc_id) ?? 0;
      return Math.max(0, p.so_luong_lenh - received);
    },
    [receivedByProduct],
  );

  const handleQtyChange = (danh_muc_id: string, raw: string) => {
    const num = parseFloat(raw);
    onChange({ ...value, [danh_muc_id]: isNaN(num) ? 0 : Math.max(0, num) });
  };

  const handleSetAllRemaining = () => {
    const next: ProductQtyMap = {};
    for (const p of products) {
      next[p.danh_muc_id] = getRemaining(p);
    }
    onChange(next);
  };

  const tableBody =
    products.length > 0 ? (
      <>
        <thead className="bg-muted/40 sticky top-0 z-[1]">
          <tr>
            <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground w-8">#</th>
            <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground min-w-[200px]">
              Sản phẩm
            </th>
            <th className="px-2 py-2 text-right text-xs font-semibold text-muted-foreground w-28">
              {txt('warehouseSlip.store.qtyOrderCol')}
            </th>
            <th className="px-2 py-2 text-right text-xs font-semibold text-muted-foreground w-28">
              {txt('warehouseSlip.store.qtyReceivedCol')}
            </th>
            <th className="px-2 py-2 text-right text-xs font-semibold text-muted-foreground w-28">
              {txt('warehouseSlip.store.qtyRemainingCol')}
            </th>
            <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground w-32">
              {txt('warehouseSlip.store.qtyInputCol')}
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, idx) => {
            const received = receivedByProduct.get(p.danh_muc_id) ?? 0;
            const remaining = getRemaining(p);
            const inputQty = value[p.danh_muc_id] ?? 0;
            const isExceeding = inputQty > remaining;

            return (
              <tr key={p.danh_muc_id} className="border-t border-border hover:bg-muted/20 transition-colors">
                <td className="px-2 py-2 text-muted-foreground tabular-nums text-xs">
                  {idx + 1}
                </td>
                <td className="px-2 py-2">
                  <div className="font-medium text-sm leading-tight">{p.ten_danh_muc}</div>
                  <div className="text-xs text-muted-foreground">{p.ma_danh_muc}</div>
                </td>
                <td className="px-2 py-2 text-right tabular-nums text-sm">
                  {p.so_luong_lenh.toLocaleString('vi-VN')}
                  <span className="ml-1 text-xs text-muted-foreground">{p.don_vi_tinh}</span>
                </td>
                <td className="px-2 py-2 text-right tabular-nums text-sm text-muted-foreground">
                  {received.toLocaleString('vi-VN')}
                </td>
                <td className="px-2 py-2 text-right tabular-nums text-sm">
                  <span
                    className={
                      remaining === 0
                        ? 'text-muted-foreground'
                        : 'text-emerald-600 font-medium'
                    }
                  >
                    {remaining.toLocaleString('vi-VN')}
                  </span>
                </td>
                <td className="px-2 py-2">
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={inputQty === 0 ? '' : inputQty}
                    placeholder="0"
                    className={`h-9 text-right${isExceeding ? ' border-amber-400 focus-visible:ring-amber-400' : ''}`}
                    onChange={(e) => handleQtyChange(p.danh_muc_id, e.target.value)}
                  />
                  {isExceeding && (
                    <p className="text-[10px] text-amber-600 mt-0.5">
                      {txt('warehouseSlip.form.qtyExceedsWarning')}
                    </p>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </>
    ) : null;

  return (
    <GenericSubTableSection
      title={txt('warehouseSlip.form.linesSection')}
      icon={<Package size={14} className="text-primary" />}
      count={products.length}
      addLabel={txt('warehouseSlip.form.setRemainingAll')}
      onAdd={products.length > 0 ? handleSetAllRemaining : undefined}
      emptyTitle={txt('warehouseSlip.form.orderProductsEmpty')}
      emptyDescription={txt('warehouseSlip.form.orderProductsHint')}
      emptyIcon={<Package className="h-10 w-10 text-muted-foreground" />}
      maxTableHeight="min(400px, 50vh)"
      tableMinWidth={680}
      className="border-0 shadow-none p-0"
    >
      {tableBody}
    </GenericSubTableSection>
  );
};

export default ProductionOrderProductsEditor;
