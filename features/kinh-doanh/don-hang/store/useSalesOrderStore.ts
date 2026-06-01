import { createGenericStore, ColumnConfig } from '@/store/createGenericStore';
import { TABLE_COLUMN_PRESETS } from '@/lib/table-column-presets';
import type { SalesOrderFilters } from '../core/types';
import { txt } from '@/lib/text';

const P = TABLE_COLUMN_PRESETS;

const DEFAULT_COLUMNS: ColumnConfig[] = [
  {
    id: 'ma_don_hang',
    label: txt('salesOrder.store.codeCol'),
    visible: true,
    minWidth: 140,
    maxWidth: 200,
    order: 0,
  },
  {
    id: 'ten_khach_hang',
    label: txt('salesOrder.store.customerCol'),
    visible: true,
    minWidth: 200,
    maxWidth: 360,
    order: 1,
  },
  {
    id: 'ngay_dat',
    label: txt('salesOrder.store.orderDateCol'),
    visible: true,
    ...P.date,
    order: 2,
  },
  {
    id: 'sl_don_dat',
    label: txt('salesOrder.store.slDonDatCol'),
    visible: true,
    minWidth: 96,
    maxWidth: 128,
    order: 3,
  },
  {
    id: 'sl_da_sx',
    label: txt('salesOrder.store.slDaSxCol'),
    visible: true,
    minWidth: 96,
    maxWidth: 128,
    order: 4,
  },
  {
    id: 'sl_con_lai',
    label: txt('salesOrder.store.slConLaiCol'),
    visible: true,
    minWidth: 96,
    maxWidth: 128,
    order: 5,
  },
  { id: 'tien_do', label: txt('salesOrder.store.tienDoCol'), visible: true, ...P.enumBadge, order: 6 },
  {
    id: 'tong_tien',
    label: txt('salesOrder.store.totalCol'),
    visible: true,
    minWidth: 120,
    maxWidth: 160,
    order: 7,
  },
  { id: 'trang_thai', label: txt('salesOrder.store.statusCol'), visible: true, ...P.enumBadge, order: 8 },
  { id: 'tg_cap_nhat', label: txt('salesOrder.store.updatedCol'), visible: true, ...P.datetime, order: 9 },
];

const initialFilters: SalesOrderFilters = {
  status: [],
  khach_hang_ids: [],
  columnSearch: {},
  dateRange: { preset: 'all', customStart: '', customEnd: '' },
};

export const useSalesOrderStore = createGenericStore<SalesOrderFilters>(
  initialFilters,
  DEFAULT_COLUMNS,
);
