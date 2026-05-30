import React, { useEffect } from 'react';
import { txt } from '@/lib/text';
import { toast } from 'sonner';
import { useForm, Controller, SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SlidersHorizontal, Type, Power, ArrowUpFromLine } from 'lucide-react';
import Input from '@/components/ui/Input';
import StatusToggle from '@/components/ui/StatusToggle';
import { ProductAttributeFormValues, productAttributeSchema } from '../core/schema';
import type { ProductAttribute } from '../core/types';
import {
  useCreateProductAttribute,
  useUpdateProductAttribute,
  useProductAttributes,
} from '../hooks/use-thuoc-tinh-hang-hoa';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import GenericDrawer, { DRAWER_WIDTH_FORM } from '@/components/shared/GenericDrawer';
import FormDrawerFooter from '@/components/shared/FormDrawerFooter';
import FormSection from '@/components/shared/FormSection';
import FormGrid from '@/components/shared/FormGrid';
import { normalizeTrangThaiHoatDong } from '@/lib/constants/trang-thai';

const DEFAULT_VALUES: ProductAttributeFormValues = {
  ten_hien_thi: '',
  thu_tu: 1,
  trang_thai: 'Đang hoạt động',
};

interface Props {
  initialData?: ProductAttribute | null;
  onClose: () => void;
}

const ProductAttributeForm: React.FC<Props> = ({ initialData, onClose }) => {
  const isEdit = !!initialData;
  const sessionReady = useSupabaseReady();
  const createMutation = useCreateProductAttribute(onClose);
  const updateMutation = useUpdateProductAttribute(onClose);
  const { data: allItems = [] } = useProductAttributes({ enabled: sessionReady });

  const { register, handleSubmit, formState: { errors }, reset, control } =
    useForm<ProductAttributeFormValues>({
      resolver: zodResolver(productAttributeSchema) as Resolver<ProductAttributeFormValues>,
      defaultValues: DEFAULT_VALUES,
    });

  useEffect(() => {
    if (initialData) {
      reset({
        ten_hien_thi: initialData.ten_hien_thi,
        thu_tu: initialData.thu_tu,
        trang_thai: normalizeTrangThaiHoatDong(initialData.trang_thai),
      });
    } else {
      const nextThuTu = allItems.length
        ? Math.max(...allItems.map((d) => d.thu_tu ?? 0)) + 1
        : 1;
      reset({ ...DEFAULT_VALUES, thu_tu: nextThuTu });
    }
  }, [initialData, reset, allItems]);

  const onSubmit: SubmitHandler<ProductAttributeFormValues> = (data) => {
    if (isEdit && initialData) {
      updateMutation.mutate({ id: initialData.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const onInvalid = () => {
    toast.error(txt('productAttribute.form.validationError'));
  };

  const isPending = !sessionReady || createMutation.isPending || updateMutation.isPending;

  return (
    <GenericDrawer
      title={isEdit ? txt('productAttribute.form.editTitle') : txt('productAttribute.form.createTitle')}
      subtitle={
        isEdit ? txt('productAttribute.form.editSubtitle') : txt('productAttribute.form.createSubtitle')
      }
      icon={<SlidersHorizontal size={18} />}
      onClose={onClose}
      footer={
        <FormDrawerFooter
          formId="product-attribute-form"
          onCancel={onClose}
          isLoading={isPending}
          isEdit={isEdit}
          compact
          createIcon={<SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 shrink-0" />}
        />
      }
      footerCompact
      maxWidthClass={DRAWER_WIDTH_FORM}
    >
      <form
        id="product-attribute-form"
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="space-y-5"
      >
        <FormSection title={txt('productAttribute.form.generalInfo')} icon={<SlidersHorizontal size={14} />}>
          <FormGrid cols={2}>
            <div className="sm:col-span-2">
              <Input
                label={txt('productAttribute.form.displayName')}
                placeholder={txt('productAttribute.form.displayNamePlaceholder')}
                icon={Type}
                required
                error={errors.ten_hien_thi?.message}
                {...register('ten_hien_thi')}
              />
            </div>
            <Input
              type="number"
              label={txt('productAttribute.store.orderCol')}
              icon={<ArrowUpFromLine size={12} />}
              required
              error={errors.thu_tu?.message}
              {...register('thu_tu')}
            />
            <Controller
              name="trang_thai"
              control={control}
              render={({ field }) => (
                <StatusToggle
                  label={txt('productAttribute.form.status')}
                  icon={Power}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </FormGrid>
        </FormSection>
      </form>
    </GenericDrawer>
  );
};

export default ProductAttributeForm;
