import React, { useMemo } from 'react';
import { txt } from '@/lib/text';
import { Users, Tag } from 'lucide-react';
import DateRangePicker from '@/components/ui/DateRangePicker';
import {
  PRODUCTION_ORDER_DATE_PRESETS,
  productionOrderDateRangeLabel,
} from '../utils/production-order-date-filter';
import type { ProductionOrder } from '../core/types';
import type { PartnerListItem } from '@/features/kinh-doanh/doi-tac/core/types';
import { useProductionOrderStore } from '../store/useProductionOrderStore';
import GenericToolbar from '@/components/shared/GenericToolbar';
import FilterChipMultiSelect from '@/components/shared/FilterChipMultiSelect';
import { TRANG_THAI_LENH_SX } from '../core/constants';

interface Props {
  orders: ProductionOrder[];
  customers: PartnerListItem[];
}

const LenhSanXuatToolbar: React.FC<Props> = ({ orders, customers }) => {
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
  } = useProductionOrderStore();

  const statusOptions = useMemo(
    () =>
      TRANG_THAI_LENH_SX.map((st) => ({
        label: st,
        value: st,
        count: orders.filter((o) => o.trang_thai === st).length,
      })),
    [orders],
  );

  const customerOptions = useMemo(
    () =>
      customers
        .filter((c) => c.trang_thai === 'Đang hoạt động')
        .map((c) => ({
          label: c.ten_doi_tac,
          value: c.id,
          subLabel: c.ma_doi_tac,
        }))
        .sort((a, b) => a.label.localeCompare(b.label, 'vi')),
    [customers],
  );

  const dateRangeActive = filters.dateRange.preset !== 'all';

  const activeFilterCount = useMemo(() => {
    const colN = Object.values(filters.columnSearch).filter((v) => v?.trim()).length;
    return (
      (searchTerm ? 1 : 0) +
      colN +
      (filters.status.length > 0 ? 1 : 0) +
      (filters.khach_hang_ids.length > 0 ? 1 : 0) +
      (dateRangeActive ? 1 : 0)
    );
  }, [searchTerm, filters, dateRangeActive]);

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setFilter('columnSearch', {});
    setFilter('status', []);
    setFilter('khach_hang_ids', []);
    setFilter('dateRange', { preset: 'all', customStart: '', customEnd: '' });
  };

  const filterGroups = useMemo(
    () => [
      {
        key: 'khach_hang_ids',
        label: txt('productionOrder.store.customerCol'),
        icon: Users,
        options: customerOptions,
        value: filters.khach_hang_ids,
        onChange: (val: string[]) => setFilter('khach_hang_ids', val),
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
    [customerOptions, statusOptions, filters, setFilter],
  );

  const dateRangeLabel = useMemo(
    () => productionOrderDateRangeLabel(filters.dateRange),
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
      filters={
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <FilterChipMultiSelect
            options={customerOptions}
            value={filters.khach_hang_ids}
            onChange={(val) => setFilter('khach_hang_ids', val)}
            placeholder={txt('productionOrder.store.customerCol')}
            icon={Users}
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
            presets={[...PRODUCTION_ORDER_DATE_PRESETS]}
            value={filters.dateRange}
            onChange={(val) => setFilter('dateRange', val)}
            displayLabel={dateRangeLabel}
            placeholder={txt('productionOrder.filter.orderDate')}
            className="shrink-0"
          />
        </div>
      }
    />
  );
};

export default LenhSanXuatToolbar;
