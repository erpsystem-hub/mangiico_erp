import React, { useMemo } from 'react';
import { txt } from '@/lib/text';
import { Plus, Download, Upload, Tag, Landmark, MapPinned } from 'lucide-react';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';
import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';
import { useFinanceAccountStore } from '../store/useFinanceAccountStore';
import GenericToolbar from '@/components/shared/GenericToolbar';
import FilterChipMultiSelect from '@/components/shared/FilterChipMultiSelect';
import { countColumnSearchActive } from '../utils/column-search';
import { LOAI_QUY_VALUES } from '../core/constants';
import type { Branch } from '@/features/he-thong/chi-nhanh/core/types';

interface Props {
  statusCounts: { Active: number; Inactive: number };
  loaiCounts: Record<string, number>;
  branchCounts: Record<string, number>;
  branches: Branch[];
  onAdd: () => void;
  onExport: () => void;
  onImport: () => void;
  onDeleteMany: (ids: string[]) => void;
  onStatusChangeMany: (ids: string[], status: TrangThaiHoatDong) => void;
}

const FinanceAccountToolbar: React.FC<Props> = ({
  statusCounts,
  loaiCounts,
  branchCounts,
  branches,
  onAdd,
  onExport,
  onImport,
  onDeleteMany,
  onStatusChangeMany,
}) => {
  const { canCreate, canImport, canExport, canDelete, canEdit } =
    useResourcePermissions('financeAccounts');

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
  } = useFinanceAccountStore();

  const selectedCount = selectedIds.size;

  const activeFilterCount = useMemo(() => {
    const columnSearchN = countColumnSearchActive(filters.columnSearch);
    return (
      (searchTerm ? 1 : 0) +
      columnSearchN +
      (filters.status.length > 0 ? 1 : 0) +
      (filters.loai_quy.length > 0 ? 1 : 0) +
      (filters.chi_nhanh_id.length > 0 ? 1 : 0)
    );
  }, [searchTerm, filters]);

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setFilter('columnSearch', {});
    setFilter('status', []);
    setFilter('loai_quy', []);
    setFilter('chi_nhanh_id', []);
  };

  const statusOptions = useMemo(
    () => [
      { label: txt('common.activeStatus'), value: 'Active', count: statusCounts.Active },
      { label: txt('common.inactiveStatus'), value: 'Inactive', count: statusCounts.Inactive },
    ],
    [statusCounts],
  );

  const loaiOptions = useMemo(
    () =>
      LOAI_QUY_VALUES.map((v) => ({
        label: v === 'Tiền mặt' ? txt('financeAccount.fundTypeCash') : txt('financeAccount.fundTypeBank'),
        value: v,
        count: loaiCounts[v] ?? 0,
      })),
    [loaiCounts],
  );

  const branchOptions = useMemo(
    () =>
      branches.map((b) => ({
        label: b.ten_chi_nhanh,
        value: b.id,
        count: branchCounts[b.id] ?? 0,
      })),
    [branches, branchCounts],
  );

  const filtersSlot = useMemo(
    () => (
      <div className="flex flex-wrap items-center gap-2 min-w-0">
        <FilterChipMultiSelect
          options={loaiOptions}
          value={filters.loai_quy}
          onChange={(val) => setFilter('loai_quy', val)}
          placeholder={txt('financeAccount.store.fundTypeCol')}
          icon={Landmark}
          className="shrink-0 w-full min-w-0 sm:w-[min(160px,22vw)] sm:max-w-[200px]"
        />
        <FilterChipMultiSelect
          options={branchOptions}
          value={filters.chi_nhanh_id}
          onChange={(val) => setFilter('chi_nhanh_id', val)}
          placeholder={txt('financeAccount.store.branchCol')}
          icon={MapPinned}
          className="shrink-0 w-full min-w-0 sm:w-[min(180px,24vw)] sm:max-w-[220px]"
        />
        <FilterChipMultiSelect
          options={statusOptions}
          value={filters.status}
          onChange={(val) => setFilter('status', val)}
          placeholder={txt('common.status')}
          icon={Tag}
          className="shrink-0 w-full min-w-0 sm:w-[min(180px,24vw)] sm:max-w-[220px]"
        />
      </div>
    ),
    [loaiOptions, branchOptions, statusOptions, filters, setFilter],
  );

  const filterGroups = useMemo(
    () => [
      {
        key: 'loai_quy',
        label: txt('financeAccount.store.fundTypeCol'),
        icon: Landmark,
        options: loaiOptions,
        value: filters.loai_quy,
        onChange: (val: string[]) => setFilter('loai_quy', val),
      },
      {
        key: 'chi_nhanh_id',
        label: txt('financeAccount.store.branchCol'),
        icon: MapPinned,
        options: branchOptions,
        value: filters.chi_nhanh_id,
        onChange: (val: string[]) => setFilter('chi_nhanh_id', val),
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
    [filters, setFilter, loaiOptions, branchOptions, statusOptions],
  );

  const mobileActions = useMemo(
    () => [
      ...(canImport
        ? [{ key: 'import', label: txt('common.import'), icon: Upload, onClick: onImport, description: '' }]
        : []),
      ...(canExport
        ? [{ key: 'export', label: txt('common.export'), icon: Download, onClick: onExport, description: '' }]
        : []),
    ],
    [onImport, onExport, canImport, canExport],
  );

  const renderActions = (
    <>
      <div className="hidden sm:flex items-center gap-2">
        {canImport && (
          <Tooltip content={txt('common.import')} placement="bottom">
            <Button
              variant="outline"
              size="sm"
              onClick={onImport}
              className="inline-flex min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 h-9 w-9 p-0 items-center justify-center border-border text-muted-foreground hover:bg-muted/50"
            >
              <Upload className="w-4 h-4" />
            </Button>
          </Tooltip>
        )}
        {canExport && (
          <Tooltip content={txt('common.export')} placement="bottom">
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="inline-flex min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 h-9 w-9 p-0 items-center justify-center border-border text-muted-foreground hover:bg-muted/50"
            >
              <Download className="w-4 h-4" />
            </Button>
          </Tooltip>
        )}
      </div>
      {canCreate && (
        <Button
          onClick={onAdd}
          size="sm"
          className="bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20 h-9 px-3 sm:px-4"
        >
          <Plus className="w-5 h-5 sm:w-4 sm:h-4 sm:mr-2" />
          <span className="hidden sm:inline">{txt('common.addNew')}</span>
        </Button>
      )}
    </>
  );

  return (
    <GenericToolbar
      selectedCount={selectedCount}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      onClearSelection={clearSelection}
      actions={renderActions}
      filters={filtersSlot}
      filterGroups={filterGroups}
      mobileActions={mobileActions}
      onAdd={canCreate ? onAdd : undefined}
      activeFilterCount={activeFilterCount}
      onClearAllFilters={handleClearAllFilters}
      onDeleteMany={canDelete ? () => onDeleteMany(Array.from(selectedIds)) : undefined}
      onStatusChangeMany={
        canEdit ? (status) => onStatusChangeMany(Array.from(selectedIds), status) : undefined
      }
      columns={columns}
      onToggleColumn={toggleColumn}
      onReorderColumns={reorderColumns}
      onResetColumns={resetColumns}
      showBack
    />
  );
};

export default FinanceAccountToolbar;
