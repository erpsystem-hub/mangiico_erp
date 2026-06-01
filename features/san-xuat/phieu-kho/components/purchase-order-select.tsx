import React, { useMemo } from 'react';
import { Package } from 'lucide-react';
import Combobox from '@/components/ui/Combobox';
import type { PurchaseOrder } from '@/features/kinh-doanh/mua-nguyen-lieu/core/types';

interface Props {
  orders: PurchaseOrder[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

const PurchaseOrderSelect: React.FC<Props> = ({
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
          label: o.ma_don_mua,
          subLabel: o.ten_nha_cung_cap,
        })),
    [orders],
  );

  const handleChange = (v: string | number | null) => {
    onChange(String(v ?? ''));
  };

  return (
    <Combobox
      label={label}
      icon={Package}
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

export default PurchaseOrderSelect;
