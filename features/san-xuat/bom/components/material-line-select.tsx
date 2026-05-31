import React, { useMemo } from 'react';
import { FlaskConical } from 'lucide-react';
import Combobox from '@/components/ui/Combobox';
import type { MaterialCatalogItem } from '@/features/san-xuat/danh-sach-nguyen-lieu/core/types';

interface Props {
  materials: MaterialCatalogItem[];
  excludeIds?: string[];
  value: string;
  onChange: (value: string) => void;
  onMaterialPick?: (material: MaterialCatalogItem) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

const MaterialLineSelect: React.FC<Props> = ({
  materials,
  excludeIds = [],
  value,
  onChange,
  onMaterialPick,
  label,
  placeholder,
  error,
  disabled,
}) => {
  const exclude = useMemo(() => new Set(excludeIds), [excludeIds]);

  const options = useMemo(
    () =>
      materials
        .filter((m) => m.trang_thai === 'Đang hoạt động')
        .filter((m) => m.id === value || !exclude.has(m.id))
        .sort((a, b) => a.ten_nguyen_lieu.localeCompare(b.ten_nguyen_lieu, 'vi'))
        .map((m) => ({
          value: m.id,
          label: m.ten_nguyen_lieu,
          subLabel: m.ma_nguyen_lieu,
        })),
    [materials, exclude, value],
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
      icon={FlaskConical}
      options={options}
      value={value}
      onChange={handleChange}
      error={error}
      disabled={disabled}
      searchable
      clearable={false}
      dropdownInPortal
      placeholder={placeholder}
    />
  );
};

export default MaterialLineSelect;
