import React, { useMemo } from 'react';
import { Users } from 'lucide-react';
import Combobox from '@/components/ui/Combobox';
import type { PartnerListItem } from '@/features/kinh-doanh/doi-tac/core/types';

interface Props {
  customers: PartnerListItem[];
  value: string;
  onChange: (value: string) => void;
  onCustomerPick?: (customer: PartnerListItem) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

const CustomerSelect: React.FC<Props> = ({
  customers,
  value,
  onChange,
  onCustomerPick,
  label,
  placeholder,
  error,
  required,
  disabled,
}) => {
  const options = useMemo(
    () =>
      customers
        .filter((c) => c.trang_thai === 'Đang hoạt động' || c.id === value)
        .sort((a, b) => a.ten_doi_tac.localeCompare(b.ten_doi_tac, 'vi'))
        .map((c) => ({
          value: c.id,
          label: c.ten_doi_tac,
          subLabel: c.ma_doi_tac,
        })),
    [customers, value],
  );

  const handleChange = (v: string | number | null) => {
    const s = String(v ?? '');
    onChange(s);
    const picked = customers.find((c) => c.id === s);
    if (picked) onCustomerPick?.(picked);
  };

  return (
    <Combobox
      label={label}
      icon={Users}
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

export default CustomerSelect;
