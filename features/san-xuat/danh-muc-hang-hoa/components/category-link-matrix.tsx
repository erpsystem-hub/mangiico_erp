import React, { useMemo } from 'react';
import { txt } from '@/lib/text';
import { Tags, CornerDownRight } from 'lucide-react';
import { useTreeFlatten } from '@/lib/hooks';
import { getNameStyleDefault } from '@/lib/tree-utils';
import type { ProductCategory } from '../core/types';
import type { CategoryLinkMatrix } from '../services/danh-muc-hang-hoa-links-service';

export type MatrixMasterColumn = {
  id: string;
  ten_hien_thi: string;
  don_vi?: string;
};

export type CategoryLinkMatrixMode = 'attribute' | 'measurement';

interface Props {
  columns: MatrixMasterColumn[];
  linkMatrix: CategoryLinkMatrix;
  categoriesForRows: ProductCategory[];
  canEdit: boolean;
  onToggle: (danhMucId: string, masterId: string, linked: boolean) => void;
  pendingKey?: string | null;
}

const treeOptions = {
  getId: (d: ProductCategory) => d.id,
  getParentId: (d: ProductCategory) => d.cha_id,
  getOrder: (d: ProductCategory) => d.thu_tu,
  includeOrphans: true as const,
};

function matrixCellKey(danhMucId: string, masterId: string): string {
  return `${danhMucId}:${masterId}`;
}

const CategoryLinkMatrix: React.FC<Props> = ({
  categoriesForRows,
  columns,
  linkMatrix,
  canEdit,
  onToggle,
  pendingKey,
}) => {
  const treeRows = useTreeFlatten(categoriesForRows, treeOptions);

  const isLinked = (danhMucId: string, masterId: string): boolean => {
    return linkMatrix.get(danhMucId)?.has(masterId) ?? false;
  };

  if (columns.length === 0) {
    return null;
  }

  const stickyNameCol =
    'sticky left-0 w-[min(280px,40vw)] min-w-[200px] max-w-[280px] border-r border-border bg-card shadow-[4px_0_8px_-4px_rgba(0,0,0,0.12)]';

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
              {txt('productCategory.matrix.categoryCol')}
            </th>
            {columns.map((col) => (
              <th
                key={col.id}
                className="sticky top-0 z-20 min-w-[88px] w-[100px] px-2 py-2 text-center text-xs font-semibold text-muted-foreground border-l border-border/60 border-b border-border bg-muted/95 backdrop-blur-sm"
              >
                <span className="block truncate" title={col.ten_hien_thi}>
                  {col.ten_hien_thi}
                </span>
                {col.don_vi ? (
                  <span className="block text-[10px] font-normal text-muted-foreground/80 mt-0.5">
                    ({col.don_vi})
                  </span>
                ) : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {treeRows.map((dept) => {
            const isRoot = dept.cap_do === 1;
            const paddingLeft = (dept.cap_do - 1) * 32;
            const canCheck = dept.cap_do === 2;

            return (
              <tr
                key={dept.id}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors group"
              >
                <td
                  className={`${stickyNameCol} z-10 px-4 py-1.5 group-hover:bg-muted/30`}
                >
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
                  const linked = isLinked(dept.id, col.id);
                  const isPending = pendingKey === cellKey;

                  return (
                    <td
                      key={col.id}
                      className="w-[100px] min-w-[88px] px-2 py-1.5 text-center border-l border-border/40 whitespace-nowrap"
                    >
                      {canCheck ? (
                        <input
                          type="checkbox"
                          checked={linked}
                          disabled={!canEdit || isPending}
                          onChange={(e) => onToggle(dept.id, col.id, e.target.checked)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
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

export default CategoryLinkMatrix;
