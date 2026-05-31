import React, { useState, useCallback, useMemo } from 'react';
import { txt } from '@/lib/text';
import { ShoppingCart } from 'lucide-react';
import type { SalesOrder } from '../core/types';
import { useSalesOrderStore } from '../store/useSalesOrderStore';
import type { ColumnConfig } from '@/store/createGenericStore';
import GenericTable from '@/components/shared/GenericTable';
import EnumBadge from '@/components/ui/EnumBadge';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { salesOrderStatusBadgeConfig } from '../utils/order-badges';
import { MobileListCard } from '@/components/shared/MobileListCard';
import {
  ColumnHeaderSortMenu,
  ColumnHeaderSearch,
  ColumnHeaderFilter,
} from '@/components/shared/column-header';
import { TRANG_THAI_DON_HANG } from '../core/constants';
import { SalesOrderTableRowActions } from './sales-order-table-row-actions';

interface Props {
  data: SalesOrder[];
  isLoading: boolean;
  onEdit: (item: SalesOrder) => void;
  onDelete: (id: string) => void;
  onView?: (item: SalesOrder) => void;
}

const DonHangTable: React.FC<Props> = ({ data, isLoading, onEdit, onDelete, onView }) => {
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
  } = useSalesOrderStore();

  const statusBadgeConfig = useMemo(() => salesOrderStatusBadgeConfig(), []);

  const statusOptions = useMemo(
    () =>
      TRANG_THAI_DON_HANG.map((st) => ({
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

  const renderCell = (colId: string, item: SalesOrder) => {
    switch (colId) {
      case 'ma_don_hang':
        return (
          <span className="text-sm font-mono text-muted-foreground">{item.ma_don_hang}</span>
        );
      case 'ten_khach_hang':
        return (
          <div className="flex items-center gap-2 min-w-0">
            <ShoppingCart size={14} className="shrink-0 text-muted-foreground" />
            <span className="font-medium text-foreground truncate">{item.ten_khach_hang}</span>
          </div>
        );
      case 'ngay_dat':
        return <span className="text-sm">{formatDateShort(item.ngay_dat)}</span>;
      case 'tong_tien':
        return (
          <span className="text-sm font-medium tabular-nums">{formatCurrency(item.tong_tien)}</span>
        );
      case 'trang_thai':
        return <EnumBadge value={item.trang_thai} config={statusBadgeConfig} />;
      case 'tg_cap_nhat':
        return formatDateShort(item.tg_cap_nhat);
      case 'actions':
        return (
          <SalesOrderTableRowActions
            item={item}
            menuOpenId={rowMenuOpenId}
            onMenuOpenChange={setRowMenuOpenId}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      default:
        return null;
    }
  };

  const renderMobileCard = (item: SalesOrder, isSelected: boolean) => (
    <MobileListCard
      selected={isSelected}
      onBodyClick={onView ? () => onView(item) : undefined}
      leading={
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
          <ShoppingCart size={20} />
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
        <span className="text-xs text-muted-foreground">
          {formatDateShort(item.ngay_dat)} · {formatCurrency(item.tong_tien)}
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
        <SalesOrderTableRowActions
          compact
          item={item}
          menuOpenId={rowMenuOpenId}
          onMenuOpenChange={setRowMenuOpenId}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      }
    />
  );

  return (
    <GenericTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      loadingText={txt('salesOrder.loading')}
      emptyTitle={txt('salesOrder.empty')}
      emptyDescription={txt('salesOrder.emptyHint')}
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

export default DonHangTable;
