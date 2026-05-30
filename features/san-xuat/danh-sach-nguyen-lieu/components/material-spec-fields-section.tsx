import React, { useMemo } from 'react';
import { txt } from '@/lib/text';
import { Palette, Ruler, Globe, Layers, Scale, Shirt } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Combobox, { type Option } from '@/components/ui/Combobox';
import FormSection from '@/components/shared/FormSection';
import FormGrid from '@/components/shared/FormGrid';
import DetailSection from '@/components/shared/DetailSection';
import DetailField from '@/components/shared/DetailField';
import DetailFieldGrid from '@/components/shared/DetailFieldGrid';
import type { MaterialCatalogItem } from '../core/types';
import type { Control, FieldErrors } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import type { MaterialCatalogFormValues } from '../core/schema';
import {
  buildMaterialSpecComboboxOptions,
  type MaterialSpecComboboxOptions,
} from '../utils/material-spec-options';

interface FormProps {
  control: Control<MaterialCatalogFormValues>;
  errors: FieldErrors<MaterialCatalogFormValues>;
  specOptions: MaterialSpecComboboxOptions;
}

interface SpecComboboxFieldProps {
  name: keyof Pick<
    MaterialCatalogFormValues,
    'don_vi_tinh' | 'mau_sac' | 'thanh_phan' | 'kho_vai' | 'xuat_xu'
  >;
  control: Control<MaterialCatalogFormValues>;
  options: Option[];
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  creatableLabel: (value: string) => string;
  icon: LucideIcon;
  error?: string;
}

const SpecComboboxField: React.FC<SpecComboboxFieldProps> = ({
  name,
  control,
  options,
  label,
  placeholder,
  searchPlaceholder,
  creatableLabel,
  icon,
  error,
}) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <Combobox
        label={label}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        options={options}
        value={field.value ?? ''}
        onChange={(v) => field.onChange(String(v).trim())}
        icon={icon}
        searchable
        creatable
        creatableActionLabel={creatableLabel}
        clearable
        dropdownInPortal
        error={error}
      />
    )}
  />
);

export const MaterialSpecFieldsFormSection: React.FC<FormProps> = ({
  control,
  errors,
  specOptions,
}) => (
  <FormSection title={txt('materialCatalog.form.specSection')} icon={<Shirt size={14} />}>
    <FormGrid cols={2}>
      <SpecComboboxField
        name="don_vi_tinh"
        control={control}
        options={specOptions.unitOptions}
        label={txt('materialCatalog.form.unit')}
        placeholder={txt('materialCatalog.form.unitPlaceholder')}
        searchPlaceholder={txt('materialCatalog.form.unitSearch')}
        creatableLabel={(s) => txt('materialCatalog.form.unitCreate', { value: s })}
        icon={Scale}
        error={errors.don_vi_tinh?.message}
      />
      <SpecComboboxField
        name="mau_sac"
        control={control}
        options={specOptions.colorOptions}
        label={txt('materialCatalog.form.color')}
        placeholder={txt('materialCatalog.form.colorPlaceholder')}
        searchPlaceholder={txt('materialCatalog.form.colorSearch')}
        creatableLabel={(s) => txt('materialCatalog.form.colorCreate', { value: s })}
        icon={Palette}
        error={errors.mau_sac?.message}
      />
      <SpecComboboxField
        name="thanh_phan"
        control={control}
        options={specOptions.compositionOptions}
        label={txt('materialCatalog.form.composition')}
        placeholder={txt('materialCatalog.form.compositionPlaceholder')}
        searchPlaceholder={txt('materialCatalog.form.compositionSearch')}
        creatableLabel={(s) => txt('materialCatalog.form.compositionCreate', { value: s })}
        icon={Layers}
        error={errors.thanh_phan?.message}
      />
      <SpecComboboxField
        name="kho_vai"
        control={control}
        options={specOptions.widthOptions}
        label={txt('materialCatalog.form.width')}
        placeholder={txt('materialCatalog.form.widthPlaceholder')}
        searchPlaceholder={txt('materialCatalog.form.widthSearch')}
        creatableLabel={(s) => txt('materialCatalog.form.widthCreate', { value: s })}
        icon={Ruler}
        error={errors.kho_vai?.message}
      />
      <Controller
        name="dinh_luong_gsm"
        control={control}
        render={({ field }) => {
          const display =
            field.value == null || Number.isNaN(field.value as number) ? '' : String(field.value);
          return (
            <Combobox
              label={txt('materialCatalog.form.gsm')}
              placeholder={txt('materialCatalog.form.gsmPlaceholder')}
              searchPlaceholder={txt('materialCatalog.form.gsmSearch')}
              options={specOptions.gsmOptions}
              value={display}
              onChange={(v) => {
                const s = String(v).trim();
                if (!s) {
                  field.onChange(null);
                  return;
                }
                const n = Number(s.replace(',', '.'));
                field.onChange(Number.isFinite(n) ? n : NaN);
              }}
              icon={Scale}
              searchable
              creatable
              creatableActionLabel={(s) => txt('materialCatalog.form.gsmCreate', { value: s })}
              clearable
              dropdownInPortal
              error={errors.dinh_luong_gsm?.message}
            />
          );
        }}
      />
      <SpecComboboxField
        name="xuat_xu"
        control={control}
        options={specOptions.originOptions}
        label={txt('materialCatalog.form.origin')}
        placeholder={txt('materialCatalog.form.originPlaceholder')}
        searchPlaceholder={txt('materialCatalog.form.originSearch')}
        creatableLabel={(s) => txt('materialCatalog.form.originCreate', { value: s })}
        icon={Globe}
        error={errors.xuat_xu?.message}
      />
    </FormGrid>
  </FormSection>
);

interface DetailProps {
  data: MaterialCatalogItem;
}

export const MaterialSpecFieldsDetailSection: React.FC<DetailProps> = ({ data }) => (
  <DetailSection title={txt('materialCatalog.detail.specSection')} icon={<Shirt size={14} />}>
    <DetailFieldGrid>
      <DetailField label={txt('materialCatalog.form.unit')} value={data.don_vi_tinh || '—'} icon={Scale} />
      <DetailField label={txt('materialCatalog.form.color')} value={data.mau_sac || '—'} icon={Palette} />
      <DetailField
        label={txt('materialCatalog.form.composition')}
        value={data.thanh_phan || '—'}
        icon={Layers}
      />
      <DetailField label={txt('materialCatalog.form.width')} value={data.kho_vai || '—'} icon={Ruler} />
      <DetailField
        label={txt('materialCatalog.form.gsm')}
        value={data.dinh_luong_gsm != null ? String(data.dinh_luong_gsm) : '—'}
        icon={Scale}
      />
      <DetailField label={txt('materialCatalog.form.origin')} value={data.xuat_xu || '—'} icon={Globe} />
    </DetailFieldGrid>
  </DetailSection>
);

/** Gợi ý combobox: danh mục mặc định + giá trị đã dùng trong list + giá trị form hiện tại */
export function useMaterialSpecComboboxOptions(
  catalogItems: MaterialCatalogItem[],
  watched: Partial<MaterialCatalogFormValues>,
): MaterialSpecComboboxOptions {
  return useMemo(
    () =>
      buildMaterialSpecComboboxOptions(catalogItems, {
        don_vi_tinh: watched.don_vi_tinh,
        mau_sac: watched.mau_sac,
        thanh_phan: watched.thanh_phan,
        kho_vai: watched.kho_vai,
        dinh_luong_gsm: watched.dinh_luong_gsm ?? null,
        xuat_xu: watched.xuat_xu,
      }),
    [
      catalogItems,
      watched.don_vi_tinh,
      watched.mau_sac,
      watched.thanh_phan,
      watched.kho_vai,
      watched.dinh_luong_gsm,
      watched.xuat_xu,
    ],
  );
}
