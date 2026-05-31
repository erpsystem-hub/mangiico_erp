import { createGenericStore, ColumnConfig } from '@/store/createGenericStore';
import { TABLE_COLUMN_PRESETS } from '@/lib/table-column-presets';
import type { PurchaseOrderFilters } from '../core/types';
import { txt } from '@/lib/text';

const P = TABLE_COLUMN_PRESETS;

const DEFAULT_COLUMNS: ColumnConfig[] = [
  {
    id: 'ma_don_mua',
    label: txt('purchaseOrder.store.codeCol'),
    visible: true,
    minWidth: 140,
    maxWidth: 200,
    order: 0,
  },
  {
    id: 'ten_nha_cung_cap',
    label: txt('purchaseOrder.store.supplierCol'),
    visible: true,
    minWidth: 200,
    maxWidth: 360,
    order: 1,
  },
  {
    id: 'ngay_dat',
    label: txt('purchaseOrder.store.orderDateCol'),
    visible: true,
    ...P.date,
    order: 2,
  },
  {
    id: 'tong_tien',
    label: txt('purchaseOrder.store.totalCol'),
    visible: true,
    minWidth: 120,
    maxWidth: 160,
    order: 3,
  },
  { id: 'trang_thai', label: txt('purchaseOrder.store.statusCol'), visible: true, ...P.enumBadge, order: 4 },
  { id: 'tg_cap_nhat', label: txt('purchaseOrder.store.updatedCol'), visible: true, ...P.datetime, order: 5 },
];

const initialFilters: PurchaseOrderFilters = {
  status: [],
  nha_cung_cap_ids: [],
  columnSearch: {},
  dateRange: { preset: 'all', customStart: '', customEnd: '' },
};

export const usePurchaseOrderStore = createGenericStore<PurchaseOrderFilters>(
  initialFilters,
  DEFAULT_COLUMNS,
);
