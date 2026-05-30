import React, { useState, useCallback, useMemo } from 'react';
import { txt } from '../../../../lib/text';
import { MapPinned } from 'lucide-react';
import type { Branch } from '../core/types';
import { useBranchStore } from '../store/useBranchStore';
import type { ColumnConfig } from '../../../../store/createGenericStore';
import GenericTable from '../../../../components/shared/GenericTable';
import EnumBadge from '../../../../components/ui/EnumBadge';
import { formatDateShort } from '../../../../lib/utils';
import { MobileListCard } from '../../../../components/shared/MobileListCard';
import {
  ColumnHeaderSortMenu,
  ColumnHeaderSearch,
} from '@/components/shared/column-header';
import { BranchTableRowActions } from './branch-table-row-actions';

interface Props {
  data: Branch[];
  isLoading: boolean;
  onEdit: (item: Branch) => void;
  onDelete: (id: string) => void;
  onStatusChange: (item: Branch) => void;
  onView?: (item: Branch) => void;
}

const BranchTable: React.FC<Props> = ({
  data,
  isLoading,
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
  } = useBranchStore();

  const trangThaiBadgeConfig = useMemo(
    () => ({
      'Đang hoạt động': { label: txt('branch.active'), color: 'emerald' as const },
      'Ngừng hoạt động': { label: txt('branch.inactive'), color: 'slate' as const },
    }),
    [],
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
    [filters.columnSearch, setFilter, sort, setSort],
  );

  const renderCell = (colId: string, item: Branch) => {
    switch (colId) {
      case 'ten_chi_nhanh':
        return (
          <div className="flex items-center gap-2 min-w-0">
            <MapPinned size={14} className="shrink-0 text-muted-foreground" />
            <span className="font-medium text-foreground truncate">{item.ten_chi_nhanh}</span>
          </div>
        );
      case 'ma_chi_nhanh':
        return item.ma_chi_nhanh ? (
          <span className="font-mono text-xs text-muted-foreground">{item.ma_chi_nhanh}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      case 'dia_chi':
        return <span className="truncate text-body-sm text-muted-foreground">{item.dia_chi ?? '—'}</span>;
      case 'dien_thoai':
        return item.dien_thoai ?? '—';
      case 'email':
        return item.email ?? '—';
      case 'mo_ta':
        return <span className="truncate text-body-sm text-muted-foreground">{item.mo_ta ?? '—'}</span>;
      case 'thu_tu':
        return <span className="tabular-nums">{item.thu_tu}</span>;
      case 'trang_thai':
        return <EnumBadge value={item.trang_thai} config={trangThaiBadgeConfig} />;
      case 'tg_cap_nhat':
        return formatDateShort(item.tg_cap_nhat);
      case 'actions':
        return (
          <BranchTableRowActions
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

  const renderMobileCard = (item: Branch, isSelected: boolean) => (
    <MobileListCard
      key={item.id}
      isSelected={isSelected}
      onToggleSelect={() => toggleSelection(item.id)}
      onClick={onView ? () => onView(item) : undefined}
      title={item.ten_chi_nhanh}
      subtitle={item.ma_chi_nhanh ?? undefined}
      badge={<EnumBadge value={item.trang_thai} config={trangThaiBadgeConfig} />}
      meta={item.dia_chi ?? undefined}
      trailing={
        <BranchTableRowActions
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
      loadingText={txt('branch.loading')}
      emptyTitle={txt('branch.empty')}
      emptyHint={txt('branch.emptyHint')}
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
      footerRecordLabel={txt('branch.footerRecords')}
    />
  );
};

export default BranchTable;
