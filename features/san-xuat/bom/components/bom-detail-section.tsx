import React, { useMemo, useState } from 'react';
import { txt } from '@/lib/text';
import { GitBranch, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import EnumBadge from '@/components/ui/EnumBadge';
import DetailSection from '@/components/shared/DetailSection';
import EmptyState from '@/components/shared/EmptyState';
import EmbeddedChildDataGrid from '@/components/shared/EmbeddedChildDataGrid';
import { useCan } from '@/hooks/use-can';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';
import { useBomList } from '../hooks/use-bom';
import type { BomItem } from '../core/types';
import { bomTrangThaiBadgeConfig } from '../utils/bom-badges';
import { BomTableRowActions } from './bom-table-row-actions';

export type BomDetailSectionMode = 'product' | 'material';

interface Props {
  mode: BomDetailSectionMode;
  entityId: string;
  enabled?: boolean;
  onView: (item: BomItem) => void;
  onAdd: () => void;
  onEdit: (item: BomItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (item: BomItem) => void;
}

const BomDetailSection: React.FC<Props> = ({
  mode,
  entityId,
  enabled = true,
  onView,
  onAdd,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const canViewBom = useCan('view', 'bom');
  const { canCreate: canCreateBom } = useResourcePermissions('bom');
  const [rowMenuOpenId, setRowMenuOpenId] = useState<string | null>(null);

  const { data: allBom = [], isLoading } = useBomList({
    enabled: enabled && canViewBom,
  });

  const rows = useMemo(() => {
    const filtered =
      mode === 'product'
        ? allBom.filter((b) => b.san_pham_id === entityId)
        : allBom.filter((b) => b.nguyen_lieu_id === entityId);
    return filtered.sort((a, b) => {
      const ta = mode === 'product' ? a.ten_nguyen_lieu : a.ten_san_pham;
      const tb = mode === 'product' ? b.ten_nguyen_lieu : b.ten_san_pham;
      return ta.localeCompare(tb, 'vi');
    });
  }, [allBom, mode, entityId]);

  const statusBadgeConfig = useMemo(() => bomTrangThaiBadgeConfig(), []);
  const labelHeader =
    mode === 'product' ? txt('bom.store.materialNameCol') : txt('bom.store.productNameCol');

  return (
    <DetailSection
      title={txt('bom.embedded.sectionTitle')}
      icon={<GitBranch size={14} />}
      variant="primary"
      headerRight={
        canViewBom ? (
          <>
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium tabular-nums text-primary">
              {rows.length} {txt('bom.embedded.recordCount')}
            </span>
            {canCreateBom ? (
              <Button
                type="button"
                size="sm"
                onClick={onAdd}
                className="h-8 shrink-0 bg-primary px-3 text-white shadow-sm hover:bg-primary/90"
              >
                <Plus size={14} className="mr-1.5" />
                {txt('bom.embedded.addLine')}
              </Button>
            ) : null}
          </>
        ) : null
      }
    >
      {!canViewBom ? (
        <p className="text-sm text-muted-foreground">{txt('bom.embedded.noPermission')}</p>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">{txt('bom.loading')}</p>
      ) : rows.length === 0 ? (
        <EmptyState
          title={txt('bom.embedded.empty')}
          description={
            mode === 'product'
              ? txt('bom.embedded.emptyProductHint')
              : txt('bom.embedded.emptyMaterialHint')
          }
          icon={<GitBranch className="h-10 w-10 text-muted-foreground" />}
          action={
            canCreateBom ? (
              <Button
                type="button"
                size="sm"
                onClick={onAdd}
                className="bg-primary text-white hover:bg-primary/90"
              >
                <Plus size={14} className="mr-2" />
                {txt('bom.embedded.addLine')}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <EmbeddedChildDataGrid<BomItem>
          rows={rows}
          getRowKey={(b) => b.id}
          labelColumn={{
            header: labelHeader,
            minWidthClass: 'min-w-[140px]',
            renderCell: (b) => (
              <span className="font-medium text-foreground truncate">
                {mode === 'product' ? b.ten_nguyen_lieu : b.ten_san_pham}
              </span>
            ),
          }}
          columns={[
            {
              id: 'code',
              header: mode === 'product' ? txt('bom.store.materialCodeCol') : txt('bom.store.productCodeCol'),
              renderCell: (b) => (
                <span className="font-mono text-xs text-muted-foreground">
                  {mode === 'product' ? b.ma_nguyen_lieu : b.ma_san_pham}
                </span>
              ),
            },
            {
              id: 'qty',
              header: txt('bom.store.quantityCol'),
              renderCell: (b) => (
                <span className="text-xs tabular-nums">
                  {b.so_luong} {b.don_vi_tinh}
                </span>
              ),
            },
            {
              id: 'status',
              header: txt('common.status'),
              renderCell: (b) => (
                <EnumBadge shape="pill" value={b.trang_thai} config={statusBadgeConfig} />
              ),
            },
          ]}
          actionsColumn={{
            header: txt('common.actions'),
            widthClass: 'w-[92px] min-w-[92px]',
            renderCell: (b) => (
              <BomTableRowActions
                compact
                item={b}
                menuOpenId={rowMenuOpenId}
                onMenuOpenChange={setRowMenuOpenId}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
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

export default BomDetailSection;
