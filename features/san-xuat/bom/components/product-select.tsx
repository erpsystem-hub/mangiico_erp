import React, { useMemo } from 'react';
import { Package } from 'lucide-react';
import Combobox from '@/components/ui/Combobox';
import type { ProductCatalogItem } from '@/features/san-xuat/danh-sach-hang-hoa/core/types';

interface Props {
  products: ProductCatalogItem[];
  value: string;
  onChange: (value: string) => void;
  onProductPick?: (product: ProductCatalogItem) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

const ProductSelect: React.FC<Props> = ({
  products,
  value,
  onChange,
  onProductPick,
  label,
  placeholder,
  error,
  required,
  disabled,
}) => {
  const options = useMemo(
    () =>
      products
        .filter((p) => p.trang_thai === 'Đang hoạt động' || p.id === value)
        .sort((a, b) => a.ten_san_pham.localeCompare(b.ten_san_pham, 'vi'))
        .map((p) => ({
          value: p.id,
          label: p.ten_san_pham,
          subLabel: p.ma_san_pham,
        })),
    [products, value],
  );

  const handleChange = (v: string | number | null) => {
    const s = String(v ?? '');
    onChange(s);
    const picked = products.find((p) => p.id === s);
    if (picked) onProductPick?.(picked);
  };

  return (
    <Combobox
      label={label}
      icon={Package}
      required={required}
      options={options}
      value={value}
      onChange={handleChange}
      error={error}
      disabled={disabled}
      searchable
      clearable={!disabled}
      dropdownInPortal
      placeholder={placeholder}
    />
  );
};

export default ProductSelect;
