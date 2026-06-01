import { z } from 'zod';
import { txt } from '@/lib/text';
import { LOAI_HANG_PHIEU, LOAI_PHIEU_KHO, TRANG_THAI_PHIEU_KHO } from './constants';

export const warehouseSlipLineSchema = z
  .object({
    loai_hang: z.enum(LOAI_HANG_PHIEU),
    nguyen_lieu_id: z.string().optional().nullable(),
    danh_muc_id: z.string().optional().nullable(),
    so_luong: z.coerce.number().positive(txt('warehouseSlip.validation.qtyPositive')),
    don_vi_tinh: z.string().max(32).optional().default('m'),
    ghi_chu: z.string().max(500).optional().nullable(),
    thu_tu: z.coerce.number().int().min(0).optional().default(0),
  })
  .superRefine((val, ctx) => {
    if (val.loai_hang === 'nguyen_lieu' && !val.nguyen_lieu_id?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: txt('warehouseSlip.validation.materialRequired'),
        path: ['nguyen_lieu_id'],
      });
    }
    if (val.loai_hang === 'thanh_pham' && !val.danh_muc_id?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: txt('warehouseSlip.validation.productRequired'),
        path: ['danh_muc_id'],
      });
    }
  });

export const warehouseSlipSchema = z.object({
  ma_phieu_kho: z.string().max(64).optional().nullable(),
  loai_phieu: z.enum(LOAI_PHIEU_KHO),
  muc_dich: z.string().min(1, txt('warehouseSlip.validation.purposeRequired')),
  kho_id: z.string().min(1, txt('warehouseSlip.validation.warehouseRequired')),
  kho_dich_id: z.string().optional().nullable(),
  ngay_phieu: z.string().min(1, txt('warehouseSlip.validation.dateRequired')),
  chi_nhanh_id: z.string().optional().nullable(),
  nhan_vien_id: z.string().optional().nullable(),
  don_hang_id: z.string().optional().nullable(),
  don_mua_id: z.string().optional().nullable(),
  ghi_chu: z.string().max(2000).optional().nullable(),
  trang_thai: z.enum(TRANG_THAI_PHIEU_KHO),
  lines: z.array(warehouseSlipLineSchema).min(1, txt('warehouseSlip.validation.linesRequired')),
});

export type WarehouseSlipFormValues = z.infer<typeof warehouseSlipSchema>;
export type WarehouseSlipLineFormValues = z.infer<typeof warehouseSlipLineSchema>;
