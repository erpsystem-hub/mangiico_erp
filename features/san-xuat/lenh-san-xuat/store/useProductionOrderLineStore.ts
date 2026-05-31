import { createGenericStore, ColumnConfig } from '@/store/createGenericStore';
import { TABLE_COLUMN_PRESETS } from '@/lib/table-column-presets';
import type { ProductionOrderLineFilters } from '../core/types';
import { txt } from '@/lib/text';

const P = TABLE_COLUMN_PRESETS;

const DEFAULT_COLUMNS: ColumnConfig[] = [
  {
    id: 'ma_don_hang',
    label: txt('productionOrder.store.codeCol'),
    visible: true,
    minWidth: 140,
    maxWidth: 200,
    order: 0,
  },
  {
    id: 'ten_khach_hang',
    label: txt('productionOrder.store.customerCol'),
    visible: true,
    minWidth: 160,
    maxWidth: 280,
    order: 1,
  },
  {
    id: 'ten_danh_muc',
    label: txt('productionOrder.store.categoryCol'),
    visible: true,
    minWidth: 180,
    maxWidth: 320,
    order: 2,
  },
  {
    id: 'ten_nhom_danh_muc',
    label: txt('productionOrder.store.groupCol'),
    visible: true,
    minWidth: 140,
    maxWidth: 220,
    order: 3,
  },
  {
    id: 'ma_danh_muc',
    label: txt('partnerList.store.codeCol'),
    visible: true,
    minWidth: 100,
    maxWidth: 140,
    order: 4,
  },
  {
    id: 'so_luong',
    label: txt('productionOrder.store.qtyCol'),
    visible: true,
    minWidth: 96,
    maxWidth: 128,
    order: 5,
  },
  {
    id: 'trang_thai',
    label: txt('productionOrder.store.statusCol'),
    visible: true,
    ...P.enumBadge,
    order: 6,
  },
  {
    id: 'ngay_dat',
    label: txt('productionOrder.store.orderDateCol'),
    visible: true,
    ...P.date,
    order: 7,
  },
  {
    id: 'ngay_giao_du_kien',
    label: txt('productionOrder.store.deliveryDateCol'),
    visible: true,
    ...P.date,
    order: 8,
  },
];

const initialFilters: ProductionOrderLineFilters = {
  status: [],
  khach_hang_ids: [],
  columnSearch: {},
  dateRange: { preset: 'all', customStart: '', customEnd: '' },
};

export const useProductionOrderLineStore = createGenericStore<ProductionOrderLineFilters>(
  initialFilters,
  DEFAULT_COLUMNS,
);
