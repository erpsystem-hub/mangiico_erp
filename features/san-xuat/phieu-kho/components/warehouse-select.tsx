import React, { useMemo } from 'react';
import { Warehouse } from 'lucide-react';
import Combobox from '@/components/ui/Combobox';
import type { WarehouseItem } from '../core/types';

interface Props {
  warehouses: WarehouseItem[];
  value: string;
  onChange: (value: string) => void;
  onWarehousePick?: (warehouse: WarehouseItem) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

const WarehouseSelect: React.FC<Props> = ({
  warehouses,
  value,
  onChange,
  onWarehousePick,
  label,
  placeholder,
  error,
  required,
  disabled,
}) => {
  const options = useMemo(
    () =>
      warehouses
        .filter((w) => w.trang_thai === 'Đang hoạt động' || w.id === value)
        .sort((a, b) => a.ten_kho.localeCompare(b.ten_kho, 'vi'))
        .map((w) => ({
          value: w.id,
          label: w.ten_kho,
          subLabel: w.ma_kho,
        })),
    [warehouses, value],
  );

  const handleChange = (v: string | number | null) => {
    const s = String(v ?? '');
    onChange(s);
    const picked = warehouses.find((w) => w.id === s);
    if (picked) onWarehousePick?.(picked);
  };

  return (
    <Combobox
      label={label}
      icon={Warehouse}
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

export default WarehouseSelect;
