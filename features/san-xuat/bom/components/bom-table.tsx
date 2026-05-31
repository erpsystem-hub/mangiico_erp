import React, { useState, useCallback, useMemo } from 'react';
import { txt } from '@/lib/text';
import { GitBranch, Package, FlaskConical } from 'lucide-react';
import type { BomItem } from '../core/types';
import { useBomStore } from '../store/useBomStore';
import type { ColumnConfig } from '@/store/createGenericStore';
import GenericTable from '@/components/shared/GenericTable';
import EnumBadge from '@/components/ui/EnumBadge';
import { formatDateShort } from '@/lib/utils';
import { bomTrangThaiBadgeConfig } from '../utils/bom-badges';
import { MobileListCard } from '@/components/shared/MobileListCard';
import {
  ColumnHeaderSortMenu,
  ColumnHeaderSearch,
  ColumnHeaderFilter,
} from '@/components/shared/column-header';
import { BomTableRowActions } from './bom-table-row-actions';

interface Props {
  data: BomItem[];
  isLoading: boolean;
  statusCounts: { Active: number; Inactive: number };
  onEdit: (item: BomItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (item: BomItem) => void;
  onView?: (item: BomItem) => void;
}

const BomTable: React.FC<Props> = ({
  data,
  isLoading,
  statusCounts,
  onEdit,
  onDelete,
  onStatusChange,
  onView,
}) => {
  const [rowMenuOpenId, setRowMenuOpenId] = useState<string | null>(null);
  const {
    columns,
    pagination,
    setPage,
    setPageSize,
    selectedIds,
    toggleSelection,
    toggleAllSelection,
    sort,
    setSort,
    filters,
    setFilter,
  } = useBomStore();

  const trangThaiBadgeConfig = useMemo(() => bomTrangThaiBadgeConfig(), []);

  const statusOptions = useMemo(
    () => [
      { label: txt('common.activeStatus'), value: 'Active', count: statusCounts.Active },
      { label: txt('common.inactiveStatus'), value: 'Inactive', count: statusCounts.Inactive },
    ],
    [statusCounts],
  );

  const renderColumnHeaderAccessory = useCallback(
    (col: ColumnConfig) => {
      const cs = filters.columnSearch;
      const colSearchActive = Boolean(cs[col.id]?.trim());
      const columnSearchEl = (
        <ColumnHeaderSearch
          variant="inDropdown"
          ariaLabel={col.label}
          value={cs[col.id] ?? ''}
          onChange={(v) =>
            setFilter('columnSearch', {
              ...cs,
              [col.id]: v,
            })
          }
        />
      );
      if (col.id === 'trang_thai') {
        return (
          <ColumnHeaderFilter
            options={statusOptions}
            value={filters.status}
            onChange={(v) => setFilter('status', v)}
            ariaLabel={txt('common.status')}
            sortColumnId="trang_thai"
            sort={sort}
            setSort={setSort}
          />
        );
      }
      return (
        <ColumnHeaderSortMenu
          ariaLabel={col.label}
          sortColumnId={col.id}
          sort={sort}
          setSort={setSort}
          columnSearch={columnSearchEl}
          columnSearchActive={colSearchActive}
        />
      );
    },
    [filters, setFilter, sort, setSort, statusOptions],
  );

  const renderCell = (colId: string, item: BomItem) => {
    switch (colId) {
      case 'ma_san_pham':
        return (
          <span className="text-sm font-mono text-muted-foreground">{item.ma_san_pham}</span>
        );
      case 'ten_san_pham':
        return (
          <div className="flex items-center gap-2 min-w-0">
            <Package size={14} className="shrink-0 text-muted-foreground" />
            <span className="font-medium text-foreground truncate">{item.ten_san_pham}</span>
          </div>
        );
      case 'ma_nguyen_lieu':
        return (
          <span className="text-sm font-mono text-muted-foreground">{item.ma_nguyen_lieu}</span>
        );
      case 'ten_nguyen_lieu':
        return (
          <div className="flex items-center gap-2 min-w-0">
            <FlaskConical size={14} className="shrink-0 text-muted-foreground" />
            <span className="text-sm text-foreground truncate">{item.ten_nguyen_lieu}</span>
          </div>
        );
      case 'so_luong':
        return (
          <span className="text-sm tabular-nums text-right block w-full" title={String(item.so_luong)}>
            {item.so_luong}
          </span>
        );
      case 'don_vi_tinh':
        return (
          <span className="text-sm text-muted-foreground text-center block w-full">
            {item.don_vi_tinh || '—'}
          </span>
        );
      case 'ten_nhom_danh_muc_sp':
        return (
          <span className="text-sm text-muted-foreground truncate">
            {item.ten_nhom_danh_muc_sp || '—'}
          </span>
        );
      case 'trang_thai':
        return <EnumBadge value={item.trang_thai} config={trangThaiBadgeConfig} />;
      case 'tg_cap_nhat':
        return formatDateShort(item.tg_cap_nhat);
      case 'actions':
        return (
          <BomTableRowActions
            item={item}
            menuOpenId={rowMenuOpenId}
            onMenuOpenChange={setRowMenuOpenId}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        );
      default:
        return null;
    }
  };

  const renderMobileCard = (item: BomItem, isSelected: boolean) => (
    <MobileListCard
      selected={isSelected}
      onBodyClick={onView ? () => onView(item) : undefined}
      leading={
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
          <GitBranch size={22} />
        </div>
      }
      titleRow={
        <div className="flex min-w-0 items-center justify-between gap-2">
          <h4 className="truncate text-sm font-semibold text-foreground">{item.ten_san_pham}</h4>
          <EnumBadge value={item.trang_thai} config={trangThaiBadgeConfig} />
        </div>
      }
      subheader={
        <span className="text-xs text-muted-foreground truncate">
          {item.ma_san_pham} · {item.ten_nguyen_lieu} ({item.ma_nguyen_lieu})
        </span>
      }
      metaLine={
        <span className="text-xs text-muted-foreground">
          {item.so_luong} {item.don_vi_tinh}
        </span>
      }
      footerStart={
        <label className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleSelection(item.id)}
            onClick={(e) => e.stopPropagation()}
            className="h-3 w-3 cursor-pointer rounded border-border text-primary accent-primary"
            aria-label={txt('common.select')}
          />
        </label>
      }
      footerEnd={
        <BomTableRowActions
          compact
          item={item}
          menuOpenId={rowMenuOpenId}
          onMenuOpenChange={setRowMenuOpenId}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      }
    />
  );

  return (
    <GenericTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      loadingText={txt('bom.loading')}
      emptyTitle={txt('bom.empty')}
      emptyDescription={txt('bom.emptyHint')}
      selectedIds={selectedIds}
      onToggleSelection={toggleSelection}
      onToggleAll={toggleAllSelection}
      page={pagination.page}
      pageSize={pagination.pageSize}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      renderColumnHeaderAccessory={renderColumnHeaderAccessory}
      renderCell={renderCell}
      renderMobileCard={renderMobileCard}
      onRowClick={onView}
      keyExtractor={(item) => item.id}
    />
  );
};

export default BomTable;
