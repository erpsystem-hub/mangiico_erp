import React, { useCallback, useState } from 'react';
import { txt } from '@/lib/text';
import { Tags, CornerDownRight } from 'lucide-react';
import { useTreeFlatten } from '@/lib/hooks';
import { getNameStyleDefault } from '@/lib/tree-utils';
import Input from '@/components/ui/Input';
import type { PartnerCategory } from '../../core/types';
import { DEFAULT_HE_SO_GIA } from '../core/constants';
import {
  getHeSoFromMatrix,
  type CustomerPriceMatrix,
  type ProductGroupColumn,
} from '../services/kh-he-so-gia-service';

interface Props {
  columns: ProductGroupColumn[];
  priceMatrix: CustomerPriceMatrix;
  categoriesForRows: PartnerCategory[];
  canEdit: boolean;
  onCommitCell: (danhMucId: string, nhomSpId: string, raw: string) => void;
  pendingKey?: string | null;
}

const treeOptions = {
  getId: (d: PartnerCategory) => d.id,
  getParentId: (d: PartnerCategory) => d.cha_id,
  getOrder: (d: PartnerCategory) => d.thu_tu,
  includeOrphans: true as const,
};

function matrixCellKey(danhMucId: string, nhomSpId: string): string {
  return `${danhMucId}:${nhomSpId}`;
}

function formatHeSoDisplay(value: number): string {
  const s = String(value);
  if (s.includes('.')) return s.replace(/\.?0+$/, '');
  return s;
}

const CustomerPriceMatrixTable: React.FC<Props> = ({
  categoriesForRows,
  columns,
  priceMatrix,
  canEdit,
  onCommitCell,
  pendingKey,
}) => {
  const treeRows = useTreeFlatten(categoriesForRows, treeOptions);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draftByKey, setDraftByKey] = useState<Record<string, string>>({});

  const getDisplayValue = useCallback(
    (danhMucId: string, nhomSpId: string) => {
      const heSo = getHeSoFromMatrix(priceMatrix, danhMucId, nhomSpId);
      if (Math.abs(heSo - DEFAULT_HE_SO_GIA) < 0.00005) return '';
      return formatHeSoDisplay(heSo);
    },
    [priceMatrix],
  );

  const stickyNameCol =
    'sticky left-0 w-[min(280px,40vw)] min-w-[200px] max-w-[280px] border-r border-border bg-card shadow-[4px_0_8px_-4px_rgba(0,0,0,0.12)]';

  if (columns.length === 0) return null;

  return (
    <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto overscroll-x-contain">
      <table className="w-max min-w-full border-collapse text-sm table-fixed">
        <colgroup>
          <col className="w-[min(280px,40vw)] min-w-[200px]" />
          {columns.map((col) => (
            <col key={col.id} className="w-[100px] min-w-[88px]" />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th
              className={`${stickyNameCol} sticky top-0 z-40 px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-muted/95 backdrop-blur-sm border-b border-border`}
            >
              {txt('customerPrice.matrix.categoryCol')}
            </th>
            {columns.map((col) => (
              <th
                key={col.id}
                className="sticky top-0 z-20 min-w-[88px] w-[100px] px-2 py-2 text-center text-xs font-semibold text-muted-foreground border-l border-border/60 border-b border-border bg-muted/95 backdrop-blur-sm"
              >
                <span className="block truncate" title={col.ten_hien_thi}>
                  {col.ten_hien_thi}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {treeRows.map((dept) => {
            const isRoot = dept.cap_do === 1;
            const paddingLeft = (dept.cap_do - 1) * 32;
            const canEditCell = dept.cap_do === 2;

            return (
              <tr
                key={dept.id}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors group"
              >
                <td className={`${stickyNameCol} z-10 px-4 py-1.5 group-hover:bg-muted/30`}>
                  <div className="flex items-center" style={{ paddingLeft: `${paddingLeft}px` }}>
                    <div className="mr-3 shrink-0 flex items-center justify-center w-6 h-6">
                      {isRoot ? (
                        <div className="bg-primary/15 p-1.5 rounded-lg text-primary border border-primary/20">
                          <Tags size={16} />
                        </div>
                      ) : (
                        <div className="relative h-full w-full flex items-center justify-center">
                          <div className="absolute -left-[18px] top-1/2 w-[18px] h-px bg-border" />
                          <CornerDownRight size={14} className="text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <span className={`${getNameStyleDefault(dept.cap_do)} truncate`}>
                      {dept.ten_danh_muc}
                    </span>
                  </div>
                </td>
                {columns.map((col) => {
                  const cellKey = matrixCellKey(dept.id, col.id);
                  const isPending = pendingKey === cellKey;
                  const display = getDisplayValue(dept.id, col.id);
                  const isEditing = editingKey === cellKey;
                  const draft = draftByKey[cellKey] ?? display;

                  return (
                    <td
                      key={col.id}
                      className="w-[100px] min-w-[88px] px-1 py-1 text-center border-l border-border/40 whitespace-nowrap"
                    >
                      {canEditCell ? (
                        <Input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          min="0.01"
                          placeholder={formatHeSoDisplay(DEFAULT_HE_SO_GIA)}
                          value={isEditing ? draft : display}
                          disabled={!canEdit || isPending}
                          onFocus={() => {
                            setEditingKey(cellKey);
                            setDraftByKey((prev) => ({
                              ...prev,
                              [cellKey]: prev[cellKey] ?? display,
                            }));
                          }}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setDraftByKey((prev) => ({ ...prev, [cellKey]: e.target.value }));
                          }}
                          onBlur={() => {
                            setEditingKey(null);
                            const raw = draftByKey[cellKey] ?? display;
                            onCommitCell(dept.id, col.id, raw);
                          }}
                          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                          className="h-8 w-[72px] mx-auto text-center text-xs px-1 tabular-nums"
                          aria-label={`${dept.ten_danh_muc} — ${col.ten_hien_thi}`}
                        />
                      ) : (
                        <span className="text-muted-foreground/40 select-none" aria-hidden>
                          —
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerPriceMatrixTable;
