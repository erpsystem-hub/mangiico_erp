import React, { useEffect, useMemo } from 'react';
import { txt } from '@/lib/text';
import { toast } from 'sonner';
import { useForm, Controller, SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ruler, Type, Hash, Power, ArrowUpFromLine } from 'lucide-react';
import Input from '@/components/ui/Input';
import Combobox from '@/components/ui/Combobox';
import StatusToggle from '@/components/ui/StatusToggle';
import { MeasurementSpecFormValues, measurementSpecSchema } from '../core/schema';
import type { MeasurementSpec } from '../core/types';
import {
  useCreateMeasurementSpec,
  useUpdateMeasurementSpec,
  useMeasurementSpecs,
} from '../hooks/use-thong-so-do';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import GenericDrawer, { DRAWER_WIDTH_FORM } from '@/components/shared/GenericDrawer';
import FormDrawerFooter from '@/components/shared/FormDrawerFooter';
import FormSection from '@/components/shared/FormSection';
import FormGrid from '@/components/shared/FormGrid';
import { normalizeTrangThaiHoatDong } from '@/lib/constants/trang-thai';
import { buildMeasurementUnitOptions } from '../utils/unit-options';

const DEFAULT_VALUES: MeasurementSpecFormValues = {
  ten_hien_thi: '',
  thu_tu: 1,
  don_vi: 'cm',
  trang_thai: 'Đang hoạt động',
};

interface Props {
  initialData?: MeasurementSpec | null;
  onClose: () => void;
  /** Đơn vị đã dùng trong danh sách — gợi ý trong combobox */
  knownUnits?: string[];
}

const MeasurementSpecForm: React.FC<Props> = ({ initialData, onClose, knownUnits = [] }) => {
  const isEdit = !!initialData;
  const sessionReady = useSupabaseReady();
  const createMutation = useCreateMeasurementSpec(onClose);
  const updateMutation = useUpdateMeasurementSpec(onClose);
  const { data: allItems = [] } = useMeasurementSpecs({ enabled: sessionReady });

  const { register, handleSubmit, formState: { errors }, reset, control } =
    useForm<MeasurementSpecFormValues>({
      resolver: zodResolver(measurementSpecSchema) as Resolver<MeasurementSpecFormValues>,
      defaultValues: DEFAULT_VALUES,
    });

  const unitOptions = useMemo(
    () => buildMeasurementUnitOptions(knownUnits, initialData?.don_vi),
    [knownUnits, initialData?.don_vi],
  );

  useEffect(() => {
    if (initialData) {
      reset({
        ten_hien_thi: initialData.ten_hien_thi,
        thu_tu: initialData.thu_tu,
        don_vi: initialData.don_vi,
        trang_thai: normalizeTrangThaiHoatDong(initialData.trang_thai),
      });
    } else {
      const nextThuTu = allItems.length
        ? Math.max(...allItems.map((d) => d.thu_tu ?? 0)) + 1
        : 1;
      reset({ ...DEFAULT_VALUES, thu_tu: nextThuTu });
    }
  }, [initialData, reset, allItems]);

  const onSubmit: SubmitHandler<MeasurementSpecFormValues> = (data) => {
    if (isEdit && initialData) {
      updateMutation.mutate({ id: initialData.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const onInvalid = () => {
    toast.error(txt('measurementSpec.form.validationError'));
  };

  const isPending = !sessionReady || createMutation.isPending || updateMutation.isPending;

  return (
    <GenericDrawer
      title={isEdit ? txt('measurementSpec.form.editTitle') : txt('measurementSpec.form.createTitle')}
      subtitle={
        isEdit ? txt('measurementSpec.form.editSubtitle') : txt('measurementSpec.form.createSubtitle')
      }
      icon={<Ruler size={18} />}
      onClose={onClose}
      footer={
        <FormDrawerFooter
          formId="measurement-spec-form"
          onCancel={onClose}
          isLoading={isPending}
          isEdit={isEdit}
          compact
          createIcon={<Ruler className="w-3.5 h-3.5 mr-1.5 shrink-0" />}
        />
      }
      footerCompact
      maxWidthClass={DRAWER_WIDTH_FORM}
    >
      <form
        id="measurement-spec-form"
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="space-y-5"
      >
        <FormSection title={txt('measurementSpec.form.generalInfo')} icon={<Ruler size={14} />}>
          <FormGrid cols={2}>
            <div className="sm:col-span-2">
              <Input
                label={txt('measurementSpec.form.displayName')}
                placeholder={txt('measurementSpec.form.displayNamePlaceholder')}
                icon={Type}
                required
                error={errors.ten_hien_thi?.message}
                {...register('ten_hien_thi')}
              />
            </div>
            <Controller
              name="don_vi"
              control={control}
              render={({ field }) => (
                <Combobox
                  label={txt('measurementSpec.form.unit')}
                  placeholder={txt('measurementSpec.form.unitPlaceholder')}
                  searchPlaceholder={txt('measurementSpec.form.unitSearch')}
                  options={unitOptions}
                  value={field.value}
                  onChange={(v) => field.onChange(String(v).trim())}
                  icon={Hash}
                  required
                  searchable
                  creatable
                  creatableActionLabel={(s) => txt('measurementSpec.form.unitCreate', { unit: s })}
                  clearable={false}
                  dropdownInPortal
                  error={errors.don_vi?.message}
                />
              )}
            />
            <Input
              type="number"
              label={txt('measurementSpec.store.orderCol')}
              icon={<ArrowUpFromLine size={12} />}
              required
              error={errors.thu_tu?.message}
              {...register('thu_tu')}
            />
            <Controller
              name="trang_thai"
              control={control}
              render={({ field }) => (
                <StatusToggle
                  label={txt('measurementSpec.form.status')}
                  icon={Power}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </FormGrid>
        </FormSection>
      </form>
    </GenericDrawer>
  );
};

export default MeasurementSpecForm;
