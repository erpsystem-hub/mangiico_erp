import React, { useMemo } from 'react';
import { Package } from 'lucide-react';
import Combobox from '@/components/ui/Combobox';
import type { MaterialCatalogItem } from '@/features/san-xuat/danh-sach-nguyen-lieu/core/types';

interface Props {
  materials: MaterialCatalogItem[];
  value: string;
  onChange: (value: string) => void;
  onMaterialPick?: (material: MaterialCatalogItem) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  compact?: boolean;
}

const MaterialSelect: React.FC<Props> = ({
  materials,
  value,
  onChange,
  onMaterialPick,
  label,
  placeholder,
  error,
  required,
  disabled,
  compact = false,
}) => {
  const options = useMemo(
    () =>
      materials
        .filter((m) => m.trang_thai === 'Đang hoạt động' || m.id === value)
        .sort((a, b) => a.ten_nguyen_lieu.localeCompare(b.ten_nguyen_lieu, 'vi'))
        .map((m) => ({
          value: m.id,
          label: m.ten_nguyen_lieu,
          subLabel: m.ma_nguyen_lieu,
        })),
    [materials, value],
  );

  const handleChange = (v: string | number | null) => {
    const s = String(v ?? '');
    onChange(s);
    const picked = materials.find((m) => m.id === s);
    if (picked) onMaterialPick?.(picked);
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
      triggerClassName={compact ? 'h-9 min-h-9 text-sm' : undefined}
      className={compact ? 'space-y-0' : undefined}
    />
  );
};

export default MaterialSelect;
