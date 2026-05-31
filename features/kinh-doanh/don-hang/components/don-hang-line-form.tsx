import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import CategoryLineSelect from './category-line-select';
import CategoryAttributeValuesSection from '@/features/san-xuat/danh-muc-hang-hoa/components/category-attribute-values-section';
import OrderLineMeasurementValuesSection from './order-line-measurement-values-section';
import { salesOrderLineSchema, type SalesOrderLineFormValues } from '../core/schema';
import type { SalesOrder, SalesOrderLine } from '../core/types';
import { useUpsertSalesOrder } from '../hooks/use-don-hang';
import { useProductCategories, useCategoryLinks } from '@/features/san-xuat/danh-muc-hang-hoa/hooks/use-danh-muc-hang-hoa';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import {
  draftLineToFormValues,
  mergeOrderLineIntoFormValues,
  newOrderLineRow,
  salesOrderLineToFormValues,
  type OrderLineRow,
} from '../utils/order-form-mapper';
import {
  buildEmptyLineAttributeValues,
  buildEmptyLineMeasurementValues,
  mergeLineAttributeValuesWithTemplate,
  mergeLineMeasurementValuesWithTemplate,
  collectLineAttributeFieldErrors,
  collectLineMeasurementFieldErrors,
} from '../utils/order-line-values';
import { formatCurrency } from '@/lib/utils';

interface BaseProps {
  onClose: () => void;
  maxWidthClass?: string;
  stackLevel?: number;
}

interface PersistProps extends BaseProps {
  order: SalesOrder;
  initialLine?: SalesOrderLine | null;
  onSaved: (order: SalesOrder) => void;
}

interface DraftProps extends BaseProps {
  draftMode: true;
  orderLabel?: string;
  lineCount: number;
  initialDraftLine?: OrderLineRow | null;
  onDraftSave: (line: OrderLineRow) => void;
}

type Props = PersistProps | DraftProps;

function isDraftProps(props: Props): props is DraftProps {
  return 'draftMode' in props && props.draftMode === true;
}

const DonHangLineForm: React.FC<Props> = (props) => {
  const { onClose, maxWidthClass, stackLevel = 1 } = props;
  const isDraft = isDraftProps(props);
  const isEdit = isDraft ? Boolean(props.initialDraftLine) : Boolean(props.initialLine);
  const sessionReady = useSupabaseReady();
  const prevCategoryRef = useRef<string>('');
  const appliedTemplateKeyRef = useRef<string>('');
  const { data: categories = [] } = useProductCategories({ enabled: sessionReady });
  const upsertMutation = useUpsertSalesOrder((saved) => {
    if (!isDraft) {
      props.onSaved(saved);
      onClose();
    }
  });

  const orderCode = isDraft
    ? props.orderLabel ?? txt('salesOrder.form.createTitle')
    : props.order.ma_don_hang;
  const lineCount = isDraft ? props.lineCount : (props.order.lines?.length ?? 0);

  const defaultValues = useMemo((): SalesOrderLineFormValues => {
    if (isDraft && props.initialDraftLine) return draftLineToFormValues(props.initialDraftLine);
    if (!isDraft && props.initialLine) return salesOrderLineToFormValues(props.initialLine);
    return {
      danh_muc_id: '',
      so_luong: 1,
      don_vi_tinh: 'cái',
      don_gia: 0,
      ghi_chu: '',
      thu_tu: lineCount + 1,
      thuoc_tinh_values: [],
      thong_so_do_values: [],
    };
  }, [isDraft, props, lineCount]);

  const initialCategoryId = isDraft
    ? props.initialDraftLine?.danh_muc_id
    : props.initialLine?.danh_muc_id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
    setValue,
  } = useForm<SalesOrderLineFormValues>({
    resolver: zodResolver(salesOrderLineSchema) as Resolver<SalesOrderLineFormValues>,
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
    prevCategoryRef.current = initialCategoryId ?? '';
    appliedTemplateKeyRef.current = '';
  }, [defaultValues, reset, initialCategoryId]);

  const danhMucId = watch('danh_muc_id');
  const thuocTinhValues = watch('thuoc_tinh_values') ?? [];
  const thongSoDoValues = watch('thong_so_do_values') ?? [];
  const qty = watch('so_luong');
  const price = watch('don_gia');

  const { data: categoryLinks, isFetched: categoryLinksFetched } = useCategoryLinks(danhMucId, {
    enabled: Boolean(danhMucId?.trim()) && sessionReady,
  });
  const attributeTemplate = categoryLinks?.attributeLinks ?? [];
  const measurementTemplate = categoryLinks?.measurementLinks ?? [];

  const templateKey = useMemo(
    () =>
      [
        danhMucId,
        attributeTemplate.map((t) => t.thuoc_tinh_id).join(','),
        measurementTemplate.map((t) => t.thong_so_do_id).join(','),
      ].join('|'),
    [danhMucId, attributeTemplate, measurementTemplate],
  );

  useEffect(() => {
    if (!danhMucId?.trim()) {
      setValue('thuoc_tinh_values', []);
      setValue('thong_so_do_values', []);
      prevCategoryRef.current = '';
      appliedTemplateKeyRef.current = '';
      return;
    }

    if (!categoryLinksFetched) return;
    if (appliedTemplateKeyRef.current === templateKey) return;

    const prev = prevCategoryRef.current;
    const isInitialCategory = isEdit && danhMucId === initialCategoryId;

    if (isInitialCategory) {
      const savedAttrs = isDraft
        ? props.initialDraftLine?.thuoc_tinh_values ?? []
        : props.initialLine?.thuoc_tinh_values ?? [];
      const savedSpecs = isDraft
        ? props.initialDraftLine?.thong_so_do_values ?? []
        : props.initialLine?.thong_so_do_values ?? [];
      setValue(
        'thuoc_tinh_values',
        mergeLineAttributeValuesWithTemplate(attributeTemplate, savedAttrs),
      );
      setValue(
        'thong_so_do_values',
        mergeLineMeasurementValuesWithTemplate(measurementTemplate, savedSpecs),
      );
    } else {
      setValue('thuoc_tinh_values', buildEmptyLineAttributeValues(attributeTemplate));
      setValue('thong_so_do_values', buildEmptyLineMeasurementValues(measurementTemplate));
    }

    if (prev && prev !== danhMucId) {
      toast.info(txt('salesOrder.form.categoryChangedResetSpecs'));
    }
    prevCategoryRef.current = danhMucId;
    appliedTemplateKeyRef.current = templateKey;
    setAttrErrors({});
    setSpecErrors({});
  }, [
    danhMucId,
    templateKey,
    categoryLinksFetched,
    attributeTemplate,
    measurementTemplate,
    isEdit,
    initialCategoryId,
    isDraft,
    props,
    setValue,
  ]);

  const [attrErrors, setAttrErrors] = useState<Record<string, string>>({});
  const [specErrors, setSpecErrors] = useState<Record<string, string>>({});

  const lineTotal = useMemo(
    () => Math.round(Number(qty) * Number(price) * 100) / 100,
    [qty, price],
  );

  const onSubmit: SubmitHandler<SalesOrderLineFormValues> = (data) => {
    if (danhMucId?.trim() && !categoryLinksFetched) {
      toast.error(txt('salesOrder.validation.specsLoading'));
      return;
    }

    const nextAttrErrors = collectLineAttributeFieldErrors(
      attributeTemplate,
      data.thuoc_tinh_values ?? [],
    );
    const nextSpecErrors = collectLineMeasurementFieldErrors(
      measurementTemplate,
      data.thong_so_do_values ?? [],
    );
    setAttrErrors(nextAttrErrors);
    setSpecErrors(nextSpecErrors);

    if (Object.keys(nextAttrErrors).length > 0 || Object.keys(nextSpecErrors).length > 0) {
      toast.error(txt('salesOrder.validation.specsIncomplete'));
      return;
    }

    if (isDraft) {
      const cat = categories.find((c) => c.id === data.danh_muc_id);
      const row: OrderLineRow = {
        ...(props.initialDraftLine ?? newOrderLineRow(lineCount + 1)),
        ...data,
        ten_danh_muc: cat?.ten_danh_muc ?? '',
        ma_danh_muc: cat?.ma_danh_muc ?? '',
      };
      props.onDraftSave(row);
      onClose();
      return;
    }

    const payload = mergeOrderLineIntoFormValues(props.order, data, props.initialLine?.id);
    upsertMutation.mutate({ id: props.order.id, data: payload });
  };

  const onInvalid = () => {
    toast.error(txt('salesOrder.form.validationError'));
  };

  const drawerWidth = maxWidthClass ?? getDrawerWidthClass(stackLevel);
  const editCategoryLabel = isDraft
    ? props.initialDraftLine?.ten_danh_muc ?? ''
    : props.initialLine?.ten_danh_muc ?? '';

  return (
    <GenericDrawer
      title={
        isEdit ? txt('salesOrder.form.editLineTitle') : txt('salesOrder.form.addLineTitle')
      }
      subtitle={
        isEdit
          ? txt('salesOrder.form.editLineSubtitle', {
              category: editCategoryLabel,
              code: orderCode,
            })
          : txt('salesOrder.form.addLineSubtitle', { code: orderCode })
      }
      icon={<Package size={20} />}
      onClose={onClose}
      maxWidthClass={drawerWidth}
      stackLevel={stackLevel}
      footer={
        <FormDrawerFooter
          formId="don-hang-line-form"
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
        id="don-hang-line-form"
        className="space-y-5"
        onSubmit={handleSubmit(onSubmit, onInvalid)}
      >
        <FormSection
          title={txt('salesOrder.form.linesSection')}
          icon={<Package size={14} />}
          variant="primary"
        >
          <FormGrid cols={2}>
            <div className="col-span-2">
              <Controller
                name="danh_muc_id"
                control={control}
                render={({ field }) => (
                  <CategoryLineSelect
                    categories={categories}
                    value={field.value}
                    onChange={field.onChange}
                    label={txt('salesOrder.form.category')}
                    placeholder={txt('salesOrder.form.categoryPlaceholder')}
                    error={errors.danh_muc_id?.message}
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
                  label={txt('salesOrder.form.qty')}
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
              label={txt('salesOrder.form.unit')}
              icon={<ListOrdered size={12} />}
              {...register('don_vi_tinh')}
              error={errors.don_vi_tinh?.message}
            />
            <Controller
              name="don_gia"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  label={txt('salesOrder.form.unitPrice')}
                  icon={<Package size={12} />}
                  suffix=""
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.don_gia?.message}
                  required
                />
              )}
            />
            <Input
              label={txt('salesOrder.form.lineTotal')}
              icon={<Package size={12} />}
              value={formatCurrency(lineTotal)}
              readOnly
              disabled
            />
            <div className="col-span-2">
              <Textarea
                label={txt('salesOrder.form.lineNote')}
                icon={<FileText size={12} />}
                {...register('ghi_chu')}
                rows={2}
              />
            </div>
          </FormGrid>
        </FormSection>

        {danhMucId ? (
          <>
            <CategoryAttributeValuesSection
              template={attributeTemplate}
              values={thuocTinhValues}
              onChange={(v) => {
                setAttrErrors({});
                setValue('thuoc_tinh_values', v, { shouldValidate: true });
              }}
              errors={attrErrors}
              allFieldsRequired
            />
            <OrderLineMeasurementValuesSection
              template={measurementTemplate}
              values={thongSoDoValues}
              onChange={(v) => {
                setSpecErrors({});
                setValue('thong_so_do_values', v, { shouldValidate: true });
              }}
              errors={specErrors}
              allFieldsRequired
            />
          </>
        ) : null}
      </form>
    </GenericDrawer>
  );
};

export default DonHangLineForm;
