import React, { useEffect, useMemo } from 'react';
import { txt } from '@/lib/text';
import { useForm, Controller, SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Layers, FileText, ArrowUpFromLine, Power, Folder, Hash } from 'lucide-react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import StatusToggle from '@/components/ui/StatusToggle';
import ParentSelect from '@/components/ui/ParentSelect';
import { PartnerCategoryFormValues, partnerCategorySchema } from '../../core/schema';
import { PartnerCategory, type PartnerKind } from '../../core/types';
import {
  useCreatePartnerCategory,
  useUpdatePartnerCategory,
} from '../../hooks/use-doi-tac-category';
import GenericDrawer, { DRAWER_WIDTH_FORM } from '@/components/shared/GenericDrawer';
import FormSection from '@/components/shared/FormSection';
import FormGrid from '@/components/shared/FormGrid';
import FormDrawerFooter from '@/components/shared/FormDrawerFooter';

interface Props {
  kind: PartnerKind;
  initialData?: PartnerCategory | null;
  allCategories: PartnerCategory[];
  onClose: () => void;
  defaultParentId?: string | null;
}

const PartnerCategoryForm: React.FC<Props> = ({
  kind,
  initialData,
  allCategories,
  onClose,
  defaultParentId,
}) => {
  const isEdit = !!initialData;
  const createMutation = useCreatePartnerCategory(kind, onClose);
  const updateMutation = useUpdatePartnerCategory(kind, onClose);
  const rootParents = useMemo(() => allCategories.filter((c) => c.cap_do === 1), [allCategories]);
  const showParentField = !isEdit || initialData?.cap_do === 1;

  const defaultValues = useMemo<Partial<PartnerCategoryFormValues>>(
    () => ({
      ten_danh_muc: '',
      ma_danh_muc: '',
      mo_ta: '',
      cha_id: '',
      trang_thai: 'Đang hoạt động',
      thu_tu: 1,
    }),
    [],
  );

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<PartnerCategoryFormValues>({
    resolver: zodResolver(partnerCategorySchema) as Resolver<PartnerCategoryFormValues>,
    defaultValues,
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ten_danh_muc: initialData.ten_danh_muc,
        ma_danh_muc: initialData.ma_danh_muc ?? '',
        mo_ta: initialData.mo_ta ?? '',
        cha_id: initialData.cha_id || '',
        trang_thai: initialData.trang_thai,
        thu_tu: initialData.thu_tu,
      });
    } else {
      const nextThuTu = allCategories.length
        ? Math.max(...allCategories.map((d) => d.thu_tu ?? 0)) + 1
        : 1;
      reset({
        ...defaultValues,
        thu_tu: nextThuTu,
        cha_id: defaultParentId ?? '',
      });
    }
  }, [initialData, defaultParentId, allCategories, reset, defaultValues]);

  const onSubmit: SubmitHandler<PartnerCategoryFormValues> = (data) => {
    const sanitizedData: PartnerCategoryFormValues = {
      ...data,
      cha_id: data.cha_id === '' || data.cha_id === undefined ? null : data.cha_id,
      ma_danh_muc:
        data.ma_danh_muc != null && String(data.ma_danh_muc).trim() !== ''
          ? String(data.ma_danh_muc).trim()
          : null,
      mo_ta: data.mo_ta?.trim() || undefined,
    };
    if (isEdit && initialData) {
      updateMutation.mutate({ id: initialData.id, data: sanitizedData });
    } else {
      createMutation.mutate(sanitizedData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <GenericDrawer
      title={isEdit ? txt('partnerCategory.form.editTitle') : txt('partnerCategory.form.createTitle')}
      icon={<Layers size={20} />}
      onClose={onClose}
      footer={
        <FormDrawerFooter
          formId="partner-category-form"
          onCancel={onClose}
          isLoading={isLoading}
          isEdit={isEdit}
          compact
        />
      }
      footerCompact
      maxWidthClass={DRAWER_WIDTH_FORM}
    >
      <form id="partner-category-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormSection title={txt('partnerCategory.detail.basicInfo')} icon={<Layers size={14} />} variant="primary">
          <FormGrid cols={2}>
            <div className="col-span-1 sm:col-span-2">
              <Input
                label={txt('partnerCategory.name')}
                placeholder={txt('partnerCategory.form.namePlaceholder')}
                icon={<Layers size={12} />}
                required
                {...register('ten_danh_muc')}
                error={errors.ten_danh_muc?.message}
              />
            </div>
            <Input
              label={txt('partnerCategory.code')}
              placeholder={txt('partnerCategory.form.codePlaceholder')}
              icon={<Hash size={12} />}
              {...register('ma_danh_muc')}
              error={errors.ma_danh_muc?.message}
            />
            <div className="col-span-1 sm:col-span-2">
              <Textarea
                {...register('mo_ta')}
                label={txt('partnerCategory.detail.description')}
                placeholder={txt('partnerCategory.form.descriptionPlaceholder')}
                icon={<FileText size={12} />}
                rows={3}
                className="resize-y min-h-[80px]"
                error={errors.mo_ta?.message}
              />
            </div>
            {showParentField && (
              <div className="col-span-1 sm:col-span-2">
                <Controller
                  name="cha_id"
                  control={control}
                  render={({ field }) => (
                    <ParentSelect<PartnerCategory>
                      items={rootParents}
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      excludeId={initialData?.id}
                      getId={(d) => d.id}
                      getParentId={() => null}
                      getLevel={() => 1}
                      getOptionLabel={(d) => d.ten_danh_muc}
                      label={txt('partnerCategory.detail.parent')}
                      icon={<Folder size={12} />}
                      placeholder={txt('partnerCategory.form.parentNone')}
                      hint={txt('partnerCategory.form.parentHint')}
                    />
                  )}
                />
              </div>
            )}
            {isEdit && initialData && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-foreground/80 flex items-center gap-1.5">
                  <Layers size={12} className="text-muted-foreground" />
                  {txt('partnerCategory.detail.level')}
                </span>
                <span className="text-sm text-muted-foreground">{String(initialData.cap_do)}</span>
              </div>
            )}
            <Input
              type="number"
              label={txt('partnerCategory.detail.order')}
              icon={<ArrowUpFromLine size={12} />}
              required
              {...register('thu_tu')}
              error={errors.thu_tu?.message}
            />
            <Controller
              name="trang_thai"
              control={control}
              render={({ field }) => (
                <StatusToggle
                  label={txt('common.status')}
                  value={field.value}
                  onChange={field.onChange}
                  activeLabel="Đang hoạt động"
                  inactiveLabel="Ngừng hoạt động"
                  icon={<Power size={12} />}
                  required
                />
              )}
            />
          </FormGrid>
        </FormSection>
      </form>
    </GenericDrawer>
  );
};

export default PartnerCategoryForm;
