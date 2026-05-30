import React, { useEffect, useMemo } from 'react';
import { txt } from '@/lib/text';
import { toast } from 'sonner';
import { useForm, Controller, SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Landmark, MapPinned, Building2, CreditCard, User, Wallet, Power } from 'lucide-react';
import Input from '@/components/ui/Input';
import Combobox from '@/components/ui/Combobox';
import StatusToggle from '@/components/ui/StatusToggle';
import { FinanceAccountFormValues, financeAccountSchema } from '../core/schema';
import type { FinanceAccount } from '../core/types';
import { LOAI_QUY_VALUES, VN_BANKS } from '../core/constants';
import {
  useCreateFinanceAccount,
  useUpdateFinanceAccount,
} from '../hooks/use-tai-khoan';
import { useBranches } from '@/features/he-thong/chi-nhanh/hooks/use-chi-nhanh';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import GenericDrawer, { DRAWER_WIDTH_FORM } from '@/components/shared/GenericDrawer';
import FormDrawerFooter from '@/components/shared/FormDrawerFooter';
import FormSection from '@/components/shared/FormSection';
import FormGrid from '@/components/shared/FormGrid';
import { normalizeTrangThaiHoatDong } from '@/lib/constants/trang-thai';
import VietQrPreview from './vietqr-preview';

const DEFAULT_VALUES: FinanceAccountFormValues = {
  ten_quy: '',
  loai_quy: 'Tiền mặt',
  chi_nhanh_id: '',
  ngan_hang: null,
  ma_ngan_hang_bin: null,
  so_tai_khoan: null,
  chu_tai_khoan: null,
  so_du_khoi_dau: 0,
  trang_thai: 'Đang hoạt động',
};

interface Props {
  initialData?: FinanceAccount | null;
  onClose: () => void;
}

const FinanceAccountForm: React.FC<Props> = ({ initialData, onClose }) => {
  const isEdit = !!initialData;
  const sessionReady = useSupabaseReady();
  const { data: branches = [] } = useBranches();
  const createMutation = useCreateFinanceAccount(onClose);
  const updateMutation = useUpdateFinanceAccount(onClose);

  const { register, handleSubmit, formState: { errors }, reset, control, watch, setValue } =
    useForm<FinanceAccountFormValues>({
      resolver: zodResolver(financeAccountSchema) as Resolver<FinanceAccountFormValues>,
      defaultValues: DEFAULT_VALUES,
    });

  const loaiQuy = watch('loai_quy');
  const watchBin = watch('ma_ngan_hang_bin');
  const watchStk = watch('so_tai_khoan');
  const watchChu = watch('chu_tai_khoan');

  const branchOptions = useMemo(() => {
    const active = branches
      .filter((b) => b.trang_thai === 'Đang hoạt động')
      .map((b) => ({ label: b.ten_chi_nhanh, value: b.id, subLabel: b.ma_chi_nhanh ?? undefined }));
    const selectedId = initialData?.chi_nhanh_id;
    if (selectedId && !active.some((o) => o.value === selectedId)) {
      const sel = branches.find((b) => b.id === selectedId);
      if (sel) {
        active.unshift({
          label: sel.ten_chi_nhanh,
          value: sel.id,
          subLabel: sel.ma_chi_nhanh ?? undefined,
        });
      }
    }
    return active;
  }, [branches, initialData?.chi_nhanh_id]);

  const bankOptions = useMemo(
    () => VN_BANKS.map((b) => ({ label: b.name, value: b.bin, subLabel: b.code })),
    [],
  );

  const loaiOptions = useMemo(
    () =>
      LOAI_QUY_VALUES.map((v) => ({
        label: v === 'Tiền mặt' ? txt('financeAccount.fundTypeCash') : txt('financeAccount.fundTypeBank'),
        value: v,
      })),
    [],
  );

  useEffect(() => {
    if (initialData) {
      reset({
        ten_quy: initialData.ten_quy,
        loai_quy: initialData.loai_quy,
        chi_nhanh_id: initialData.chi_nhanh_id ?? '',
        ngan_hang: initialData.ngan_hang,
        ma_ngan_hang_bin: initialData.ma_ngan_hang_bin,
        so_tai_khoan: initialData.so_tai_khoan,
        chu_tai_khoan: initialData.chu_tai_khoan,
        so_du_khoi_dau: initialData.so_du_khoi_dau,
        trang_thai: normalizeTrangThaiHoatDong(initialData.trang_thai),
      });
    } else {
      reset(DEFAULT_VALUES);
    }
  }, [initialData, reset]);

  const onSubmit: SubmitHandler<FinanceAccountFormValues> = (data) => {
    if (isEdit && initialData) {
      updateMutation.mutate({ id: initialData.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const onInvalid = () => {
    toast.error(txt('financeAccount.form.validationError'));
  };

  const isPending = !sessionReady || createMutation.isPending || updateMutation.isPending;
  const isBank = loaiQuy === 'Ngân hàng';

  return (
    <GenericDrawer
      title={isEdit ? txt('financeAccount.form.editTitle') : txt('financeAccount.form.createTitle')}
      subtitle={
        isEdit ? txt('financeAccount.form.editSubtitle') : txt('financeAccount.form.createSubtitle')
      }
      icon={<Landmark size={18} />}
      onClose={onClose}
      footer={
        <FormDrawerFooter
          formId="finance-account-form"
          onCancel={onClose}
          isLoading={isPending}
          isEdit={isEdit}
          compact
          createIcon={<Landmark className="w-3.5 h-3.5 mr-1.5 shrink-0" />}
        />
      }
      footerCompact
      maxWidthClass={DRAWER_WIDTH_FORM}
    >
      <form
        id="finance-account-form"
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="space-y-5"
      >
        <FormSection title={txt('financeAccount.form.generalInfo')} icon={<Landmark size={14} />}>
          <FormGrid cols={2}>
            <Input
              label={txt('financeAccount.form.name')}
              placeholder={txt('financeAccount.form.namePlaceholder')}
              icon={Landmark}
              required
              error={errors.ten_quy?.message}
              {...register('ten_quy')}
            />
            <Controller
              name="loai_quy"
              control={control}
              render={({ field }) => (
                <Combobox
                  label={txt('financeAccount.form.fundType')}
                  options={loaiOptions}
                  value={field.value}
                  onChange={(v) => {
                    const next = v === 'Ngân hàng' ? 'Ngân hàng' : 'Tiền mặt';
                    field.onChange(next);
                    if (next === 'Tiền mặt') {
                      setValue('ngan_hang', null);
                      setValue('ma_ngan_hang_bin', null);
                      setValue('so_tai_khoan', null);
                      setValue('chu_tai_khoan', null);
                    }
                  }}
                  icon={Wallet}
                  required
                  clearable={false}
                  error={errors.loai_quy?.message}
                />
              )}
            />
            <Controller
              name="chi_nhanh_id"
              control={control}
              render={({ field }) => (
                <div className="sm:col-span-2">
                  <Combobox
                    label={txt('financeAccount.form.branch')}
                    placeholder={txt('financeAccount.form.branchPlaceholder')}
                    options={branchOptions}
                    value={field.value}
                    onChange={(v) => field.onChange(String(v))}
                    icon={MapPinned}
                    required
                    searchable
                    error={errors.chi_nhanh_id?.message}
                  />
                </div>
              )}
            />
            <Input
              label={txt('financeAccount.form.openingBalance')}
              type="number"
              min={0}
              step="1000"
              icon={Wallet}
              error={errors.so_du_khoi_dau?.message}
              {...register('so_du_khoi_dau')}
            />
            <Controller
              name="trang_thai"
              control={control}
              render={({ field }) => (
                <StatusToggle
                  label={txt('financeAccount.form.status')}
                  icon={Power}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </FormGrid>
        </FormSection>

        {isBank && (
          <FormSection title={txt('financeAccount.form.bankInfo')} icon={<Building2 size={14} />}>
            <FormGrid cols={2}>
              <Controller
                name="ma_ngan_hang_bin"
                control={control}
                render={({ field }) => (
                  <div className="sm:col-span-2">
                    <Combobox
                      label={txt('financeAccount.form.bank')}
                      placeholder={txt('financeAccount.form.bankPlaceholder')}
                      options={bankOptions}
                      value={field.value ?? ''}
                      onChange={(v) => {
                        const bin = String(v);
                        field.onChange(bin || null);
                        const bank = VN_BANKS.find((b) => b.bin === bin);
                        setValue('ngan_hang', bank?.name ?? null);
                      }}
                      icon={Building2}
                      required
                      searchable
                      error={errors.ma_ngan_hang_bin?.message}
                    />
                  </div>
                )}
              />
              <Input
                label={txt('financeAccount.form.accountNumber')}
                placeholder={txt('financeAccount.form.accountNumberPlaceholder')}
                icon={CreditCard}
                required
                error={errors.so_tai_khoan?.message}
                {...register('so_tai_khoan')}
              />
              <Input
                label={txt('financeAccount.form.accountHolder')}
                placeholder={txt('financeAccount.form.accountHolderPlaceholder')}
                icon={User}
                required
                error={errors.chu_tai_khoan?.message}
                {...register('chu_tai_khoan')}
              />
            </FormGrid>
            <VietQrPreview
              className="mt-4"
              loai_quy={loaiQuy}
              ma_ngan_hang_bin={watchBin}
              so_tai_khoan={watchStk}
              chu_tai_khoan={watchChu}
            />
          </FormSection>
        )}
      </form>
    </GenericDrawer>
  );
};

export default FinanceAccountForm;
