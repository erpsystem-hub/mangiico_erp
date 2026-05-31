import { z } from 'zod';
import { txt } from '@/lib/text';
import { TRANG_THAI_HOAT_DONG, normalizeTrangThaiHoatDong } from '@/lib/constants/trang-thai';

export const bomSchema = z.object({
  san_pham_id: z.string().trim().min(1, txt('bom.validation.productRequired')),
  nguyen_lieu_id: z.string().trim().min(1, txt('bom.validation.materialRequired')),
  so_luong: z.coerce
    .number()
    .refine((n) => Number.isFinite(n) && n > 0, { message: txt('bom.validation.quantityRequired') }),
  don_vi_tinh: z.string().trim().optional().default(''),
  ghi_chu: z.string().trim().optional(),
  thu_tu: z.coerce.number().int().min(0).optional().default(0),
  trang_thai: z.preprocess(
    (v) => normalizeTrangThaiHoatDong(v),
    z.enum(TRANG_THAI_HOAT_DONG, { message: txt('bom.validation.statusInvalid') }),
  ),
});

export type BomFormValues = z.infer<typeof bomSchema>;
