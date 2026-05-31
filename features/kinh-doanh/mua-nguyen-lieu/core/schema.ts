import { z } from 'zod';
import { txt } from '@/lib/text';
import { TRANG_THAI_DON_MUA } from './constants';

export const purchaseOrderLineSchema = z.object({
  nguyen_lieu_id: z.string().min(1, txt('purchaseOrder.validation.materialRequired')),
  so_luong: z.coerce.number().positive(txt('purchaseOrder.validation.qtyPositive')),
  don_vi_tinh: z.string().max(32).optional().default('m'),
  don_gia: z.coerce.number().min(0, txt('purchaseOrder.validation.priceMin')),
  ghi_chu: z.string().max(500).optional().nullable(),
  thu_tu: z.coerce.number().int().min(0).optional().default(0),
});

export const purchaseOrderSchema = z.object({
  ma_don_mua: z.string().max(64).optional().nullable(),
  nha_cung_cap_id: z.string().min(1, txt('purchaseOrder.validation.supplierRequired')),
  chi_nhanh_id: z.string().optional().nullable(),
  nhan_vien_id: z.string().optional().nullable(),
  ngay_dat: z.string().min(1, txt('purchaseOrder.validation.orderDateRequired')),
  ngay_giao_du_kien: z.string().optional().nullable(),
  dia_chi_nhan: z.string().max(500).optional().nullable(),
  ghi_chu: z.string().max(2000).optional().nullable(),
  trang_thai: z.enum(TRANG_THAI_DON_MUA),
  lines: z.array(purchaseOrderLineSchema).min(0),
});

/** Form drawer chỉnh thông tin đơn — dòng quản lý qua drawer con. */
export const purchaseOrderHeaderSchema = purchaseOrderSchema.omit({ lines: true });

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;
export type PurchaseOrderHeaderFormValues = z.infer<typeof purchaseOrderHeaderSchema>;
export type PurchaseOrderLineFormValues = z.infer<typeof purchaseOrderLineSchema>;
