import React, { useMemo, useState, useCallback } from 'react';
import { txt } from '@/lib/text';
import EmptyState from '@/components/shared/EmptyState';
import ErrorState from '@/components/shared/ErrorState';
import ListPageSkeleton from '@/components/shared/ListPageSkeleton';
import type { ProductCategory } from '../core/types';
import {
  filterCategoriesForMatrix,
  type MatrixCategoryFilters,
} from '../utils/matrix-category-filter';
import type { ProductAttribute } from '@/features/san-xuat/thuoc-tinh-hang-hoa/core/types';
import type { MeasurementSpec } from '@/features/san-xuat/thong-so-do/core/types';
import type { CategoryLinkMatrix } from '../services/danh-muc-hang-hoa-links-service';
import CategoryLinkMatrixTable, {
  type CategoryLinkMatrixMode,
  type MatrixMasterColumn,
} from './category-link-matrix';
import CategoryLinkMatrixToolbar from './category-link-matrix-toolbar';

interface Props {
  mode: CategoryLinkMatrixMode;
  categories: ProductCategory[];
  attributes?: ProductAttribute[];
  measurements?: MeasurementSpec[];
  linkMatrix: CategoryLinkMatrix | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  canEdit: boolean;
  onToggle: (danhMucId: string, masterId: string, linked: boolean) => void;
  pendingKey?: string | null;
}

const CategoryLinkMatrixPanel: React.FC<Props> = ({
  mode,
  categories,
  attributes = [],
  measurements = [],
  linkMatrix,
  isLoading,
  isError,
  onRetry,
  canEdit,
  onToggle,
  pendingKey,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [matrixFilters, setMatrixFilters] = useState<MatrixCategoryFilters>({
    status: [],
    id_danh_muc_goc: [],
  });

  const setMatrixFilter = useCallback(
    <K extends keyof MatrixCategoryFilters>(key: K, value: MatrixCategoryFilters[K]) => {
      setMatrixFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (searchTerm.trim()) n += 1;
    if (matrixFilters.status.length > 0) n += 1;
    if (matrixFilters.id_danh_muc_goc.length > 0) n += 1;
    return n;
  }, [searchTerm, matrixFilters.status.length, matrixFilters.id_danh_muc_goc.length]);

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setMatrixFilters({ status: [], id_danh_muc_goc: [] });
  };

  const filteredCategories = useMemo(
    () => filterCategoriesForMatrix(categories, searchTerm, matrixFilters),
    [categories, searchTerm, matrixFilters],
  );

  const masterColumns: MatrixMasterColumn[] = useMemo(() => {
    if (mode === 'attribute') {
      return attributes
        .filter((a) => a.trang_thai === 'Đang hoạt động')
        .sort((a, b) => (a.thu_tu ?? 0) - (b.thu_tu ?? 0) || a.ten_hien_thi.localeCompare(b.ten_hien_thi, 'vi'))
        .map((a) => ({ id: a.id, ten_hien_thi: a.ten_hien_thi }));
    }
    return measurements
      .filter((m) => m.trang_thai === 'Đang hoạt động')
      .sort((a, b) => (a.thu_tu ?? 0) - (b.thu_tu ?? 0) || a.ten_hien_thi.localeCompare(b.ten_hien_thi, 'vi'))
      .map((m) => ({ id: m.id, ten_hien_thi: m.ten_hien_thi, don_vi: m.don_vi }));
  }, [mode, attributes, measurements]);

  const emptyMaster =
    mode === 'attribute'
      ? {
          title: txt('productCategory.matrix.emptyAttributes'),
          hint: txt('productCategory.matrix.emptyAttributesHint'),
        }
      : {
          title: txt('productCategory.matrix.emptyMeasurements'),
          hint: txt('productCategory.matrix.emptyMeasurementsHint'),
        };

  const matrix = linkMatrix ?? new Map();

  const renderBody = () => {
    if (isLoading) {
      return (
        <ListPageSkeleton
          loadingText={txt('productCategory.loading')}
          tableColumns={5}
          tableRowCount={6}
          tableColumnWithSubline={0}
          cardCount={0}
        />
      );
    }

    if (isError) {
      return (
        <ErrorState
          title={txt('productCategory.matrix.loadErrorTitle')}
          message={txt('productCategory.matrix.loadErrorHint')}
          onRetry={onRetry}
          primaryButtons
          className="m-4 border-0 shadow-none"
        />
      );
    }

    if (categories.length === 0) {
      return (
        <div className="flex-1 min-h-0 flex items-center justify-center p-6">
          <EmptyState
            title={txt('productCategory.matrix.emptyCategories')}
            description={txt('productCategory.matrix.emptyCategoriesHint')}
          />
        </div>
      );
    }

    if (masterColumns.length === 0) {
      return (
        <div className="flex-1 min-h-0 flex items-center justify-center p-6">
          <EmptyState title={emptyMaster.title} description={emptyMaster.hint} />
        </div>
      );
    }

    if (filteredCategories.length === 0) {
      return (
        <div className="flex-1 min-h-0 flex items-center justify-center p-6">
          <EmptyState
            title={txt('productCategory.empty')}
            description={txt('common.noResults')}
          />
        </div>
      );
    }

    return (
      <CategoryLinkMatrixTable
        categoriesForRows={filteredCategories}
        columns={masterColumns}
        linkMatrix={matrix}
        canEdit={canEdit}
        onToggle={onToggle}
        pendingKey={pendingKey}
      />
    );
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col mt-1.5 rounded-xl border border-border bg-card shadow-sm overflow-hidden relative z-0">
      <CategoryLinkMatrixToolbar
        categories={categories}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={matrixFilters}
        onFilterChange={setMatrixFilter}
        activeFilterCount={activeFilterCount}
        onClearAllFilters={handleClearAllFilters}
      />
      <div className="flex-1 min-h-0 flex flex-col">{renderBody()}</div>
    </div>
  );
};

export default CategoryLinkMatrixPanel;
