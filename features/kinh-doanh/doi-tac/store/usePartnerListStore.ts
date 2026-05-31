import { createGenericStore, ColumnConfig } from '@/store/createGenericStore';
import { TABLE_COLUMN_PRESETS } from '@/lib/table-column-presets';
import type { PartnerListFilters } from '../core/types';
import { txt } from '@/lib/text';

const P = TABLE_COLUMN_PRESETS;

const DEFAULT_COLUMNS: ColumnConfig[] = [
  {
    id: 'ma_doi_tac',
    label: txt('partnerList.store.codeCol'),
    visible: true,
    minWidth: 128,
    maxWidth: 176,
    order: 0,
  },
  {
    id: 'ten_doi_tac',
    label: txt('partnerList.store.nameCol'),
    visible: true,
    minWidth: 220,
    maxWidth: 400,
    order: 1,
  },
  {
    id: 'ten_nhom_danh_muc',
    label: txt('partnerList.store.groupCol'),
    visible: true,
    ...P.branch,
    order: 2,
  },
  {
    id: 'ten_danh_muc',
    label: txt('partnerList.store.categoryCol'),
    visible: true,
    minWidth: 160,
    maxWidth: 300,
    order: 3,
  },
  {
    id: 'dien_thoai',
    label: txt('partnerList.store.phoneCol'),
    visible: true,
    minWidth: 128,
    maxWidth: 168,
    order: 4,
  },
  {
    id: 'email',
    label: txt('partnerList.store.emailCol'),
    visible: true,
    ...P.email,
    order: 5,
  },
  { id: 'trang_thai', label: txt('partnerList.store.statusCol'), visible: true, ...P.enumBadge, order: 6 },
  { id: 'tg_cap_nhat', label: txt('partnerList.store.updatedCol'), visible: true, ...P.datetime, order: 7 },
];

const initialFilters: PartnerListFilters = {
  status: [],
  id_danh_muc_goc: [],
  columnSearch: {},
};

export const usePartnerListStore = createGenericStore<PartnerListFilters>(
  initialFilters,
  DEFAULT_COLUMNS,
);
