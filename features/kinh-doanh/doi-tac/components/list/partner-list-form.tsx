import React, { useEffect } from 'react';
import { txt } from '@/lib/text';
import { toast } from 'sonner';
import { useForm, Controller, SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users, Hash, Type, FileText, Power, Phone, Mail, MapPin, Receipt, User } from 'lucide-react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import StatusToggle from '@/components/ui/StatusToggle';
import { partnerListSchema, type PartnerListFormValues } from '../../core/schema';
import type { PartnerKind, PartnerListItem } from '../../core/types';
import {
  useCreatePartnerListItem,
  useUpdatePartnerListItem,
} from '../../hooks/use-doi-tac-list';
import { usePartnerCategories } from '../../hooks/use-doi-tac-category';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import GenericDrawer, { DRAWER_WIDTH_FORM } from '@/components/shared/GenericDrawer';
import FormDrawerFooter from '@/components/shared/FormDrawerFooter';
import FormSection from '@/components/shared/FormSection';
import FormGrid from '@/components/shared/FormGrid';
import { normalizeTrangThaiHoatDong } from '@/lib/constants/trang-thai';
import CategoryLevel2GroupedSelect from './category-level2-grouped-select';

const DEFAULT_VALUES: PartnerListFormValues = {
  ma_doi_tac: '',
  ten_doi_tac: '',
  danh_muc_id: '',
  dien_thoai: '',
  email: '',
  dia_chi: '',
  ma_so_thue: '',
  nguoi_lien_he: '',
  mo_ta: '',
  trang_thai: 'Đang hoạt động',
};

interface Props {
  kind: PartnerKind;
  initialData?: PartnerListItem | null;
  defaultDanhMucId?: string;
  onClose: () => void;
  maxWidthClass?: string;
  stackLevel?: number;
}

const PartnerListForm: React.FC<Props> = ({
  kind,
  initialData,
  defaultDanhMucId,
  onClose,
  maxWidthClass,
  stackLevel = 0,
}) => {
  const isEdit = !!initialData;
  const sessionReady = useSupabaseReady();
  const createMutation = useCreatePartnerListItem(kind, onClose);
  const updateMutation = useUpdatePartnerListItem(kind, onClose);
  const { data: categories = [] } = usePartnerCategories(kind, { enabled: sessionReady });

  const { register, handleSubmit, formState: { errors }, reset, control } =
    useForm<PartnerListFormValues>({
      resolver: zodResolver(partnerListSchema) as Resolver<PartnerListFormValues>,
      defaultValues: DEFAULT_VALUES,
    });

  useEffect(() => {
    if (initialData) {
      reset({
        ma_doi_tac: initialData.ma_doi_tac,
        ten_doi_tac: initialData.ten_doi_tac,
        danh_muc_id: initialData.danh_muc_id,
        dien_thoai: initialData.dien_thoai ?? '',
        email: initialData.email ?? '',
        dia_chi: initialData.dia_chi ?? '',
        ma_so_thue: initialData.ma_so_thue ?? '',
        nguoi_lien_he: initialData.nguoi_lien_he ?? '',
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

  const onSubmit: SubmitHandler<PartnerListFormValues> = (data) => {
    if (isEdit && initialData) {
      updateMutation.mutate({ id: initialData.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const onInvalid = () => {
    toast.error(txt('partnerList.form.validationError'));
  };

  const isPending = !sessionReady || createMutation.isPending || updateMutation.isPending;

  return (
    <GenericDrawer
      title={isEdit ? txt('partnerList.form.editTitle') : txt('partnerList.form.createTitle')}
      subtitle={
        isEdit ? txt('partnerList.form.editSubtitle') : txt('partnerList.form.createSubtitle')
      }
      icon={<Users size={18} />}
      onClose={onClose}
      footer={
        <FormDrawerFooter
          formId="partner-list-form"
          onCancel={onClose}
          isLoading={isPending}
          isEdit={isEdit}
          compact
          createIcon={<Users className="w-3.5 h-3.5 mr-1.5 shrink-0" />}
        />
      }
      footerCompact
      maxWidthClass={maxWidthClass ?? DRAWER_WIDTH_FORM}
      stackLevel={stackLevel}
    >
      <form
        id="partner-list-form"
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="space-y-5"
      >
        <FormSection title={txt('partnerList.form.generalInfo')} icon={<Users size={14} />}>
          <FormGrid cols={2}>
            <Input
              label={txt('partnerList.form.code')}
              placeholder={txt('partnerList.form.codePlaceholder')}
              icon={Hash}
              required
              error={errors.ma_doi_tac?.message}
              {...register('ma_doi_tac')}
            />
            <Input
              label={txt('partnerList.form.name')}
              placeholder={txt('partnerList.form.namePlaceholder')}
              icon={Type}
              required
              error={errors.ten_doi_tac?.message}
              {...register('ten_doi_tac')}
            />
            <Controller
              name="danh_muc_id"
              control={control}
              render={({ field }) => (
                <CategoryLevel2GroupedSelect
                  categories={categories}
                  value={field.value}
                  onChange={field.onChange}
                  label={txt('partnerList.form.category')}
                  placeholder={txt('partnerList.form.categoryPlaceholder')}
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
                  label={txt('partnerList.form.status')}
                  icon={Power}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <div className="sm:col-span-2">
              <Textarea
                label={txt('partnerList.form.description')}
                placeholder={txt('partnerList.form.descriptionPlaceholder')}
                icon={FileText}
                rows={2}
                {...register('mo_ta')}
              />
            </div>
          </FormGrid>
        </FormSection>

        <FormSection title={txt('partnerList.form.contactInfo')} icon={<Phone size={14} />}>
          <FormGrid cols={2}>
            <Input
              label={txt('partnerList.form.phone')}
              placeholder={txt('partnerList.form.phonePlaceholder')}
              icon={Phone}
              error={errors.dien_thoai?.message}
              {...register('dien_thoai')}
            />
            <Input
              label={txt('partnerList.form.email')}
              placeholder={txt('partnerList.form.emailPlaceholder')}
              icon={Mail}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label={txt('partnerList.form.contactPerson')}
              placeholder={txt('partnerList.form.contactPersonPlaceholder')}
              icon={User}
              {...register('nguoi_lien_he')}
            />
            <Input
              label={txt('partnerList.form.taxCode')}
              placeholder={txt('partnerList.form.taxCodePlaceholder')}
              icon={Receipt}
              {...register('ma_so_thue')}
            />
            <div className="sm:col-span-2">
              <Input
                label={txt('partnerList.form.address')}
                placeholder={txt('partnerList.form.addressPlaceholder')}
                icon={MapPin}
                {...register('dia_chi')}
              />
            </div>
          </FormGrid>
        </FormSection>
      </form>
    </GenericDrawer>
  );
};

export default PartnerListForm;
