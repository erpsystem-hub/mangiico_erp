import { z } from 'zod';
import { txt } from '@/lib/text';
import { TRANG_THAI_HOAT_DONG } from '@/lib/constants/trang-thai';

const categoryLinkItemSchema = z.object({
  bat_buoc: z.boolean(),
  thu_tu: z.coerce.number().min(0),
});

export const categoryAttributeLinkSchema = categoryLinkItemSchema.extend({
  thuoc_tinh_id: z.string().min(1),
  ten_hien_thi: z.string().default(''),
});

export const categoryMeasurementLinkSchema = categoryLinkItemSchema.extend({
  thong_so_do_id: z.string().min(1),
  ten_hien_thi: z.string().default(''),
  don_vi: z.string().default(''),
});

export const productCategorySchema = z
  .object({
    ten_danh_muc: z
      .string()
      .trim()
      .min(2, txt('productCategory.validation.nameMin'))
      .max(255, txt('productCategory.validation.nameMax')),
    ma_danh_muc: z
      .string()
      .trim()
      .max(50, txt('productCategory.validation.codeMax'))
      .optional()
      .nullable(),
    mo_ta: z.string().optional().nullable(),
    cha_id: z.string().optional().nullable(),
    trang_thai: z.enum(TRANG_THAI_HOAT_DONG, {
      message: txt('productCategory.validation.statusInvalid'),
    }),
    thu_tu: z.coerce.number().min(0, txt('productCategory.validation.sortOrderMin')),
    thuoc_tinh_links: z.array(categoryAttributeLinkSchema).optional().default([]),
    thong_so_do_links: z.array(categoryMeasurementLinkSchema).optional().default([]),
  })
  .superRefine((data, ctx) => {
    const hasCha = data.cha_id != null && String(data.cha_id).trim() !== '';
    const hasAttrLinks = (data.thuoc_tinh_links?.length ?? 0) > 0;
    const hasSpecLinks = (data.thong_so_do_links?.length ?? 0) > 0;
    if (!hasCha && (hasAttrLinks || hasSpecLinks)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: txt('productCategory.validation.linksLevel2Only'),
        path: ['thuoc_tinh_links'],
      });
    }
  });

export type ProductCategoryFormValues = z.infer<typeof productCategorySchema>;
