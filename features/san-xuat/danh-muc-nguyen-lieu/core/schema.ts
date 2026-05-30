import { z } from 'zod';
import { txt } from '@/lib/text';
import { TRANG_THAI_HOAT_DONG } from '@/lib/constants/trang-thai';

export const materialCategorySchema = z.object({
  ten_danh_muc: z
    .string()
    .trim()
    .min(2, txt('materialCategory.validation.nameMin'))
    .max(255, txt('materialCategory.validation.nameMax')),
  ma_danh_muc: z
    .string()
    .trim()
    .max(50, txt('materialCategory.validation.codeMax'))
    .optional()
    .nullable(),
  mo_ta: z.string().optional().nullable(),
  cha_id: z.string().optional().nullable(),
  trang_thai: z.enum(TRANG_THAI_HOAT_DONG, {
    message: txt('materialCategory.validation.statusInvalid'),
  }),
  thu_tu: z.coerce.number().min(0, txt('materialCategory.validation.sortOrderMin')),
});

export type MaterialCategoryFormValues = z.infer<typeof materialCategorySchema>;
