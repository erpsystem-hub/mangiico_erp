import React from 'react';
import { txt } from '@/lib/text';
import { Ruler } from 'lucide-react';
import NumericFormatInput from '@/components/ui/NumericFormatInput';
import FormSection from '@/components/shared/FormSection';
import FormGrid from '@/components/shared/FormGrid';
import type { CategoryMeasurementLink } from '@/features/san-xuat/danh-muc-hang-hoa/core/types';

interface ValueRow {
  thong_so_do_id: string;
  gia_tri: number | null;
}

interface Props {
  template: CategoryMeasurementLink[];
  values: ValueRow[];
  onChange: (values: ValueRow[]) => void;
  errors?: Record<string, string>;
  readOnly?: boolean;
  /** Dòng đơn: mọi trường template đều bắt buộc */
  allFieldsRequired?: boolean;
}

const OrderLineMeasurementValuesSection: React.FC<Props> = ({
  template,
  values,
  onChange,
  errors = {},
  readOnly = false,
  allFieldsRequired = false,
}) => {
  if (template.length === 0) {
    return (
      <FormSection title={txt('salesOrder.form.measurementsSection')} icon={<Ruler size={14} />}>
        <p className="text-sm text-muted-foreground">{txt('salesOrder.form.measurementsEmpty')}</p>
      </FormSection>
    );
  }

  const valueById = new Map(values.map((v) => [v.thong_so_do_id, v.gia_tri]));

  const setValue = (thongSoDoId: string, giaTri: number | null) => {
    const next = template.map((t) => ({
      thong_so_do_id: t.thong_so_do_id,
      gia_tri: t.thong_so_do_id === thongSoDoId ? giaTri : (valueById.get(t.thong_so_do_id) ?? null),
    }));
    onChange(next);
  };

  return (
    <FormSection title={txt('salesOrder.form.measurementsSection')} icon={<Ruler size={14} />}>
      <FormGrid cols={2}>
        {template.map((t) => (
          <div key={t.thong_so_do_id}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-foreground">{t.ten_hien_thi}</span>
              <span className="text-xs text-muted-foreground">({t.don_vi})</span>
              {t.bat_buoc || allFieldsRequired ? (
                <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded border bg-destructive/10 text-destructive border-destructive/20">
                  {txt('productCategory.detail.requiredBadge')}
                </span>
              ) : null}
            </div>
            {readOnly ? (
              <p className="text-sm text-foreground tabular-nums">
                {valueById.get(t.thong_so_do_id) != null
                  ? `${valueById.get(t.thong_so_do_id)} ${t.don_vi}`
                  : '—'}
              </p>
            ) : (
              <NumericFormatInput
                icon={<Ruler size={12} />}
                value={valueById.get(t.thong_so_do_id) ?? undefined}
                onChange={(n) => setValue(t.thong_so_do_id, Number.isFinite(n) ? n : null)}
                decimalScale={4}
                required={t.bat_buoc || allFieldsRequired}
                error={errors[t.thong_so_do_id]}
              />
            )}
          </div>
        ))}
      </FormGrid>
    </FormSection>
  );
};

export default OrderLineMeasurementValuesSection;
