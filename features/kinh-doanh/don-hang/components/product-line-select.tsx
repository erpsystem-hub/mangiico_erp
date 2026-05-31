import React from 'react';
import ProductSelect from '@/features/san-xuat/bom/components/product-select';
import type { ProductCatalogItem } from '@/features/san-xuat/danh-sach-hang-hoa/core/types';

interface Props {
  products: ProductCatalogItem[];
  value: string;
  onChange: (value: string) => void;
  onProductPick?: (product: ProductCatalogItem) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

/** Chọn SP cho dòng đơn hàng — chỉ SP đang hoạt động (logic trong ProductSelect). */
const ProductLineSelect: React.FC<Props> = ({
  products,
  value,
  onChange,
  onProductPick,
  placeholder,
  error,
  disabled,
}) => (
  <ProductSelect
    products={products}
    value={value}
    onChange={onChange}
    onProductPick={onProductPick}
    placeholder={placeholder}
    error={error}
    disabled={disabled}
  />
);

export default ProductLineSelect;
