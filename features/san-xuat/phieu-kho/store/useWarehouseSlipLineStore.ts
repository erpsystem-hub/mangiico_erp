import { createGenericStore, ColumnConfig } from '@/store/createGenericStore';
import { TABLE_COLUMN_PRESETS } from '@/lib/table-column-presets';
import type { WarehouseSlipLineFilters } from '../core/types';
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
    minWidth: 140,
    maxWidth: 220,
    order: 2,
  },
  {
    id: 'ten_kho',
    label: txt('warehouseSlip.store.warehouseCol'),
    visible: true,
    minWidth: 120,
    maxWidth: 200,
    order: 3,
  },
  {
    id: 'ten_hang',
    label: txt('warehouseSlip.store.itemNameCol'),
    visible: true,
    minWidth: 180,
    maxWidth: 320,
    order: 4,
  },
  {
    id: 'ma_hang',
    label: txt('warehouseSlip.store.itemCodeCol'),
    visible: true,
    minWidth: 112,
    maxWidth: 160,
    order: 5,
  },
  {
    id: 'so_luong',
    label: txt('warehouseSlip.store.qtyCol'),
    visible: true,
    minWidth: 96,
    maxWidth: 128,
    order: 6,
  },
  {
    id: 'trang_thai',
    label: txt('warehouseSlip.store.statusCol'),
    visible: true,
    ...P.enumBadge,
    order: 7,
  },
  {
    id: 'ngay_phieu',
    label: txt('warehouseSlip.store.dateCol'),
    visible: true,
    minWidth: 112,
    maxWidth: 152,
    order: 8,
  },
];

const initialFilters: WarehouseSlipLineFilters = {
  loai_phieu: [],
  muc_dich: [],
  status: [],
  kho_ids: [],
  columnSearch: {},
  dateRange: { preset: 'all', customStart: '', customEnd: '' },
};

export const useWarehouseSlipLineStore = createGenericStore<WarehouseSlipLineFilters>(
  initialFilters,
  DEFAULT_COLUMNS,
);
