import React, { useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { txt } from '@/lib/text';
import EmptyState from '@/components/shared/EmptyState';
import ErrorState from '@/components/shared/ErrorState';
import ListPageSkeleton from '@/components/shared/ListPageSkeleton';
import Button from '@/components/ui/Button';
import type { PartnerCategory } from '../../core/types';
import {
  filterPartnerCategoriesForMatrix,
  type MatrixPartnerCategoryFilters,
} from '../utils/matrix-partner-category-filter';
import type { CustomerPriceMatrix, ProductGroupColumn } from '../services/kh-he-so-gia-service';
import {
  getHeSoFromMatrix,
  parseHeSoGiaInput,
  shouldPersistHeSoGia,
} from '../services/kh-he-so-gia-service';
import { DEFAULT_HE_SO_GIA } from '../core/constants';
import CustomerPriceMatrixTable from './customer-price-matrix-table';
import CustomerPriceMatrixToolbar from './customer-price-matrix-toolbar';

interface Props {
  categories: PartnerCategory[];
  productGroups: ProductGroupColumn[];
  priceMatrix: CustomerPriceMatrix | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  canEdit: boolean;
  onSave: (danhMucId: string, nhomSpId: string, heSoGia: number | null) => void;
  pendingKey?: string | null;
}

function displayRawFromMatrix(matrix: CustomerPriceMatrix, dmId: string, nhomId: string): string {
  const heSo = getHeSoFromMatrix(matrix, dmId, nhomId);
  if (Math.abs(heSo - DEFAULT_HE_SO_GIA) < 0.00005) return '';
  return String(heSo);
}

const CustomerPriceMatrixPanel: React.FC<Props> = ({
  categories,
  productGroups,
  priceMatrix,
  isLoading,
  isError,
  onRetry,
  canEdit,
  onSave,
  pendingKey,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [matrixFilters, setMatrixFilters] = useState<MatrixPartnerCategoryFilters>({
    status: [],
    id_danh_muc_goc: [],
  });

  const setMatrixFilter = useCallback(
    <K extends keyof MatrixPartnerCategoryFilters>(key: K, value: MatrixPartnerCategoryFilters[K]) => {
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
    () => filterPartnerCategoriesForMatrix(categories, searchTerm, matrixFilters),
    [categories, searchTerm, matrixFilters],
  );

  const matrix = priceMatrix ?? new Map();

  const handleCommitCell = useCallback(
    (danhMucId: string, nhomSpId: string, raw: string) => {
      const trimmed = raw.trim();
      if (trimmed) {
        const parsed = parseHeSoGiaInput(trimmed);
        if (parsed == null) {
          toast.error(txt('customerPrice.matrix.invalidValue'));
          return;
        }
        const prevRaw = displayRawFromMatrix(matrix, danhMucId, nhomSpId);
        const prevParsed = prevRaw ? parseHeSoGiaInput(prevRaw) : null;
        const nextPersist = shouldPersistHeSoGia(parsed) ? parsed : null;
        const prevPersist = prevParsed != null && shouldPersistHeSoGia(prevParsed) ? prevParsed : null;
        if (nextPersist === prevPersist) return;
        onSave(danhMucId, nhomSpId, nextPersist);
        return;
      }
      const prevRaw = displayRawFromMatrix(matrix, danhMucId, nhomSpId);
      if (!prevRaw) return;
      onSave(danhMucId, nhomSpId, null);
    },
    [matrix, onSave],
  );

  const renderBody = () => {
    if (isLoading) {
      return (
        <ListPageSkeleton
          loadingText={txt('customerPrice.loading')}
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
          title={txt('customerPrice.matrix.loadErrorTitle')}
          message={txt('customerPrice.matrix.loadErrorHint')}
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
            title={txt('customerPrice.matrix.emptyCategories')}
            description={txt('customerPrice.matrix.emptyCategoriesHint')}
          />
        </div>
      );
    }

    if (productGroups.length === 0) {
      return (
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-6 gap-4">
          <EmptyState
            title={txt('customerPrice.matrix.emptyProductGroups')}
            description={txt('customerPrice.matrix.emptyProductGroupsHint')}
          />
          <Link to="/san-xuat/danh-muc-hang-hoa">
            <Button variant="outline" size="sm" type="button">
              {txt('customerPrice.matrix.openProductCategories')}
            </Button>
          </Link>
        </div>
      );
    }

    if (filteredCategories.length === 0) {
      return (
        <div className="flex-1 min-h-0 flex items-center justify-center p-6">
          <EmptyState
            title={txt('partnerCategory.empty')}
            description={txt('common.noResults')}
          />
        </div>
      );
    }

    return (
      <CustomerPriceMatrixTable
        categoriesForRows={filteredCategories}
        columns={productGroups}
        priceMatrix={matrix}
        canEdit={canEdit}
        onCommitCell={handleCommitCell}
        pendingKey={pendingKey}
      />
    );
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col mt-1.5 rounded-xl border border-border bg-card shadow-sm overflow-hidden relative z-0">
      <CustomerPriceMatrixToolbar
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

export default CustomerPriceMatrixPanel;
