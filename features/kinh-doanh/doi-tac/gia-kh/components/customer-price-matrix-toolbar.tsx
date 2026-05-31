import React, { useMemo } from 'react';
import { txt } from '@/lib/text';
import { Building2, Tag } from 'lucide-react';
import GenericToolbar from '@/components/shared/GenericToolbar';
import FilterChipMultiSelect from '@/components/shared/FilterChipMultiSelect';
import { useHierarchyRootFilter } from '@/lib/useHierarchyRootFilter';
import type { PartnerCategory } from '../../core/types';
import type { MatrixPartnerCategoryFilters } from '../utils/matrix-partner-category-filter';

interface Props {
  categories: PartnerCategory[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: MatrixPartnerCategoryFilters;
  onFilterChange: <K extends keyof MatrixPartnerCategoryFilters>(
    key: K,
    value: MatrixPartnerCategoryFilters[K],
  ) => void;
  activeFilterCount: number;
  onClearAllFilters: () => void;
}

const CustomerPriceMatrixToolbar: React.FC<Props> = ({
  categories,
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  activeFilterCount,
  onClearAllFilters,
}) => {
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
        count: categories.filter((d) => d.trang_thai === 'Đang hoạt động').length,
      },
      {
        label: txt('common.inactiveStatus'),
        value: 'Inactive',
        count: categories.filter((d) => d.trang_thai === 'Ngừng hoạt động').length,
      },
    ],
    [categories],
  );

  const filterGroups = useMemo(
    () => [
      {
        key: 'id_danh_muc_goc',
        label: txt('partnerCategory.toolbar.rootCategory'),
        icon: Building2,
        options: rootOptionsWithCount,
        value: filters.id_danh_muc_goc,
        onChange: (val: string[]) => onFilterChange('id_danh_muc_goc', val),
      },
      {
        key: 'status',
        label: txt('common.status'),
        icon: Tag,
        options: statusOptions,
        value: filters.status,
        onChange: (val: string[]) => onFilterChange('status', val),
      },
    ],
    [filters.id_danh_muc_goc, filters.status, onFilterChange, rootOptionsWithCount, statusOptions],
  );

  const filtersSlot = useMemo(
    () => (
      <div className="flex flex-wrap items-center gap-2 min-w-0">
        <FilterChipMultiSelect
          options={rootOptionsWithCount}
          value={filters.id_danh_muc_goc}
          onChange={(val) => onFilterChange('id_danh_muc_goc', val)}
          placeholder={txt('partnerCategory.toolbar.rootCategory')}
          icon={Building2}
          className="shrink-0 w-full min-w-0 sm:w-[min(220px,30vw)] sm:max-w-[280px]"
        />
        <FilterChipMultiSelect
          options={statusOptions}
          value={filters.status}
          onChange={(val) => onFilterChange('status', val)}
          placeholder={txt('common.status')}
          icon={Tag}
          className="shrink-0 w-full min-w-0 sm:w-[min(180px,24vw)] sm:max-w-[220px]"
        />
      </div>
    ),
    [filters.id_danh_muc_goc, filters.status, onFilterChange, rootOptionsWithCount, statusOptions],
  );

  return (
    <GenericToolbar
      selectedCount={0}
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      onClearSelection={() => {}}
      searchPlaceholder={txt('customerPrice.matrix.searchPlaceholder')}
      filters={filtersSlot}
      filterGroups={filterGroups}
      activeFilterCount={activeFilterCount}
      onClearAllFilters={onClearAllFilters}
      showBack
    />
  );
};

export default CustomerPriceMatrixToolbar;
