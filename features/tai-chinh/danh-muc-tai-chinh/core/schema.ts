import { z } from 'zod';
import { txt } from '@/lib/text';
import { TRANG_THAI_HOAT_DONG } from '@/lib/constants/trang-thai';
import { LOAI_DANH_MUC } from './constants';

export const financeCategorySchema = z.object({
  ten_danh_muc: z
    .string()
    .trim()
    .min(2, txt('financeCategory.validation.nameMin'))
    .max(255, txt('financeCategory.validation.nameMax')),
  ma_danh_muc: z
    .string()
    .trim()
    .max(50, txt('financeCategory.validation.codeMax'))
    .optional()
    .nullable(),
  loai: z.enum(LOAI_DANH_MUC, {
    message: txt('financeCategory.validation.typeInvalid'),
  }),
  mo_ta: z.string().optional().nullable(),
  cha_id: z.string().optional().nullable(),
  trang_thai: z.enum(TRANG_THAI_HOAT_DONG, {
    message: txt('financeCategory.validation.statusInvalid'),
  }),
  thu_tu: z.coerce.number().min(0, txt('financeCategory.validation.sortOrderMin')),
});

export type FinanceCategoryFormValues = z.infer<typeof financeCategorySchema>;
