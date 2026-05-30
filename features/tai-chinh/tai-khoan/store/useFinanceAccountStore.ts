import { createGenericStore, ColumnConfig } from '@/store/createGenericStore';
import { TABLE_COLUMN_PRESETS } from '@/lib/table-column-presets';
import type { FinanceAccountFilters } from '../core/types';
import { txt } from '@/lib/text';

const P = TABLE_COLUMN_PRESETS;

const DEFAULT_COLUMNS: ColumnConfig[] = [
  {
    id: 'ten_quy',
    label: txt('financeAccount.store.nameCol'),
    visible: true,
    minWidth: 200,
    maxWidth: 360,
    order: 0,
  },
  {
    id: 'loai_quy',
    label: txt('financeAccount.store.fundTypeCol'),
    visible: true,
    minWidth: 120,
    maxWidth: 160,
    order: 1,
  },
  {
    id: 'ten_chi_nhanh',
    label: txt('financeAccount.store.branchCol'),
    visible: true,
    minWidth: 180,
    maxWidth: 300,
    order: 2,
  },
  {
    id: 'ngan_hang',
    label: txt('financeAccount.store.bankCol'),
    visible: true,
    minWidth: 240,
    maxWidth: 400,
    order: 3,
  },
  {
    id: 'so_tai_khoan',
    label: txt('financeAccount.store.accountNoCol'),
    visible: true,
    minWidth: 140,
    maxWidth: 200,
    order: 4,
  },
  {
    id: 'so_du_khoi_dau',
    label: txt('financeAccount.store.openingBalanceCol'),
    visible: true,
    minWidth: 130,
    maxWidth: 180,
    order: 5,
  },
  { id: 'trang_thai', label: txt('financeAccount.store.statusCol'), visible: true, ...P.enumBadge, order: 6 },
  { id: 'tg_cap_nhat', label: txt('financeAccount.store.updatedCol'), visible: true, ...P.datetime, order: 7 },
];

const initialFilters: FinanceAccountFilters = {
  loai_quy: [],
  chi_nhanh_id: [],
  status: [],
  columnSearch: {},
};

export const useFinanceAccountStore = createGenericStore<FinanceAccountFilters>(
  initialFilters,
  DEFAULT_COLUMNS,
);
