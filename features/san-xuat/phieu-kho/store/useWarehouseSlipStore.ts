import { createGenericStore, ColumnConfig } from '@/store/createGenericStore';
import { TABLE_COLUMN_PRESETS } from '@/lib/table-column-presets';
import type { WarehouseSlipFilters } from '../core/types';
import { txt } from '@/lib/text';

const P = TABLE_COLUMN_PRESETS;

const DEFAULT_COLUMNS: ColumnConfig[] = [
  {
    id: 'ma_phieu_kho',
    label: txt('warehouseSlip.store.codeCol'),
    visible: true,
    minWidth: 152,
    maxWidth: 220,
    order: 0,
  },
  {
    id: 'loai_phieu',
    label: txt('warehouseSlip.store.typeCol'),
    visible: true,
    minWidth: 88,
    maxWidth: 112,
    order: 1,
  },
  {
    id: 'muc_dich',
    label: txt('warehouseSlip.store.purposeCol'),
    visible: true,
    minWidth: 160,
    maxWidth: 260,
    order: 2,
  },
  {
    id: 'ten_kho',
    label: txt('warehouseSlip.store.warehouseCol'),
    visible: true,
    minWidth: 140,
    maxWidth: 220,
    order: 3,
  },
  {
    id: 'ngay_phieu',
    label: txt('warehouseSlip.store.dateCol'),
    visible: true,
    ...P.date,
    order: 4,
  },
  {
    id: 'ma_don_hang',
    label: txt('warehouseSlip.store.productionOrderCol'),
    visible: true,
    minWidth: 140,
    maxWidth: 200,
    order: 5,
  },
  {
    id: 'so_dong',
    label: txt('warehouseSlip.store.lineCountCol'),
    visible: true,
    minWidth: 88,
    maxWidth: 112,
    order: 6,
  },
  { id: 'trang_thai', label: txt('warehouseSlip.store.statusCol'), visible: true, ...P.enumBadge, order: 7 },
  { id: 'tg_cap_nhat', label: txt('warehouseSlip.store.updatedCol'), visible: true, ...P.datetime, order: 8 },
];

const initialFilters: WarehouseSlipFilters = {
  loai_phieu: [],
  muc_dich: [],
  status: [],
  kho_ids: [],
  columnSearch: {},
  dateRange: { preset: 'all', customStart: '', customEnd: '' },
};

export const useWarehouseSlipStore = createGenericStore<WarehouseSlipFilters>(
  initialFilters,
  DEFAULT_COLUMNS,
);
