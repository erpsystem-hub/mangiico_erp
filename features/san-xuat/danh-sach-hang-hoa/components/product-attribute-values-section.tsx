import React from 'react';
import { txt } from '@/lib/text';
import { SlidersHorizontal } from 'lucide-react';
import Input from '@/components/ui/Input';
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
}

const ProductAttributeValuesSection: React.FC<Props> = ({
  template,
  values,
  onChange,
  errors = {},
  readOnly = false,
}) => {
  if (template.length === 0) {
    return (
      <FormSection title={txt('productCatalog.form.attributesSection')} icon={<SlidersHorizontal size={14} />}>
        <p className="text-sm text-muted-foreground">{txt('productCatalog.form.attributesEmpty')}</p>
      </FormSection>
    );
  }

  const valueById = new Map(values.map((v) => [v.thuoc_tinh_id, v.gia_tri]));

  const setValue = (thuocTinhId: string, giaTri: string) => {
    const next = template.map((t) => ({
      thuoc_tinh_id: t.thuoc_tinh_id,
      gia_tri: t.thuoc_tinh_id === thuocTinhId ? giaTri : (valueById.get(t.thuoc_tinh_id) ?? ''),
    }));
    onChange(next);
  };

  return (
    <FormSection title={txt('productCatalog.form.attributesSection')} icon={<SlidersHorizontal size={14} />}>
      <FormGrid cols={2}>
        {template.map((t) => (
          <div key={t.thuoc_tinh_id}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-foreground">{t.ten_hien_thi}</span>
              {t.bat_buoc ? (
                <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded border bg-destructive/10 text-destructive border-destructive/20">
                  {txt('productCategory.detail.requiredBadge')}
                </span>
              ) : null}
            </div>
            {readOnly ? (
              <p className="text-sm text-foreground">{valueById.get(t.thuoc_tinh_id) || '—'}</p>
            ) : (
              <Input
                value={valueById.get(t.thuoc_tinh_id) ?? ''}
                onChange={(e) => setValue(t.thuoc_tinh_id, e.target.value)}
                required={t.bat_buoc}
                error={errors[t.thuoc_tinh_id]}
              />
            )}
          </div>
        ))}
      </FormGrid>
    </FormSection>
  );
};

export default ProductAttributeValuesSection;
