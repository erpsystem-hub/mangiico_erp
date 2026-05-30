import { z } from 'zod';
import { txt } from '../../../../lib/text';
import { TRANG_THAI_HOAT_DONG, normalizeTrangThaiHoatDong } from '@/lib/constants/trang-thai';

const MA_REGEX = /^[A-Z0-9_-]+$/;

export const branchSchema = z.object({
  ten_chi_nhanh: z
    .string()
    .trim()
    .min(3, txt('branch.validation.nameMin'))
    .max(255, txt('branch.validation.nameMax')),
  ma_chi_nhanh: z
    .string()
    .trim()
    .max(50, txt('branch.validation.codeMax'))
    .optional()
    .nullable()
    .transform((v) => (v == null || v.trim() === '' ? null : v.trim().toUpperCase()))
    .refine((v) => v == null || MA_REGEX.test(v), { message: txt('branch.validation.codeFormat') }),
  dia_chi: z.string().max(500, txt('branch.validation.addressMax')).optional().nullable(),
  dien_thoai: z.string().max(50, txt('branch.validation.phoneMax')).optional().nullable(),
  email: z
    .string()
    .max(255, txt('branch.validation.emailMax'))
    .optional()
    .nullable()
    .transform((v) => (v == null || v.trim() === '' ? null : v.trim())),
  mo_ta: z.string().max(500, txt('branch.validation.descMax')).optional().nullable(),
  thu_tu: z.preprocess(
    (v) => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? 0 : v),
    z.coerce.number().int().min(0),
  ),
  trang_thai: z.preprocess(
    (v) => normalizeTrangThaiHoatDong(v),
    z.enum(TRANG_THAI_HOAT_DONG, { message: txt('branch.validation.statusInvalid') }),
  ),
});

export type BranchFormValues = z.infer<typeof branchSchema>;
