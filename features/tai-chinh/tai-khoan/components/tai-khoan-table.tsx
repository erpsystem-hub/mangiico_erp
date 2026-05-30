import React, { useState, useCallback, useMemo } from 'react';
import { txt } from '@/lib/text';
import { Landmark, MapPinned } from 'lucide-react';
import type { FinanceAccount } from '../core/types';
import { useFinanceAccountStore } from '../store/useFinanceAccountStore';
import type { ColumnConfig } from '@/store/createGenericStore';
import GenericTable from '@/components/shared/GenericTable';
import EnumBadge from '@/components/ui/EnumBadge';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { MobileListCard } from '@/components/shared/MobileListCard';
import {
  ColumnHeaderSortMenu,
  ColumnHeaderSearch,
  ColumnHeaderFilter,
} from '@/components/shared/column-header';
import { FinanceAccountTableRowActions } from './finance-account-table-row-actions';
import { LOAI_QUY_VALUES } from '../core/constants';
import type { Branch } from '@/features/he-thong/chi-nhanh/core/types';

interface Props {
  data: FinanceAccount[];
  isLoading: boolean;
  branches: Branch[];
  loaiCounts: Record<string, number>;
  branchCounts: Record<string, number>;
  statusCounts: { Active: number; Inactive: number };
  onEdit: (item: FinanceAccount) => void;
  onDelete: (id: string) => void;
  onStatusChange: (item: FinanceAccount) => void;
  onView?: (item: FinanceAccount) => void;
}

const FinanceAccountTable: React.FC<Props> = ({
  data,
  isLoading,
  branches,
  loaiCounts,
  branchCounts,
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
  } = useFinanceAccountStore();

  const trangThaiBadgeConfig = useMemo(
    () => ({
      'Đang hoạt động': { label: txt('financeAccount.active'), color: 'emerald' as const },
      'Ngừng hoạt động': { label: txt('financeAccount.inactive'), color: 'slate' as const },
    }),
    [],
  );

  const loaiBadgeConfig = useMemo(
    () => ({
      'Tiền mặt': { label: txt('financeAccount.fundTypeCash'), color: 'amber' as const },
      'Ngân hàng': { label: txt('financeAccount.fundTypeBank'), color: 'blue' as const },
    }),
    [],
  );

  const loaiOptions = useMemo(
    () =>
      LOAI_QUY_VALUES.map((v) => ({
        label: v === 'Tiền mặt' ? txt('financeAccount.fundTypeCash') : txt('financeAccount.fundTypeBank'),
        value: v,
        count: loaiCounts[v] ?? 0,
      })),
    [loaiCounts],
  );

  const branchOptions = useMemo(
    () =>
      branches.map((b) => ({
        label: b.ten_chi_nhanh,
        value: b.id,
        count: branchCounts[b.id] ?? 0,
      })),
    [branches, branchCounts],
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
        case 'loai_quy':
          return (
            <ColumnHeaderFilter
              options={loaiOptions}
              value={filters.loai_quy}
              onChange={(v) => setFilter('loai_quy', v)}
              ariaLabel={txt('financeAccount.store.fundTypeCol')}
              sortColumnId="loai_quy"
              sort={sort}
              setSort={setSort}
            />
          );
        case 'ten_chi_nhanh':
          return (
            <ColumnHeaderFilter
              options={branchOptions}
              value={filters.chi_nhanh_id}
              onChange={(v) => setFilter('chi_nhanh_id', v)}
              ariaLabel={txt('financeAccount.store.branchCol')}
              sortColumnId="ten_chi_nhanh"
              sort={sort}
              setSort={setSort}
            />
          );
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
    [
      filters,
      setFilter,
      sort,
      setSort,
      loaiOptions,
      branchOptions,
      statusOptions,
    ],
  );

  const renderCell = (colId: string, item: FinanceAccount) => {
    switch (colId) {
      case 'ten_quy':
        return (
          <div className="flex items-center gap-2 min-w-0">
            <Landmark size={14} className="shrink-0 text-muted-foreground" />
            <span className="font-medium text-foreground truncate">{item.ten_quy}</span>
          </div>
        );
      case 'loai_quy':
        return <EnumBadge value={item.loai_quy} config={loaiBadgeConfig} />;
      case 'ten_chi_nhanh':
        return (
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPinned size={12} className="shrink-0 text-muted-foreground" />
            <span className="truncate text-body-sm">{item.ten_chi_nhanh ?? '—'}</span>
          </div>
        );
      case 'ngan_hang':
        return (
          <span className="truncate text-body-sm text-muted-foreground">
            {item.loai_quy === 'Ngân hàng' ? item.ngan_hang ?? '—' : '—'}
          </span>
        );
      case 'so_tai_khoan':
        return item.so_tai_khoan ? (
          <span className="font-mono text-xs text-muted-foreground">{item.so_tai_khoan}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      case 'so_du_khoi_dau':
        return (
          <span className="tabular-nums text-body-sm font-medium">{formatCurrency(item.so_du_khoi_dau)}</span>
        );
      case 'trang_thai':
        return <EnumBadge value={item.trang_thai} config={trangThaiBadgeConfig} />;
      case 'tg_cap_nhat':
        return formatDateShort(item.tg_cap_nhat);
      case 'actions':
        return (
          <FinanceAccountTableRowActions
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

  const renderMobileCard = (item: FinanceAccount, isSelected: boolean) => (
    <MobileListCard
      key={item.id}
      selected={isSelected}
      onBodyClick={onView ? () => onView(item) : undefined}
      leading={
        <div className="h-11 w-11 shrink-0 rounded-lg border border-primary/20 bg-primary/15 flex items-center justify-center text-primary">
          <Landmark size={22} />
        </div>
      }
      titleRow={
        <div className="flex min-w-0 items-center justify-between gap-2">
          <h4 className="truncate text-sm font-semibold text-foreground">{item.ten_quy}</h4>
          <EnumBadge value={item.loai_quy} config={loaiBadgeConfig} />
        </div>
      }
      metaLine={
        <p className="text-xs text-muted-foreground truncate">
          {item.ten_chi_nhanh ?? '—'}
          {item.loai_quy === 'Ngân hàng' && item.so_tai_khoan
            ? ` · ${item.so_tai_khoan}`
            : ` · ${formatCurrency(item.so_du_khoi_dau)}`}
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
        <FinanceAccountTableRowActions
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
      loadingText={txt('financeAccount.loading')}
      emptyTitle={txt('financeAccount.empty')}
      emptyDescription={txt('financeAccount.emptyHint')}
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

export default FinanceAccountTable;
