import React, { useEffect, useMemo } from 'react';
import { txt } from '@/lib/text';
import { toast } from 'sonner';
import { useForm, Controller, SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GitBranch } from 'lucide-react';
import Input from '@/components/ui/Input';
import NumericFormatInput from '@/components/ui/NumericFormatInput';
import Textarea from '@/components/ui/Textarea';
import { orderLineBomSchema, type OrderLineBomFormValues } from '../core/order-line-bom-schema';
import type { OrderLineBomItem } from '../core/order-line-bom-types';
import {
  useCreateOrderLineBom,
  useUpdateOrderLineBom,
  useTemplateMaterialIds,
} from '../hooks/use-order-line-bom';
import { useMaterialCatalogList } from '@/features/san-xuat/danh-sach-nguyen-lieu/hooks/use-danh-sach-nguyen-lieu';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import GenericDrawer, { DRAWER_WIDTH_FORM } from '@/components/shared/GenericDrawer';
import FormDrawerFooter from '@/components/shared/FormDrawerFooter';
import FormSection from '@/components/shared/FormSection';
import FormGrid from '@/components/shared/FormGrid';
import MaterialLineSelect from '@/features/san-xuat/bom/components/material-line-select';

const DEFAULT_VALUES: OrderLineBomFormValues = {
  nguyen_lieu_id: '',
  so_luong_dinh_muc: 1,
  don_vi_tinh: '',
  ghi_chu: '',
  thu_tu: 0,
};

interface Props {
  lineId: string;
  lineQty: number;
  danhMucId: string;
  initialData?: OrderLineBomItem | null;
  existingMaterialIds?: string[];
  onClose: () => void;
  maxWidthClass?: string;
  stackLevel?: number;
}

const OrderLineBomForm: React.FC<Props> = ({
  lineId,
  lineQty,
  danhMucId,
  initialData,
  existingMaterialIds = [],
  onClose,
  maxWidthClass = DRAWER_WIDTH_FORM,
  stackLevel = 2,
}) => {
  const isEdit = !!initialData;
  const sessionReady = useSupabaseReady();
  const createMutation = useCreateOrderLineBom(lineId, lineQty, onClose);
  const updateMutation = useUpdateOrderLineBom(lineId, lineQty, onClose);
  const { data: allMaterials = [] } = useMaterialCatalogList({ enabled: sessionReady });
  const { data: templateMaterialIds = [] } = useTemplateMaterialIds(danhMucId, {
    enabled: sessionReady && Boolean(danhMucId),
  });

  const allowedMaterials = useMemo(() => {
    const allowed = new Set(templateMaterialIds);
    return allMaterials.filter((m) => allowed.has(m.id));
  }, [allMaterials, templateMaterialIds]);

  const excludeIds = useMemo(
    () => existingMaterialIds.filter((id) => id !== initialData?.nguyen_lieu_id),
    [existingMaterialIds, initialData?.nguyen_lieu_id],
  );

  const { register, handleSubmit, formState: { errors }, reset, control, setValue } =
    useForm<OrderLineBomFormValues>({
      resolver: zodResolver(orderLineBomSchema) as Resolver<OrderLineBomFormValues>,
      defaultValues: DEFAULT_VALUES,
    });

  useEffect(() => {
    if (initialData) {
      reset({
        nguyen_lieu_id: initialData.nguyen_lieu_id,
        so_luong_dinh_muc: initialData.so_luong_dinh_muc,
        don_vi_tinh: initialData.don_vi_tinh ?? '',
        ghi_chu: initialData.ghi_chu ?? '',
        thu_tu: initialData.thu_tu,
      });
    } else {
      reset(DEFAULT_VALUES);
    }
  }, [initialData, reset]);

  const onSubmit: SubmitHandler<OrderLineBomFormValues> = (data) => {
    if (isEdit && initialData) {
      updateMutation.mutate({ id: initialData.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const onInvalid = () => {
    toast.error(txt('productionOrder.lineBom.validation.quantityRequired'));
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <GenericDrawer
      title={
        isEdit
          ? txt('productionOrder.lineBom.formEditTitle')
          : txt('productionOrder.lineBom.formCreateTitle')
      }
      icon={<GitBranch size={20} />}
      onClose={onClose}
      maxWidthClass={maxWidthClass}
      stackLevel={stackLevel}
      footer={
        <FormDrawerFooter
          formId="order-line-bom-form"
          onCancel={onClose}
          isLoading={isSubmitting}
          isEdit={isEdit}
        />
      }
    >
      <form id="order-line-bom-form" onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-5">
        <FormSection title={txt('productionOrder.lineBom.sectionTitle')} icon={<GitBranch size={14} />}>
          {isEdit ? (
            <p className="text-xs text-muted-foreground mb-2 px-0.5">
              {txt('productionOrder.lineBom.materialLocked')}
            </p>
          ) : null}
          <FormGrid>
            <Controller
              name="nguyen_lieu_id"
              control={control}
              render={({ field }) => (
                <MaterialLineSelect
                  materials={allowedMaterials}
                  excludeIds={excludeIds}
                  value={field.value}
                  onChange={field.onChange}
                  onMaterialPick={(m) => {
                    if (!isEdit && m.don_vi_tinh) {
                      setValue('don_vi_tinh', m.don_vi_tinh);
                    }
                  }}
                  label={txt('productionOrder.lineBom.formMaterial')}
                  placeholder={txt('productionOrder.lineBom.formMaterialPlaceholder')}
                  error={errors.nguyen_lieu_id?.message}
                  disabled={isEdit}
                />
              )}
            />
            <Controller
              name="so_luong_dinh_muc"
              control={control}
              render={({ field }) => (
                <NumericFormatInput
                  label={txt('productionOrder.lineBom.formQtyPerUnit')}
                  value={field.value}
                  onValueChange={(_formatted, values) =>
                    field.onChange(values.floatValue ?? 0)
                  }
                  error={errors.so_luong_dinh_muc?.message}
                  decimalScale={4}
                  min={0.0001}
                />
              )}
            />
            <Input
              label={txt('productionOrder.lineBom.formUnit')}
              {...register('don_vi_tinh')}
              error={errors.don_vi_tinh?.message}
            />
            <Input
              label={txt('productionOrder.lineBom.formSortOrder')}
              type="number"
              min={0}
              {...register('thu_tu', { valueAsNumber: true })}
              error={errors.thu_tu?.message}
            />
            <Textarea
              label={txt('productionOrder.lineBom.formNote')}
              {...register('ghi_chu')}
              error={errors.ghi_chu?.message}
              className="sm:col-span-2"
            />
          </FormGrid>
          {!isEdit && lineQty > 1 ? (
            <p className="text-xs text-muted-foreground mt-2">
              SL tổng = SL/SP × {lineQty} SP
            </p>
          ) : null}
        </FormSection>
      </form>
    </GenericDrawer>
  );
};

export default OrderLineBomForm;
