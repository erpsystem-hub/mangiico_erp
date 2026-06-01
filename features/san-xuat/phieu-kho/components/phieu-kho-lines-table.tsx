import React, { useCallback, useMemo } from 'react';
import { txt } from '@/lib/text';
import { Package } from 'lucide-react';
import type { WarehouseSlipLineRow } from '../core/types';
import { useWarehouseSlipLineStore } from '../store/useWarehouseSlipLineStore';
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

interface Props {
  data: WarehouseSlipLineRow[];
  isLoading: boolean;
  onView?: (item: WarehouseSlipLineRow) => void;
}

const PhieuKhoLinesTable: React.FC<Props> = ({ data, isLoading, onView }) => {
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
  } = useWarehouseSlipLineStore();

  const statusBadgeConfig = useMemo(() => warehouseSlipStatusBadgeConfig(), []);
  const typeBadgeConfig = useMemo(() => warehouseSlipTypeBadgeConfig(), []);

  const statusOptions = useMemo(
    () =>
      TRANG_THAI_PHIEU_KHO.map((st) => ({
        label: st,
        value: st,
        count: data.filter((ln) => ln.trang_thai === st).length,
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

  const renderCell = (colId: string, item: WarehouseSlipLineRow) => {
    switch (colId) {
      case 'ma_phieu_kho':
        return (
          <span className="text-sm font-mono text-muted-foreground">{item.ma_phieu_kho}</span>
        );
      case 'loai_phieu':
        return <EnumBadge value={item.loai_phieu} config={typeBadgeConfig} />;
      case 'muc_dich':
        return <span className="text-sm">{item.muc_dich}</span>;
      case 'ten_kho':
        return <span className="text-sm font-medium truncate">{item.ten_kho}</span>;
      case 'ten_hang':
        return (
          <div className="flex items-center gap-2 min-w-0">
            <Package size={14} className="shrink-0 text-muted-foreground" />
            <span className="font-medium text-foreground truncate">{item.ten_hang}</span>
          </div>
        );
      case 'ma_hang':
        return (
          <span className="font-mono text-xs text-muted-foreground">{item.ma_hang || '—'}</span>
        );
      case 'so_luong':
        return (
          <span className="tabular-nums">
            {item.so_luong} {item.don_vi_tinh}
          </span>
        );
      case 'trang_thai':
        return <EnumBadge value={item.trang_thai} config={statusBadgeConfig} />;
      case 'ngay_phieu':
        return <span className="text-sm">{formatDateShort(item.ngay_phieu)}</span>;
      default:
        return null;
    }
  };

  const renderMobileCard = (item: WarehouseSlipLineRow, isSelected: boolean) => (
    <MobileListCard
      selected={isSelected}
      onBodyClick={onView ? () => onView(item) : undefined}
      leading={
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
          <Package size={20} />
        </div>
      }
      titleRow={
        <div className="flex min-w-0 items-center justify-between gap-2">
          <h4 className="truncate text-sm font-semibold text-foreground">{item.ten_hang}</h4>
          <EnumBadge value={item.trang_thai} config={statusBadgeConfig} />
        </div>
      }
      subheader={
        <span className="text-xs text-muted-foreground truncate">
          {item.ma_phieu_kho} · {item.ten_kho}
        </span>
      }
      metaLine={
        <span className="text-xs text-muted-foreground tabular-nums">
          {item.so_luong} {item.don_vi_tinh} · {formatDateShort(item.ngay_phieu)}
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
    />
  );

  return (
    <GenericTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      loadingText={txt('warehouseSlip.linesLoading')}
      emptyTitle={txt('warehouseSlip.linesEmpty')}
      emptyDescription={txt('warehouseSlip.linesEmptyHint')}
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
      keyExtractor={(item) => `${item.phieu_kho_id}-${item.id}`}
    />
  );
};

export default PhieuKhoLinesTable;
