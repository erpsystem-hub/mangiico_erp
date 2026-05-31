import React, { useMemo } from 'react';
import { txt } from '@/lib/text';
import { Plus, Truck, Tag } from 'lucide-react';
import DateRangePicker from '@/components/ui/DateRangePicker';
import {
  PURCHASE_ORDER_DATE_PRESETS,
  purchaseOrderDateRangeLabel,
} from '../utils/purchase-date-filter';
import Button from '@/components/ui/Button';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';
import type { PurchaseOrder } from '../core/types';
import type { PartnerListItem } from '@/features/kinh-doanh/doi-tac/core/types';
import { usePurchaseOrderStore } from '../store/usePurchaseOrderStore';
import GenericToolbar from '@/components/shared/GenericToolbar';
import FilterChipMultiSelect from '@/components/shared/FilterChipMultiSelect';
import { TRANG_THAI_DON_MUA } from '../core/constants';

interface Props {
  orders: PurchaseOrder[];
  suppliers: PartnerListItem[];
  onAdd: () => void;
  onDeleteMany: (ids: string[]) => void;
}

const DonMuaToolbar: React.FC<Props> = ({ orders, suppliers, onAdd, onDeleteMany }) => {
  const { canCreate, canDelete } = useResourcePermissions('materialPurchases');

  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    columns,
    toggleColumn,
    reorderColumns,
    resetColumns,
    selectedIds,
    clearSelection,
  } = usePurchaseOrderStore();

  const statusOptions = useMemo(
    () =>
      TRANG_THAI_DON_MUA.map((st) => ({
        label: st,
        value: st,
        count: orders.filter((o) => o.trang_thai === st).length,
      })),
    [orders],
  );

  const supplierOptions = useMemo(
    () =>
      suppliers
        .filter((c) => c.trang_thai === 'Đang hoạt động')
        .map((c) => ({
          label: c.ten_doi_tac,
          value: c.id,
          subLabel: c.ma_doi_tac,
        }))
        .sort((a, b) => a.label.localeCompare(b.label, 'vi')),
    [suppliers],
  );

  const dateRangeActive = filters.dateRange.preset !== 'all';

  const activeFilterCount = useMemo(() => {
    const colN = Object.values(filters.columnSearch).filter((v) => v?.trim()).length;
    return (
      (searchTerm ? 1 : 0) +
      colN +
      (filters.status.length > 0 ? 1 : 0) +
      (filters.nha_cung_cap_ids.length > 0 ? 1 : 0) +
      (dateRangeActive ? 1 : 0)
    );
  }, [searchTerm, filters, dateRangeActive]);

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setFilter('columnSearch', {});
    setFilter('status', []);
    setFilter('nha_cung_cap_ids', []);
    setFilter('dateRange', { preset: 'all', customStart: '', customEnd: '' });
  };

  const filterGroups = useMemo(
    () => [
      {
        key: 'nha_cung_cap_ids',
        label: txt('purchaseOrder.store.supplierCol'),
        icon: Truck,
        options: supplierOptions,
        value: filters.nha_cung_cap_ids,
        onChange: (val: string[]) => setFilter('nha_cung_cap_ids', val),
      },
      {
        key: 'status',
        label: txt('common.status'),
        icon: Tag,
        options: statusOptions,
        value: filters.status,
        onChange: (val: string[]) => setFilter('status', val),
      },
    ],
    [supplierOptions, statusOptions, filters, setFilter],
  );

  const dateRangeLabel = useMemo(
    () => purchaseOrderDateRangeLabel(filters.dateRange),
    [filters.dateRange],
  );

  return (
    <GenericToolbar
      showBack
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder={txt('common.search')}
      activeFilterCount={activeFilterCount}
      onClearAllFilters={handleClearAllFilters}
      filterGroups={filterGroups}
      columns={columns}
      onToggleColumn={toggleColumn}
      onReorderColumns={reorderColumns}
      onResetColumns={resetColumns}
      selectedCount={selectedIds.size}
      onClearSelection={clearSelection}
      actions={
        canCreate ? (
          <Button size="sm" onClick={onAdd} className="bg-primary text-white hover:bg-primary/90">
            <Plus size={16} className="mr-1.5" />
            {txt('purchaseOrder.addButton')}
          </Button>
        ) : undefined
      }
      onDeleteMany={
        canDelete && selectedIds.size > 0
          ? () => onDeleteMany(Array.from(selectedIds))
          : undefined
      }
      filters={
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <FilterChipMultiSelect
            options={supplierOptions}
            value={filters.nha_cung_cap_ids}
            onChange={(val) => setFilter('nha_cung_cap_ids', val)}
            placeholder={txt('purchaseOrder.store.supplierCol')}
            icon={Truck}
            className="shrink-0 w-full min-w-0 sm:w-[min(220px,30vw)] sm:max-w-[280px]"
          />
          <FilterChipMultiSelect
            options={statusOptions}
            value={filters.status}
            onChange={(val) => setFilter('status', val)}
            placeholder={txt('common.status')}
            icon={Tag}
            className="shrink-0 w-full min-w-0 sm:w-[min(180px,24vw)] sm:max-w-[220px]"
          />
          <DateRangePicker
            presets={[...PURCHASE_ORDER_DATE_PRESETS]}
            value={filters.dateRange}
            onChange={(val) => setFilter('dateRange', val)}
            displayLabel={dateRangeLabel}
            placeholder={txt('purchaseOrder.filter.orderDate')}
            className="shrink-0"
          />
        </div>
      }
    />
  );
};

export default DonMuaToolbar;
