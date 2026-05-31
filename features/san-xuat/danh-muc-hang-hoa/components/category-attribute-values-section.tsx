import React, { useMemo } from 'react';
import { txt } from '@/lib/text';
import { List, SlidersHorizontal } from 'lucide-react';
import Combobox from '@/components/ui/Combobox';
import FormSection from '@/components/shared/FormSection';
import FormGrid from '@/components/shared/FormGrid';
import type { CategoryAttributeLink } from '@/features/san-xuat/danh-muc-hang-hoa/core/types';

interface ValueRow {
  thuoc_tinh_id: string;
  gia_tri: string;
}

interface Props {
  template: CategoryAttributeLink[];
  values: ValueRow[];
  onChange: (values: ValueRow[]) => void;
  errors?: Record<string, string>;
  readOnly?: boolean;
  /** Dòng đơn: mọi trường template đều bắt buộc */
  allFieldsRequired?: boolean;
}

function buildValueOptions(preset: string[], current: string) {
  const seen = new Set<string>();
  const options: { value: string; label: string }[] = [];
  for (const v of preset) {
    const t = v.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    options.push({ value: t, label: t });
  }
  const cur = current.trim();
  if (cur && !seen.has(cur)) {
    options.push({ value: cur, label: cur });
  }
  return options;
}

const CategoryAttributeValuesSection: React.FC<Props> = ({
  template,
  values,
  onChange,
  errors = {},
  readOnly = false,
  allFieldsRequired = false,
}) => {
  if (template.length === 0) {
    return (
      <FormSection title={txt('productCategory.form.attributesSection')} icon={<SlidersHorizontal size={14} />}>
        <p className="text-sm text-muted-foreground">{txt('productCategory.form.attributesEmpty')}</p>
      </FormSection>
    );
  }

  const valueById = useMemo(() => new Map(values.map((v) => [v.thuoc_tinh_id, v.gia_tri])), [values]);

  const setValue = (thuocTinhId: string, giaTri: string) => {
    const next = template.map((t) => ({
      thuoc_tinh_id: t.thuoc_tinh_id,
      gia_tri: t.thuoc_tinh_id === thuocTinhId ? giaTri : (valueById.get(t.thuoc_tinh_id) ?? ''),
    }));
    onChange(next);
  };

  return (
    <FormSection title={txt('productCategory.form.attributesSection')} icon={<SlidersHorizontal size={14} />}>
      <FormGrid cols={2}>
        {template.map((t) => {
          const current = valueById.get(t.thuoc_tinh_id) ?? '';
          const options = buildValueOptions(t.cac_gia_tri ?? [], current);
          return (
            <div key={t.thuoc_tinh_id}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-foreground">{t.ten_hien_thi}</span>
                {t.bat_buoc || allFieldsRequired ? (
                  <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded border bg-destructive/10 text-destructive border-destructive/20">
                    {txt('productCategory.detail.requiredBadge')}
                  </span>
                ) : null}
              </div>
              {readOnly ? (
                <p className="text-sm text-foreground">{current || '—'}</p>
              ) : (
                <Combobox
                  icon={List}
                  options={options}
                  value={current}
                  onChange={(v) => setValue(t.thuoc_tinh_id, String(v ?? '').trim())}
                  placeholder={txt('productCategory.form.attributeValuePlaceholder')}
                  searchPlaceholder={txt('productCategory.form.attributeValueSearch')}
                  searchable
                  creatable
                  creatableActionLabel={(s) =>
                    txt('productCategory.form.attributeValueCreate', { value: s })
                  }
                  clearable
                  dropdownInPortal
                  required={t.bat_buoc || allFieldsRequired}
                  error={errors[t.thuoc_tinh_id]}
                />
              )}
            </div>
          );
        })}
      </FormGrid>
    </FormSection>
  );
};

export default CategoryAttributeValuesSection;
