import React, { useEffect } from 'react';
import { txt } from '../../../../lib/text';
import { toast } from 'sonner';
import { useForm, Controller, SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPinned, Hash, Phone, Mail, FileText, Power, ArrowUpFromLine } from 'lucide-react';
import Input from '../../../../components/ui/Input';
import Textarea from '../../../../components/ui/Textarea';
import StatusToggle from '../../../../components/ui/StatusToggle';
import { BranchFormValues, branchSchema } from '../core/schema';
import { Branch } from '../core/types';
import { useCreateBranch, useUpdateBranch } from '../hooks/use-chi-nhanh';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import GenericDrawer, { DRAWER_WIDTH_FORM } from '../../../../components/shared/GenericDrawer';
import FormDrawerFooter from '../../../../components/shared/FormDrawerFooter';
import FormSection from '../../../../components/shared/FormSection';
import FormGrid from '../../../../components/shared/FormGrid';
import { TRANG_THAI_HOAT_DONG, normalizeTrangThaiHoatDong } from '@/lib/constants/trang-thai';

const DEFAULT_VALUES: BranchFormValues = {
  ten_chi_nhanh: '',
  ma_chi_nhanh: null,
  dia_chi: null,
  dien_thoai: null,
  email: null,
  mo_ta: null,
  thu_tu: 1,
  trang_thai: 'Đang hoạt động',
};

interface Props {
  initialData?: Branch | null;
  onClose: () => void;
}

const BranchForm: React.FC<Props> = ({ initialData, onClose }) => {
  const isEdit = !!initialData;
  const sessionReady = useSupabaseReady();
  const createMutation = useCreateBranch(onClose);
  const updateMutation = useUpdateBranch(onClose);

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema) as Resolver<BranchFormValues>,
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ten_chi_nhanh: initialData.ten_chi_nhanh,
        ma_chi_nhanh: initialData.ma_chi_nhanh,
        dia_chi: initialData.dia_chi,
        dien_thoai: initialData.dien_thoai,
        email: initialData.email,
        mo_ta: initialData.mo_ta,
        thu_tu: initialData.thu_tu ?? 0,
        trang_thai: normalizeTrangThaiHoatDong(initialData.trang_thai),
      });
    } else {
      reset(DEFAULT_VALUES);
    }
  }, [initialData, reset]);

  const onSubmit: SubmitHandler<BranchFormValues> = (data) => {
    if (isEdit && initialData) {
      updateMutation.mutate({ id: initialData.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const onInvalid = () => {
    toast.error(txt('branch.form.validationError'));
  };

  const isPending = !sessionReady || createMutation.isPending || updateMutation.isPending;

  return (
    <GenericDrawer
      title={isEdit ? txt('branch.form.editTitle') : txt('branch.form.createTitle')}
      subtitle={isEdit ? txt('branch.form.editSubtitle') : txt('branch.form.createSubtitle')}
      icon={<MapPinned size={18} />}
      onClose={onClose}
      footer={
        <FormDrawerFooter
          formId="branch-form"
          onCancel={onClose}
          isLoading={isPending}
          isEdit={isEdit}
          compact
          createIcon={<MapPinned className="w-3.5 h-3.5 mr-1.5 shrink-0" />}
        />
      }
      footerCompact
      maxWidthClass={DRAWER_WIDTH_FORM}
    >
      <form id="branch-form" onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-5">
        <FormSection title={txt('branch.form.generalInfo')} icon={<MapPinned size={14} />}>
          <FormGrid cols={2}>
            <Input
              label={txt('branch.form.name')}
              placeholder={txt('branch.form.namePlaceholder')}
              icon={MapPinned}
              error={errors.ten_chi_nhanh?.message}
              required
              {...register('ten_chi_nhanh')}
            />
            <Input
              label={txt('branch.form.code')}
              placeholder={txt('branch.form.codePlaceholder')}
              icon={Hash}
              error={errors.ma_chi_nhanh?.message}
              {...register('ma_chi_nhanh')}
            />
            <Input
              label={txt('branch.form.order')}
              type="number"
              min={0}
              icon={ArrowUpFromLine}
              error={errors.thu_tu?.message}
              {...register('thu_tu', { valueAsNumber: true })}
            />
            <Controller
              name="trang_thai"
              control={control}
              render={({ field }) => (
                <StatusToggle
                  label={txt('branch.form.status')}
                  icon={Power}
                  value={field.value}
                  onChange={field.onChange}
                  activeLabel={TRANG_THAI_HOAT_DONG[1]}
                  inactiveLabel={TRANG_THAI_HOAT_DONG[0]}
                  error={errors.trang_thai?.message}
                />
              )}
            />
          </FormGrid>
        </FormSection>

        <FormSection title={txt('branch.form.contactInfo')} icon={<Phone size={14} />}>
          <FormGrid cols={1}>
            <Input
              label={txt('branch.form.address')}
              placeholder={txt('branch.form.addressPlaceholder')}
              icon={MapPinned}
              error={errors.dia_chi?.message}
              {...register('dia_chi')}
            />
            <FormGrid cols={2}>
              <Input
                label={txt('branch.form.phone')}
                placeholder={txt('branch.form.phonePlaceholder')}
                icon={Phone}
                error={errors.dien_thoai?.message}
                {...register('dien_thoai')}
              />
              <Input
                label={txt('branch.form.email')}
                placeholder={txt('branch.form.emailPlaceholder')}
                icon={Mail}
                error={errors.email?.message}
                {...register('email')}
              />
            </FormGrid>
            <Textarea
              label={txt('branch.form.description')}
              placeholder={txt('branch.form.descriptionPlaceholder')}
              icon={FileText}
              error={errors.mo_ta?.message}
              rows={3}
              {...register('mo_ta')}
            />
          </FormGrid>
        </FormSection>
      </form>
    </GenericDrawer>
  );
};

export default BranchForm;
