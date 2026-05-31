import React, { useMemo } from 'react';
import { txt } from '@/lib/text';
import { Plus, Building2, Tag } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';
import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';
import type { AppResource } from '@/lib/permissions';
import type { PartnerCategory } from '../../core/types';
import type { PartnerListItem } from '../../core/types';
import { usePartnerListStore } from '../../store/usePartnerListStore';
import GenericToolbar from '@/components/shared/GenericToolbar';
import FilterChipMultiSelect from '@/components/shared/FilterChipMultiSelect';
import { useHierarchyRootFilter } from '@/lib/useHierarchyRootFilter';
import { countPartnerListColumnSearchActive } from '../../utils/column-search';

interface Props {
  listResource: AppResource;
  categories: PartnerCategory[];
  items: PartnerListItem[];
  onAdd: () => void;
  onDeleteMany: (ids: string[]) => void;
  onStatusChangeMany: (ids: string[], status: TrangThaiHoatDong) => void;
}

const PartnerListToolbar: React.FC<Props> = ({
  listResource,
  categories,
  items,
  onAdd,
  onDeleteMany,
  onStatusChangeMany,
}) => {
  const { canCreate, canDelete, canEdit } = useResourcePermissions(listResource);

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
  } = usePartnerListStore();

  const rootOptionsWithCount = useHierarchyRootFilter({
    items: categories,
    getId: (d) => d.id,
    getParentId: (d) => d.cha_id,
    getOrder: (d) => d.thu_tu,
    getRootLabel: (d) => d.ten_danh_muc,
  });

  const statusOptions = useMemo(
    () => [
      {
        label: txt('common.activeStatus'),
        value: 'Active',
        count: items.filter((d) => d.trang_thai === 'Đang hoạt động').length,
      },
      {
        label: txt('common.inactiveStatus'),
        value: 'Inactive',
        count: items.filter((d) => d.trang_thai === 'Ngừng hoạt động').length,
      },
    ],
    [items],
  );

  const activeFilterCount = useMemo(() => {
    const colN = countPartnerListColumnSearchActive(filters.columnSearch);
    return (
      (searchTerm ? 1 : 0) +
      colN +
      (filters.status.length > 0 ? 1 : 0) +
      (filters.id_danh_muc_goc.length > 0 ? 1 : 0)
    );
  }, [searchTerm, filters]);

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setFilter('columnSearch', {});
    setFilter('status', []);
    setFilter('id_danh_muc_goc', []);
  };

  const filterGroups = useMemo(
    () => [
      {
        key: 'id_danh_muc_goc',
        label: txt('partnerCategory.toolbar.rootCategory'),
        icon: Building2,
        options: rootOptionsWithCount,
        value: filters.id_danh_muc_goc,
        onChange: (val: string[]) => setFilter('id_danh_muc_goc', val),
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
    [filters, setFilter, rootOptionsWithCount, statusOptions],
  );

  const filtersSlot = useMemo(
    () => (
      <div className="flex flex-wrap items-center gap-2 min-w-0">
        <FilterChipMultiSelect
          options={rootOptionsWithCount}
          value={filters.id_danh_muc_goc}
          onChange={(val) => setFilter('id_danh_muc_goc', val)}
          placeholder={txt('partnerCategory.toolbar.rootCategory')}
          icon={Building2}
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
      </div>
    ),
    [rootOptionsWithCount, statusOptions, filters.id_danh_muc_goc, filters.status, setFilter],
  );

  return (
    <GenericToolbar
      selectedCount={selectedIds.size}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      onClearSelection={clearSelection}
      searchPlaceholder={txt('common.search')}
      filters={filtersSlot}
      filterGroups={filterGroups}
      activeFilterCount={activeFilterCount}
      onClearAllFilters={handleClearAllFilters}
      onDeleteMany={canDelete ? () => onDeleteMany(Array.from(selectedIds)) : undefined}
      onStatusChangeMany={
        canEdit ? (status) => onStatusChangeMany(Array.from(selectedIds), status) : undefined
      }
      onAdd={canCreate ? onAdd : undefined}
      showBack
      columns={columns}
      onToggleColumn={toggleColumn}
      onReorderColumns={reorderColumns}
      onResetColumns={resetColumns}
      actions={
        canCreate ? (
          <Button
            onClick={onAdd}
            size="sm"
            className="bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20 h-9 px-3 sm:px-4"
          >
            <Plus className="w-5 h-5 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">{txt('common.addNew')}</span>
          </Button>
        ) : null
      }
    />
  );
};

export default PartnerListToolbar;
