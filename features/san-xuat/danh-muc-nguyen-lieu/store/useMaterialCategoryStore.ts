import { createGenericStore, ColumnConfig } from '@/store/createGenericStore';
import { txt } from '@/lib/text';
import type { MaterialCategoryFilters } from '../core/types';

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'thu_tu', label: txt('materialCategory.store.orderCol'), visible: true, minWidth: 80, maxWidth: 104, order: 0 },
  {
    id: 'ten_danh_muc',
    label: txt('materialCategory.store.nameCol'),
    visible: true,
    minWidth: 280,
    maxWidth: 520,
    order: 1,
  },
  { id: 'ma_danh_muc', label: txt('materialCategory.store.codeCol'), visible: true, minWidth: 140, maxWidth: 220, order: 2 },
  {
    id: 'ten_danh_muc_cha',
    label: txt('materialCategory.store.parentCol'),
    visible: true,
    minWidth: 200,
    maxWidth: 320,
    order: 3,
  },
  {
    id: 'mo_ta',
    label: txt('materialCategory.store.descCol'),
    visible: true,
    minWidth: 200,
    maxWidth: 380,
    order: 4,
  },
  { id: 'cap_do', label: txt('materialCategory.store.levelCol'), visible: true, minWidth: 120, maxWidth: 160, order: 5 },
  { id: 'trang_thai', label: txt('materialCategory.store.statusCol'), visible: true, minWidth: 160, maxWidth: 220, order: 6 },
  { id: 'tg_cap_nhat', label: txt('materialCategory.store.updatedCol'), visible: true, minWidth: 120, maxWidth: 160, order: 7 },
];

const initialFilters: MaterialCategoryFilters = {
  columnSearch: {},
  status: [],
  id_danh_muc_goc: [],
};

export const useMaterialCategoryStore = createGenericStore<MaterialCategoryFilters>(
  initialFilters,
  DEFAULT_COLUMNS,
);
