import React, { useMemo } from 'react';
import { txt } from '@/lib/text';
import { Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ProductLineSelect from './product-line-select';
import type { ProductCatalogItem } from '@/features/san-xuat/danh-sach-hang-hoa/core/types';
import type { SalesOrderLineFormValues } from '../core/schema';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

export type OrderLineRow = SalesOrderLineFormValues & { clientId: string };

interface Props {
  lines: OrderLineRow[];
  products: ProductCatalogItem[];
  onChange: (lines: OrderLineRow[]) => void;
  errors?: { lines?: { message?: string } };
  disabled?: boolean;
}

function newLineRow(thuTu: number): OrderLineRow {
  return {
    clientId: `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    san_pham_id: '',
    so_luong: 1,
    don_vi_tinh: 'cái',
    don_gia: 0,
    ghi_chu: '',
    thu_tu: thuTu,
  };
}

function lineTotal(ln: OrderLineRow): number {
  return Math.round(Number(ln.so_luong) * Number(ln.don_gia) * 100) / 100;
}

const OrderLinesEditor: React.FC<Props> = ({ lines, products, onChange, errors, disabled }) => {
  const orderTotal = useMemo(
    () => lines.reduce((sum, ln) => sum + lineTotal(ln), 0),
    [lines],
  );

  const updateLine = (clientId: string, patch: Partial<OrderLineRow>) => {
    onChange(
      lines.map((ln) => (ln.clientId === clientId ? { ...ln, ...patch } : ln)),
    );
  };

  const removeLine = (clientId: string) => {
    onChange(lines.filter((ln) => ln.clientId !== clientId));
  };

  const addLine = () => {
    onChange([...lines, newLineRow(lines.length + 1)]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">
          {txt('salesOrder.form.linesSection')}
        </h4>
        {!disabled && (
          <Button type="button" size="sm" variant="outline" onClick={addLine}>
            <Plus size={14} className="mr-1" />
            {txt('salesOrder.form.addLine')}
          </Button>
        )}
      </div>

      {errors?.lines?.message && (
        <p className="text-xs text-destructive">{errors.lines.message}</p>
      )}

      <div className="rounded-lg border border-border overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground w-8">#</th>
              <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground min-w-[200px]">
                {txt('salesOrder.form.product')}
              </th>
              <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground w-24">
                {txt('salesOrder.form.qty')}
              </th>
              <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground w-20">
                {txt('salesOrder.form.unit')}
              </th>
              <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground w-28">
                {txt('salesOrder.form.unitPrice')}
              </th>
              <th className="px-2 py-2 text-right text-xs font-semibold text-muted-foreground w-28">
                {txt('salesOrder.form.lineTotal')}
              </th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {lines.map((ln, idx) => (
              <tr key={ln.clientId} className="border-t border-border">
                <td className="px-2 py-2 text-muted-foreground tabular-nums">{idx + 1}</td>
                <td className="px-2 py-2">
                  <ProductLineSelect
                    products={products}
                    value={ln.san_pham_id}
                    onChange={(v) => updateLine(ln.clientId, { san_pham_id: v })}
                    disabled={disabled}
                    placeholder={txt('salesOrder.form.product')}
                  />
                </td>
                <td className="px-2 py-2">
                  <Input
                    type="number"
                    min={0.0001}
                    step="any"
                    value={ln.so_luong}
                    onChange={(e) =>
                      updateLine(ln.clientId, { so_luong: Number(e.target.value) || 0 })
                    }
                    disabled={disabled}
                  />
                </td>
                <td className="px-2 py-2">
                  <Input
                    value={ln.don_vi_tinh}
                    onChange={(e) => updateLine(ln.clientId, { don_vi_tinh: e.target.value })}
                    disabled={disabled}
                  />
                </td>
                <td className="px-2 py-2">
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={ln.don_gia}
                    onChange={(e) =>
                      updateLine(ln.clientId, { don_gia: Number(e.target.value) || 0 })
                    }
                    disabled={disabled}
                  />
                </td>
                <td className={cn('px-2 py-2 text-right font-medium tabular-nums')}>
                  {formatCurrency(lineTotal(ln))}
                </td>
                <td className="px-1 py-2">
                  {!disabled && lines.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive"
                      onClick={() => removeLine(ln.clientId)}
                      aria-label={txt('common.delete')}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <span className="text-sm text-muted-foreground mr-2">{txt('salesOrder.form.orderTotal')}:</span>
        <span className="text-base font-semibold text-primary tabular-nums">
          {formatCurrency(orderTotal)}
        </span>
      </div>
    </div>
  );
};

export { newLineRow };
export default OrderLinesEditor;
