import { createGenericStore, ColumnConfig } from '../../../../store/createGenericStore';
import { TABLE_COLUMN_PRESETS } from '../../../../lib/table-column-presets';
import type { BranchFilters } from '../core/types';
import { txt } from '../../../../lib/text';

const P = TABLE_COLUMN_PRESETS;

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'thu_tu', label: txt('branch.store.orderCol'), visible: true, minWidth: 72, maxWidth: 96, order: 0 },
  { id: 'ten_chi_nhanh', label: txt('branch.store.nameCol'), visible: true, ...P.titleShort, order: 1 },
  { id: 'ma_chi_nhanh', label: txt('branch.store.codeCol'), visible: true, minWidth: 88, maxWidth: 140, order: 2 },
  { id: 'dia_chi', label: txt('branch.store.addressCol'), visible: true, minWidth: 160, maxWidth: 320, order: 3 },
  { id: 'dien_thoai', label: txt('branch.store.phoneCol'), visible: false, minWidth: 120, maxWidth: 180, order: 4 },
  { id: 'email', label: txt('branch.store.emailCol'), visible: false, minWidth: 140, maxWidth: 220, order: 5 },
  { id: 'mo_ta', label: txt('branch.store.descCol'), visible: false, minWidth: 160, maxWidth: 400, order: 6 },
  { id: 'trang_thai', label: txt('branch.store.statusCol'), visible: true, ...P.enumBadge, order: 7 },
  { id: 'tg_cap_nhat', label: txt('branch.store.updatedCol'), visible: true, ...P.datetime, order: 8 },
];

const initialFilters: BranchFilters = {
  status: [],
  columnSearch: {},
};

export const useBranchStore = createGenericStore<BranchFilters>(initialFilters, DEFAULT_COLUMNS);
