import { createGenericStore, ColumnConfig } from '@/store/createGenericStore';
import { TABLE_COLUMN_PRESETS } from '@/lib/table-column-presets';
import type { ProductionOrderFilters } from '../core/types';
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
    minWidth: 200,
    maxWidth: 360,
    order: 1,
  },
  {
    id: 'so_dong_sp',
    label: txt('productionOrder.store.lineCountCol'),
    visible: true,
    minWidth: 88,
    maxWidth: 112,
    order: 2,
  },
  {
    id: 'ngay_dat',
    label: txt('productionOrder.store.orderDateCol'),
    visible: true,
    ...P.date,
    order: 3,
  },
  {
    id: 'ngay_giao_du_kien',
    label: txt('productionOrder.store.deliveryDateCol'),
    visible: true,
    ...P.date,
    order: 4,
  },
  {
    id: 'tien_do_tong',
    label: txt('productionOrder.store.tienDoTongCol'),
    visible: true,
    ...P.enumBadge,
    order: 5,
  },
  { id: 'trang_thai', label: txt('productionOrder.store.statusCol'), visible: true, ...P.enumBadge, order: 6 },
  { id: 'tg_cap_nhat', label: txt('productionOrder.store.updatedCol'), visible: true, ...P.datetime, order: 7 },
];

const initialFilters: ProductionOrderFilters = {
  status: [],
  khach_hang_ids: [],
  columnSearch: {},
  dateRange: { preset: 'all', customStart: '', customEnd: '' },
};

export const useProductionOrderStore = createGenericStore<ProductionOrderFilters>(
  initialFilters,
  DEFAULT_COLUMNS,
);
