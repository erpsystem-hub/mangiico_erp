import React, { useState, useCallback, useMemo } from 'react';
import { txt } from '@/lib/text';
import { Ruler } from 'lucide-react';
import type { MeasurementSpec } from '../core/types';
import { useMeasurementSpecStore } from '../store/useMeasurementSpecStore';
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
import { MeasurementSpecTableRowActions } from './measurement-spec-table-row-actions';

interface Props {
  data: MeasurementSpec[];
  isLoading: boolean;
  statusCounts: { Active: number; Inactive: number };
  onEdit: (item: MeasurementSpec) => void;
  onDelete: (id: string) => void;
  onStatusChange: (item: MeasurementSpec) => void;
  onView?: (item: MeasurementSpec) => void;
}

const MeasurementSpecTable: React.FC<Props> = ({
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
  } = useMeasurementSpecStore();

  const trangThaiBadgeConfig = useMemo(
    () => ({
      'Đang hoạt động': { label: txt('measurementSpec.active'), color: 'emerald' as const },
      'Ngừng hoạt động': { label: txt('measurementSpec.inactive'), color: 'slate' as const },
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
          value={cs[col.id] ?? ''}
          onChange={(v) =>
            setFilter('columnSearch', {
              ...cs,
              [col.id]: v,
            })
          }
          ariaLabel={`${col.label} — ${txt('common.search')}`}
        />
      );

      switch (col.id) {
        case 'trang_thai':
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
        default:
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
      }
    },
    [filters, setFilter, sort, setSort, statusOptions],
  );

  const renderCell = (colId: string, item: MeasurementSpec) => {
    switch (colId) {
      case 'thu_tu':
        return (
          <span className="text-sm font-medium text-muted-foreground tabular-nums">{item.thu_tu}</span>
        );
      case 'ten_hien_thi':
        return (
          <div className="flex items-center gap-2 min-w-0">
            <Ruler size={14} className="shrink-0 text-muted-foreground" />
            <span className="font-medium text-foreground truncate">{item.ten_hien_thi}</span>
          </div>
        );
      case 'don_vi':
        return (
          <span className="text-body-sm font-medium text-foreground tabular-nums">{item.don_vi}</span>
        );
      case 'trang_thai':
        return <EnumBadge value={item.trang_thai} config={trangThaiBadgeConfig} />;
      case 'tg_cap_nhat':
        return formatDateShort(item.tg_cap_nhat);
      case 'actions':
        return (
          <MeasurementSpecTableRowActions
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

  const renderMobileCard = (item: MeasurementSpec, isSelected: boolean) => (
    <MobileListCard
      key={item.id}
      selected={isSelected}
      onBodyClick={onView ? () => onView(item) : undefined}
      leading={
        <div className="h-11 w-11 shrink-0 rounded-lg border border-primary/20 bg-primary/15 flex items-center justify-center text-primary">
          <Ruler size={22} />
        </div>
      }
      titleRow={
        <div className="flex min-w-0 items-center justify-between gap-2">
          <h4 className="truncate text-sm font-semibold text-foreground">{item.ten_hien_thi}</h4>
          <EnumBadge value={item.trang_thai} config={trangThaiBadgeConfig} />
        </div>
      }
      metaLine={
        <p className="text-xs text-muted-foreground truncate">
          {txt('measurementSpec.form.unit')}: {item.don_vi}
        </p>
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
        <MeasurementSpecTableRowActions
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
      loadingText={txt('measurementSpec.loading')}
      emptyTitle={txt('measurementSpec.empty')}
      emptyDescription={txt('measurementSpec.emptyHint')}
      selectedIds={selectedIds}
      onToggleSelection={toggleSelection}
      onToggleAll={toggleAllSelection}
      page={pagination.page}
      pageSize={pagination.pageSize}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      renderCell={renderCell}
      renderMobileCard={renderMobileCard}
      renderColumnHeaderAccessory={renderColumnHeaderAccessory}
      onRowClick={onView}
      keyExtractor={(item) => item.id}
    />
  );
};

export default MeasurementSpecTable;
