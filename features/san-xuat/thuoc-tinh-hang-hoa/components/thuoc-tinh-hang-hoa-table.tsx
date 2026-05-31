import React, { useState, useCallback, useMemo } from 'react';
import { txt } from '@/lib/text';
import { SlidersHorizontal } from 'lucide-react';
import type { ProductAttribute } from '../core/types';
import { useProductAttributeStore } from '../store/useProductAttributeStore';
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
import { ProductAttributeTableRowActions } from './product-attribute-table-row-actions';
import AttributeValuesCell from './attribute-values-cell';

interface Props {
  data: ProductAttribute[];
  isLoading: boolean;
  statusCounts: { Active: number; Inactive: number };
  onEdit: (item: ProductAttribute) => void;
  onDelete: (id: string) => void;
  onStatusChange: (item: ProductAttribute) => void;
  onView?: (item: ProductAttribute) => void;
}

const ProductAttributeTable: React.FC<Props> = ({
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
  } = useProductAttributeStore();

  const trangThaiBadgeConfig = useMemo(
    () => ({
      'Đang hoạt động': { label: txt('productAttribute.active'), color: 'emerald' as const },
      'Ngừng hoạt động': { label: txt('productAttribute.inactive'), color: 'slate' as const },
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

  const renderCell = (colId: string, item: ProductAttribute) => {
    switch (colId) {
      case 'thu_tu':
        return (
          <span className="text-sm font-medium text-muted-foreground tabular-nums">{item.thu_tu}</span>
        );
      case 'ten_hien_thi':
        return (
          <div className="flex items-center gap-2 min-w-0">
            <SlidersHorizontal size={14} className="shrink-0 text-muted-foreground" />
            <span className="font-medium text-foreground truncate">{item.ten_hien_thi}</span>
          </div>
        );
      case 'cac_gia_tri':
        return <AttributeValuesCell values={item.cac_gia_tri ?? []} />;
      case 'trang_thai':
        return <EnumBadge value={item.trang_thai} config={trangThaiBadgeConfig} />;
      case 'tg_cap_nhat':
        return formatDateShort(item.tg_cap_nhat);
      case 'actions':
        return (
          <ProductAttributeTableRowActions
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

  const renderMobileCard = (item: ProductAttribute, isSelected: boolean) => (
    <MobileListCard
      key={item.id}
      selected={isSelected}
      onBodyClick={onView ? () => onView(item) : undefined}
      leading={
        <div className="h-11 w-11 shrink-0 rounded-lg border border-primary/20 bg-primary/15 flex items-center justify-center text-primary">
          <SlidersHorizontal size={22} />
        </div>
      }
      titleRow={
        <div className="flex min-w-0 items-center justify-between gap-2">
          <h4 className="truncate text-sm font-semibold text-foreground">{item.ten_hien_thi}</h4>
          <EnumBadge value={item.trang_thai} config={trangThaiBadgeConfig} />
        </div>
      }
      subheader={
        item.cac_gia_tri?.length ? (
          <AttributeValuesCell values={item.cac_gia_tri} />
        ) : undefined
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
        <ProductAttributeTableRowActions
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
      loadingText={txt('productAttribute.loading')}
      emptyTitle={txt('productAttribute.empty')}
      emptyDescription={txt('productAttribute.emptyHint')}
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

export default ProductAttributeTable;
