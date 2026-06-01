import React, { useState, useCallback, useMemo } from 'react';
import { txt } from '@/lib/text';
import { ClipboardList } from 'lucide-react';
import type { ProductionOrderListItem } from '../core/types';
import { useProductionOrderStore } from '../store/useProductionOrderStore';
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
import { ProductionOrderTableRowActions } from './production-order-table-row-actions';
import { getTienDo, TIEN_DO_BADGE } from './lenh-san-xuat-lines-table';

interface Props {
  data: ProductionOrderListItem[];
  isLoading: boolean;
  onView: (item: ProductionOrderListItem) => void;
  /** Key = don_hang_id → { lenh: number; nhap: number } */
  progressSummary?: Map<string, { lenh: number; nhap: number }>;
}

const LenhSanXuatTable: React.FC<Props> = ({ data, isLoading, onView, progressSummary }) => {
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
  } = useProductionOrderStore();

  const statusBadgeConfig = useMemo(() => salesOrderStatusBadgeConfig(), []);

  const statusOptions = useMemo(
    () =>
      TRANG_THAI_LENH_SX.map((st) => ({
        label: st,
        value: st,
        count: data.filter((o) => o.trang_thai === st).length,
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

  const renderCell = (colId: string, item: ProductionOrderListItem) => {
    switch (colId) {
      case 'ma_don_hang':
        return (
          <span className="text-sm font-mono text-muted-foreground">{item.ma_don_hang}</span>
        );
      case 'ten_khach_hang':
        return (
          <div className="flex items-center gap-2 min-w-0">
            <ClipboardList size={14} className="shrink-0 text-muted-foreground" />
            <span className="font-medium text-foreground truncate">{item.ten_khach_hang}</span>
          </div>
        );
      case 'so_dong_sp':
        return (
          <span className="tabular-nums text-sm font-medium text-foreground">{item.so_dong_sp}</span>
        );
      case 'ngay_dat':
        return <span className="text-sm">{formatDateShort(item.ngay_dat)}</span>;
      case 'ngay_giao_du_kien':
        return (
          <span className="text-sm">
            {item.ngay_giao_du_kien ? formatDateShort(item.ngay_giao_du_kien) : '—'}
          </span>
        );
      case 'tien_do_tong': {
        const summary = progressSummary?.get(item.id);
        const lenh = summary?.lenh ?? 0;
        const nhap = summary?.nhap ?? 0;
        const tienDo = getTienDo(lenh, nhap);
        const cfg = TIEN_DO_BADGE[tienDo];
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cfg.className}`}>
            {cfg.label}
          </span>
        );
      }
      case 'trang_thai':
        return <EnumBadge value={item.trang_thai} config={statusBadgeConfig} />;
      case 'tg_cap_nhat':
        return formatDateShort(item.tg_cap_nhat);
      case 'actions':
        return (
          <ProductionOrderTableRowActions
            item={item}
            menuOpenId={rowMenuOpenId}
            onMenuOpenChange={setRowMenuOpenId}
            onView={onView}
          />
        );
      default:
        return null;
    }
  };

  const renderMobileCard = (item: ProductionOrderListItem, isSelected: boolean) => {
    const summary = progressSummary?.get(item.id);
    const lenh = summary?.lenh ?? 0;
    const nhap = summary?.nhap ?? 0;
    const tienDo = getTienDo(lenh, nhap);
    const tienDoCfg = TIEN_DO_BADGE[tienDo];
    return (
    <MobileListCard
      selected={isSelected}
      onBodyClick={() => onView(item)}
      leading={
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
          <ClipboardList size={20} />
        </div>
      }
      titleRow={
        <div className="flex min-w-0 items-center justify-between gap-2">
          <h4 className="truncate text-sm font-semibold text-foreground">{item.ma_don_hang}</h4>
          <EnumBadge value={item.trang_thai} config={statusBadgeConfig} />
        </div>
      }
      subheader={
        <span className="text-xs text-muted-foreground truncate">{item.ten_khach_hang}</span>
      }
      metaLine={
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-muted-foreground">
            {formatDateShort(item.ngay_dat)}
            {item.ngay_giao_du_kien ? ` · Giao ${formatDateShort(item.ngay_giao_du_kien)}` : ''}
            {` · ${item.so_dong_sp} SP`}
          </span>
          <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${tienDoCfg.className}`}>
            {tienDoCfg.label}
          </span>
        </div>
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
        <ProductionOrderTableRowActions
          compact
          item={item}
          menuOpenId={rowMenuOpenId}
          onMenuOpenChange={setRowMenuOpenId}
          onView={onView}
        />
      }
    />
  );
  };

  return (
    <GenericTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      loadingText={txt('productionOrder.loading')}
      emptyTitle={txt('productionOrder.empty')}
      emptyDescription={txt('productionOrder.emptyHint')}
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

export default LenhSanXuatTable;
