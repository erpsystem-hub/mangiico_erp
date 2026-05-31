import React, { useMemo } from 'react';
import { txt } from '@/lib/text';
import { Package, Pencil, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import GenericSubTableSection from '@/components/shared/GenericSubTableSection';
import type { ProductCategory } from '@/features/san-xuat/danh-muc-hang-hoa/core/types';
import type { OrderLineRow } from '../utils/order-form-mapper';
import { formatCurrency } from '@/lib/utils';

interface Props {
  lines: OrderLineRow[];
  categories: ProductCategory[];
  onAdd: () => void;
  onEdit: (clientId: string) => void;
  onDelete: (clientId: string) => void;
}

function lineTotal(ln: OrderLineRow): number {
  return Math.round(Number(ln.so_luong) * Number(ln.don_gia) * 100) / 100;
}

function resolveCategoryLabel(
  ln: OrderLineRow,
  categories: ProductCategory[],
): { name: string; code: string } {
  if (ln.ten_danh_muc?.trim()) {
    return { name: ln.ten_danh_muc, code: ln.ma_danh_muc ?? '—' };
  }
  const cat = categories.find((c) => c.id === ln.danh_muc_id);
  return {
    name: cat?.ten_danh_muc ?? txt('salesOrder.form.categoryPlaceholder'),
    code: cat?.ma_danh_muc ?? '—',
  };
}

const OrderFormLinesSection: React.FC<Props> = ({
  lines,
  categories,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const orderTotal = useMemo(
    () => lines.reduce((sum, ln) => sum + lineTotal(ln), 0),
    [lines],
  );

  const tableBody =
    lines.length > 0 ? (
      <>
        <thead className="bg-muted/40 sticky top-0 z-[1]">
          <tr>
            <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground w-8">#</th>
            <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground min-w-[180px]">
              {txt('salesOrder.form.category')}
            </th>
            <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground min-w-[88px]">
              {txt('partnerList.store.codeCol')}
            </th>
            <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground w-28">
              {txt('salesOrder.form.qty')}
            </th>
            <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground w-28">
              {txt('salesOrder.form.unitPrice')}
            </th>
            <th className="px-2 py-2 text-right text-xs font-semibold text-muted-foreground w-28">
              {txt('salesOrder.form.lineTotal')}
            </th>
            <th className="w-[72px]" />
          </tr>
        </thead>
        <tbody>
          {lines.map((ln, idx) => {
            const { name, code } = resolveCategoryLabel(ln, categories);
            return (
              <tr key={ln.clientId} className="border-t border-border align-top">
                <td className="px-2 py-2 text-muted-foreground tabular-nums">{idx + 1}</td>
                <td className="px-2 py-2 font-medium text-foreground">{name}</td>
                <td className="px-2 py-2 font-mono text-xs text-muted-foreground">{code}</td>
                <td className="px-2 py-2 tabular-nums text-sm">
                  {ln.so_luong} {ln.don_vi_tinh}
                </td>
                <td className="px-2 py-2 tabular-nums text-sm">{formatCurrency(ln.don_gia)}</td>
                <td className="px-2 py-2 text-right font-medium tabular-nums text-sm">
                  {formatCurrency(lineTotal(ln))}
                </td>
                <td className="px-1 py-2">
                  <div className="flex items-center justify-end gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => onEdit(ln.clientId)}
                      aria-label={txt('common.edit')}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive"
                      onClick={() => onDelete(ln.clientId)}
                      aria-label={txt('common.delete')}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </>
    ) : null;

  return (
    <div className="space-y-3">
      <GenericSubTableSection
        title={txt('salesOrder.form.linesSection')}
        icon={<Package size={14} className="text-primary" />}
        count={lines.length}
        addLabel={txt('salesOrder.form.addLine')}
        onAdd={onAdd}
        emptyTitle={txt('salesOrder.detail.noLines')}
        emptyDescription={txt('salesOrder.form.addLineHint')}
        emptyIcon={<Package className="h-10 w-10 text-muted-foreground" />}
        maxTableHeight="min(320px, 40vh)"
        tableMinWidth={720}
        className="border-0 shadow-none p-0"
      >
        {tableBody}
      </GenericSubTableSection>

      <div className="flex justify-end px-1">
        <span className="text-sm text-muted-foreground mr-2">{txt('salesOrder.form.orderTotal')}:</span>
        <span className="text-base font-semibold text-primary tabular-nums">
          {formatCurrency(orderTotal)}
        </span>
      </div>
    </div>
  );
};

export default OrderFormLinesSection;
