import { createGenericStore, ColumnConfig } from '@/store/createGenericStore';
import { txt } from '@/lib/text';

export interface FinanceCategoryFilters {
  columnSearch: Record<string, string>;
  status: string[];
  loai: string[];
  id_danh_muc_goc: string[];
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'thu_tu', label: txt('financeCategory.store.orderCol'), visible: true, minWidth: 80, maxWidth: 104, order: 0 },
  {
    id: 'ten_danh_muc',
    label: txt('financeCategory.store.nameCol'),
    visible: true,
    minWidth: 280,
    maxWidth: 520,
    order: 1,
  },
  { id: 'ma_danh_muc', label: txt('financeCategory.store.codeCol'), visible: true, minWidth: 140, maxWidth: 220, order: 2 },
  { id: 'loai', label: txt('financeCategory.store.typeCol'), visible: true, minWidth: 108, maxWidth: 140, order: 3 },
  {
    id: 'ten_danh_muc_cha',
    label: txt('financeCategory.store.parentCol'),
    visible: true,
    minWidth: 200,
    maxWidth: 320,
    order: 4,
  },
  {
    id: 'mo_ta',
    label: txt('financeCategory.store.descCol'),
    visible: true,
    minWidth: 200,
    maxWidth: 380,
    order: 5,
  },
  { id: 'cap_do', label: txt('financeCategory.store.levelCol'), visible: true, minWidth: 120, maxWidth: 160, order: 6 },
  { id: 'trang_thai', label: txt('financeCategory.store.statusCol'), visible: true, minWidth: 160, maxWidth: 220, order: 7 },
  { id: 'tg_cap_nhat', label: txt('financeCategory.store.updatedCol'), visible: true, minWidth: 120, maxWidth: 160, order: 8 },
];

const initialFilters: FinanceCategoryFilters = {
  columnSearch: {},
  status: [],
  loai: [],
  id_danh_muc_goc: [],
};

export const useFinanceCategoryStore = createGenericStore<FinanceCategoryFilters>(
  initialFilters,
  DEFAULT_COLUMNS,
);
