import { z } from 'zod';
import { txt } from '@/lib/text';
import { TRANG_THAI_HOAT_DONG } from '@/lib/constants/trang-thai';

export const bomSchema = z.object({
  danh_muc_id: z.string().trim().min(1, txt('bom.validation.categoryRequired')),
  nguyen_lieu_id: z.string().trim().min(1, txt('bom.validation.materialRequired')),
  so_luong: z.number().positive(txt('bom.validation.quantityRequired')),
  don_vi_tinh: z.string().optional(),
  ghi_chu: z.string().optional(),
  thu_tu: z.number().int().min(0).optional(),
  trang_thai: z.enum(TRANG_THAI_HOAT_DONG, { message: txt('bom.validation.statusInvalid') }),
});

export type BomFormValues = z.infer<typeof bomSchema>;
