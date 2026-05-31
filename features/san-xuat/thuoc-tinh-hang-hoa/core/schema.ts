import { z } from 'zod';
import { txt } from '@/lib/text';
import { TRANG_THAI_HOAT_DONG, normalizeTrangThaiHoatDong } from '@/lib/constants/trang-thai';
import { normalizeCacGiaTri } from '../utils/normalize-cac-gia-tri';

export const productAttributeSchema = z.object({
  ten_hien_thi: z
    .string()
    .trim()
    .min(1, txt('productAttribute.validation.displayNameRequired'))
    .max(255, txt('productAttribute.validation.displayNameMax')),
  cac_gia_tri: z.preprocess(
    (v) => normalizeCacGiaTri(v),
    z.array(z.string().trim().min(1, txt('productAttribute.validation.valueEmpty'))),
  ),
  thu_tu: z.coerce.number().min(0, txt('productAttribute.validation.orderMin')),
  trang_thai: z.preprocess(
    (v) => normalizeTrangThaiHoatDong(v),
    z.enum(TRANG_THAI_HOAT_DONG, { message: txt('productAttribute.validation.statusInvalid') }),
  ),
});

export type ProductAttributeFormValues = z.infer<typeof productAttributeSchema>;
