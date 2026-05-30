import React, { useEffect, useMemo } from 'react';
import { txt } from '@/lib/text';
import { useForm, Controller, SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FolderTree, Layers, FileText, ArrowUpFromLine, Power, Folder, Hash } from 'lucide-react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import StatusToggle from '@/components/ui/StatusToggle';
import ParentSelect from '@/components/ui/ParentSelect';
import { ProductCategoryFormValues, productCategorySchema } from '../core/schema';
import { ProductCategory } from '../core/types';
import {
  useCreateProductCategory,
  useUpdateProductCategory,
  useCategoryLinks,
} from '../hooks/use-danh-muc-hang-hoa';
import { useProductAttributes } from '../../thuoc-tinh-hang-hoa/hooks/use-thuoc-tinh-hang-hoa';
import { useMeasurementSpecs } from '../../thong-so-do/hooks/use-thong-so-do';
import GenericDrawer, { DRAWER_WIDTH_FORM } from '@/components/shared/GenericDrawer';
import FormSection from '@/components/shared/FormSection';
import FormGrid from '@/components/shared/FormGrid';
import FormDrawerFooter from '@/components/shared/FormDrawerFooter';
import CategoryLinksSection from './category-links-section';

interface Props {
  initialData?: ProductCategory | null;
  allCategories: ProductCategory[];
  onClose: () => void;
  defaultParentId?: string | null;
}

const ProductCategoryForm: React.FC<Props> = ({
  initialData,
  allCategories,
  onClose,
  defaultParentId,
}) => {
  const isEdit = !!initialData;
  const createMutation = useCreateProductCategory(onClose);
  const updateMutation = useUpdateProductCategory(onClose);
  const rootParents = useMemo(() => allCategories.filter((c) => c.cap_do === 1), [allCategories]);
  const showParentField = !isEdit || initialData?.cap_do === 1;

  const isLevel2Edit = isEdit && initialData?.cap_do === 2;
  const { data: existingLinks } = useCategoryLinks(initialData?.id, {
    enabled: isLevel2Edit,
  });
  const { data: attributes = [] } = useProductAttributes({ enabled: true });
  const { data: measurementSpecs = [] } = useMeasurementSpecs({ enabled: true });

  const defaultValues = useMemo<Partial<ProductCategoryFormValues>>(
    () => ({
      ten_danh_muc: '',
      ma_danh_muc: '',
      mo_ta: '',
      cha_id: '',
      trang_thai: 'Đang hoạt động',
      thu_tu: 1,
      thuoc_tinh_links: [],
      thong_so_do_links: [],
    }),
    [],
  );

  const { register, handleSubmit, formState: { errors }, reset, control, watch, setValue } =
    useForm<ProductCategoryFormValues>({
      resolver: zodResolver(productCategorySchema) as Resolver<ProductCategoryFormValues>,
      defaultValues,
    });

  const chaIdWatch = watch('cha_id');
  const thuocTinhLinks = watch('thuoc_tinh_links') ?? [];
  const thongSoDoLinks = watch('thong_so_do_links') ?? [];

  const showLinksSection =
    isLevel2Edit || (Boolean(chaIdWatch) && String(chaIdWatch).trim() !== '');

  useEffect(() => {
    if (initialData) {
      reset({
        ten_danh_muc: initialData.ten_danh_muc,
        ma_danh_muc: initialData.ma_danh_muc ?? '',
        mo_ta: initialData.mo_ta ?? '',
        cha_id: initialData.cha_id || '',
        trang_thai: initialData.trang_thai,
        thu_tu: initialData.thu_tu,
        thuoc_tinh_links: [],
        thong_so_do_links: [],
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

  useEffect(() => {
    if (!existingLinks || !isLevel2Edit) return;
    setValue('thuoc_tinh_links', existingLinks.attributeLinks);
    setValue('thong_so_do_links', existingLinks.measurementLinks);
  }, [existingLinks, isLevel2Edit, setValue]);

  useEffect(() => {
    if (!showLinksSection) {
      setValue('thuoc_tinh_links', []);
      setValue('thong_so_do_links', []);
    }
  }, [showLinksSection, setValue]);

  const onSubmit: SubmitHandler<ProductCategoryFormValues> = (data) => {
    const sanitizedData: ProductCategoryFormValues = {
      ...data,
      cha_id: data.cha_id === '' || data.cha_id === undefined ? null : data.cha_id,
      ma_danh_muc:
        data.ma_danh_muc != null && String(data.ma_danh_muc).trim() !== ''
          ? String(data.ma_danh_muc).trim()
          : null,
      mo_ta: data.mo_ta?.trim() || undefined,
      thuoc_tinh_links: showLinksSection ? (data.thuoc_tinh_links ?? []) : [],
      thong_so_do_links: showLinksSection ? (data.thong_so_do_links ?? []) : [],
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
      title={isEdit ? txt('productCategory.form.editTitle') : txt('productCategory.form.createTitle')}
      icon={<FolderTree size={20} />}
      onClose={onClose}
      footer={
        <FormDrawerFooter
          formId="product-category-form"
          onCancel={onClose}
          isLoading={isLoading}
          isEdit={isEdit}
          compact
        />
      }
      footerCompact
      maxWidthClass={DRAWER_WIDTH_FORM}
    >
      <form id="product-category-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormSection title={txt('productCategory.detail.basicInfo')} icon={<FolderTree size={14} />} variant="primary">
          <FormGrid cols={2}>
            <div className="col-span-1 sm:col-span-2">
              <Input
                label={txt('productCategory.name')}
                placeholder={txt('productCategory.form.namePlaceholder')}
                icon={<FolderTree size={12} />}
                required
                {...register('ten_danh_muc')}
                error={errors.ten_danh_muc?.message}
              />
            </div>
            <Input
              label={txt('productCategory.code')}
              placeholder={txt('productCategory.form.codePlaceholder')}
              icon={<Hash size={12} />}
              {...register('ma_danh_muc')}
              error={errors.ma_danh_muc?.message}
            />
            <div className="col-span-1 sm:col-span-2">
              <Textarea
                {...register('mo_ta')}
                label={txt('productCategory.detail.description')}
                placeholder={txt('productCategory.form.descriptionPlaceholder')}
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
                    <ParentSelect<ProductCategory>
                      items={rootParents}
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      excludeId={initialData?.id}
                      getId={(d) => d.id}
                      getParentId={() => null}
                      getLevel={() => 1}
                      getOptionLabel={(d) => d.ten_danh_muc}
                      label={txt('productCategory.detail.parent')}
                      icon={<Folder size={12} />}
                      placeholder={txt('productCategory.form.parentNone')}
                      hint={txt('productCategory.form.parentHint')}
                    />
                  )}
                />
              </div>
            )}
            {isEdit && initialData && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-foreground/80 flex items-center gap-1.5">
                  <Layers size={12} className="text-muted-foreground" />
                  {txt('productCategory.detail.level')}
                </span>
                <span className="text-sm text-muted-foreground">{String(initialData.cap_do)}</span>
              </div>
            )}
            <Input
              type="number"
              label={txt('productCategory.detail.order')}
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

        {showLinksSection ? (
          <CategoryLinksSection
            attributeLinks={thuocTinhLinks}
            measurementLinks={thongSoDoLinks}
            attributes={attributes}
            measurementSpecs={measurementSpecs}
            onAttributeLinksChange={(links) => setValue('thuoc_tinh_links', links)}
            onMeasurementLinksChange={(links) => setValue('thong_so_do_links', links)}
          />
        ) : (
          <p className="text-xs text-muted-foreground px-1">
            {txt('productCategory.form.linksLevel2OnlyHint')}
          </p>
        )}
      </form>
    </GenericDrawer>
  );
};

export default ProductCategoryForm;
