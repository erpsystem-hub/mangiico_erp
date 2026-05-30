import { createGenericStore, ColumnConfig } from '@/store/createGenericStore';
import { TABLE_COLUMN_PRESETS } from '@/lib/table-column-presets';
import type { MaterialCatalogFilters } from '../core/types';
import { txt } from '@/lib/text';

const P = TABLE_COLUMN_PRESETS;

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'ma_nguyen_lieu', label: txt('materialCatalog.store.codeCol'), visible: true, minWidth: 120, maxWidth: 160, order: 0 },
  {
    id: 'ten_nguyen_lieu',
    label: txt('materialCatalog.store.nameCol'),
    visible: true,
    minWidth: 200,
    maxWidth: 360,
    order: 1,
  },
  { id: 'ten_nhom_danh_muc', label: txt('materialCatalog.store.groupCol'), visible: true, minWidth: 140, maxWidth: 220, order: 2 },
  { id: 'ten_danh_muc', label: txt('materialCatalog.store.categoryCol'), visible: true, minWidth: 140, maxWidth: 220, order: 3 },
  { id: 'mau_sac', label: txt('materialCatalog.store.colorCol'), visible: true, minWidth: 100, maxWidth: 160, order: 4 },
  { id: 'don_vi_tinh', label: txt('materialCatalog.store.unitCol'), visible: true, minWidth: 80, maxWidth: 120, order: 5 },
  { id: 'trang_thai', label: txt('materialCatalog.store.statusCol'), visible: true, ...P.enumBadge, order: 6 },
  { id: 'tg_cap_nhat', label: txt('materialCatalog.store.updatedCol'), visible: true, ...P.datetime, order: 7 },
];

const initialFilters: MaterialCatalogFilters = {
  status: [],
  id_danh_muc_goc: [],
  columnSearch: {},
};

export const useMaterialCatalogStore = createGenericStore<MaterialCatalogFilters>(
  initialFilters,
  DEFAULT_COLUMNS,
);
