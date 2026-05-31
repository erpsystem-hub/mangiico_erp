import { createGenericStore, ColumnConfig } from '@/store/createGenericStore';
import { TABLE_COLUMN_PRESETS } from '@/lib/table-column-presets';
import type { BomFilters } from '../core/types';
import { txt } from '@/lib/text';

const P = TABLE_COLUMN_PRESETS;

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'ma_san_pham', label: txt('bom.store.productCodeCol'), visible: true, ...P.code, order: 0 },
  {
    id: 'ten_san_pham',
    label: txt('bom.store.productNameCol'),
    visible: true,
    minWidth: 148,
    maxWidth: 240,
    order: 1,
  },
  { id: 'ma_nguyen_lieu', label: txt('bom.store.materialCodeCol'), visible: true, ...P.code, order: 2 },
  {
    id: 'ten_nguyen_lieu',
    label: txt('bom.store.materialNameCol'),
    visible: true,
    minWidth: 148,
    maxWidth: 240,
    order: 3,
  },
  { id: 'so_luong', label: txt('bom.store.quantityCol'), visible: true, minWidth: 76, maxWidth: 100, order: 4 },
  { id: 'don_vi_tinh', label: txt('bom.store.unitCol'), visible: true, minWidth: 56, maxWidth: 80, order: 5 },
  {
    id: 'ten_nhom_danh_muc_sp',
    label: txt('bom.store.groupCol'),
    visible: false,
    ...P.titleShort,
    order: 6,
  },
  { id: 'trang_thai', label: txt('bom.store.statusCol'), visible: true, ...P.enumBadge, order: 7 },
  { id: 'tg_cap_nhat', label: txt('bom.store.updatedCol'), visible: true, ...P.datetime, order: 8 },
];

const initialFilters: BomFilters = {
  status: [],
  id_danh_muc_goc: [],
  columnSearch: {},
};

export const useBomStore = createGenericStore<BomFilters>(initialFilters, DEFAULT_COLUMNS);
