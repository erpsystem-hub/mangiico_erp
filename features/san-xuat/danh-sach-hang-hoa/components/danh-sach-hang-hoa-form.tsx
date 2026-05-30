import React, { useEffect, useRef } from 'react';
import { txt } from '@/lib/text';
import { toast } from 'sonner';
import { useForm, Controller, SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Package, Hash, Type, FileText, Power } from 'lucide-react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import StatusToggle from '@/components/ui/StatusToggle';
import {
  productCatalogBaseSchema,
  type ProductCatalogFormValues,
} from '../core/schema';
import type { ProductCatalogItem } from '../core/types';
import {
  useCreateProductCatalogItem,
  useUpdateProductCatalogItem,
  useProductAttributeValues,
} from '../hooks/use-danh-sach-hang-hoa';
import { useProductCategories, useCategoryLinks } from '@/features/san-xuat/danh-muc-hang-hoa/hooks/use-danh-muc-hang-hoa';
import {
  buildEmptyAttributeValues,
  mergeAttributeValuesWithTemplate,
} from '../services/san-pham-thuoc-tinh-service';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import GenericDrawer, { DRAWER_WIDTH_FORM } from '@/components/shared/GenericDrawer';
import FormDrawerFooter from '@/components/shared/FormDrawerFooter';
import FormSection from '@/components/shared/FormSection';
import FormGrid from '@/components/shared/FormGrid';
import { normalizeTrangThaiHoatDong } from '@/lib/constants/trang-thai';
import CategoryLevel2GroupedSelect from './category-level2-grouped-select';
import ProductAttributeValuesSection from './product-attribute-values-section';

const DEFAULT_VALUES: ProductCatalogFormValues = {
  ma_san_pham: '',
  ten_san_pham: '',
  danh_muc_id: '',
  mo_ta: '',
  trang_thai: 'Đang hoạt động',
  thuoc_tinh_values: [],
};

interface Props {
  initialData?: ProductCatalogItem | null;
  onClose: () => void;
}

const ProductCatalogForm: React.FC<Props> = ({ initialData, onClose }) => {
  const isEdit = !!initialData;
  const sessionReady = useSupabaseReady();
  const createMutation = useCreateProductCatalogItem(onClose);
  const updateMutation = useUpdateProductCatalogItem(onClose);
  const { data: categories = [] } = useProductCategories({ enabled: sessionReady });
  const prevDanhMucRef = useRef<string>('');

  const { data: existingAttrs } = useProductAttributeValues(initialData?.id, {
    enabled: isEdit && sessionReady,
  });

  const { register, handleSubmit, formState: { errors }, reset, control, watch, setValue } =
    useForm<ProductCatalogFormValues>({
      resolver: zodResolver(productCatalogBaseSchema) as Resolver<ProductCatalogFormValues>,
      defaultValues: DEFAULT_VALUES,
    });

  const danhMucId = watch('danh_muc_id');
  const thuocTinhValues = watch('thuoc_tinh_values') ?? [];

  const { data: categoryLinks } = useCategoryLinks(danhMucId, {
    enabled: Boolean(danhMucId?.trim()) && sessionReady,
  });
  const template = categoryLinks?.attributeLinks ?? [];

  useEffect(() => {
    if (initialData) {
      reset({
        ma_san_pham: initialData.ma_san_pham,
        ten_san_pham: initialData.ten_san_pham,
        danh_muc_id: initialData.danh_muc_id,
        mo_ta: initialData.mo_ta ?? '',
        trang_thai: normalizeTrangThaiHoatDong(initialData.trang_thai),
        thuoc_tinh_values: [],
      });
      prevDanhMucRef.current = initialData.danh_muc_id;
    } else {
      reset(DEFAULT_VALUES);
      prevDanhMucRef.current = '';
    }
  }, [initialData, reset]);

  useEffect(() => {
    if (!isEdit || !existingAttrs?.length || !initialData) return;
    if (danhMucId !== initialData.danh_muc_id) return;
    setValue(
      'thuoc_tinh_values',
      existingAttrs.map((a) => ({ thuoc_tinh_id: a.thuoc_tinh_id, gia_tri: a.gia_tri })),
    );
  }, [isEdit, existingAttrs, initialData, danhMucId, setValue]);

  useEffect(() => {
    if (!danhMucId?.trim()) {
      setValue('thuoc_tinh_values', []);
      prevDanhMucRef.current = '';
      return;
    }
    const prev = prevDanhMucRef.current;
    if (prev && prev !== danhMucId) {
      toast.info(txt('productCatalog.form.categoryChanged'));
      setValue(
        'thuoc_tinh_values',
        mergeAttributeValuesWithTemplate(
          template,
          thuocTinhValues.map((v) => ({
            thuoc_tinh_id: v.thuoc_tinh_id,
            ten_hien_thi: '',
            gia_tri: v.gia_tri,
            bat_buoc: false,
            thu_tu: 0,
          })),
        ),
      );
    } else if (prev !== danhMucId && (!isEdit || danhMucId !== initialData?.danh_muc_id)) {
      setValue('thuoc_tinh_values', buildEmptyAttributeValues(template));
    }
    prevDanhMucRef.current = danhMucId;
  }, [danhMucId, template, setValue, isEdit, initialData, thuocTinhValues]);

  const onSubmit: SubmitHandler<ProductCatalogFormValues> = (data) => {
    if (isEdit && initialData) {
      updateMutation.mutate({ id: initialData.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const onInvalid = () => {
    toast.error(txt('productCatalog.form.validationError'));
  };

  const isPending = !sessionReady || createMutation.isPending || updateMutation.isPending;

  const attrErrors: Record<string, string> = {};
  if (errors.thuoc_tinh_values?.message) {
    attrErrors._form = String(errors.thuoc_tinh_values.message);
  }

  return (
    <GenericDrawer
      title={isEdit ? txt('productCatalog.form.editTitle') : txt('productCatalog.form.createTitle')}
      subtitle={
        isEdit ? txt('productCatalog.form.editSubtitle') : txt('productCatalog.form.createSubtitle')
      }
      icon={<Package size={18} />}
      onClose={onClose}
      footer={
        <FormDrawerFooter
          formId="product-catalog-form"
          onCancel={onClose}
          isLoading={isPending}
          isEdit={isEdit}
          compact
          createIcon={<Package className="w-3.5 h-3.5 mr-1.5 shrink-0" />}
        />
      }
      footerCompact
      maxWidthClass={DRAWER_WIDTH_FORM}
    >
      <form
        id="product-catalog-form"
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="space-y-5"
      >
        <FormSection title={txt('productCatalog.form.generalInfo')} icon={<Package size={14} />}>
          <FormGrid cols={2}>
            <Input
              label={txt('productCatalog.form.code')}
              placeholder={txt('productCatalog.form.codePlaceholder')}
              icon={Hash}
              required
              error={errors.ma_san_pham?.message}
              {...register('ma_san_pham')}
            />
            <Input
              label={txt('productCatalog.form.name')}
              placeholder={txt('productCatalog.form.namePlaceholder')}
              icon={Type}
              required
              error={errors.ten_san_pham?.message}
              {...register('ten_san_pham')}
            />
            <Controller
              name="danh_muc_id"
              control={control}
              render={({ field }) => (
                <CategoryLevel2GroupedSelect
                  categories={categories}
                  value={field.value}
                  onChange={field.onChange}
                  label={txt('productCatalog.form.category')}
                  placeholder={txt('productCatalog.form.categoryPlaceholder')}
                  required
                  error={errors.danh_muc_id?.message}
                />
              )}
            />
            <Controller
              name="trang_thai"
              control={control}
              render={({ field }) => (
                <StatusToggle
                  label={txt('productCatalog.form.status')}
                  icon={Power}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <div className="sm:col-span-2">
              <Textarea
                label={txt('productCatalog.form.description')}
                placeholder={txt('productCatalog.form.descriptionPlaceholder')}
                icon={FileText}
                rows={2}
                {...register('mo_ta')}
              />
            </div>
          </FormGrid>
        </FormSection>

        {!danhMucId?.trim() ? (
          <p className="text-sm text-muted-foreground px-1">
            {txt('productCatalog.form.selectCategoryFirst')}
          </p>
        ) : (
          <ProductAttributeValuesSection
            template={template}
            values={thuocTinhValues}
            onChange={(v) => setValue('thuoc_tinh_values', v, { shouldValidate: true })}
            errors={attrErrors}
          />
        )}
      </form>
    </GenericDrawer>
  );
};

export default ProductCatalogForm;
