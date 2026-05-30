import { z } from 'zod';
import { txt } from '@/lib/text';
import { TRANG_THAI_HOAT_DONG, normalizeTrangThaiHoatDong } from '@/lib/constants/trang-thai';

export const measurementSpecSchema = z.object({
  ten_hien_thi: z
    .string()
    .trim()
    .min(1, txt('measurementSpec.validation.displayNameRequired'))
    .max(255, txt('measurementSpec.validation.displayNameMax')),
  don_vi: z
    .string()
    .trim()
    .min(1, txt('measurementSpec.validation.unitRequired'))
    .max(20, txt('measurementSpec.validation.unitMax')),
  thu_tu: z.coerce.number().min(0, txt('measurementSpec.validation.orderMin')),
  trang_thai: z.preprocess(
    (v) => normalizeTrangThaiHoatDong(v),
    z.enum(TRANG_THAI_HOAT_DONG, { message: txt('measurementSpec.validation.statusInvalid') }),
  ),
});

export type MeasurementSpecFormValues = z.infer<typeof measurementSpecSchema>;
