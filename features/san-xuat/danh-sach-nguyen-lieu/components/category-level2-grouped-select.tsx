import React, { useMemo } from 'react';
import { FolderTree } from 'lucide-react';
import Combobox, { type Option } from '@/components/ui/Combobox';
import type { MaterialCategory } from '@/features/san-xuat/danh-muc-nguyen-lieu/core/types';

const HEADER_PREFIX = '__group__';

interface Props {
  categories: MaterialCategory[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

const CategoryLevel2GroupedSelect: React.FC<Props> = ({
  categories,
  value,
  onChange,
  label,
  placeholder,
  error,
  required,
  disabled,
}) => {
  const { options, selectableValues } = useMemo(() => {
    const roots = categories
      .filter((c) => c.cap_do === 1 && c.trang_thai === 'Đang hoạt động')
      .sort((a, b) => a.thu_tu - b.thu_tu || a.ten_danh_muc.localeCompare(b.ten_danh_muc, 'vi'));

    const childrenByParent = new Map<string, MaterialCategory[]>();
    categories
      .filter((c) => c.cap_do === 2 && c.trang_thai === 'Đang hoạt động' && c.cha_id)
      .forEach((c) => {
        const pid = c.cha_id!;
        const list = childrenByParent.get(pid) ?? [];
        list.push(c);
        childrenByParent.set(pid, list);
      });
    for (const list of childrenByParent.values()) {
      list.sort((a, b) => a.thu_tu - b.thu_tu || a.ten_danh_muc.localeCompare(b.ten_danh_muc, 'vi'));
    }

    const opts: Option[] = [];
    const selectable = new Set<string>();

    for (const root of roots) {
      const children = childrenByParent.get(root.id) ?? [];
      if (children.length === 0) continue;

      opts.push({
        value: `${HEADER_PREFIX}${root.id}`,
        label: root.ten_danh_muc,
      });

      for (const child of children) {
        selectable.add(child.id);
        opts.push({
          value: child.id,
          label: child.ten_danh_muc,
          subLabel: child.ma_danh_muc ?? undefined,
        });
      }
    }

    return { options: opts, selectableValues: selectable };
  }, [categories]);

  const handleChange = (v: string | number | null) => {
    const s = String(v ?? '');
    if (!s || s.startsWith(HEADER_PREFIX)) return;
    if (!selectableValues.has(s)) return;
    onChange(s);
  };

  return (
    <Combobox
      label={label}
      icon={FolderTree}
      required={required}
      options={options}
      value={value}
      onChange={handleChange}
      error={error}
      disabled={disabled}
      searchable={options.length > 8}
      clearable={false}
      dropdownInPortal
      placeholder={placeholder}
      renderOption={(option) => {
        const isHeader = String(option.value).startsWith(HEADER_PREFIX);
        if (isHeader) {
          return (
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pointer-events-none">
              {option.label}
            </span>
          );
        }
        return (
          <div className="flex flex-col min-w-0">
            <span>{option.label}</span>
            {option.subLabel ? (
              <span className="text-xs text-muted-foreground font-mono">{option.subLabel}</span>
            ) : null}
          </div>
        );
      }}
    />
  );
};

export default CategoryLevel2GroupedSelect;
