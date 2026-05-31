import React, { useMemo } from 'react';
import { txt } from '@/lib/text';
import { Package, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import GenericSubTableSection from '@/components/shared/GenericSubTableSection';
import ProductLineSelect from './product-line-select';
import type { ProductCatalogItem } from '@/features/san-xuat/danh-sach-hang-hoa/core/types';
import type { SalesOrderLineFormValues } from '../core/schema';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

export type OrderLineRow = SalesOrderLineFormValues & { clientId: string };

const COMPACT_INPUT_CLASS = 'h-9 text-sm';

interface Props {
  lines: OrderLineRow[];
  products: ProductCatalogItem[];
  onChange: (lines: OrderLineRow[]) => void;
  errors?: { lines?: { message?: string } };
  disabled?: boolean;
}

export function newLineRow(thuTu: number): OrderLineRow {
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
    onChange(lines.map((ln) => (ln.clientId === clientId ? { ...ln, ...patch } : ln)));
  };

  const removeLine = (clientId: string) => {
    onChange(lines.filter((ln) => ln.clientId !== clientId));
  };

  const addLine = () => {
    onChange([...lines, newLineRow(lines.length + 1)]);
  };

  const tableBody = (
    <>
      <thead className="bg-muted/40 sticky top-0 z-[1]">
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
          <tr key={ln.clientId} className="border-t border-border align-top">
            <td className="px-2 py-2 text-muted-foreground tabular-nums">{idx + 1}</td>
            <td className="px-2 py-2 min-w-[200px]">
              <ProductLineSelect
                products={products}
                value={ln.san_pham_id}
                onChange={(v) => updateLine(ln.clientId, { san_pham_id: v })}
                disabled={disabled}
                placeholder={txt('salesOrder.form.product')}
                compact
              />
            </td>
            <td className="px-2 py-2">
              <Input
                type="number"
                min={0.0001}
                step="any"
                className={COMPACT_INPUT_CLASS}
                value={ln.so_luong}
                onChange={(e) =>
                  updateLine(ln.clientId, { so_luong: Number(e.target.value) || 0 })
                }
                disabled={disabled}
              />
            </td>
            <td className="px-2 py-2">
              <Input
                className={COMPACT_INPUT_CLASS}
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
                className={COMPACT_INPUT_CLASS}
                value={ln.don_gia}
                onChange={(e) =>
                  updateLine(ln.clientId, { don_gia: Number(e.target.value) || 0 })
                }
                disabled={disabled}
              />
            </td>
            <td className={cn('px-2 py-2 text-right font-medium tabular-nums pt-3')}>
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
    </>
  );

  return (
    <div className="space-y-3">
      <GenericSubTableSection
        title={txt('salesOrder.form.linesSection')}
        icon={<Package size={14} className="text-primary" />}
        count={lines.length}
        addLabel={disabled ? undefined : txt('salesOrder.form.addLine')}
        onAdd={disabled ? undefined : addLine}
        emptyTitle={txt('salesOrder.detail.noLines')}
        emptyDescription={txt('salesOrder.form.addLineHint')}
        emptyIcon={<Package className="h-10 w-10 text-muted-foreground" />}
        maxTableHeight="min(420px, 50vh)"
        tableMinWidth={720}
        className="border-0 shadow-none p-0"
      >
        {lines.length > 0 ? tableBody : null}
      </GenericSubTableSection>

      {errors?.lines?.message && (
        <p className="text-xs text-destructive px-1">{errors.lines.message}</p>
      )}

      <div className="flex justify-end px-1">
        <span className="text-sm text-muted-foreground mr-2">{txt('salesOrder.form.orderTotal')}:</span>
        <span className="text-base font-semibold text-primary tabular-nums">
          {formatCurrency(orderTotal)}
        </span>
      </div>
    </div>
  );
};

export default OrderLinesEditor;
