import React from 'react';
import CategoryLevel2GroupedSelect from '@/features/san-xuat/danh-muc-hang-hoa/components/category-level2-grouped-select';
import type { ProductCategory } from '@/features/san-xuat/danh-muc-hang-hoa/core/types';

interface Props {
  categories: ProductCategory[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  compact?: boolean;
}

/** Chọn loại hàng (danh mục cấp 2) cho dòng đơn hàng. */
const CategoryLineSelect: React.FC<Props> = (props) => (
  <CategoryLevel2GroupedSelect {...props} />
);

export default CategoryLineSelect;
