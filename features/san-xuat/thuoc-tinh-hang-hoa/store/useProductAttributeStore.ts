import { createGenericStore, ColumnConfig } from '@/store/createGenericStore';
import { TABLE_COLUMN_PRESETS } from '@/lib/table-column-presets';
import type { ProductAttributeFilters } from '../core/types';
import { txt } from '@/lib/text';

const P = TABLE_COLUMN_PRESETS;

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'thu_tu', label: txt('productAttribute.store.orderCol'), visible: true, minWidth: 72, maxWidth: 96, order: 0 },
  {
    id: 'ten_hien_thi',
    label: txt('productAttribute.store.displayNameCol'),
    visible: true,
    minWidth: 240,
    maxWidth: 420,
    order: 1,
  },
  { id: 'trang_thai', label: txt('productAttribute.store.statusCol'), visible: true, ...P.enumBadge, order: 2 },
  { id: 'tg_cap_nhat', label: txt('productAttribute.store.updatedCol'), visible: true, ...P.datetime, order: 3 },
];

const initialFilters: ProductAttributeFilters = {
  status: [],
  columnSearch: {},
};

export const useProductAttributeStore = createGenericStore<ProductAttributeFilters>(
  initialFilters,
  DEFAULT_COLUMNS,
);
