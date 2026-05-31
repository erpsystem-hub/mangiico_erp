import React, { useState } from 'react';
import { useCan } from '@/hooks/use-can';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';
import { usePartnerCategories } from '../hooks/use-doi-tac-category';
import {
  useCustomerPriceMatrix,
  useProductGroupColumns,
  useSaveCustomerPriceRatio,
} from './hooks/use-customer-price-matrix';
import CustomerPriceMatrixPanel from './components/customer-price-matrix-panel';

const CustomerPriceMatrixTab: React.FC = () => {
  const canView = useCan('view', 'customerList');
  const canEdit = useCan('edit', 'customerList');
  const canViewProductGroups = useCan('view', 'productCategories');
  useResourcePermissions('customerList');
  useResourcePermissions('productCategories');

  const priceTabActive = canView;

  const { data: categories = [], isLoading: catLoading, isError: catError, refetch: refetchCat } =
    usePartnerCategories('khach_hang', { enabled: priceTabActive });

  const {
    data: productGroups = [],
    isLoading: groupsLoading,
    isError: groupsError,
    refetch: refetchGroups,
  } = useProductGroupColumns({ enabled: priceTabActive && canViewProductGroups });

  const {
    data: priceMatrix,
    isLoading: matrixLoading,
    isError: matrixError,
    refetch: refetchMatrix,
  } = useCustomerPriceMatrix({ enabled: priceTabActive });

  const saveMutation = useSaveCustomerPriceRatio();
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const isLoading = catLoading || (canViewProductGroups && groupsLoading) || matrixLoading;
  const isError = catError || (canViewProductGroups && groupsError) || matrixError;

  const handleRetry = () => {
    void refetchCat();
    if (canViewProductGroups) void refetchGroups();
    void refetchMatrix();
  };

  const handleSave = (danhMucId: string, nhomSpId: string, heSoGia: number | null) => {
    const key = `${danhMucId}:${nhomSpId}`;
    setPendingKey(key);
    saveMutation.mutate(
      { danhMucKhachHangId: danhMucId, nhomSanPhamId: nhomSpId, heSoGia },
      { onSettled: () => setPendingKey(null) },
    );
  };

  return (
    <CustomerPriceMatrixPanel
      categories={categories}
      productGroups={canViewProductGroups ? productGroups : []}
      priceMatrix={priceMatrix}
      isLoading={isLoading}
      isError={isError}
      onRetry={handleRetry}
      canEdit={canEdit}
      onSave={handleSave}
      pendingKey={pendingKey}
    />
  );
};

export default CustomerPriceMatrixTab;
