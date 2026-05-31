import React, { useMemo } from 'react';
import { Truck } from 'lucide-react';
import Combobox from '@/components/ui/Combobox';
import type { PartnerListItem } from '@/features/kinh-doanh/doi-tac/core/types';

interface Props {
  suppliers: PartnerListItem[];
  value: string;
  onChange: (value: string) => void;
  onSupplierPick?: (supplier: PartnerListItem) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

const SupplierSelect: React.FC<Props> = ({
  suppliers,
  value,
  onChange,
  onSupplierPick,
  label,
  placeholder,
  error,
  required,
  disabled,
}) => {
  const options = useMemo(
    () =>
      suppliers
        .filter((c) => c.trang_thai === 'Đang hoạt động' || c.id === value)
        .sort((a, b) => a.ten_doi_tac.localeCompare(b.ten_doi_tac, 'vi'))
        .map((c) => ({
          value: c.id,
          label: c.ten_doi_tac,
          subLabel: c.ma_doi_tac,
        })),
    [suppliers, value],
  );

  const handleChange = (v: string | number | null) => {
    const s = String(v ?? '');
    onChange(s);
    const picked = suppliers.find((c) => c.id === s);
    if (picked) onSupplierPick?.(picked);
  };

  return (
    <Combobox
      label={label}
      icon={Truck}
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

export default SupplierSelect;
