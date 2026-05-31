import { z } from 'zod';
import { txt } from '@/lib/text';

export const orderLineBomSchema = z.object({
  nguyen_lieu_id: z.string().trim().min(1, txt('productionOrder.lineBom.validation.materialRequired')),
  so_luong_dinh_muc: z.number().positive(txt('productionOrder.lineBom.validation.quantityRequired')),
  don_vi_tinh: z.string().optional(),
  ghi_chu: z.string().optional(),
  thu_tu: z.number().int().min(0).optional(),
});

export type OrderLineBomFormValues = z.infer<typeof orderLineBomSchema>;
