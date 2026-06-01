import React, { useState, useCallback, useMemo } from 'react';
import { txt } from '@/lib/text';
import { ScrollText } from 'lucide-react';
import type { WarehouseSlipListItem } from '../core/types';
import { useWarehouseSlipStore } from '../store/useWarehouseSlipStore';
import type { ColumnConfig } from '@/store/createGenericStore';
import GenericTable from '@/components/shared/GenericTable';
import EnumBadge from '@/components/ui/EnumBadge';
import { formatDateShort } from '@/lib/utils';
import {
  warehouseSlipStatusBadgeConfig,
  warehouseSlipTypeBadgeConfig,
} from '../utils/warehouse-slip-badges';
import { MobileListCard } from '@/components/shared/MobileListCard';
import {
  ColumnHeaderSortMenu,
  ColumnHeaderSearch,
  ColumnHeaderFilter,
} from '@/components/shared/column-header';
import { TRANG_THAI_PHIEU_KHO } from '../core/constants';
import { PhieuKhoTableRowActions } from './phieu-kho-table-row-actions';

interface Props {
  data: WarehouseSlipListItem[];
  isLoading: boolean;
  onEdit: (item: WarehouseSlipListItem) => void;
  onDelete: (id: string) => void;
  onView?: (item: WarehouseSlipListItem) => void;
  onPrint: (item: WarehouseSlipListItem) => void;
}

const PhieuKhoTable: React.FC<Props> = ({
  data,
  isLoading,
  onEdit,
  onDelete,
  onView,
  onPrint,
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
  } = useWarehouseSlipStore();

  const statusBadgeConfig = useMemo(() => warehouseSlipStatusBadgeConfig(), []);
  const typeBadgeConfig = useMemo(() => warehouseSlipTypeBadgeConfig(), []);

  const statusOptions = useMemo(
    () =>
      TRANG_THAI_PHIEU_KHO.map((st) => ({
        label: st,
        value: st,
        count: data.filter((s) => s.trang_thai === st).length,
      })),
    [data],
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

  const renderCell = (colId: string, item: WarehouseSlipListItem) => {
    switch (colId) {
      case 'ma_phieu_kho':
        return (
          <span className="text-sm font-mono text-muted-foreground">{item.ma_phieu_kho}</span>
        );
      case 'loai_phieu':
        return <EnumBadge value={item.loai_phieu} config={typeBadgeConfig} />;
      case 'muc_dich':
        return <span className="text-sm text-foreground">{item.muc_dich}</span>;
      case 'ten_kho':
        return (
          <div className="flex items-center gap-2 min-w-0">
            <ScrollText size={14} className="shrink-0 text-muted-foreground" />
            <span className="font-medium text-foreground truncate">{item.ten_kho}</span>
          </div>
        );
      case 'ngay_phieu':
        return <span className="text-sm">{formatDateShort(item.ngay_phieu)}</span>;
      case 'ma_don_hang':
        return (
          <span className="text-sm font-mono text-muted-foreground">
            {item.ma_don_hang ?? '—'}
          </span>
        );
      case 'so_dong':
        return (
          <span className="tabular-nums text-sm font-medium text-foreground">{item.so_dong}</span>
        );
      case 'trang_thai':
        return <EnumBadge value={item.trang_thai} config={statusBadgeConfig} />;
      case 'tg_cap_nhat':
        return formatDateShort(item.tg_cap_nhat);
      case 'actions':
        return (
          <PhieuKhoTableRowActions
            item={item}
            menuOpenId={rowMenuOpenId}
            onMenuOpenChange={setRowMenuOpenId}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onPrint={onPrint}
          />
        );
      default:
        return null;
    }
  };

  const renderMobileCard = (item: WarehouseSlipListItem, isSelected: boolean) => (
    <MobileListCard
      selected={isSelected}
      onBodyClick={onView ? () => onView(item) : undefined}
      leading={
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
          <ScrollText size={20} />
        </div>
      }
      titleRow={
        <div className="flex min-w-0 items-center justify-between gap-2">
          <h4 className="truncate text-sm font-semibold text-foreground">{item.ma_phieu_kho}</h4>
          <EnumBadge value={item.trang_thai} config={statusBadgeConfig} />
        </div>
      }
      subheader={
        <span className="text-xs text-muted-foreground truncate">
          {item.muc_dich} · {item.ten_kho}
        </span>
      }
      metaLine={
        <span className="text-xs text-muted-foreground">
          {formatDateShort(item.ngay_phieu)} · {item.so_dong} {txt('warehouseSlip.footerLineRecords')}
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
        <PhieuKhoTableRowActions
          compact
          item={item}
          menuOpenId={rowMenuOpenId}
          onMenuOpenChange={setRowMenuOpenId}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onPrint={onPrint}
        />
      }
    />
  );

  return (
    <GenericTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      loadingText={txt('warehouseSlip.loading')}
      emptyTitle={txt('warehouseSlip.empty')}
      emptyDescription={txt('warehouseSlip.emptyHint')}
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

export default PhieuKhoTable;
