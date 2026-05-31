import React, { useEffect, useMemo } from 'react';
import { txt } from '@/lib/text';
import { toast } from 'sonner';
import { useForm, Controller, SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Package, ListOrdered, FileText } from 'lucide-react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import NumericFormatInput from '@/components/ui/NumericFormatInput';
import CurrencyInput from '@/components/ui/CurrencyInput';
import GenericDrawer from '@/components/shared/GenericDrawer';
import { getDrawerWidthClass } from '@/lib/dialog-sizes';
import FormDrawerFooter from '@/components/shared/FormDrawerFooter';
import FormSection from '@/components/shared/FormSection';
import FormGrid from '@/components/shared/FormGrid';
import MaterialLineSelect from './material-line-select';
import { purchaseOrderLineSchema, type PurchaseOrderLineFormValues } from '../core/schema';
import type { PurchaseOrder, PurchaseOrderLine } from '../core/types';
import { useUpsertPurchaseOrder } from '../hooks/use-don-mua-nguyen-lieu';
import { useMaterialCatalogList } from '@/features/san-xuat/danh-sach-nguyen-lieu/hooks/use-danh-sach-nguyen-lieu';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import {
  draftLineToFormValues,
  mergePurchaseLineIntoFormValues,
  newPurchaseLineRow,
  purchaseOrderLineToFormValues,
  type PurchaseLineRow,
} from '../utils/purchase-form-mapper';
import { formatCurrency } from '@/lib/utils';

interface BaseProps {
  onClose: () => void;
  maxWidthClass?: string;
  stackLevel?: number;
}

interface PersistProps extends BaseProps {
  order: PurchaseOrder;
  initialLine?: PurchaseOrderLine | null;
  onSaved: (order: PurchaseOrder) => void;
}

interface DraftProps extends BaseProps {
  draftMode: true;
  orderLabel?: string;
  lineCount: number;
  initialDraftLine?: PurchaseLineRow | null;
  onDraftSave: (line: PurchaseLineRow) => void;
}

type Props = PersistProps | DraftProps;

function isDraftProps(props: Props): props is DraftProps {
  return 'draftMode' in props && props.draftMode === true;
}

const DonMuaLineForm: React.FC<Props> = (props) => {
  const { onClose, maxWidthClass, stackLevel = 1 } = props;
  const isDraft = isDraftProps(props);
  const isEdit = isDraft ? Boolean(props.initialDraftLine) : Boolean(props.initialLine);
  const sessionReady = useSupabaseReady();
  const { data: materials = [] } = useMaterialCatalogList({ enabled: sessionReady });
  const upsertMutation = useUpsertPurchaseOrder((saved) => {
    if (!isDraft) {
      props.onSaved(saved);
      onClose();
    }
  });

  const orderCode = isDraft
    ? props.orderLabel ?? txt('purchaseOrder.form.createTitle')
    : props.order.ma_don_mua;
  const lineCount = isDraft ? props.lineCount : (props.order.lines?.length ?? 0);

  const defaultValues = useMemo((): PurchaseOrderLineFormValues => {
    if (isDraft && props.initialDraftLine) return draftLineToFormValues(props.initialDraftLine);
    if (!isDraft && props.initialLine) return purchaseOrderLineToFormValues(props.initialLine);
    return {
      nguyen_lieu_id: '',
      so_luong: 1,
      don_vi_tinh: 'm',
      don_gia: 0,
      ghi_chu: '',
      thu_tu: lineCount + 1,
    };
  }, [isDraft, props, lineCount]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
    setValue,
  } = useForm<PurchaseOrderLineFormValues>({
    resolver: zodResolver(purchaseOrderLineSchema) as Resolver<PurchaseOrderLineFormValues>,
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const qty = watch('so_luong');
  const price = watch('don_gia');

  const lineTotal = useMemo(
    () => Math.round(Number(qty) * Number(price) * 100) / 100,
    [qty, price],
  );

  const onSubmit: SubmitHandler<PurchaseOrderLineFormValues> = (data) => {
    if (isDraft) {
      const material = materials.find((m) => m.id === data.nguyen_lieu_id);
      const row: PurchaseLineRow = {
        ...(props.initialDraftLine ?? newPurchaseLineRow(lineCount + 1)),
        ...data,
        ten_nguyen_lieu: material?.ten_nguyen_lieu ?? '',
        ma_nguyen_lieu: material?.ma_nguyen_lieu ?? '',
      };
      props.onDraftSave(row);
      onClose();
      return;
    }

    const payload = mergePurchaseLineIntoFormValues(props.order, data, props.initialLine?.id);
    upsertMutation.mutate({ id: props.order.id, data: payload });
  };

  const onInvalid = () => {
    toast.error(txt('purchaseOrder.form.validationError'));
  };

  const drawerWidth = maxWidthClass ?? getDrawerWidthClass(stackLevel);
  const editMaterialLabel = isDraft
    ? props.initialDraftLine?.ten_nguyen_lieu ?? ''
    : props.initialLine?.ten_nguyen_lieu ?? '';

  return (
    <GenericDrawer
      title={
        isEdit ? txt('purchaseOrder.form.editLineTitle') : txt('purchaseOrder.form.addLineTitle')
      }
      subtitle={
        isEdit
          ? txt('purchaseOrder.form.editLineSubtitle', {
              material: editMaterialLabel,
              code: orderCode,
            })
          : txt('purchaseOrder.form.addLineSubtitle', { code: orderCode })
      }
      icon={<Package size={20} />}
      onClose={onClose}
      maxWidthClass={drawerWidth}
      stackLevel={stackLevel}
      footer={
        <FormDrawerFooter
          formId="don-mua-line-form"
          onCancel={onClose}
          isLoading={!isDraft && upsertMutation.isPending}
          isEdit={isEdit}
          compact
          createIcon={<Package className="w-3.5 h-3.5 mr-1.5 shrink-0" />}
        />
      }
      footerCompact
    >
      <form
        id="don-mua-line-form"
        className="space-y-5"
        onSubmit={handleSubmit(onSubmit, onInvalid)}
      >
        <FormSection
          title={txt('purchaseOrder.form.linesSection')}
          icon={<Package size={14} />}
          variant="primary"
        >
          <FormGrid cols={2}>
            <div className="col-span-2">
              <Controller
                name="nguyen_lieu_id"
                control={control}
                render={({ field }) => (
                  <MaterialLineSelect
                    materials={materials}
                    value={field.value}
                    onChange={field.onChange}
                    onMaterialPick={(m) => {
                      if (m.don_vi_tinh) {
                        setValue('don_vi_tinh', m.don_vi_tinh);
                      }
                    }}
                    label={txt('purchaseOrder.form.material')}
                    placeholder={txt('purchaseOrder.form.material')}
                    error={errors.nguyen_lieu_id?.message}
                    required
                  />
                )}
              />
            </div>
            <Controller
              name="so_luong"
              control={control}
              render={({ field }) => (
                <NumericFormatInput
                  label={txt('purchaseOrder.form.qty')}
                  icon={<ListOrdered size={12} />}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.so_luong?.message}
                  decimalScale={4}
                  min={0.0001}
                  required
                />
              )}
            />
            <Input
              label={txt('purchaseOrder.form.unit')}
              {...register('don_vi_tinh')}
              error={errors.don_vi_tinh?.message}
            />
            <Controller
              name="don_gia"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  label={txt('purchaseOrder.form.unitPrice')}
                  suffix=""
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.don_gia?.message}
                />
              )}
            />
            <div className="flex flex-col justify-end">
              <span className="text-xs text-muted-foreground mb-1">
                {txt('purchaseOrder.form.lineTotal')}
              </span>
              <span className="text-base font-semibold text-primary tabular-nums">
                {formatCurrency(lineTotal)}
              </span>
            </div>
            <div className="col-span-2">
              <Textarea
                label={txt('purchaseOrder.form.lineNote')}
                icon={<FileText size={12} />}
                {...register('ghi_chu')}
                rows={2}
              />
            </div>
          </FormGrid>
        </FormSection>
      </form>
    </GenericDrawer>
  );
};

export default DonMuaLineForm;
