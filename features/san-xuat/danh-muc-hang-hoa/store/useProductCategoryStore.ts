import { createGenericStore, ColumnConfig } from '@/store/createGenericStore';
import { txt } from '@/lib/text';

export interface ProductCategoryFilters {
  columnSearch: Record<string, string>;
  status: string[];
  id_danh_muc_goc: string[];
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'thu_tu', label: txt('productCategory.store.orderCol'), visible: true, minWidth: 80, maxWidth: 104, order: 0 },
  {
    id: 'ten_danh_muc',
    label: txt('productCategory.store.nameCol'),
    visible: true,
    minWidth: 280,
    maxWidth: 520,
    order: 1,
  },
  { id: 'ma_danh_muc', label: txt('productCategory.store.codeCol'), visible: true, minWidth: 140, maxWidth: 220, order: 2 },
  {
    id: 'ten_danh_muc_cha',
    label: txt('productCategory.store.parentCol'),
    visible: true,
    minWidth: 200,
    maxWidth: 320,
    order: 3,
  },
  {
    id: 'mo_ta',
    label: txt('productCategory.store.descCol'),
    visible: true,
    minWidth: 200,
    maxWidth: 380,
    order: 4,
  },
  { id: 'cap_do', label: txt('productCategory.store.levelCol'), visible: true, minWidth: 120, maxWidth: 160, order: 5 },
  { id: 'trang_thai', label: txt('productCategory.store.statusCol'), visible: true, minWidth: 160, maxWidth: 220, order: 6 },
  { id: 'tg_cap_nhat', label: txt('productCategory.store.updatedCol'), visible: true, minWidth: 120, maxWidth: 160, order: 7 },
];

const initialFilters: ProductCategoryFilters = {
  columnSearch: {},
  status: [],
  id_danh_muc_goc: [],
};

export const useProductCategoryStore = createGenericStore<ProductCategoryFilters>(
  initialFilters,
  DEFAULT_COLUMNS,
);
