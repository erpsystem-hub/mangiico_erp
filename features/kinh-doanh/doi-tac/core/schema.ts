import { z } from 'zod';
import { txt } from '@/lib/text';
import { TRANG_THAI_HOAT_DONG, normalizeTrangThaiHoatDong } from '@/lib/constants/trang-thai';

export const partnerCategorySchema = z.object({
  ten_danh_muc: z
    .string()
    .trim()
    .min(2, txt('partnerCategory.validation.nameMin'))
    .max(255, txt('partnerCategory.validation.nameMax')),
  ma_danh_muc: z
    .string()
    .trim()
    .max(50, txt('partnerCategory.validation.codeMax'))
    .optional()
    .nullable(),
  mo_ta: z.string().optional().nullable(),
  cha_id: z.string().optional().nullable(),
  trang_thai: z.enum(TRANG_THAI_HOAT_DONG, {
    message: txt('partnerCategory.validation.statusInvalid'),
  }),
  thu_tu: z.coerce.number().min(0, txt('partnerCategory.validation.sortOrderMin')),
});

export type PartnerCategoryFormValues = z.infer<typeof partnerCategorySchema>;

export const partnerListSchema = z.object({
  ma_doi_tac: z
    .string()
    .trim()
    .min(1, txt('partnerList.validation.codeRequired'))
    .max(50, txt('partnerList.validation.codeMax')),
  ten_doi_tac: z
    .string()
    .trim()
    .min(1, txt('partnerList.validation.nameRequired'))
    .max(255, txt('partnerList.validation.nameMax')),
  danh_muc_id: z.string().trim().min(1, txt('partnerList.validation.categoryRequired')),
  dien_thoai: z.string().trim().optional(),
  email: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: txt('partnerList.validation.emailInvalid'),
    }),
  dia_chi: z.string().trim().optional(),
  ma_so_thue: z.string().trim().optional(),
  nguoi_lien_he: z.string().trim().optional(),
  mo_ta: z.string().trim().optional(),
  trang_thai: z.preprocess(
    (v) => normalizeTrangThaiHoatDong(v),
    z.enum(TRANG_THAI_HOAT_DONG, { message: txt('partnerList.validation.statusInvalid') }),
  ),
});

export type PartnerListFormValues = z.infer<typeof partnerListSchema>;
