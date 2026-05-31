import React, { useEffect, useState } from 'react';
import { txt } from '@/lib/text';
import { toast } from 'sonner';
import { useForm, Controller, SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShoppingCart, Calendar, MapPin, FileText } from 'lucide-react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Combobox from '@/components/ui/Combobox';
import { salesOrderSchema, type SalesOrderFormValues } from '../core/schema';
import type { SalesOrder } from '../core/types';
import { TRANG_THAI_DON_HANG_OPTIONS, canEditOrderCode } from '../core/constants';
import { useUpsertSalesOrder } from '../hooks/use-don-hang';
import { usePartnerList } from '@/features/kinh-doanh/doi-tac/hooks/use-doi-tac-list';
import { useBranches } from '@/features/he-thong/chi-nhanh/hooks/use-chi-nhanh';
import { useProductCatalogList } from '@/features/san-xuat/danh-sach-hang-hoa/hooks/use-danh-sach-hang-hoa';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import GenericDrawer from '@/components/shared/GenericDrawer';
import { DRAWER_WIDTH_WIDE, getDrawerWidthClass } from '@/lib/dialog-sizes';
import FormDrawerFooter from '@/components/shared/FormDrawerFooter';
import FormSection from '@/components/shared/FormSection';
import FormGrid, { FORM_GRID_SPAN_FULL } from '@/components/shared/FormGrid';
import CustomerSelect from './customer-select';
import OrderLinesEditor, { newLineRow, type OrderLineRow } from './order-lines-editor';
import { lineRowsToFormLines } from '../utils/order-form-mapper';

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function orderToLineRows(order?: SalesOrder | null): OrderLineRow[] {
  if (!order?.lines?.length) return [newLineRow(1)];
  return order.lines.map((ln, i) => ({
    clientId: ln.id || `line-${i}`,
    san_pham_id: ln.san_pham_id,
    so_luong: ln.so_luong,
    don_vi_tinh: ln.don_vi_tinh,
    don_gia: ln.don_gia,
    ghi_chu: ln.ghi_chu ?? '',
    thu_tu: ln.thu_tu ?? i + 1,
  }));
}

interface Props {
  initialData?: SalesOrder | null;
  presetKhachHangId?: string;
  onClose: () => void;
  maxWidthClass?: string;
  stackLevel?: number;
}

const DonHangForm: React.FC<Props> = ({
  initialData,
  presetKhachHangId,
  onClose,
  maxWidthClass,
  stackLevel = 0,
}) => {
  const isEdit = !!initialData;
  const sessionReady = useSupabaseReady();
  const upsertMutation = useUpsertSalesOrder(() => onClose());
  const { data: customers = [] } = usePartnerList('khach_hang', { enabled: sessionReady });
  const { data: branches = [] } = useBranches({ enabled: sessionReady });
  const { data: products = [] } = useProductCatalogList({ enabled: sessionReady });

  const [lineRows, setLineRows] = useState<OrderLineRow[]>(() => orderToLineRows(initialData));

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
    setValue,
    getValues,
  } = useForm<SalesOrderFormValues>({
    resolver: zodResolver(salesOrderSchema) as Resolver<SalesOrderFormValues>,
    defaultValues: {
      ma_don_hang: '',
      khach_hang_id: '',
      chi_nhanh_id: '',
      ngay_dat: todayIsoDate(),
      ngay_giao_du_kien: '',
      dia_chi_giao: '',
      ghi_chu: '',
      trang_thai: 'Nháp',
      lines: [lineRowsToFormLines([newLineRow(1)])[0]],
    },
  });

  const trangThai = watch('trang_thai');
  const codeEditable = canEditOrderCode(trangThai);

  useEffect(() => {
    if (initialData) {
      const rows = orderToLineRows(initialData);
      reset({
        ma_don_hang: initialData.ma_don_hang,
        khach_hang_id: initialData.khach_hang_id,
        chi_nhanh_id: initialData.chi_nhanh_id ?? '',
        ngay_dat: initialData.ngay_dat,
        ngay_giao_du_kien: initialData.ngay_giao_du_kien ?? '',
        dia_chi_giao: initialData.dia_chi_giao ?? '',
        ghi_chu: initialData.ghi_chu ?? '',
        trang_thai: initialData.trang_thai,
        lines: lineRowsToFormLines(rows),
      });
      setLineRows(rows);
    } else {
      const rows = [newLineRow(1)];
      reset({
        ma_don_hang: '',
        khach_hang_id: presetKhachHangId?.trim() ?? '',
        chi_nhanh_id: '',
        ngay_dat: todayIsoDate(),
        ngay_giao_du_kien: '',
        dia_chi_giao: '',
        ghi_chu: '',
        trang_thai: 'Nháp',
        lines: lineRowsToFormLines(rows),
      });
      setLineRows(rows);
    }
  }, [initialData, presetKhachHangId, reset]);

  useEffect(() => {
    setValue('lines', lineRowsToFormLines(lineRows), { shouldValidate: true });
  }, [lineRows, setValue]);

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

  const onSubmit: SubmitHandler<SalesOrderFormValues> = (data) => {
    const lines = lineRowsToFormLines(lineRows);
    const missingProduct = lines.some((ln) => !ln.san_pham_id?.trim());
    if (missingProduct) {
      toast.error(txt('salesOrder.validation.productRequired'));
      return;
    }
    const payload: SalesOrderFormValues = {
      ...data,
      ma_don_hang: data.ma_don_hang?.trim() || null,
      chi_nhanh_id: data.chi_nhanh_id?.trim() || null,
      ngay_giao_du_kien: data.ngay_giao_du_kien?.trim() || null,
      lines,
    };
    upsertMutation.mutate({
      id: initialData?.id,
      data: payload,
    });
  };

  const onInvalid = () => {
    toast.error(txt('salesOrder.form.validationError'));
  };

  const drawerWidth = maxWidthClass ?? (stackLevel > 0 ? getDrawerWidthClass(stackLevel) : DRAWER_WIDTH_WIDE);

  return (
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
        <FormSection title={txt('salesOrder.detail.orderInfo')} icon={<ShoppingCart size={14} />}>
          <FormGrid cols={2}>
            <Input
              label={txt('salesOrder.store.codeCol')}
              icon={ShoppingCart}
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
              icon={Calendar}
              {...register('ngay_dat')}
              error={errors.ngay_dat?.message}
              required
            />
            <Input
              label={txt('salesOrder.form.deliveryDate')}
              type="date"
              icon={Calendar}
              {...register('ngay_giao_du_kien')}
            />
            <Controller
              name="chi_nhanh_id"
              control={control}
              render={({ field }) => (
                <Combobox
                  label={txt('salesOrder.form.branch')}
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
                icon={MapPin}
                {...register('dia_chi_giao')}
              />
            </div>
            <div className={FORM_GRID_SPAN_FULL}>
              <Textarea
                label={txt('salesOrder.form.note')}
                icon={FileText}
                {...register('ghi_chu')}
                rows={2}
              />
            </div>
          </FormGrid>
        </FormSection>

        <OrderLinesEditor
          lines={lineRows}
          products={products}
          onChange={setLineRows}
          errors={errors.lines ? { lines: { message: errors.lines.message } } : undefined}
        />
      </form>
    </GenericDrawer>
  );
};

export default DonHangForm;
