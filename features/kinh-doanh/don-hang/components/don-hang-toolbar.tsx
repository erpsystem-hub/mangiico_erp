import React, { useMemo } from 'react';
import { txt } from '@/lib/text';
import { Plus, Users, Tag } from 'lucide-react';
import DateRangePicker from '@/components/ui/DateRangePicker';
import {
  SALES_ORDER_DATE_PRESETS,
  salesOrderDateRangeLabel,
} from '../utils/order-date-filter';
import Button from '@/components/ui/Button';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';
import type { SalesOrder } from '../core/types';
import type { PartnerListItem } from '@/features/kinh-doanh/doi-tac/core/types';
import { useSalesOrderStore } from '../store/useSalesOrderStore';
import GenericToolbar from '@/components/shared/GenericToolbar';
import FilterChipMultiSelect from '@/components/shared/FilterChipMultiSelect';
import { TRANG_THAI_DON_HANG } from '../core/constants';

interface Props {
  orders: SalesOrder[];
  customers: PartnerListItem[];
  onAdd: () => void;
  onDeleteMany: (ids: string[]) => void;
}

const DonHangToolbar: React.FC<Props> = ({ orders, customers, onAdd, onDeleteMany }) => {
  const { canCreate, canDelete } = useResourcePermissions('salesOrders');

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
  } = useSalesOrderStore();

  const statusOptions = useMemo(
    () =>
      TRANG_THAI_DON_HANG.map((st) => ({
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
        label: txt('salesOrder.store.customerCol'),
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
    () => salesOrderDateRangeLabel(filters.dateRange),
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
            {txt('salesOrder.addButton')}
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
            options={customerOptions}
            value={filters.khach_hang_ids}
            onChange={(val) => setFilter('khach_hang_ids', val)}
            placeholder={txt('salesOrder.store.customerCol')}
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
            presets={[...SALES_ORDER_DATE_PRESETS]}
            value={filters.dateRange}
            onChange={(val) => setFilter('dateRange', val)}
            displayLabel={dateRangeLabel}
            placeholder={txt('salesOrder.filter.orderDate')}
            className="shrink-0"
          />
        </div>
      }
    />
  );
};

export default DonHangToolbar;
