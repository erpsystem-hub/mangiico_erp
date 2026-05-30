import React, { useMemo } from 'react';
import { txt } from '../../../../lib/text';
import { Plus, Download, Upload, Tag, Building2 } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Tooltip from '../../../../components/ui/Tooltip';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';
import { useFinanceCategoryStore } from '../store/useFinanceCategoryStore';
import GenericToolbar from '../../../../components/shared/GenericToolbar';
import FilterChipMultiSelect from '../../../../components/shared/FilterChipMultiSelect';
import { useHierarchyRootFilter } from '../../../../lib/useHierarchyRootFilter';
import type { FinanceCategory } from '../core/types';
import { countFinanceCategoryColumnSearchActive } from '../utils/column-search';

interface Props {
  categories: FinanceCategory[];
  selectedCount: number;
  onAdd: () => void;
  onExport: () => void;
  onImport: () => void;
  onDeleteMany: () => void;
  onStatusChangeMany: (status: import('@/lib/constants/trang-thai').TrangThaiHoatDong) => void;
}

const DanhMucTaiChinhToolbar: React.FC<Props> = ({
  categories,
  selectedCount,
  onAdd,
  onExport,
  onImport,
  onDeleteMany,
  onStatusChangeMany,
}) => {
  const { canCreate, canImport, canExport, canDelete, canEdit } = useResourcePermissions('financeCategories');

  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    setSort,
    clearSelection,
    columns,
    toggleColumn,
    reorderColumns,
    resetColumns,
  } = useFinanceCategoryStore();

  const phongOptionsWithCount = useHierarchyRootFilter({
    items: categories,
    getId: (d) => d.id,
    getParentId: (d) => d.cha_id,
    getOrder: (d) => d.thu_tu,
    getRootLabel: (d) => d.ten_danh_muc,
  });

  const statusOptions = useMemo(
    () => [
      { label: txt('common.activeStatus'), value: 'Active', count: categories.filter((d) => d.trang_thai === 'Đang hoạt động').length },
      { label: txt('common.inactiveStatus'), value: 'Inactive', count: categories.filter((d) => d.trang_thai === 'Ngừng hoạt động').length },
    ],
    [categories]
  );

  const loaiOptions = useMemo(
    () => [
      {
        label: txt('financeCategory.typeThu'),
        value: 'Thu',
        count: categories.filter((d) => d.loai === 'Thu').length,
      },
      {
        label: txt('financeCategory.typeChi'),
        value: 'Chi',
        count: categories.filter((d) => d.loai === 'Chi').length,
      },
    ],
    [categories],
  );

  const activeFilterCount = useMemo(() => {
    const colN = countFinanceCategoryColumnSearchActive(filters.columnSearch);
    const statusOn = filters.status.length > 0 ? 1 : 0;
    const loaiOn = filters.loai.length > 0 ? 1 : 0;
    const rootOn = filters.id_danh_muc_goc.length > 0 ? 1 : 0;
    return colN + statusOn + loaiOn + rootOn + (searchTerm.trim() ? 1 : 0);
  }, [
    filters.columnSearch,
    filters.status.length,
    filters.loai.length,
    filters.id_danh_muc_goc.length,
    searchTerm,
  ]);

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setFilter('columnSearch', {});
    setFilter('status', []);
    setFilter('loai', []);
    setFilter('id_danh_muc_goc', []);
    setSort(null, null);
  };

  const filterGroups = useMemo(
    () => [
      {
        key: 'id_danh_muc_goc',
        label: txt('financeCategory.toolbar.rootCategory'),
        icon: Building2,
        options: phongOptionsWithCount,
        value: filters.id_danh_muc_goc,
        onChange: (val: string[]) => setFilter('id_danh_muc_goc', val),
      },
      {
        key: 'loai',
        label: txt('financeCategory.toolbar.type'),
        icon: Tag,
        options: loaiOptions,
        value: filters.loai,
        onChange: (val: string[]) => setFilter('loai', val),
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
    [
      filters.id_danh_muc_goc,
      filters.loai,
      filters.status,
      setFilter,
      phongOptionsWithCount,
      loaiOptions,
      statusOptions,
    ],
  );

  const filtersSlot = useMemo(
    () => (
      <div className="flex flex-wrap items-center gap-2 min-w-0">
        <FilterChipMultiSelect
          options={phongOptionsWithCount}
          value={filters.id_danh_muc_goc}
          onChange={(val) => setFilter('id_danh_muc_goc', val)}
          placeholder={txt('financeCategory.toolbar.rootCategory')}
          icon={Building2}
          className="shrink-0 w-full min-w-0 sm:w-[min(220px,30vw)] sm:max-w-[280px]"
        />
        <FilterChipMultiSelect
          options={loaiOptions}
          value={filters.loai}
          onChange={(val) => setFilter('loai', val)}
          placeholder={txt('financeCategory.toolbar.type')}
          icon={Tag}
          className="shrink-0 w-full min-w-0 sm:w-[min(160px,22vw)] sm:max-w-[200px]"
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
    [phongOptionsWithCount, loaiOptions, statusOptions, filters.id_danh_muc_goc, filters.loai, filters.status, setFilter],
  );

  const mobileActions = useMemo(
    () => [
      ...(canImport
        ? [
            {
              key: 'import',
              label: txt('common.import'),
              icon: Upload,
              onClick: onImport,
              description: '',
            },
          ]
        : []),
      ...(canExport
        ? [
            {
              key: 'export',
              label: txt('common.export'),
              icon: Download,
              onClick: onExport,
              description: '',
            },
          ]
        : []),
    ],
    [onImport, onExport, canImport, canExport]
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
      onDeleteMany={canDelete ? onDeleteMany : undefined}
      onStatusChangeMany={canEdit ? onStatusChangeMany : undefined}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      onClearSelection={clearSelection}
      actions={renderActions}
      filters={filtersSlot}
      filterGroups={filterGroups}
      mobileActions={mobileActions}
      onAdd={canCreate ? onAdd : undefined}
      showBack
      activeFilterCount={activeFilterCount}
      onClearAllFilters={handleClearAllFilters}
      columns={columns}
      onToggleColumn={toggleColumn}
      onReorderColumns={reorderColumns}
      onResetColumns={resetColumns}
    />
  );
};

export default DanhMucTaiChinhToolbar;
