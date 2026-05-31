import React, { useEffect } from 'react';
import { txt } from '@/lib/text';
import { toast } from 'sonner';
import { useForm, Controller, SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GitBranch, Power } from 'lucide-react';
import Input from '@/components/ui/Input';
import NumericFormatInput from '@/components/ui/NumericFormatInput';
import Textarea from '@/components/ui/Textarea';
import StatusToggle from '@/components/ui/StatusToggle';
import { bomSchema, type BomFormValues } from '../core/schema';
import type { BomItem } from '../core/types';
import {
  useCreateBomItem,
  useUpdateBomItem,
} from '../hooks/use-bom';
import { useProductCategories } from '@/features/san-xuat/danh-muc-hang-hoa/hooks/use-danh-muc-hang-hoa';
import { useMaterialCatalogList } from '@/features/san-xuat/danh-sach-nguyen-lieu/hooks/use-danh-sach-nguyen-lieu';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import GenericDrawer, { DRAWER_WIDTH_FORM } from '@/components/shared/GenericDrawer';
import FormDrawerFooter from '@/components/shared/FormDrawerFooter';
import FormSection from '@/components/shared/FormSection';
import FormGrid from '@/components/shared/FormGrid';
import { normalizeTrangThaiHoatDong } from '@/lib/constants/trang-thai';
import CategoryLevel2GroupedSelect from '@/features/san-xuat/danh-muc-hang-hoa/components/category-level2-grouped-select';
import MaterialLineSelect from './material-line-select';

const DEFAULT_VALUES: BomFormValues = {
  danh_muc_id: '',
  nguyen_lieu_id: '',
  so_luong: 1,
  don_vi_tinh: '',
  ghi_chu: '',
  thu_tu: 0,
  trang_thai: 'Đang hoạt động',
};

interface Props {
  initialData?: BomItem | null;
  presetDanhMucId?: string;
  presetNguyenLieuId?: string;
  lockDanhMuc?: boolean;
  lockNguyenLieu?: boolean;
  onClose: () => void;
  maxWidthClass?: string;
  stackLevel?: number;
}

const BomForm: React.FC<Props> = ({
  initialData,
  presetDanhMucId,
  presetNguyenLieuId,
  lockDanhMuc = false,
  lockNguyenLieu = false,
  onClose,
  maxWidthClass,
  stackLevel = 0,
}) => {
  const isEdit = !!initialData;
  const sessionReady = useSupabaseReady();
  const createMutation = useCreateBomItem(onClose);
  const updateMutation = useUpdateBomItem(onClose);
  const { data: categories = [] } = useProductCategories({ enabled: sessionReady });
  const { data: materials = [] } = useMaterialCatalogList({ enabled: sessionReady });

  const { register, handleSubmit, formState: { errors }, reset, control, watch, setValue } =
    useForm<BomFormValues>({
      resolver: zodResolver(bomSchema) as Resolver<BomFormValues>,
      defaultValues: DEFAULT_VALUES,
    });

  useEffect(() => {
    if (initialData) {
      reset({
        danh_muc_id: initialData.danh_muc_id,
        nguyen_lieu_id: initialData.nguyen_lieu_id,
        so_luong: initialData.so_luong,
        don_vi_tinh: initialData.don_vi_tinh ?? '',
        ghi_chu: initialData.ghi_chu ?? '',
        thu_tu: initialData.thu_tu,
        trang_thai: normalizeTrangThaiHoatDong(initialData.trang_thai),
      });
    } else {
      reset({
        ...DEFAULT_VALUES,
        danh_muc_id: presetDanhMucId?.trim() ?? '',
        nguyen_lieu_id: presetNguyenLieuId?.trim() ?? '',
      });
    }
  }, [initialData, presetDanhMucId, presetNguyenLieuId, reset]);

  const onSubmit: SubmitHandler<BomFormValues> = (data) => {
    if (isEdit && initialData) {
      updateMutation.mutate({ id: initialData.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const onInvalid = () => {
    toast.error(txt('bom.form.validationError'));
  };

  const isPending = !sessionReady || createMutation.isPending || updateMutation.isPending;
  const lockCategoryField = isEdit || lockDanhMuc;
  const lockMaterialField = isEdit || lockNguyenLieu;
  const showPairLockHint = lockCategoryField && lockMaterialField;

  return (
    <GenericDrawer
      title={isEdit ? txt('bom.form.editTitle') : txt('bom.form.createTitle')}
      subtitle={isEdit ? txt('bom.form.editSubtitle') : txt('bom.form.createSubtitle')}
      icon={<GitBranch size={18} />}
      onClose={onClose}
      footer={
        <FormDrawerFooter
          formId="bom-form"
          onCancel={onClose}
          isLoading={isPending}
          isEdit={isEdit}
          compact
          createIcon={<GitBranch className="w-3.5 h-3.5 mr-1.5 shrink-0" />}
        />
      }
      footerCompact
      maxWidthClass={maxWidthClass ?? DRAWER_WIDTH_FORM}
      stackLevel={stackLevel}
    >
      <form id="bom-form" onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-5">
        <FormSection title={txt('bom.form.generalInfo')} icon={<GitBranch size={14} />}>
          {showPairLockHint ? (
            <p className="text-xs text-muted-foreground mb-2 px-0.5">{txt('bom.form.pairLocked')}</p>
          ) : null}
          <FormGrid cols={2}>
            <Controller
              name="danh_muc_id"
              control={control}
              render={({ field }) => (
                <CategoryLevel2GroupedSelect
                  categories={categories}
                  value={field.value}
                  onChange={field.onChange}
                  label={txt('bom.form.category')}
                  placeholder={txt('bom.form.categoryPlaceholder')}
                  required
                  disabled={lockCategoryField}
                  error={errors.danh_muc_id?.message}
                />
              )}
            />
            <Controller
              name="nguyen_lieu_id"
              control={control}
              render={({ field }) => (
                <MaterialLineSelect
                  materials={materials}
                  value={field.value}
                  onChange={field.onChange}
                  onMaterialPick={(m) => {
                    const currentDvt = watch('don_vi_tinh');
                    if (!currentDvt?.trim()) {
                      setValue('don_vi_tinh', m.don_vi_tinh ?? '');
                    }
                  }}
                  label={txt('bom.form.material')}
                  placeholder={txt('bom.form.materialPlaceholder')}
                  disabled={lockMaterialField}
                  error={errors.nguyen_lieu_id?.message}
                />
              )}
            />
            <Controller
              name="so_luong"
              control={control}
              render={({ field }) => (
                <NumericFormatInput
                  label={txt('bom.form.quantity')}
                  required
                  error={errors.so_luong?.message}
                  value={field.value}
                  onChange={field.onChange}
                  decimalScale={4}
                  min={0.0001}
                />
              )}
            />
            <Input
              label={txt('bom.form.unit')}
              error={errors.don_vi_tinh?.message}
              {...register('don_vi_tinh')}
            />
            <Input
              type="number"
              min={0}
              label={txt('bom.form.sortOrder')}
              {...register('thu_tu', { valueAsNumber: true })}
            />
            <Controller
              name="trang_thai"
              control={control}
              render={({ field }) => (
                <StatusToggle
                  label={txt('bom.form.status')}
                  icon={Power}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <div className="sm:col-span-2">
              <Textarea
                label={txt('bom.form.lineNote')}
                rows={2}
                {...register('ghi_chu')}
              />
            </div>
          </FormGrid>
        </FormSection>
      </form>
    </GenericDrawer>
  );
};

export default BomForm;
