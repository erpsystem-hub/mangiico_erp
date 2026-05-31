import { createGenericStore, ColumnConfig } from '@/store/createGenericStore';
import { TABLE_COLUMN_PRESETS } from '@/lib/table-column-presets';
import { txt } from '@/lib/text';
import type { PartnerCategoryFilters } from '../core/types';

const P = TABLE_COLUMN_PRESETS;

const DEFAULT_COLUMNS: ColumnConfig[] = [
  {
    id: 'thu_tu',
    label: txt('partnerCategory.store.orderCol'),
    visible: true,
    minWidth: 88,
    maxWidth: 112,
    order: 0,
  },
  {
    id: 'ten_danh_muc',
    label: txt('partnerCategory.store.nameCol'),
    visible: true,
    minWidth: 300,
    maxWidth: 560,
    order: 1,
  },
  {
    id: 'ma_danh_muc',
    label: txt('partnerCategory.store.codeCol'),
    visible: true,
    minWidth: 150,
    maxWidth: 240,
    order: 2,
  },
  {
    id: 'ten_danh_muc_cha',
    label: txt('partnerCategory.store.parentCol'),
    visible: true,
    minWidth: 220,
    maxWidth: 360,
    order: 3,
  },
  {
    id: 'mo_ta',
    label: txt('partnerCategory.store.descCol'),
    visible: true,
    minWidth: 240,
    maxWidth: 420,
    order: 4,
  },
  {
    id: 'cap_do',
    label: txt('partnerCategory.store.levelCol'),
    visible: true,
    ...P.enumBadgeShort,
    order: 5,
  },
  { id: 'trang_thai', label: txt('partnerCategory.store.statusCol'), visible: true, ...P.enumBadge, order: 6 },
  { id: 'tg_cap_nhat', label: txt('partnerCategory.store.updatedCol'), visible: true, ...P.datetime, order: 7 },
];

const initialFilters: PartnerCategoryFilters = {
  columnSearch: {},
  status: [],
  id_danh_muc_goc: [],
};

export const usePartnerCategoryStore = createGenericStore<PartnerCategoryFilters>(
  initialFilters,
  DEFAULT_COLUMNS,
);
