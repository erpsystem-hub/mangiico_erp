import React, { useState, useCallback, useMemo } from 'react';
import { txt } from '@/lib/text';
import { Package } from 'lucide-react';
import type { PurchaseOrder } from '../core/types';
import { usePurchaseOrderStore } from '../store/usePurchaseOrderStore';
import type { ColumnConfig } from '@/store/createGenericStore';
import GenericTable from '@/components/shared/GenericTable';
import EnumBadge from '@/components/ui/EnumBadge';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { purchaseOrderStatusBadgeConfig } from '../utils/purchase-badges';
import { MobileListCard } from '@/components/shared/MobileListCard';
import {
  ColumnHeaderSortMenu,
  ColumnHeaderSearch,
  ColumnHeaderFilter,
} from '@/components/shared/column-header';
import { TRANG_THAI_DON_MUA } from '../core/constants';
import { PurchaseOrderTableRowActions } from './purchase-order-table-row-actions';

interface Props {
  data: PurchaseOrder[];
  isLoading: boolean;
  onEdit: (item: PurchaseOrder) => void;
  onDelete: (id: string) => void;
  onView?: (item: PurchaseOrder) => void;
}

const DonMuaTable: React.FC<Props> = ({ data, isLoading, onEdit, onDelete, onView }) => {
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
  } = usePurchaseOrderStore();

  const statusBadgeConfig = useMemo(() => purchaseOrderStatusBadgeConfig(), []);

  const statusOptions = useMemo(
    () =>
      TRANG_THAI_DON_MUA.map((st) => ({
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

  const renderCell = (colId: string, item: PurchaseOrder) => {
    switch (colId) {
      case 'ma_don_mua':
        return (
          <span className="text-sm font-mono text-muted-foreground">{item.ma_don_mua}</span>
        );
      case 'ten_nha_cung_cap':
        return (
          <div className="flex items-center gap-2 min-w-0">
            <Package size={14} className="shrink-0 text-muted-foreground" />
            <span className="font-medium text-foreground truncate">{item.ten_nha_cung_cap}</span>
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
          <PurchaseOrderTableRowActions
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

  const renderMobileCard = (item: PurchaseOrder, isSelected: boolean) => (
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
          <h4 className="truncate text-sm font-semibold text-foreground">{item.ma_don_mua}</h4>
          <EnumBadge value={item.trang_thai} config={statusBadgeConfig} />
        </div>
      }
      subheader={
        <span className="text-xs text-muted-foreground truncate">{item.ten_nha_cung_cap}</span>
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
        <PurchaseOrderTableRowActions
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
      loadingText={txt('purchaseOrder.loading')}
      emptyTitle={txt('purchaseOrder.empty')}
      emptyDescription={txt('purchaseOrder.emptyHint')}
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

export default DonMuaTable;
