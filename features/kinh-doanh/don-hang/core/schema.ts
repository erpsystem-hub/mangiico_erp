import { z } from 'zod';
import { txt } from '@/lib/text';
import { TRANG_THAI_DON_HANG } from './constants';

export const salesOrderLineAttributeValueSchema = z.object({
  thuoc_tinh_id: z.string().min(1),
  gia_tri: z.string(),
});

export const salesOrderLineMeasurementValueSchema = z.object({
  thong_so_do_id: z.string().min(1),
  gia_tri: z.union([z.coerce.number(), z.null()]),
});

export const salesOrderLineSchema = z.object({
  danh_muc_id: z.string().min(1, txt('salesOrder.validation.categoryRequired')),
  so_luong: z.coerce.number().positive(txt('salesOrder.validation.qtyPositive')),
  don_vi_tinh: z.string().max(32).optional().default('cái'),
  don_gia: z.coerce.number().min(0, txt('salesOrder.validation.priceMin')),
  ghi_chu: z.string().max(500).optional().nullable(),
  thu_tu: z.coerce.number().int().min(0).optional().default(0),
  thuoc_tinh_values: z.array(salesOrderLineAttributeValueSchema).optional().default([]),
  thong_so_do_values: z.array(salesOrderLineMeasurementValueSchema).optional().default([]),
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
  lines: z.array(salesOrderLineSchema).min(0),
});

/** Form drawer chỉnh thông tin đơn — không chỉnh dòng tại đây. */
export const salesOrderHeaderSchema = salesOrderSchema.omit({ lines: true });

export type SalesOrderFormValues = z.infer<typeof salesOrderSchema>;
export type SalesOrderHeaderFormValues = z.infer<typeof salesOrderHeaderSchema>;
export type SalesOrderLineFormValues = z.infer<typeof salesOrderLineSchema>;
