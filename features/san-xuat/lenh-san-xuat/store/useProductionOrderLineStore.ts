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
    minWidth: 152,
    maxWidth: 220,
    order: 0,
  },
  {
    id: 'ten_khach_hang',
    label: txt('productionOrder.store.customerCol'),
    visible: true,
    minWidth: 180,
    maxWidth: 300,
    order: 1,
  },
  {
    id: 'ten_danh_muc',
    label: txt('productionOrder.store.categoryCol'),
    visible: true,
    minWidth: 220,
    maxWidth: 380,
    order: 2,
  },
  {
    id: 'ten_nhom_danh_muc',
    label: txt('productionOrder.store.groupCol'),
    visible: true,
    minWidth: 160,
    maxWidth: 260,
    order: 3,
  },
  {
    id: 'ma_danh_muc',
    label: txt('partnerList.store.codeCol'),
    visible: true,
    minWidth: 120,
    maxWidth: 168,
    order: 4,
  },
  {
    id: 'so_luong',
    label: txt('productionOrder.store.qtyCol'),
    visible: true,
    minWidth: 112,
    maxWidth: 148,
    order: 5,
  },
  {
    id: 'so_dong_bom',
    label: txt('productionOrder.store.bomCountCol'),
    visible: true,
    minWidth: 96,
    maxWidth: 120,
    order: 6,
  },
  {
    id: 'sl_da_nhap',
    label: txt('productionOrder.store.slReceivedCol'),
    visible: true,
    minWidth: 104,
    maxWidth: 136,
    order: 7,
  },
  {
    id: 'sl_con_lai',
    label: txt('productionOrder.store.slRemainingCol'),
    visible: true,
    minWidth: 104,
    maxWidth: 136,
    order: 8,
  },
  {
    id: 'tien_do',
    label: txt('productionOrder.store.tienDoCol'),
    visible: true,
    ...P.enumBadge,
    order: 9,
  },
  {
    id: 'trang_thai',
    label: txt('productionOrder.store.statusCol'),
    visible: true,
    ...P.enumBadge,
    order: 10,
  },
  {
    id: 'ngay_dat',
    label: txt('productionOrder.store.orderDateCol'),
    visible: true,
    minWidth: 112,
    maxWidth: 152,
    order: 11,
  },
  {
    id: 'ngay_giao_du_kien',
    label: txt('productionOrder.store.deliveryDateCol'),
    visible: true,
    minWidth: 112,
    maxWidth: 152,
    order: 12,
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
