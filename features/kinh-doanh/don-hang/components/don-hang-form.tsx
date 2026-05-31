import React, { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { txt } from '@/lib/text';
import { toast } from 'sonner';
import { useForm, Controller, SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShoppingCart, Calendar, MapPin, FileText, Building2, Power } from 'lucide-react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Combobox from '@/components/ui/Combobox';
import { salesOrderHeaderSchema, type SalesOrderHeaderFormValues } from '../core/schema';
import type { SalesOrder } from '../core/types';
import { TRANG_THAI_DON_HANG_OPTIONS, canEditOrderCode } from '../core/constants';
import { useUpsertSalesOrder } from '../hooks/use-don-hang';
import { usePartnerList } from '@/features/kinh-doanh/doi-tac/hooks/use-doi-tac-list';
import { useBranches } from '@/features/he-thong/chi-nhanh/hooks/use-chi-nhanh';
import { useProductCategories } from '@/features/san-xuat/danh-muc-hang-hoa/hooks/use-danh-muc-hang-hoa';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import GenericDrawer from '@/components/shared/GenericDrawer';
import { DRAWER_WIDTH_FORM, getDrawerWidthClass } from '@/lib/dialog-sizes';
import FormDrawerFooter from '@/components/shared/FormDrawerFooter';
import FormSection from '@/components/shared/FormSection';
import FormGrid, { FORM_GRID_SPAN_FULL } from '@/components/shared/FormGrid';
import CustomerSelect from './customer-select';
import OrderFormLinesSection from './order-form-lines-section';
import {
  lineRowsToFormLines,
  salesOrderLinesToDraftRows,
  type OrderLineRow,
} from '../utils/order-form-mapper';

const DonHangLineForm = lazy(() => import('./don-hang-line-form'));

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

const DEFAULT_VALUES: SalesOrderHeaderFormValues = {
  ma_don_hang: '',
  khach_hang_id: '',
  chi_nhanh_id: '',
  ngay_dat: todayIsoDate(),
  ngay_giao_du_kien: '',
  dia_chi_giao: '',
  ghi_chu: '',
  trang_thai: 'Nháp',
};

type LineFormState = { mode: 'add' } | { mode: 'edit'; clientId: string } | null;

interface Props {
  initialData?: SalesOrder | null;
  presetKhachHangId?: string;
  onClose: () => void;
  onSaved?: (saved: SalesOrder) => void;
  maxWidthClass?: string;
  stackLevel?: number;
}

const DonHangForm: React.FC<Props> = ({
  initialData,
  presetKhachHangId,
  onClose,
  onSaved,
  maxWidthClass,
  stackLevel = 0,
}) => {
  const isEdit = !!initialData;
  const sessionReady = useSupabaseReady();
  const upsertMutation = useUpsertSalesOrder((saved) => {
    onSaved?.(saved);
    onClose();
  });
  const { data: customers = [] } = usePartnerList('khach_hang', { enabled: sessionReady });
  const { data: branches = [] } = useBranches({ enabled: sessionReady });
  const { data: categories = [] } = useProductCategories({ enabled: sessionReady });

  const [draftLines, setDraftLines] = useState<OrderLineRow[]>(() =>
    initialData?.lines?.length ? salesOrderLinesToDraftRows(initialData.lines) : [],
  );
  const [lineForm, setLineForm] = useState<LineFormState>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
    setValue,
    getValues,
  } = useForm<SalesOrderHeaderFormValues>({
    resolver: zodResolver(salesOrderHeaderSchema) as Resolver<SalesOrderHeaderFormValues>,
    defaultValues: DEFAULT_VALUES,
  });

  const trangThai = watch('trang_thai');
  const codeEditable = canEditOrderCode(trangThai);
  const orderLabel = watch('ma_don_hang')?.trim() || initialData?.ma_don_hang || '';

  useEffect(() => {
    if (initialData) {
      reset({
        ma_don_hang: initialData.ma_don_hang,
        khach_hang_id: initialData.khach_hang_id,
        chi_nhanh_id: initialData.chi_nhanh_id ?? '',
        ngay_dat: initialData.ngay_dat,
        ngay_giao_du_kien: initialData.ngay_giao_du_kien ?? '',
        dia_chi_giao: initialData.dia_chi_giao ?? '',
        ghi_chu: initialData.ghi_chu ?? '',
        trang_thai: initialData.trang_thai,
      });
      setDraftLines(
        initialData.lines?.length ? salesOrderLinesToDraftRows(initialData.lines) : [],
      );
    } else {
      reset({
        ...DEFAULT_VALUES,
        khach_hang_id: presetKhachHangId?.trim() ?? '',
        ngay_dat: todayIsoDate(),
      });
      setDraftLines([]);
    }
    setLineForm(null);
  }, [initialData, presetKhachHangId, reset]);

  useEffect(() => {
    if (isEdit || !presetKhachHangId?.trim()) return;
    const c = customers.find((x) => x.id === presetKhachHangId);
    if (c?.dia_chi && !getValues('dia_chi_giao')?.trim()) {
      setValue('dia_chi_giao', c.dia_chi);
    }
  }, [presetKhachHangId, customers, isEdit, setValue, getValues]);

  const branchOptions = branches.map((b) => ({
    value: b.id,
    label: b.ten_chi_nhanh,
    subLabel: b.ma_chi_nhanh ?? undefined,
  }));

  const editingDraftLine = useMemo(() => {
    if (lineForm?.mode !== 'edit') return null;
    return draftLines.find((ln) => ln.clientId === lineForm.clientId) ?? null;
  }, [lineForm, draftLines]);

  const onSubmit: SubmitHandler<SalesOrderHeaderFormValues> = (data) => {
    const payload = {
      ...data,
      ma_don_hang: data.ma_don_hang?.trim() || null,
      chi_nhanh_id: data.chi_nhanh_id?.trim() || null,
      ngay_giao_du_kien: data.ngay_giao_du_kien?.trim() || null,
      lines: lineRowsToFormLines(draftLines),
    };
    upsertMutation.mutate({
      id: initialData?.id,
      data: payload,
    });
  };

  const onInvalid = () => {
    toast.error(txt('salesOrder.form.validationError'));
  };

  const handleDraftSave = (line: OrderLineRow) => {
    setDraftLines((prev) => {
      const idx = prev.findIndex((ln) => ln.clientId === line.clientId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...line, thu_tu: idx + 1 };
        return next;
      }
      return [...prev, { ...line, thu_tu: prev.length + 1 }];
    });
  };

  const handleDeleteLine = (clientId: string) => {
    setDraftLines((prev) =>
      prev.filter((ln) => ln.clientId !== clientId).map((ln, i) => ({ ...ln, thu_tu: i + 1 })),
    );
  };

  const drawerWidth =
    maxWidthClass ?? (stackLevel > 0 ? getDrawerWidthClass(stackLevel) : DRAWER_WIDTH_FORM);

  return (
    <>
      <GenericDrawer
        title={isEdit ? txt('salesOrder.form.editTitle') : txt('salesOrder.form.createTitle')}
        subtitle={
          isEdit
            ? txt('salesOrder.form.editSubtitle', { code: initialData?.ma_don_hang ?? '' })
            : txt('salesOrder.form.createSubtitle')
        }
        icon={<ShoppingCart size={20} />}
        onClose={onClose}
        maxWidthClass={drawerWidth}
        stackLevel={stackLevel}
        footer={
          <FormDrawerFooter
            formId="don-hang-form"
            onCancel={onClose}
            isLoading={upsertMutation.isPending}
            isEdit={isEdit}
            compact
            createIcon={<ShoppingCart className="w-3.5 h-3.5 mr-1.5 shrink-0" />}
          />
        }
        footerCompact
      >
        <form
          id="don-hang-form"
          className="space-y-5"
          onSubmit={handleSubmit(onSubmit, onInvalid)}
        >
          <FormSection
            title={txt('salesOrder.detail.orderInfo')}
            icon={<ShoppingCart size={14} />}
            variant="primary"
          >
            <FormGrid cols={2}>
              <Input
                label={txt('salesOrder.store.codeCol')}
                icon={<ShoppingCart size={12} />}
                {...register('ma_don_hang')}
                placeholder={txt('salesOrder.form.codePlaceholder')}
                error={errors.ma_don_hang?.message}
                disabled={!codeEditable && isEdit}
              />
              <Controller
                name="khach_hang_id"
                control={control}
                render={({ field }) => (
                  <CustomerSelect
                    customers={customers}
                    value={field.value}
                    onChange={field.onChange}
                    onCustomerPick={(c) => {
                      if (!getValues('dia_chi_giao')?.trim() && c.dia_chi) {
                        setValue('dia_chi_giao', c.dia_chi ?? '');
                      }
                    }}
                    label={txt('salesOrder.form.customer')}
                    placeholder={txt('salesOrder.form.customerPlaceholder')}
                    error={errors.khach_hang_id?.message}
                    required
                    disabled={Boolean(presetKhachHangId?.trim()) && !isEdit}
                  />
                )}
              />
              <Input
                label={txt('salesOrder.form.orderDate')}
                type="date"
                icon={<Calendar size={12} />}
                {...register('ngay_dat')}
                error={errors.ngay_dat?.message}
                required
              />
              <Input
                label={txt('salesOrder.form.deliveryDate')}
                type="date"
                icon={<Calendar size={12} />}
                {...register('ngay_giao_du_kien')}
              />
              <Controller
                name="chi_nhanh_id"
                control={control}
                render={({ field }) => (
                  <Combobox
                    label={txt('salesOrder.form.branch')}
                    icon={Building2}
                    options={[
                      { value: '', label: txt('salesOrder.form.branchNone') },
                      ...branchOptions,
                    ]}
                    value={field.value ?? ''}
                    onChange={(v) => field.onChange(String(v ?? ''))}
                    searchable
                    clearable
                    dropdownInPortal
                  />
                )}
              />
              <Controller
                name="trang_thai"
                control={control}
                render={({ field }) => (
                  <Combobox
                    label={txt('common.status')}
                    icon={Power}
                    options={TRANG_THAI_DON_HANG_OPTIONS.map((o) => ({
                      value: o.value,
                      label: o.label,
                    }))}
                    value={field.value}
                    onChange={(v) => field.onChange(String(v))}
                    dropdownInPortal
                  />
                )}
              />
              <div className={FORM_GRID_SPAN_FULL}>
                <Input
                  label={txt('salesOrder.form.deliveryAddress')}
                  icon={<MapPin size={12} />}
                  {...register('dia_chi_giao')}
                />
              </div>
              <div className={FORM_GRID_SPAN_FULL}>
                <Textarea
                  label={txt('salesOrder.form.note')}
                  icon={<FileText size={12} />}
                  {...register('ghi_chu')}
                  rows={2}
                />
              </div>
            </FormGrid>
          </FormSection>

          <OrderFormLinesSection
            lines={draftLines}
            categories={categories}
            onAdd={() => setLineForm({ mode: 'add' })}
            onEdit={(clientId) => setLineForm({ mode: 'edit', clientId })}
            onDelete={handleDeleteLine}
          />
        </form>
      </GenericDrawer>

      {lineForm ? (
        <Suspense fallback={null}>
          <DonHangLineForm
            draftMode
            orderLabel={orderLabel}
            lineCount={draftLines.length}
            initialDraftLine={lineForm.mode === 'edit' ? editingDraftLine : null}
            onDraftSave={handleDraftSave}
            onClose={() => setLineForm(null)}
            stackLevel={stackLevel + 1}
          />
        </Suspense>
      ) : null}
    </>
  );
};

export default DonHangForm;
