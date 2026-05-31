import React, { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { txt } from '@/lib/text';
import { toast } from 'sonner';
import { useForm, Controller, SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Package, Calendar, MapPin, FileText, Building2, Power } from 'lucide-react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Combobox from '@/components/ui/Combobox';
import { purchaseOrderHeaderSchema, type PurchaseOrderHeaderFormValues } from '../core/schema';
import type { PurchaseOrder } from '../core/types';
import { TRANG_THAI_DON_MUA_OPTIONS, canEditOrderCode } from '../core/constants';
import { useUpsertPurchaseOrder } from '../hooks/use-don-mua-nguyen-lieu';
import { usePartnerList } from '@/features/kinh-doanh/doi-tac/hooks/use-doi-tac-list';
import { useBranches } from '@/features/he-thong/chi-nhanh/hooks/use-chi-nhanh';
import { useMaterialCatalogList } from '@/features/san-xuat/danh-sach-nguyen-lieu/hooks/use-danh-sach-nguyen-lieu';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import GenericDrawer from '@/components/shared/GenericDrawer';
import { DRAWER_WIDTH_FORM, getDrawerWidthClass } from '@/lib/dialog-sizes';
import FormDrawerFooter from '@/components/shared/FormDrawerFooter';
import FormSection from '@/components/shared/FormSection';
import FormGrid, { FORM_GRID_SPAN_FULL } from '@/components/shared/FormGrid';
import SupplierSelect from './supplier-select';
import PurchaseFormLinesSection from './purchase-form-lines-section';
import {
  lineRowsToFormLines,
  purchaseOrderLinesToDraftRows,
  type PurchaseLineRow,
} from '../utils/purchase-form-mapper';

const DonMuaLineForm = lazy(() => import('./don-mua-line-form'));

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

const DEFAULT_VALUES: PurchaseOrderHeaderFormValues = {
  ma_don_mua: '',
  nha_cung_cap_id: '',
  chi_nhanh_id: '',
  ngay_dat: todayIsoDate(),
  ngay_giao_du_kien: '',
  dia_chi_nhan: '',
  ghi_chu: '',
  trang_thai: 'Nháp',
};

type LineFormState = { mode: 'add' } | { mode: 'edit'; clientId: string } | null;

interface Props {
  initialData?: PurchaseOrder | null;
  presetNhaCungCapId?: string;
  onClose: () => void;
  onSaved?: (saved: PurchaseOrder) => void;
  maxWidthClass?: string;
  stackLevel?: number;
}

const DonMuaForm: React.FC<Props> = ({
  initialData,
  presetNhaCungCapId,
  onClose,
  onSaved,
  maxWidthClass,
  stackLevel = 0,
}) => {
  const isEdit = !!initialData;
  const sessionReady = useSupabaseReady();
  const upsertMutation = useUpsertPurchaseOrder((saved) => {
    onSaved?.(saved);
    onClose();
  });
  const { data: suppliers = [] } = usePartnerList('nha_cung_cap', { enabled: sessionReady });
  const { data: branches = [] } = useBranches({ enabled: sessionReady });
  const { data: materials = [] } = useMaterialCatalogList({ enabled: sessionReady });

  const [draftLines, setDraftLines] = useState<PurchaseLineRow[]>(() =>
    initialData?.lines?.length ? purchaseOrderLinesToDraftRows(initialData.lines) : [],
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
  } = useForm<PurchaseOrderHeaderFormValues>({
    resolver: zodResolver(purchaseOrderHeaderSchema) as Resolver<PurchaseOrderHeaderFormValues>,
    defaultValues: DEFAULT_VALUES,
  });

  const trangThai = watch('trang_thai');
  const codeEditable = canEditOrderCode(trangThai);
  const orderLabel = watch('ma_don_mua')?.trim() || initialData?.ma_don_mua || '';

  useEffect(() => {
    if (initialData) {
      reset({
        ma_don_mua: initialData.ma_don_mua,
        nha_cung_cap_id: initialData.nha_cung_cap_id,
        chi_nhanh_id: initialData.chi_nhanh_id ?? '',
        ngay_dat: initialData.ngay_dat,
        ngay_giao_du_kien: initialData.ngay_giao_du_kien ?? '',
        dia_chi_nhan: initialData.dia_chi_nhan ?? '',
        ghi_chu: initialData.ghi_chu ?? '',
        trang_thai: initialData.trang_thai,
      });
      setDraftLines(
        initialData.lines?.length ? purchaseOrderLinesToDraftRows(initialData.lines) : [],
      );
    } else {
      reset({
        ...DEFAULT_VALUES,
        nha_cung_cap_id: presetNhaCungCapId?.trim() ?? '',
        ngay_dat: todayIsoDate(),
      });
      setDraftLines([]);
    }
    setLineForm(null);
  }, [initialData, presetNhaCungCapId, reset]);

  useEffect(() => {
    if (isEdit || !presetNhaCungCapId?.trim()) return;
    const s = suppliers.find((x) => x.id === presetNhaCungCapId);
    if (s?.dia_chi && !getValues('dia_chi_nhan')?.trim()) {
      setValue('dia_chi_nhan', s.dia_chi);
    }
  }, [presetNhaCungCapId, suppliers, isEdit, setValue, getValues]);

  const branchOptions = branches.map((b) => ({
    value: b.id,
    label: b.ten_chi_nhanh,
    subLabel: b.ma_chi_nhanh ?? undefined,
  }));

  const editingDraftLine = useMemo(() => {
    if (lineForm?.mode !== 'edit') return null;
    return draftLines.find((ln) => ln.clientId === lineForm.clientId) ?? null;
  }, [lineForm, draftLines]);

  const onSubmit: SubmitHandler<PurchaseOrderHeaderFormValues> = (data) => {
    const lines = lineRowsToFormLines(draftLines);
    if (lines.length === 0) {
      toast.error(txt('purchaseOrder.validation.linesMin'));
      return;
    }
    const payload = {
      ...data,
      ma_don_mua: data.ma_don_mua?.trim() || null,
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
    toast.error(txt('purchaseOrder.form.validationError'));
  };

  const handleDraftSave = (line: PurchaseLineRow) => {
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
        title={isEdit ? txt('purchaseOrder.form.editTitle') : txt('purchaseOrder.form.createTitle')}
        subtitle={
          isEdit
            ? txt('purchaseOrder.form.editSubtitle', { code: initialData?.ma_don_mua ?? '' })
            : txt('purchaseOrder.form.createSubtitle')
        }
        icon={<Package size={20} />}
        onClose={onClose}
        maxWidthClass={drawerWidth}
        stackLevel={stackLevel}
        footer={
          <FormDrawerFooter
            formId="don-mua-form"
            onCancel={onClose}
            isLoading={upsertMutation.isPending}
            isEdit={isEdit}
            compact
            createIcon={<Package className="w-3.5 h-3.5 mr-1.5 shrink-0" />}
          />
        }
        footerCompact
      >
        <form
          id="don-mua-form"
          className="space-y-5"
          onSubmit={handleSubmit(onSubmit, onInvalid)}
        >
          <FormSection title={txt('purchaseOrder.detail.orderInfo')} icon={<Package size={14} />}>
            <FormGrid cols={2}>
              <Input
                label={txt('purchaseOrder.store.codeCol')}
                icon={Package}
                {...register('ma_don_mua')}
                placeholder={txt('purchaseOrder.form.codePlaceholder')}
                error={errors.ma_don_mua?.message}
                disabled={!codeEditable && isEdit}
              />
              <Controller
                name="nha_cung_cap_id"
                control={control}
                render={({ field }) => (
                  <SupplierSelect
                    suppliers={suppliers}
                    value={field.value}
                    onChange={field.onChange}
                    onSupplierPick={(s) => {
                      if (!getValues('dia_chi_nhan')?.trim() && s.dia_chi) {
                        setValue('dia_chi_nhan', s.dia_chi ?? '');
                      }
                    }}
                    label={txt('purchaseOrder.form.supplier')}
                    placeholder={txt('purchaseOrder.form.supplierPlaceholder')}
                    error={errors.nha_cung_cap_id?.message}
                    required
                    disabled={Boolean(presetNhaCungCapId?.trim()) && !isEdit}
                  />
                )}
              />
              <Input
                label={txt('purchaseOrder.form.orderDate')}
                type="date"
                icon={Calendar}
                {...register('ngay_dat')}
                error={errors.ngay_dat?.message}
                required
              />
              <Input
                label={txt('purchaseOrder.form.deliveryDate')}
                type="date"
                icon={Calendar}
                {...register('ngay_giao_du_kien')}
              />
              <Controller
                name="chi_nhanh_id"
                control={control}
                render={({ field }) => (
                  <Combobox
                    label={txt('purchaseOrder.form.branch')}
                    icon={Building2}
                    options={[
                      { value: '', label: txt('purchaseOrder.form.branchNone') },
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
                    options={TRANG_THAI_DON_MUA_OPTIONS.map((o) => ({
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
                  label={txt('purchaseOrder.form.receiveAddress')}
                  icon={MapPin}
                  {...register('dia_chi_nhan')}
                />
              </div>
              <div className={FORM_GRID_SPAN_FULL}>
                <Textarea
                  label={txt('purchaseOrder.form.note')}
                  icon={FileText}
                  {...register('ghi_chu')}
                  rows={2}
                />
              </div>
            </FormGrid>
          </FormSection>

          <PurchaseFormLinesSection
            lines={draftLines}
            materials={materials}
            onAdd={() => setLineForm({ mode: 'add' })}
            onEdit={(clientId) => setLineForm({ mode: 'edit', clientId })}
            onDelete={handleDeleteLine}
          />
        </form>
      </GenericDrawer>

      {lineForm ? (
        <Suspense fallback={null}>
          <DonMuaLineForm
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

export default DonMuaForm;
