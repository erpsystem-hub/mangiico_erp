import { z } from 'zod';
import { txt } from '@/lib/text';
import { TRANG_THAI_HOAT_DONG, normalizeTrangThaiHoatDong } from '@/lib/constants/trang-thai';

export const productAttributeSchema = z.object({
  ten_hien_thi: z
    .string()
    .trim()
    .min(1, txt('productAttribute.validation.displayNameRequired'))
    .max(255, txt('productAttribute.validation.displayNameMax')),
  thu_tu: z.coerce.number().min(0, txt('productAttribute.validation.orderMin')),
  trang_thai: z.preprocess(
    (v) => normalizeTrangThaiHoatDong(v),
    z.enum(TRANG_THAI_HOAT_DONG, { message: txt('productAttribute.validation.statusInvalid') }),
  ),
});

export type ProductAttributeFormValues = z.infer<typeof productAttributeSchema>;
