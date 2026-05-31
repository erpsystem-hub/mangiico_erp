import React, { useCallback, useMemo } from 'react';
import { txt } from '@/lib/text';
import { Package } from 'lucide-react';
import type { ProductionOrderLineRow } from '../core/types';
import { useProductionOrderLineStore } from '../store/useProductionOrderLineStore';
import type { ColumnConfig } from '@/store/createGenericStore';
import GenericTable from '@/components/shared/GenericTable';
import EnumBadge from '@/components/ui/EnumBadge';
import { formatDateShort } from '@/lib/utils';
import { salesOrderStatusBadgeConfig } from '@/features/kinh-doanh/don-hang/utils/order-badges';
import { MobileListCard } from '@/components/shared/MobileListCard';
import {
  ColumnHeaderSortMenu,
  ColumnHeaderSearch,
  ColumnHeaderFilter,
} from '@/components/shared/column-header';
import { TRANG_THAI_LENH_SX } from '../core/constants';

interface Props {
  data: ProductionOrderLineRow[];
  isLoading: boolean;
  onView: (item: ProductionOrderLineRow) => void;
}

const LenhSanXuatLinesTable: React.FC<Props> = ({ data, isLoading, onView }) => {
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
  } = useProductionOrderLineStore();

  const statusBadgeConfig = useMemo(() => salesOrderStatusBadgeConfig(), []);

  const statusOptions = useMemo(
    () =>
      TRANG_THAI_LENH_SX.map((st) => ({
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

  const renderCell = (colId: string, item: ProductionOrderLineRow) => {
    switch (colId) {
      case 'ma_don_hang':
        return (
          <span className="text-sm font-mono text-muted-foreground">{item.ma_don_hang}</span>
        );
      case 'ten_khach_hang':
        return <span className="font-medium text-foreground truncate">{item.ten_khach_hang}</span>;
      case 'ten_danh_muc':
        return (
          <div className="flex items-center gap-2 min-w-0">
            <Package size={14} className="shrink-0 text-muted-foreground" />
            <span className="font-medium text-foreground truncate">{item.ten_danh_muc}</span>
          </div>
        );
      case 'ten_nhom_danh_muc':
        return (
          <span className="text-sm text-muted-foreground">{item.ten_nhom_danh_muc || '—'}</span>
        );
      case 'ma_danh_muc':
        return (
          <span className="font-mono text-xs text-muted-foreground">{item.ma_danh_muc || '—'}</span>
        );
      case 'so_luong':
        return (
          <span className="tabular-nums">
            {item.so_luong} {item.don_vi_tinh}
          </span>
        );
      case 'trang_thai':
        return <EnumBadge value={item.trang_thai} config={statusBadgeConfig} />;
      case 'ngay_dat':
        return <span className="text-sm">{formatDateShort(item.ngay_dat)}</span>;
      case 'ngay_giao_du_kien':
        return (
          <span className="text-sm">
            {item.ngay_giao_du_kien ? formatDateShort(item.ngay_giao_du_kien) : '—'}
          </span>
        );
      default:
        return null;
    }
  };

  const renderMobileCard = (item: ProductionOrderLineRow, isSelected: boolean) => (
    <MobileListCard
      selected={isSelected}
      onBodyClick={() => onView(item)}
      leading={
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
          <Package size={20} />
        </div>
      }
      titleRow={
        <div className="flex min-w-0 items-center justify-between gap-2">
          <h4 className="truncate text-sm font-semibold text-foreground">{item.ten_danh_muc}</h4>
          <EnumBadge value={item.trang_thai} config={statusBadgeConfig} />
        </div>
      }
      subheader={
        <span className="text-xs text-muted-foreground truncate">
          {item.ma_don_hang} · {item.ten_khach_hang}
        </span>
      }
      metaLine={
        <span className="text-xs text-muted-foreground tabular-nums">
          {item.so_luong} {item.don_vi_tinh}
          {item.ngay_giao_du_kien
            ? ` · Giao ${formatDateShort(item.ngay_giao_du_kien)}`
            : ''}
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
      loadingText={txt('productionOrder.linesLoading')}
      emptyTitle={txt('productionOrder.linesEmpty')}
      emptyDescription={txt('productionOrder.linesEmptyHint')}
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
      keyExtractor={(item) => `${item.don_hang_id}-${item.id}`}
    />
  );
};

export default LenhSanXuatLinesTable;
