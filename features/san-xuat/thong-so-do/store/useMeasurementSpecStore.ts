import { createGenericStore, ColumnConfig } from '@/store/createGenericStore';
import { TABLE_COLUMN_PRESETS } from '@/lib/table-column-presets';
import type { MeasurementSpecFilters } from '../core/types';
import { txt } from '@/lib/text';

const P = TABLE_COLUMN_PRESETS;

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'thu_tu', label: txt('measurementSpec.store.orderCol'), visible: true, minWidth: 72, maxWidth: 96, order: 0 },
  {
    id: 'ten_hien_thi',
    label: txt('measurementSpec.store.displayNameCol'),
    visible: true,
    minWidth: 200,
    maxWidth: 360,
    order: 1,
  },
  {
    id: 'don_vi',
    label: txt('measurementSpec.store.unitCol'),
    visible: true,
    minWidth: 80,
    maxWidth: 120,
    order: 2,
  },
  { id: 'trang_thai', label: txt('measurementSpec.store.statusCol'), visible: true, ...P.enumBadge, order: 3 },
  { id: 'tg_cap_nhat', label: txt('measurementSpec.store.updatedCol'), visible: true, ...P.datetime, order: 4 },
];

const initialFilters: MeasurementSpecFilters = {
  status: [],
  columnSearch: {},
};

export const useMeasurementSpecStore = createGenericStore<MeasurementSpecFilters>(
  initialFilters,
  DEFAULT_COLUMNS,
);
