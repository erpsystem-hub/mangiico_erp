import React, { useMemo } from 'react';
import { ClipboardList } from 'lucide-react';
import Combobox from '@/components/ui/Combobox';
import type { ProductionOrderListItem } from '@/features/san-xuat/lenh-san-xuat/core/types';

interface Props {
  orders: ProductionOrderListItem[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

const ProductionOrderSelect: React.FC<Props> = ({
  orders,
  value,
  onChange,
  label,
  placeholder,
  error,
  disabled,
}) => {
  const options = useMemo(
    () =>
      [...orders]
        .sort((a, b) => b.ngay_dat.localeCompare(a.ngay_dat))
        .map((o) => ({
          value: o.id,
          label: o.ma_don_hang,
          subLabel: o.ten_khach_hang,
        })),
    [orders],
  );

  const handleChange = (v: string | number | null) => {
    onChange(String(v ?? ''));
  };

  return (
    <Combobox
      label={label}
      icon={ClipboardList}
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

export default ProductionOrderSelect;
