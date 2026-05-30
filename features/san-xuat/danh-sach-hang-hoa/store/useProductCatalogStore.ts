import { createGenericStore, ColumnConfig } from '@/store/createGenericStore';
import { TABLE_COLUMN_PRESETS } from '@/lib/table-column-presets';
import type { ProductCatalogFilters } from '../core/types';
import { txt } from '@/lib/text';

const P = TABLE_COLUMN_PRESETS;

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'ma_san_pham', label: txt('productCatalog.store.codeCol'), visible: true, minWidth: 120, maxWidth: 160, order: 0 },
  {
    id: 'ten_san_pham',
    label: txt('productCatalog.store.nameCol'),
    visible: true,
    minWidth: 200,
    maxWidth: 360,
    order: 1,
  },
  { id: 'ten_nhom_danh_muc', label: txt('productCatalog.store.groupCol'), visible: true, minWidth: 140, maxWidth: 220, order: 2 },
  { id: 'ten_danh_muc', label: txt('productCatalog.store.categoryCol'), visible: true, minWidth: 140, maxWidth: 220, order: 3 },
  { id: 'trang_thai', label: txt('productCatalog.store.statusCol'), visible: true, ...P.enumBadge, order: 4 },
  { id: 'tg_cap_nhat', label: txt('productCatalog.store.updatedCol'), visible: true, ...P.datetime, order: 5 },
];

const initialFilters: ProductCatalogFilters = {
  status: [],
  id_danh_muc_goc: [],
  columnSearch: {},
};

export const useProductCatalogStore = createGenericStore<ProductCatalogFilters>(
  initialFilters,
  DEFAULT_COLUMNS,
);
