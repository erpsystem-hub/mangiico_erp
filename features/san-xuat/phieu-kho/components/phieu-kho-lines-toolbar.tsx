import React, { useMemo } from 'react';
import { txt } from '@/lib/text';
import { Tag, Warehouse, ArrowDownUp } from 'lucide-react';
import DateRangePicker from '@/components/ui/DateRangePicker';
import {
  WAREHOUSE_SLIP_DATE_PRESETS,
  warehouseSlipDateRangeLabel,
} from '../utils/warehouse-slip-date-filter';
import type { WarehouseSlipLineRow } from '../core/types';
import { useWarehouseSlipLineStore } from '../store/useWarehouseSlipLineStore';
import GenericToolbar from '@/components/shared/GenericToolbar';
import FilterChipMultiSelect from '@/components/shared/FilterChipMultiSelect';
import {
  LOAI_PHIEU_KHO,
  MUC_DICH_NHAP,
  MUC_DICH_XUAT,
  TRANG_THAI_PHIEU_KHO,
} from '../core/constants';
import { useWarehouses } from '../hooks/use-phieu-kho';

interface Props {
  lines: WarehouseSlipLineRow[];
}

const ALL_MUC_DICH = [...MUC_DICH_NHAP, ...MUC_DICH_XUAT];

const PhieuKhoLinesToolbar: React.FC<Props> = ({ lines }) => {
  const { data: warehouses = [] } = useWarehouses();

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
  } = useWarehouseSlipLineStore();

  const loaiOptions = useMemo(
    () =>
      LOAI_PHIEU_KHO.map((loai) => ({
        label: loai,
        value: loai,
        count: lines.filter((ln) => ln.loai_phieu === loai).length,
      })),
    [lines],
  );

  const mucDichOptions = useMemo(
    () =>
      ALL_MUC_DICH.map((md) => ({
        label: md,
        value: md,
        count: lines.filter((ln) => ln.muc_dich === md).length,
      })),
    [lines],
  );

  const statusOptions = useMemo(
    () =>
      TRANG_THAI_PHIEU_KHO.map((st) => ({
        label: st,
        value: st,
        count: lines.filter((ln) => ln.trang_thai === st).length,
      })),
    [lines],
  );

  const warehouseOptions = useMemo(
    () =>
      warehouses
        .map((w) => ({
          label: w.ten_kho,
          value: w.id,
          subLabel: w.ma_kho,
        }))
        .sort((a, b) => a.label.localeCompare(b.label, 'vi')),
    [warehouses],
  );

  const dateRangeActive = filters.dateRange.preset !== 'all';

  const activeFilterCount = useMemo(() => {
    const colN = Object.values(filters.columnSearch).filter((v) => v?.trim()).length;
    return (
      (searchTerm ? 1 : 0) +
      colN +
      (filters.loai_phieu.length > 0 ? 1 : 0) +
      (filters.muc_dich.length > 0 ? 1 : 0) +
      (filters.status.length > 0 ? 1 : 0) +
      (filters.kho_ids.length > 0 ? 1 : 0) +
      (dateRangeActive ? 1 : 0)
    );
  }, [searchTerm, filters, dateRangeActive]);

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setFilter('columnSearch', {});
    setFilter('loai_phieu', []);
    setFilter('muc_dich', []);
    setFilter('status', []);
    setFilter('kho_ids', []);
    setFilter('dateRange', { preset: 'all', customStart: '', customEnd: '' });
  };

  const filterGroups = useMemo(
    () => [
      {
        key: 'loai_phieu',
        label: txt('warehouseSlip.store.typeCol'),
        icon: ArrowDownUp,
        options: loaiOptions,
        value: filters.loai_phieu,
        onChange: (val: string[]) => setFilter('loai_phieu', val),
      },
      {
        key: 'muc_dich',
        label: txt('warehouseSlip.store.purposeCol'),
        icon: Tag,
        options: mucDichOptions,
        value: filters.muc_dich,
        onChange: (val: string[]) => setFilter('muc_dich', val),
      },
      {
        key: 'kho_ids',
        label: txt('warehouseSlip.store.warehouseCol'),
        icon: Warehouse,
        options: warehouseOptions,
        value: filters.kho_ids,
        onChange: (val: string[]) => setFilter('kho_ids', val),
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
    [loaiOptions, mucDichOptions, warehouseOptions, statusOptions, filters, setFilter],
  );

  const dateRangeLabel = useMemo(
    () => warehouseSlipDateRangeLabel(filters.dateRange),
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
            options={loaiOptions}
            value={filters.loai_phieu}
            onChange={(val) => setFilter('loai_phieu', val)}
            placeholder={txt('warehouseSlip.store.typeCol')}
            icon={ArrowDownUp}
            className="shrink-0 w-full min-w-0 sm:w-[min(140px,20vw)] sm:max-w-[180px]"
          />
          <FilterChipMultiSelect
            options={mucDichOptions}
            value={filters.muc_dich}
            onChange={(val) => setFilter('muc_dich', val)}
            placeholder={txt('warehouseSlip.store.purposeCol')}
            icon={Tag}
            className="shrink-0 w-full min-w-0 sm:w-[min(180px,24vw)] sm:max-w-[220px]"
          />
          <FilterChipMultiSelect
            options={warehouseOptions}
            value={filters.kho_ids}
            onChange={(val) => setFilter('kho_ids', val)}
            placeholder={txt('warehouseSlip.store.warehouseCol')}
            icon={Warehouse}
            className="shrink-0 w-full min-w-0 sm:w-[min(180px,24vw)] sm:max-w-[220px]"
          />
          <FilterChipMultiSelect
            options={statusOptions}
            value={filters.status}
            onChange={(val) => setFilter('status', val)}
            placeholder={txt('common.status')}
            icon={Tag}
            className="shrink-0 w-full min-w-0 sm:w-[min(160px,22vw)] sm:max-w-[200px]"
          />
          <DateRangePicker
            presets={[...WAREHOUSE_SLIP_DATE_PRESETS]}
            value={filters.dateRange}
            onChange={(val) => setFilter('dateRange', val)}
            displayLabel={dateRangeLabel}
            placeholder={txt('warehouseSlip.filter.slipDate')}
            className="shrink-0"
          />
        </div>
      }
    />
  );
};

export default PhieuKhoLinesToolbar;
