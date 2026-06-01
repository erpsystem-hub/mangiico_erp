import { createGenericStore, ColumnConfig } from '@/store/createGenericStore';
import { TABLE_COLUMN_PRESETS } from '@/lib/table-column-presets';
import { txt } from '@/lib/text';

const P = TABLE_COLUMN_PRESETS;

export interface ProductionOrderBomListFilters {
  don_hang_ids: string[];
  danh_muc_ids: string[];
  columnSearch: Record<string, string>;
  dateRange: { preset: string; customStart: string; customEnd: string };
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  {
    id: 'ma_don_hang',
    label: txt('productionOrder.store.codeCol'),
    visible: true,
    minWidth: 120,
    maxWidth: 180,
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
    label: txt('productionOrder.store.productCol'),
    visible: true,
    minWidth: 180,
    maxWidth: 320,
    order: 2,
  },
  {
    id: 'sl_san_pham',
    label: txt('productionOrder.store.productQtyCol'),
    visible: true,
    minWidth: 88,
    maxWidth: 120,
    order: 3,
  },
  {
    id: 'ten_nguyen_lieu',
    label: txt('productionOrder.store.materialCol'),
    visible: true,
    minWidth: 180,
    maxWidth: 320,
    order: 4,
  },
  {
    id: 'so_luong_dinh_muc',
    label: txt('productionOrder.store.bomQtyPerUnitCol'),
    visible: true,
    minWidth: 96,
    maxWidth: 136,
    order: 5,
  },
  {
    id: 'so_luong_tong',
    label: txt('productionOrder.store.bomQtyTotalCol'),
    visible: true,
    minWidth: 96,
    maxWidth: 136,
    order: 6,
  },
  {
    id: 'don_vi_tinh',
    label: txt('productionOrder.store.unitCol'),
    visible: true,
    minWidth: 72,
    maxWidth: 96,
    order: 7,
  },
  {
    id: 'ngay_giao_du_kien',
    label: txt('productionOrder.store.deliveryDateCol'),
    visible: false,
    ...P.date,
    order: 8,
  },
];

const initialFilters: ProductionOrderBomListFilters = {
  don_hang_ids: [],
  danh_muc_ids: [],
  columnSearch: {},
  dateRange: { preset: 'all', customStart: '', customEnd: '' },
};

export const useProductionOrderBomListStore = createGenericStore<ProductionOrderBomListFilters>(
  initialFilters,
  DEFAULT_COLUMNS,
);
