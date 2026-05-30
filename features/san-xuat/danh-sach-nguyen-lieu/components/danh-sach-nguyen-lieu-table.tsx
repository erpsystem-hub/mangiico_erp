import React, { useState, useCallback, useMemo } from 'react';
import { txt } from '@/lib/text';
import { FlaskConical } from 'lucide-react';
import type { MaterialCatalogItem } from '../core/types';
import { useMaterialCatalogStore } from '../store/useMaterialCatalogStore';
import type { ColumnConfig } from '@/store/createGenericStore';
import GenericTable from '@/components/shared/GenericTable';
import EnumBadge from '@/components/ui/EnumBadge';
import { formatDateShort } from '@/lib/utils';
import { MobileListCard } from '@/components/shared/MobileListCard';
import {
  ColumnHeaderSortMenu,
  ColumnHeaderSearch,
  ColumnHeaderFilter,
} from '@/components/shared/column-header';
import { MaterialCatalogTableRowActions } from './material-catalog-table-row-actions';

interface Props {
  data: MaterialCatalogItem[];
  isLoading: boolean;
  statusCounts: { Active: number; Inactive: number };
  onEdit: (item: MaterialCatalogItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (item: MaterialCatalogItem) => void;
  onView?: (item: MaterialCatalogItem) => void;
}

const MaterialCatalogTable: React.FC<Props> = ({
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
  } = useMaterialCatalogStore();

  const trangThaiBadgeConfig = useMemo(
    () => ({
      'Đang hoạt động': { label: txt('common.activeStatus'), color: 'emerald' as const },
      'Ngừng hoạt động': { label: txt('common.inactiveStatus'), color: 'slate' as const },
    }),
    [],
  );

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

  const renderCell = (colId: string, item: MaterialCatalogItem) => {
    switch (colId) {
      case 'ma_nguyen_lieu':
        return (
          <span className="text-sm font-mono text-muted-foreground">{item.ma_nguyen_lieu}</span>
        );
      case 'ten_nguyen_lieu':
        return (
          <div className="flex items-center gap-2 min-w-0">
            <FlaskConical size={14} className="shrink-0 text-muted-foreground" />
            <span className="font-medium text-foreground truncate">{item.ten_nguyen_lieu}</span>
          </div>
        );
      case 'ten_nhom_danh_muc':
        return (
          <span className="text-sm text-muted-foreground truncate">{item.ten_nhom_danh_muc || '—'}</span>
        );
      case 'ten_danh_muc':
        return (
          <span className="text-sm text-foreground truncate">{item.ten_danh_muc}</span>
        );
      case 'mau_sac':
        return (
          <span className="text-sm text-foreground truncate">{item.mau_sac || '—'}</span>
        );
      case 'don_vi_tinh':
        return (
          <span className="text-sm text-muted-foreground">{item.don_vi_tinh || '—'}</span>
        );
      case 'trang_thai':
        return <EnumBadge value={item.trang_thai} config={trangThaiBadgeConfig} />;
      case 'tg_cap_nhat':
        return formatDateShort(item.tg_cap_nhat);
      case 'actions':
        return (
          <MaterialCatalogTableRowActions
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

  const renderMobileCard = (item: MaterialCatalogItem, isSelected: boolean) => (
    <MobileListCard
      selected={isSelected}
      onBodyClick={onView ? () => onView(item) : undefined}
      leading={
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
          <FlaskConical size={22} />
        </div>
      }
      titleRow={
        <div className="flex min-w-0 items-center justify-between gap-2">
          <h4 className="truncate text-sm font-semibold text-foreground">{item.ten_nguyen_lieu}</h4>
          <EnumBadge value={item.trang_thai} config={trangThaiBadgeConfig} />
        </div>
      }
      subheader={<span className="font-mono text-xs text-muted-foreground">{item.ma_nguyen_lieu}</span>}
      metaLine={
        <span className="text-xs text-muted-foreground truncate">
          {item.ten_nhom_danh_muc ? `${item.ten_nhom_danh_muc} › ` : ''}
          {item.ten_danh_muc}
          {item.mau_sac ? ` · ${item.mau_sac}` : ''}
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
        <MaterialCatalogTableRowActions
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
      loadingText={txt('materialCatalog.loading')}
      emptyTitle={txt('materialCatalog.empty')}
      emptyDescription={txt('materialCatalog.emptyHint')}
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

export default MaterialCatalogTable;
