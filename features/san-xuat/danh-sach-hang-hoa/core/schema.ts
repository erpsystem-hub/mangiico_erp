import { z } from 'zod';
import { txt } from '@/lib/text';
import { TRANG_THAI_HOAT_DONG, normalizeTrangThaiHoatDong } from '@/lib/constants/trang-thai';
import type { CategoryAttributeLink } from '@/features/san-xuat/danh-muc-hang-hoa/core/types';

export const productAttributeValueInputSchema = z.object({
  thuoc_tinh_id: z.string().min(1),
  gia_tri: z.string(),
});

export const productCatalogBaseSchema = z.object({
  ma_san_pham: z
    .string()
    .trim()
    .min(1, txt('productCatalog.validation.codeRequired'))
    .max(50, txt('productCatalog.validation.codeMax')),
  ten_san_pham: z
    .string()
    .trim()
    .min(1, txt('productCatalog.validation.nameRequired'))
    .max(255, txt('productCatalog.validation.nameMax')),
  danh_muc_id: z.string().trim().min(1, txt('productCatalog.validation.categoryRequired')),
  mo_ta: z.string().trim().optional(),
  trang_thai: z.preprocess(
    (v) => normalizeTrangThaiHoatDong(v),
    z.enum(TRANG_THAI_HOAT_DONG, { message: txt('productCatalog.validation.statusInvalid') }),
  ),
  thuoc_tinh_values: z.array(productAttributeValueInputSchema),
});

export type ProductCatalogFormValues = z.infer<typeof productCatalogBaseSchema>;

export function validateRequiredAttributeValues(
  template: CategoryAttributeLink[],
  values: { thuoc_tinh_id: string; gia_tri: string }[],
): string | null {
  const byId = new Map(values.map((v) => [v.thuoc_tinh_id, v.gia_tri]));
  for (const link of template) {
    if (!link.bat_buoc) continue;
    const val = (byId.get(link.thuoc_tinh_id) ?? '').trim();
    if (!val) {
      return txt('productCatalog.validation.attributeRequired', { name: link.ten_hien_thi });
    }
  }
  return null;
}
