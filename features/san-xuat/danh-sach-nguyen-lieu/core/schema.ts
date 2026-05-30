import { z } from 'zod';
import { txt } from '@/lib/text';
import { TRANG_THAI_HOAT_DONG, normalizeTrangThaiHoatDong } from '@/lib/constants/trang-thai';

function parseGsm(v: unknown): number | null {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim().replace(',', '.'));
  if (!Number.isFinite(n)) return null;
  if (n < 0) return NaN;
  return n;
}

export const materialCatalogSchema = z.object({
  ma_nguyen_lieu: z
    .string()
    .trim()
    .min(1, txt('materialCatalog.validation.codeRequired'))
    .max(50, txt('materialCatalog.validation.codeMax')),
  ten_nguyen_lieu: z
    .string()
    .trim()
    .min(1, txt('materialCatalog.validation.nameRequired'))
    .max(255, txt('materialCatalog.validation.nameMax')),
  danh_muc_id: z.string().trim().min(1, txt('materialCatalog.validation.categoryRequired')),
  don_vi_tinh: z.string().trim().optional().default(''),
  mau_sac: z.string().trim().optional(),
  thanh_phan: z.string().trim().optional(),
  kho_vai: z.string().trim().optional(),
  dinh_luong_gsm: z.preprocess(
    parseGsm,
    z
      .number()
      .nullable()
      .refine((n) => n === null || (!Number.isNaN(n) && n >= 0), {
        message: txt('materialCatalog.validation.gsmInvalid'),
      }),
  ),
  xuat_xu: z.string().trim().optional(),
  mo_ta: z.string().trim().optional(),
  trang_thai: z.preprocess(
    (v) => normalizeTrangThaiHoatDong(v),
    z.enum(TRANG_THAI_HOAT_DONG, { message: txt('materialCatalog.validation.statusInvalid') }),
  ),
});

export type MaterialCatalogFormValues = z.infer<typeof materialCatalogSchema>;
