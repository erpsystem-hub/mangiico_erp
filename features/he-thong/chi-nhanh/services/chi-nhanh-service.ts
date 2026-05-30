import { Branch } from '../core/types';
import { BranchFormValues, branchSchema } from '../core/schema';
import {
  normalizeTrangThaiHoatDong,
  parseTrangThaiHoatDongImport,
  type TrangThaiHoatDong,
} from '@/lib/constants/trang-thai';
import { createRepository } from '@/lib/data/create-repository';
import { getSupabase } from '@/lib/supabase/client';
import { handleSupabaseError } from '@/lib/supabase/errors';
import {
  BRANCH_RETURNING_FULL,
  BRANCH_RETURNING_STATUS_ONLY,
  BRANCH_SELECT_FULL,
} from '../core/supabase-select';
import { txt } from '../../../../lib/text';

const repo = createRepository<Branch>({
  tableName: 'var_chi_nhanh',
  select: BRANCH_SELECT_FULL,
});

export class BranchHasEmployeesError extends Error {
  constructor() {
    super(txt('branch.service.hasEmployees'));
    this.name = 'BranchHasEmployeesError';
  }
}

function normalizeBranchRow(raw: Branch): Branch {
  return {
    ...raw,
    id: String(raw.id),
    ma_chi_nhanh: raw.ma_chi_nhanh == null || raw.ma_chi_nhanh === '' ? null : String(raw.ma_chi_nhanh),
    dia_chi: raw.dia_chi == null || raw.dia_chi === '' ? null : String(raw.dia_chi),
    dien_thoai: raw.dien_thoai == null || raw.dien_thoai === '' ? null : String(raw.dien_thoai),
    email: raw.email == null || raw.email === '' ? null : String(raw.email),
    mo_ta: raw.mo_ta == null || raw.mo_ta === '' ? null : String(raw.mo_ta),
    thu_tu: typeof raw.thu_tu === 'number' && !Number.isNaN(raw.thu_tu) ? raw.thu_tu : Number(raw.thu_tu) || 0,
    trang_thai: normalizeTrangThaiHoatDong(raw.trang_thai),
  };
}

function normNullableText(v: string | null | undefined): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

async function assertUniqueBranch(
  ten: string,
  ma: string | null,
  excludeId?: string,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const tenKey = ten.trim().toLowerCase();
  const { data, error } = await supabase.from('var_chi_nhanh').select('id,ten_chi_nhanh,ma_chi_nhanh');
  handleSupabaseError(error);
  for (const row of data ?? []) {
    if (excludeId && String(row.id) === excludeId) continue;
    if (String(row.ten_chi_nhanh).trim().toLowerCase() === tenKey) {
      throw new Error(txt('branch.service.duplicateName'));
    }
    if (ma && row.ma_chi_nhanh && String(row.ma_chi_nhanh).trim().toLowerCase() === ma.trim().toLowerCase()) {
      throw new Error(txt('branch.service.duplicateCode'));
    }
  }
}

async function assertNoEmployeesLinked(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const supabase = getSupabase();
  if (!supabase) return;
  const numIds = ids.map((id) => Number(id)).filter((n) => Number.isFinite(n));
  if (numIds.length === 0) return;
  const { count, error } = await supabase
    .from('var_nhan_vien_chi_nhanh')
    .select('id', { count: 'exact', head: true })
    .in('chi_nhanh_id', numIds);
  handleSupabaseError(error);
  if ((count ?? 0) > 0) throw new BranchHasEmployeesError();
}

export const getBranches = async (): Promise<Branch[]> => {
  const list = await repo.getAll({ orderBy: 'thu_tu', ascending: true });
  return list.map((row) => normalizeBranchRow(row as Branch));
};

export const getBranchById = async (id: string): Promise<Branch | null> => {
  const row = await repo.getById(id);
  return row ? normalizeBranchRow(row as Branch) : null;
};

export const createBranch = async (data: BranchFormValues): Promise<Branch> => {
  const now = new Date().toISOString();
  const ten = data.ten_chi_nhanh.trim();
  const ma = data.ma_chi_nhanh ?? null;
  await assertUniqueBranch(ten, ma);

  const payload = {
    ten_chi_nhanh: ten,
    ma_chi_nhanh: ma,
    dia_chi: normNullableText(data.dia_chi ?? undefined),
    dien_thoai: normNullableText(data.dien_thoai ?? undefined),
    email: normNullableText(data.email ?? undefined),
    mo_ta: normNullableText(data.mo_ta ?? undefined),
    thu_tu: data.thu_tu ?? 0,
    trang_thai: data.trang_thai,
    tg_tao: now,
    tg_cap_nhat: now,
  };

  const inserted = await repo.insert(payload as Omit<Branch, 'id'> & { id?: string }, {
    returningSelect: BRANCH_RETURNING_FULL,
  });
  return normalizeBranchRow(inserted as Branch);
};

export const updateBranch = async (id: string, data: BranchFormValues): Promise<Branch> => {
  const ten = data.ten_chi_nhanh.trim();
  const ma = data.ma_chi_nhanh ?? null;
  await assertUniqueBranch(ten, ma, id);

  const payload = {
    ten_chi_nhanh: ten,
    ma_chi_nhanh: ma,
    dia_chi: normNullableText(data.dia_chi ?? undefined),
    dien_thoai: normNullableText(data.dien_thoai ?? undefined),
    email: normNullableText(data.email ?? undefined),
    mo_ta: normNullableText(data.mo_ta ?? undefined),
    thu_tu: data.thu_tu ?? 0,
    trang_thai: data.trang_thai,
    tg_cap_nhat: new Date().toISOString(),
  };

  const updated = await repo.update(id, payload as Partial<Branch>, {
    returningSelect: BRANCH_RETURNING_FULL,
  });
  return normalizeBranchRow(updated as Branch);
};

export const updateBranchStatus = async (
  ids: string[],
  status: TrangThaiHoatDong,
): Promise<Branch | undefined> => {
  const now = new Date().toISOString();
  const results = await Promise.all(
    ids.map((id) =>
      repo.update(id, { trang_thai: status, tg_cap_nhat: now } as Partial<Branch>, {
        returningSelect: BRANCH_RETURNING_STATUS_ONLY,
      }),
    ),
  );
  if (ids.length !== 1) return undefined;
  return normalizeBranchRow(results[0] as Branch);
};

export const deleteBranches = async (ids: string[]): Promise<void> => {
  await assertNoEmployeesLinked(ids);
  await repo.remove(ids);
};

export const importBranches = async (
  rows: Record<string, unknown>[],
): Promise<{ created: number; errors: string[] }> => {
  const errors: string[] = [];
  let created = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const ten_chi_nhanh = String(row.ten_chi_nhanh ?? '').trim();
    if (!ten_chi_nhanh) {
      errors.push(`Dòng ${i + 2}: Thiếu tên chi nhánh`);
      continue;
    }

    const parsed = branchSchema.safeParse({
      ten_chi_nhanh,
      ma_chi_nhanh: row.ma_chi_nhanh != null ? String(row.ma_chi_nhanh) : null,
      dia_chi: row.dia_chi != null ? String(row.dia_chi) : null,
      dien_thoai: row.dien_thoai != null ? String(row.dien_thoai) : null,
      email: row.email != null ? String(row.email) : null,
      mo_ta: row.mo_ta != null ? String(row.mo_ta) : null,
      thu_tu: row.thu_tu != null && String(row.thu_tu).trim() !== '' ? Number(row.thu_tu) : 0,
      trang_thai: parseTrangThaiHoatDongImport(row.trang_thai),
    });
    if (!parsed.success) {
      const msg = parsed.error.flatten().formErrors[0] ?? parsed.error.message;
      errors.push(`Dòng ${i + 2}: ${msg}`);
      continue;
    }

    try {
      await createBranch(parsed.data);
      created++;
    } catch (e: unknown) {
      errors.push(`Dòng ${i + 2}: ${e instanceof Error ? e.message : 'Lỗi'}`);
    }
  }

  return { created, errors };
};
