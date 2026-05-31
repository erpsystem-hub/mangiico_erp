import { z } from 'zod';
import { txt } from '@/lib/text';
import { TRANG_THAI_DON_HANG } from './constants';

export const salesOrderLineSchema = z.object({
  san_pham_id: z.string().min(1, txt('salesOrder.validation.productRequired')),
  so_luong: z.coerce.number().positive(txt('salesOrder.validation.qtyPositive')),
  don_vi_tinh: z.string().max(32).optional().default('cái'),
  don_gia: z.coerce.number().min(0, txt('salesOrder.validation.priceMin')),
  ghi_chu: z.string().max(500).optional().nullable(),
  thu_tu: z.coerce.number().int().min(0).optional().default(0),
});

export const salesOrderSchema = z.object({
  ma_don_hang: z.string().max(64).optional().nullable(),
  khach_hang_id: z.string().min(1, txt('salesOrder.validation.customerRequired')),
  chi_nhanh_id: z.string().optional().nullable(),
  nhan_vien_id: z.string().optional().nullable(),
  ngay_dat: z.string().min(1, txt('salesOrder.validation.orderDateRequired')),
  ngay_giao_du_kien: z.string().optional().nullable(),
  dia_chi_giao: z.string().max(500).optional().nullable(),
  ghi_chu: z.string().max(2000).optional().nullable(),
  trang_thai: z.enum(TRANG_THAI_DON_HANG),
  lines: z.array(salesOrderLineSchema).min(1, txt('salesOrder.validation.linesMin')),
});

export type SalesOrderFormValues = z.infer<typeof salesOrderSchema>;
export type SalesOrderLineFormValues = z.infer<typeof salesOrderLineSchema>;
