import React, { useCallback } from 'react';
import { txt } from '@/lib/text';
import { Layers } from 'lucide-react';
import type { ColumnConfig } from '@/store/createGenericStore';
import GenericTable from '@/components/shared/GenericTable';
import { formatDateShort } from '@/lib/utils';
import { MobileListCard } from '@/components/shared/MobileListCard';
import {
  ColumnHeaderSortMenu,
  ColumnHeaderSearch,
} from '@/components/shared/column-header';
import { useProductionOrderBomListStore } from '../store/useProductionOrderBomListStore';
import type { ProductionOrderBomRow } from '../hooks/use-order-line-bom';

interface Props {
  data: ProductionOrderBomRow[];
  isLoading: boolean;
}

const LenhSanXuatBomTable: React.FC<Props> = ({ data, isLoading }) => {
  const {
    columns,
    pagination,
    setPage,
    setPageSize,
    sort,
    setSort,
    filters,
    setFilter,
  } = useProductionOrderBomListStore();

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
    [filters, setFilter, sort, setSort],
  );

  const renderCell = useCallback((colId: string, item: ProductionOrderBomRow) => {
    switch (colId) {
      case 'ma_don_hang':
        return (
          <span className="text-sm font-mono text-muted-foreground">{item.ma_don_hang}</span>
        );
      case 'ten_khach_hang':
        return (
          <div className="flex items-center gap-2 min-w-0">
            <Layers size={14} className="shrink-0 text-muted-foreground" />
            <span className="font-medium text-foreground truncate">{item.ten_khach_hang}</span>
          </div>
        );
      case 'ten_danh_muc':
        return (
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-foreground truncate">{item.ten_danh_muc}</span>
            {item.ma_danh_muc && (
              <span className="text-xs text-muted-foreground font-mono">{item.ma_danh_muc}</span>
            )}
          </div>
        );
      case 'sl_san_pham':
        return (
          <span className="tabular-nums text-sm text-foreground">
            {item.sl_san_pham.toLocaleString('vi-VN')}
          </span>
        );
      case 'ten_nguyen_lieu':
        return (
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-foreground truncate">{item.ten_nguyen_lieu}</span>
            {item.ma_nguyen_lieu && (
              <span className="text-xs text-muted-foreground font-mono">{item.ma_nguyen_lieu}</span>
            )}
          </div>
        );
      case 'so_luong_dinh_muc':
        return (
          <span className="tabular-nums text-sm text-foreground">
            {item.so_luong_dinh_muc.toLocaleString('vi-VN', { maximumFractionDigits: 4 })}
          </span>
        );
      case 'so_luong_tong':
        return (
          <span className="tabular-nums text-sm font-medium text-primary">
            {item.so_luong_tong.toLocaleString('vi-VN', { maximumFractionDigits: 4 })}
          </span>
        );
      case 'don_vi_tinh':
        return (
          <span className="text-sm text-muted-foreground">{item.don_vi_tinh}</span>
        );
      case 'ngay_giao_du_kien':
        return (
          <span className="text-sm">
            {item.ngay_giao_du_kien ? formatDateShort(item.ngay_giao_du_kien) : '—'}
          </span>
        );
      default:
        return null;
    }
  }, []);

  const renderMobileCard = useCallback((item: ProductionOrderBomRow) => (
    <MobileListCard
      leading={
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
          <Layers size={20} />
        </div>
      }
      titleRow={
        <div className="flex min-w-0 items-center gap-2">
          <h4 className="truncate text-sm font-semibold text-foreground">{item.ten_nguyen_lieu}</h4>
          <span className="shrink-0 text-xs font-mono text-muted-foreground">{item.don_vi_tinh}</span>
        </div>
      }
      subheader={
        <span className="text-xs text-muted-foreground truncate">
          {item.ten_danh_muc} · {item.ma_don_hang}
        </span>
      }
      metaLine={
        <span className="text-xs text-muted-foreground tabular-nums">
          {`${item.so_luong_dinh_muc.toLocaleString('vi-VN', { maximumFractionDigits: 4 })} / SP · Tổng ${item.so_luong_tong.toLocaleString('vi-VN', { maximumFractionDigits: 4 })}`}
        </span>
      }
    />
  ), []);

  return (
    <GenericTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      loadingText={txt('productionOrder.bomLoading')}
      emptyTitle={txt('productionOrder.bomEmpty')}
      emptyDescription={txt('productionOrder.bomEmptyHint')}
      page={pagination.page}
      pageSize={pagination.pageSize}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      renderColumnHeaderAccessory={renderColumnHeaderAccessory}
      renderCell={renderCell}
      renderMobileCard={renderMobileCard}
      keyExtractor={(item) => item.id}
    />
  );
};

export default LenhSanXuatBomTable;
