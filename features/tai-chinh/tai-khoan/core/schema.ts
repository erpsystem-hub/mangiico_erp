import { z } from 'zod';
import { txt } from '@/lib/text';
import { TRANG_THAI_HOAT_DONG, normalizeTrangThaiHoatDong } from '@/lib/constants/trang-thai';
import { LOAI_QUY_VALUES } from './constants';

const ACCOUNT_NUMBER_REGEX = /^\d+$/;

export const financeAccountSchema = z
  .object({
    ten_quy: z
      .string()
      .trim()
      .min(2, txt('financeAccount.validation.nameMin'))
      .max(255, txt('financeAccount.validation.nameMax')),
    loai_quy: z.enum(LOAI_QUY_VALUES, { message: txt('financeAccount.validation.fundTypeInvalid') }),
    chi_nhanh_id: z
      .string()
      .trim()
      .min(1, txt('financeAccount.validation.branchRequired')),
    ngan_hang: z.string().max(255).optional().nullable(),
    ma_ngan_hang_bin: z.string().max(10).optional().nullable(),
    so_tai_khoan: z.string().max(50).optional().nullable(),
    chu_tai_khoan: z.string().max(255).optional().nullable(),
    so_du_khoi_dau: z.preprocess(
      (v) => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? 0 : v),
      z.coerce.number().min(0, txt('financeAccount.validation.balanceMin')),
    ),
    trang_thai: z.preprocess(
      (v) => normalizeTrangThaiHoatDong(v),
      z.enum(TRANG_THAI_HOAT_DONG, { message: txt('financeAccount.validation.statusInvalid') }),
    ),
  })
  .superRefine((data, ctx) => {
    if (data.loai_quy !== 'Ngân hàng') return;
    const bin = data.ma_ngan_hang_bin?.trim();
    const stk = data.so_tai_khoan?.replace(/\s+/g, '').trim();
    const chu = data.chu_tai_khoan?.trim();
    if (!bin) {
      ctx.addIssue({
        code: 'custom',
        message: txt('financeAccount.validation.bankRequired'),
        path: ['ma_ngan_hang_bin'],
      });
    }
    if (!stk) {
      ctx.addIssue({
        code: 'custom',
        message: txt('financeAccount.validation.accountNumberRequired'),
        path: ['so_tai_khoan'],
      });
    } else if (!ACCOUNT_NUMBER_REGEX.test(stk)) {
      ctx.addIssue({
        code: 'custom',
        message: txt('financeAccount.validation.accountNumberFormat'),
        path: ['so_tai_khoan'],
      });
    }
    if (!chu) {
      ctx.addIssue({
        code: 'custom',
        message: txt('financeAccount.validation.accountHolderRequired'),
        path: ['chu_tai_khoan'],
      });
    }
  });

export type FinanceAccountFormValues = z.infer<typeof financeAccountSchema>;
