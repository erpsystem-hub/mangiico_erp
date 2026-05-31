import React, { useEffect } from 'react';
import { txt } from '@/lib/text';
import { toast } from 'sonner';
import { useForm, Controller, SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FlaskConical, Hash, Type, FileText, Power } from 'lucide-react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import StatusToggle from '@/components/ui/StatusToggle';
import { materialCatalogSchema, type MaterialCatalogFormValues } from '../core/schema';
import type { MaterialCatalogItem } from '../core/types';
import {
  useCreateMaterialCatalogItem,
  useUpdateMaterialCatalogItem,
  useMaterialCatalogList,
} from '../hooks/use-danh-sach-nguyen-lieu';
import { useMaterialCategories } from '@/features/san-xuat/danh-muc-nguyen-lieu/hooks/use-danh-muc-nguyen-lieu';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import GenericDrawer, { DRAWER_WIDTH_FORM } from '@/components/shared/GenericDrawer';
import FormDrawerFooter from '@/components/shared/FormDrawerFooter';
import FormSection from '@/components/shared/FormSection';
import FormGrid from '@/components/shared/FormGrid';
import { normalizeTrangThaiHoatDong } from '@/lib/constants/trang-thai';
import CategoryLevel2GroupedSelect from './category-level2-grouped-select';
import {
  MaterialSpecFieldsFormSection,
  useMaterialSpecComboboxOptions,
} from './material-spec-fields-section';

const DEFAULT_VALUES: MaterialCatalogFormValues = {
  ma_nguyen_lieu: '',
  ten_nguyen_lieu: '',
  danh_muc_id: '',
  don_vi_tinh: '',
  mau_sac: '',
  thanh_phan: '',
  kho_vai: '',
  dinh_luong_gsm: null,
  xuat_xu: '',
  mo_ta: '',
  trang_thai: 'Đang hoạt động',
};

interface Props {
  initialData?: MaterialCatalogItem | null;
  /** Danh mục cấp 2 mặc định khi tạo mới (từ Danh mục NL) */
  defaultDanhMucId?: string;
  onClose: () => void;
  maxWidthClass?: string;
  stackLevel?: number;
}

const MaterialCatalogForm: React.FC<Props> = ({
  initialData,
  defaultDanhMucId,
  onClose,
  maxWidthClass,
  stackLevel = 0,
}) => {
  const isEdit = !!initialData;
  const sessionReady = useSupabaseReady();
  const createMutation = useCreateMaterialCatalogItem(onClose);
  const updateMutation = useUpdateMaterialCatalogItem(onClose);
  const { data: categories = [] } = useMaterialCategories({ enabled: sessionReady });
  const { data: catalogItems = [] } = useMaterialCatalogList({ enabled: sessionReady });

  const { register, handleSubmit, formState: { errors }, reset, control, watch } =
    useForm<MaterialCatalogFormValues>({
      resolver: zodResolver(materialCatalogSchema) as Resolver<MaterialCatalogFormValues>,
      defaultValues: DEFAULT_VALUES,
    });

  const danhMucId = watch('danh_muc_id');
  const donViTinh = watch('don_vi_tinh');
  const mauSac = watch('mau_sac');
  const thanhPhan = watch('thanh_phan');
  const khoVai = watch('kho_vai');
  const dinhLuongGsm = watch('dinh_luong_gsm');
  const xuatXu = watch('xuat_xu');
  const specOptions = useMaterialSpecComboboxOptions(catalogItems, {
    don_vi_tinh: donViTinh,
    mau_sac: mauSac,
    thanh_phan: thanhPhan,
    kho_vai: khoVai,
    dinh_luong_gsm: dinhLuongGsm,
    xuat_xu: xuatXu,
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ma_nguyen_lieu: initialData.ma_nguyen_lieu,
        ten_nguyen_lieu: initialData.ten_nguyen_lieu,
        danh_muc_id: initialData.danh_muc_id,
        don_vi_tinh: initialData.don_vi_tinh ?? '',
        mau_sac: initialData.mau_sac ?? '',
        thanh_phan: initialData.thanh_phan ?? '',
        kho_vai: initialData.kho_vai ?? '',
        dinh_luong_gsm: initialData.dinh_luong_gsm,
        xuat_xu: initialData.xuat_xu ?? '',
        mo_ta: initialData.mo_ta ?? '',
        trang_thai: normalizeTrangThaiHoatDong(initialData.trang_thai),
      });
    } else {
      reset({
        ...DEFAULT_VALUES,
        danh_muc_id: defaultDanhMucId?.trim() ?? '',
      });
    }
  }, [initialData, defaultDanhMucId, reset]);

  const onSubmit: SubmitHandler<MaterialCatalogFormValues> = (data) => {
    if (isEdit && initialData) {
      updateMutation.mutate({ id: initialData.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const onInvalid = () => {
    toast.error(txt('materialCatalog.form.validationError'));
  };

  const isPending = !sessionReady || createMutation.isPending || updateMutation.isPending;

  return (
    <GenericDrawer
      title={isEdit ? txt('materialCatalog.form.editTitle') : txt('materialCatalog.form.createTitle')}
      subtitle={
        isEdit ? txt('materialCatalog.form.editSubtitle') : txt('materialCatalog.form.createSubtitle')
      }
      icon={<FlaskConical size={18} />}
      onClose={onClose}
      footer={
        <FormDrawerFooter
          formId="material-catalog-form"
          onCancel={onClose}
          isLoading={isPending}
          isEdit={isEdit}
          compact
          createIcon={<FlaskConical className="w-3.5 h-3.5 mr-1.5 shrink-0" />}
        />
      }
      footerCompact
      maxWidthClass={maxWidthClass ?? DRAWER_WIDTH_FORM}
      stackLevel={stackLevel}
    >
      <form
        id="material-catalog-form"
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="space-y-5"
      >
        <FormSection title={txt('materialCatalog.form.generalInfo')} icon={<FlaskConical size={14} />}>
          <FormGrid cols={2}>
            <Input
              label={txt('materialCatalog.form.code')}
              placeholder={txt('materialCatalog.form.codePlaceholder')}
              icon={Hash}
              required
              error={errors.ma_nguyen_lieu?.message}
              {...register('ma_nguyen_lieu')}
            />
            <Input
              label={txt('materialCatalog.form.name')}
              placeholder={txt('materialCatalog.form.namePlaceholder')}
              icon={Type}
              required
              error={errors.ten_nguyen_lieu?.message}
              {...register('ten_nguyen_lieu')}
            />
            <Controller
              name="danh_muc_id"
              control={control}
              render={({ field }) => (
                <CategoryLevel2GroupedSelect
                  categories={categories}
                  value={field.value}
                  onChange={field.onChange}
                  label={txt('materialCatalog.form.category')}
                  placeholder={txt('materialCatalog.form.categoryPlaceholder')}
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
                  label={txt('materialCatalog.form.status')}
                  icon={Power}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <div className="sm:col-span-2">
              <Textarea
                label={txt('materialCatalog.form.description')}
                placeholder={txt('materialCatalog.form.descriptionPlaceholder')}
                icon={FileText}
                rows={2}
                {...register('mo_ta')}
              />
            </div>
          </FormGrid>
        </FormSection>

        {!danhMucId?.trim() ? (
          <p className="text-sm text-muted-foreground px-1">
            {txt('materialCatalog.form.selectCategoryFirst')}
          </p>
        ) : (
          <MaterialSpecFieldsFormSection
            control={control}
            errors={errors}
            specOptions={specOptions}
          />
        )}
      </form>
    </GenericDrawer>
  );
};

export default MaterialCatalogForm;
