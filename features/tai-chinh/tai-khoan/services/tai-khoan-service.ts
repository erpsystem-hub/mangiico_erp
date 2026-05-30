import type { FinanceAccount } from '../core/types';
import { FinanceAccountFormValues, financeAccountSchema } from '../core/schema';
import type { LoaiQuy } from '../core/constants';
import { findBankByBin } from '../core/constants';
import {
  normalizeTrangThaiHoatDong,
  parseTrangThaiHoatDongImport,
  type TrangThaiHoatDong,
} from '@/lib/constants/trang-thai';
import { createRepository } from '@/lib/data/create-repository';
import { getSupabase } from '@/lib/supabase/client';
import { handleSupabaseError } from '@/lib/supabase/errors';
import {
  FINANCE_ACCOUNT_RETURNING_FULL,
  FINANCE_ACCOUNT_RETURNING_STATUS_ONLY,
  FINANCE_ACCOUNT_SELECT_FULL,
} from '../core/supabase-select';
import { txt } from '@/lib/text';
import type { Branch } from '@/features/he-thong/chi-nhanh/core/types';

type RawRow = FinanceAccount & {
  cn?: { ten_chi_nhanh?: string | null; ma_chi_nhanh?: string | null } | null;
};

const repo = createRepository<RawRow>({
  tableName: 'tc_tai_khoan',
  select: FINANCE_ACCOUNT_SELECT_FULL,
});

function normNullableText(v: string | null | undefined): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

function normalizeFinanceAccountRow(raw: RawRow): FinanceAccount {
  const cn = raw.cn;
  const loai = raw.loai_quy === 'Ngân hàng' ? 'Ngân hàng' : 'Tiền mặt';
  const soDu =
    typeof raw.so_du_khoi_dau === 'number' && !Number.isNaN(raw.so_du_khoi_dau)
      ? raw.so_du_khoi_dau
      : Number(raw.so_du_khoi_dau) || 0;

  return {
    id: String(raw.id),
    ten_quy: String(raw.ten_quy).trim(),
    loai_quy: loai as LoaiQuy,
    chi_nhanh_id: raw.chi_nhanh_id == null ? null : String(raw.chi_nhanh_id),
    ten_chi_nhanh: cn?.ten_chi_nhanh ?? null,
    ma_chi_nhanh: cn?.ma_chi_nhanh ?? null,
    ngan_hang: normNullableText(raw.ngan_hang ?? undefined),
    ma_ngan_hang_bin: normNullableText(raw.ma_ngan_hang_bin ?? undefined),
    so_tai_khoan: normNullableText(raw.so_tai_khoan ?? undefined),
    chu_tai_khoan: normNullableText(raw.chu_tai_khoan ?? undefined),
    so_du_khoi_dau: soDu,
    trang_thai: normalizeTrangThaiHoatDong(raw.trang_thai),
    tg_tao: raw.tg_tao,
    tg_cap_nhat: raw.tg_cap_nhat,
  };
}

function toDbPayload(data: FinanceAccountFormValues) {
  const isBank = data.loai_quy === 'Ngân hàng';
  const bank = isBank ? findBankByBin(data.ma_ngan_hang_bin) : undefined;
  return {
    ten_quy: data.ten_quy.trim(),
    loai_quy: data.loai_quy,
    chi_nhanh_id: Number(data.chi_nhanh_id),
    ngan_hang: isBank ? (bank?.name ?? normNullableText(data.ngan_hang ?? undefined)) : null,
    ma_ngan_hang_bin: isBank ? normNullableText(data.ma_ngan_hang_bin ?? undefined) : null,
    so_tai_khoan: isBank ? normNullableText(data.so_tai_khoan?.replace(/\s+/g, '') ?? undefined) : null,
    chu_tai_khoan: isBank ? normNullableText(data.chu_tai_khoan ?? undefined) : null,
    so_du_khoi_dau: data.so_du_khoi_dau ?? 0,
    trang_thai: data.trang_thai,
  };
}

async function assertUniqueTenQuy(ten: string, excludeId?: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const tenKey = ten.trim().toLowerCase();
  const { data, error } = await supabase.from('tc_tai_khoan').select('id,ten_quy');
  handleSupabaseError(error);
  for (const row of data ?? []) {
    if (excludeId && String(row.id) === excludeId) continue;
    if (String(row.ten_quy).trim().toLowerCase() === tenKey) {
      throw new Error(txt('financeAccount.service.duplicateName'));
    }
  }
}

export const getFinanceAccounts = async (): Promise<FinanceAccount[]> => {
  const list = await repo.getAll({ orderBy: 'ten_quy', ascending: true });
  return list.map((row) => normalizeFinanceAccountRow(row as RawRow));
};

export const getFinanceAccountById = async (id: string): Promise<FinanceAccount | null> => {
  const row = await repo.getById(id);
  return row ? normalizeFinanceAccountRow(row as RawRow) : null;
};

export const createFinanceAccount = async (data: FinanceAccountFormValues): Promise<FinanceAccount> => {
  const now = new Date().toISOString();
  const ten = data.ten_quy.trim();
  await assertUniqueTenQuy(ten);

  const payload = {
    ...toDbPayload(data),
    tg_tao: now,
    tg_cap_nhat: now,
  };

  const inserted = await repo.insert(payload as unknown as Omit<RawRow, 'id'> & { id?: string }, {
    returningSelect: FINANCE_ACCOUNT_RETURNING_FULL,
  });
  const full = await getFinanceAccountById(String(inserted.id));
  if (!full) throw new Error(txt('financeAccount.service.createFetchFailed'));
  return full;
};

export const updateFinanceAccount = async (
  id: string,
  data: FinanceAccountFormValues,
): Promise<FinanceAccount> => {
  const ten = data.ten_quy.trim();
  await assertUniqueTenQuy(ten, id);

  const payload = {
    ...toDbPayload(data),
    tg_cap_nhat: new Date().toISOString(),
  };

  await repo.update(id, payload as unknown as Partial<RawRow>, {
    returningSelect: FINANCE_ACCOUNT_RETURNING_FULL,
  });
  const full = await getFinanceAccountById(id);
  if (!full) throw new Error(txt('financeAccount.service.notFound'));
  return full;
};

export const updateFinanceAccountStatus = async (
  ids: string[],
  status: TrangThaiHoatDong,
): Promise<FinanceAccount | undefined> => {
  const now = new Date().toISOString();
  const results = await Promise.all(
    ids.map((id) =>
      repo.update(id, { trang_thai: status, tg_cap_nhat: now } as Partial<RawRow>, {
        returningSelect: FINANCE_ACCOUNT_RETURNING_STATUS_ONLY,
      }),
    ),
  );
  if (ids.length !== 1) return undefined;
  const full = await getFinanceAccountById(String(results[0].id));
  return full ?? undefined;
};

export const deleteFinanceAccounts = async (ids: string[]): Promise<void> => {
  await repo.remove(ids);
};

function resolveBranchId(
  row: Record<string, unknown>,
  branches: Branch[],
): string | null {
  const rawId = row.chi_nhanh_id ?? row.ma_chi_nhanh ?? row.ten_chi_nhanh;
  if (rawId == null || String(rawId).trim() === '') return null;
  const s = String(rawId).trim();
  const byId = branches.find((b) => b.id === s);
  if (byId) return byId.id;
  const lower = s.toLowerCase();
  const byMa = branches.find((b) => b.ma_chi_nhanh?.trim().toLowerCase() === lower);
  if (byMa) return byMa.id;
  const byTen = branches.find((b) => b.ten_chi_nhanh.trim().toLowerCase() === lower);
  return byTen?.id ?? null;
}

export const importFinanceAccounts = async (
  rows: Record<string, unknown>[],
  branches: Branch[],
): Promise<{ created: number; errors: string[] }> => {
  const errors: string[] = [];
  let created = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const ten_quy = String(row.ten_quy ?? '').trim();
    if (!ten_quy) {
      errors.push(`Dòng ${i + 2}: Thiếu tên quỹ`);
      continue;
    }

    const chi_nhanh_id = resolveBranchId(row, branches);
    if (!chi_nhanh_id) {
      errors.push(`Dòng ${i + 2}: Không tìm thấy chi nhánh`);
      continue;
    }

    const loaiRaw = String(row.loai_quy ?? 'Tiền mặt').trim();
    const loai_quy = loaiRaw === 'Ngân hàng' ? 'Ngân hàng' : 'Tiền mặt';

    const parsed = financeAccountSchema.safeParse({
      ten_quy,
      loai_quy,
      chi_nhanh_id,
      ngan_hang: row.ngan_hang != null ? String(row.ngan_hang) : null,
      ma_ngan_hang_bin: row.ma_ngan_hang_bin != null ? String(row.ma_ngan_hang_bin) : null,
      so_tai_khoan: row.so_tai_khoan != null ? String(row.so_tai_khoan) : null,
      chu_tai_khoan: row.chu_tai_khoan != null ? String(row.chu_tai_khoan) : null,
      so_du_khoi_dau:
        row.so_du_khoi_dau != null && String(row.so_du_khoi_dau).trim() !== ''
          ? Number(row.so_du_khoi_dau)
          : 0,
      trang_thai: parseTrangThaiHoatDongImport(row.trang_thai),
    });

    if (!parsed.success) {
      const msg = parsed.error.flatten().formErrors[0] ?? parsed.error.message;
      errors.push(`Dòng ${i + 2}: ${msg}`);
      continue;
    }

    try {
      await createFinanceAccount(parsed.data);
      created++;
    } catch (e: unknown) {
      errors.push(`Dòng ${i + 2}: ${e instanceof Error ? e.message : 'Lỗi'}`);
    }
  }

  return { created, errors };
};
