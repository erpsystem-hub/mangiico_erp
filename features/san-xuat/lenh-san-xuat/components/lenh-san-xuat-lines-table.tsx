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

export type TienDoSanXuat = 'Chưa sản xuất' | 'Nhập 1 phần' | 'Hoàn thành';

export function getTienDo(soLuong: number, slDaNhap: number): TienDoSanXuat {
  if (slDaNhap <= 0) return 'Chưa sản xuất';
  if (slDaNhap >= soLuong) return 'Hoàn thành';
  return 'Nhập 1 phần';
}

export const TIEN_DO_BADGE: Record<TienDoSanXuat, { label: string; className: string }> = {
  'Chưa sản xuất': {
    label: txt('productionOrder.progress.chuaSanXuat'),
    className: 'bg-muted text-muted-foreground border border-border',
  },
  'Nhập 1 phần': {
    label: txt('productionOrder.progress.nhap1Phan'),
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  'Hoàn thành': {
    label: txt('productionOrder.progress.hoanThanh'),
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
};

interface Props {
  data: ProductionOrderLineRow[];
  isLoading: boolean;
  onView: (item: ProductionOrderLineRow) => void;
  /** Key = `${don_hang_id}:${danh_muc_id}` → SL đã nhập */
  receivedQtyMap?: Record<string, number>;
}

const LenhSanXuatLinesTable: React.FC<Props> = ({ data, isLoading, onView, receivedQtyMap }) => {
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

  const getSlDaNhap = useCallback(
    (item: ProductionOrderLineRow) =>
      receivedQtyMap?.[`${item.don_hang_id}:${item.danh_muc_id}`] ?? 0,
    [receivedQtyMap],
  );

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
      case 'so_dong_bom':
        return (
          <span className="tabular-nums text-sm font-medium text-foreground">{item.so_dong_bom}</span>
        );
      case 'sl_da_nhap': {
        const slDaNhap = getSlDaNhap(item);
        return (
          <span className={`tabular-nums text-sm ${slDaNhap > 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
            {slDaNhap > 0 ? slDaNhap.toLocaleString('vi-VN') : '—'}
            {slDaNhap > 0 && <span className="ml-1 text-xs text-muted-foreground">{item.don_vi_tinh}</span>}
          </span>
        );
      }
      case 'sl_con_lai': {
        const slDaNhap = getSlDaNhap(item);
        const conLai = Math.max(0, item.so_luong - slDaNhap);
        return (
          <span className={`tabular-nums text-sm ${conLai === 0 ? 'text-muted-foreground' : conLai < item.so_luong ? 'text-amber-600 font-medium' : 'text-foreground'}`}>
            {conLai.toLocaleString('vi-VN')}
            <span className="ml-1 text-xs text-muted-foreground">{item.don_vi_tinh}</span>
          </span>
        );
      }
      case 'tien_do': {
        const slDaNhap = getSlDaNhap(item);
        const tienDo = getTienDo(item.so_luong, slDaNhap);
        const cfg = TIEN_DO_BADGE[tienDo];
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cfg.className}`}>
            {cfg.label}
          </span>
        );
      }
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
      metaLine={(() => {
        const slDaNhap = getSlDaNhap(item);
        const tienDo = getTienDo(item.so_luong, slDaNhap);
        const cfg = TIEN_DO_BADGE[tienDo];
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground tabular-nums">
              {item.so_luong} {item.don_vi_tinh}
              {slDaNhap > 0 && ` · đã nhập ${slDaNhap.toLocaleString('vi-VN')}`}
              {` · ${item.so_dong_bom} BOM`}
              {item.ngay_giao_du_kien
                ? ` · Giao ${formatDateShort(item.ngay_giao_du_kien)}`
                : ''}
            </span>
            <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${cfg.className}`}>
              {cfg.label}
            </span>
          </div>
        );
      })()}
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
