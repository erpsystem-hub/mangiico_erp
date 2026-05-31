import React from 'react';
import MaterialSelect from './material-select';
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

const MaterialLineSelect: React.FC<Props> = ({
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
}) => (
  <MaterialSelect
    materials={materials}
    value={value}
    onChange={onChange}
    onMaterialPick={onMaterialPick}
    label={label}
    placeholder={placeholder}
    error={error}
    required={required}
    disabled={disabled}
    compact={compact}
  />
);

export default MaterialLineSelect;
