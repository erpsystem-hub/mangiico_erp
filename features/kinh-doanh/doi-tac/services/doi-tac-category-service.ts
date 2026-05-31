import type { PartnerCategory, PartnerKind } from '../core/types';
import type { PartnerCategoryFormValues } from '../core/schema';
import { createRepository } from '@/lib/data/create-repository';
import { getSupabase } from '@/lib/supabase/client';
import { handleSupabaseError } from '@/lib/supabase/errors';
import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';
import { normalizeTrangThaiHoatDong } from '@/lib/constants/trang-thai';
import {
  PARTNER_CATEGORY_RETURNING_FULL,
  PARTNER_CATEGORY_RETURNING_STATUS_ONLY,
  PARTNER_CATEGORY_SELECT_FULL,
} from '../core/supabase-select';
import { txt } from '@/lib/text';

function createRepo() {
  return createRepository<PartnerCategory>({
    tableName: 'kd_danh_muc_doi_tac',
    select: PARTNER_CATEGORY_SELECT_FULL,
  });
}

function normalizePartnerCategoryRow(raw: PartnerCategory): PartnerCategory {
  return {
    ...raw,
    id: String(raw.id),
    loai_doi_tac: raw.loai_doi_tac as PartnerKind,
    cha_id: raw.cha_id == null || raw.cha_id === '' ? null : String(raw.cha_id),
    cap_do: typeof raw.cap_do === 'number' ? raw.cap_do : Number(raw.cap_do),
    thu_tu: typeof raw.thu_tu === 'number' ? raw.thu_tu : Number(raw.thu_tu),
    ma_danh_muc:
      raw.ma_danh_muc == null || String(raw.ma_danh_muc).trim() === ''
        ? null
        : String(raw.ma_danh_muc).trim(),
    trang_thai: normalizeTrangThaiHoatDong(raw.trang_thai),
    mo_ta: raw.mo_ta == null || String(raw.mo_ta).trim() === '' ? null : String(raw.mo_ta).trim(),
  };
}

function normInt8Fk(v: string | null | undefined): number | null {
  const s = v == null || v === '' ? '' : String(v).trim();
  if (!s || !/^\d+$/.test(s)) return null;
  return Number(s);
}

function chaIdForStorage(chaId: string | null): number | null {
  if (chaId == null || chaId === '') return null;
  return normInt8Fk(chaId);
}

function resolveChaIdForm(dataCha: string | null | undefined): string | null {
  if (dataCha === '' || dataCha == null) return null;
  return String(dataCha).trim();
}

async function assertParentIsRoot(kind: PartnerKind, chaId: string | null): Promise<void> {
  if (!chaId) return;
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');
  const chaNum = normInt8Fk(chaId);
  if (chaNum == null) throw new Error(txt('partnerCategory.service.parentNotRoot'));
  const { data: parent, error } = await supabase
    .from('kd_danh_muc_doi_tac')
    .select('id, cap_do, loai_doi_tac')
    .eq('loai_doi_tac', kind)
    .eq('id', chaNum)
    .maybeSingle();
  if (error) handleSupabaseError(error);
  if (!parent) throw new Error(txt('partnerCategory.service.parentNotFound'));
  if (Number((parent as { cap_do: number }).cap_do) !== 1) {
    throw new Error(txt('partnerCategory.service.parentNotRoot'));
  }
}

export const getPartnerCategories = async (kind: PartnerKind): Promise<PartnerCategory[]> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');
  const { data, error } = await supabase
    .from('kd_danh_muc_doi_tac')
    .select(PARTNER_CATEGORY_SELECT_FULL)
    .eq('loai_doi_tac', kind)
    .order('duong_dan', { ascending: true });
  if (error) handleSupabaseError(error);
  return (data ?? []).map((row) => normalizePartnerCategoryRow(row as unknown as PartnerCategory));
};

export const createPartnerCategory = async (
  kind: PartnerKind,
  data: PartnerCategoryFormValues,
): Promise<PartnerCategory> => {
  const repo = createRepo();
  const chaId = resolveChaIdForm(data.cha_id);
  await assertParentIsRoot(kind, chaId);
  const now = new Date().toISOString();
  const ten = data.ten_danh_muc.trim();
  const ma =
    data.ma_danh_muc != null && String(data.ma_danh_muc).trim() !== ''
      ? String(data.ma_danh_muc).trim()
      : null;

  const inserted = await repo.insert(
    {
      loai_doi_tac: kind,
      ten_danh_muc: ten,
      ma_danh_muc: ma,
      mo_ta: data.mo_ta && String(data.mo_ta).trim() !== '' ? String(data.mo_ta).trim() : null,
      cha_id: normInt8Fk(chaId ?? undefined),
      trang_thai: data.trang_thai,
      thu_tu: data.thu_tu ?? 0,
      duong_dan: '',
      cap_do: 0,
      tg_tao: now,
      tg_cap_nhat: now,
    } as unknown as Omit<PartnerCategory, 'id'> & { id?: string },
    { returningSelect: PARTNER_CATEGORY_RETURNING_FULL },
  );
  return normalizePartnerCategoryRow(inserted as unknown as PartnerCategory);
};

export const updatePartnerCategory = async (
  kind: PartnerKind,
  id: string,
  data: PartnerCategoryFormValues,
): Promise<PartnerCategory> => {
  const repo = createRepo();
  const chaId = resolveChaIdForm(data.cha_id);
  await assertParentIsRoot(kind, chaId);
  const ten = data.ten_danh_muc.trim();
  const ma =
    data.ma_danh_muc != null && String(data.ma_danh_muc).trim() !== ''
      ? String(data.ma_danh_muc).trim()
      : null;

  let duong_dan: string;
  let cap_do: number;

  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const idNum = normInt8Fk(id);
  if (idNum == null) throw new Error(txt('partnerCategory.service.notFound'));
  const chaNum = normInt8Fk(chaId ?? undefined);

  const { data: existingRow, error: e0 } = await supabase
    .from('kd_danh_muc_doi_tac')
    .select('id, cha_id, duong_dan, cap_do, loai_doi_tac')
    .eq('loai_doi_tac', kind)
    .eq('id', idNum)
    .maybeSingle();
  if (e0) handleSupabaseError(e0);
  if (!existingRow) throw new Error(txt('partnerCategory.service.notFound'));
  const existing = {
    cha_id:
      (existingRow as { cha_id: number | string | null }).cha_id == null
        ? null
        : String((existingRow as { cha_id: number | string }).cha_id),
    duong_dan: String((existingRow as { duong_dan: string }).duong_dan),
    cap_do: Number((existingRow as { cap_do: number | string }).cap_do),
  };

  if (existing.cap_do === 2 && chaId !== existing.cha_id) {
    throw new Error(txt('partnerCategory.service.level2ParentLocked'));
  }

  if (chaId === existing.cha_id) {
    duong_dan = existing.duong_dan;
    cap_do = existing.cap_do;
  } else {
    const { data: rpcData, error: rpcErr } = await supabase.rpc(
      'get_kd_danh_muc_doi_tac_path_level',
      { p_id: idNum, p_cha_id: chaNum },
    );
    const rpcRow = Array.isArray(rpcData) ? rpcData[0] : rpcData;
    if (!rpcErr && rpcRow) {
      duong_dan = String((rpcRow as { duong_dan: string }).duong_dan);
      cap_do = Number((rpcRow as { cap_do: number | string }).cap_do);
    } else if (chaNum == null) {
      duong_dan = `/${id}`;
      cap_do = 1;
    } else {
      duong_dan = existing.duong_dan;
      cap_do = existing.cap_do;
    }
  }

  const updated = await repo.update(
    id,
    {
      ten_danh_muc: ten,
      ma_danh_muc: ma,
      mo_ta: data.mo_ta && String(data.mo_ta).trim() !== '' ? String(data.mo_ta).trim() : null,
      cha_id: chaIdForStorage(chaId),
      trang_thai: data.trang_thai,
      thu_tu: data.thu_tu ?? 0,
      duong_dan,
      cap_do,
      tg_cap_nhat: new Date().toISOString(),
    } as unknown as Partial<PartnerCategory>,
    { returningSelect: PARTNER_CATEGORY_RETURNING_FULL },
  );
  return normalizePartnerCategoryRow(updated as PartnerCategory);
};

export const updatePartnerCategoryStatus = async (
  kind: PartnerKind,
  id: string,
  status: TrangThaiHoatDong,
): Promise<PartnerCategory> => {
  const repo = createRepo();
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');
  const idNum = normInt8Fk(id);
  if (idNum == null) throw new Error(txt('partnerCategory.service.notFound'));
  const { data: existing, error } = await supabase
    .from('kd_danh_muc_doi_tac')
    .select('id')
    .eq('loai_doi_tac', kind)
    .eq('id', idNum)
    .maybeSingle();
  if (error) handleSupabaseError(error);
  if (!existing) throw new Error(txt('partnerCategory.service.notFound'));
  const updated = await repo.update(
    id,
    { trang_thai: status, tg_cap_nhat: new Date().toISOString() } as unknown as Partial<PartnerCategory>,
    { returningSelect: PARTNER_CATEGORY_RETURNING_STATUS_ONLY },
  );
  return normalizePartnerCategoryRow(updated as PartnerCategory);
};

export const deletePartnerCategory = async (kind: PartnerKind, id: string): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');
  const idNum = normInt8Fk(id);
  if (idNum != null) {
    const { count, error } = await supabase
      .from('kd_danh_muc_doi_tac')
      .select('id', { count: 'exact', head: true })
      .eq('loai_doi_tac', kind)
      .eq('cha_id', idNum);
    if (error) handleSupabaseError(error);
    if ((count ?? 0) > 0) throw new Error(txt('partnerCategory.service.hasChildren'));
  }
  const repo = createRepo();
  await repo.remove([id]);
};

export const importPartnerCategories = async (
  kind: PartnerKind,
  rows: PartnerCategoryFormValues[],
): Promise<{ created: number; errors: string[] }> => {
  const errors: string[] = [];
  let created = 0;
  const all = await getPartnerCategories(kind);
  for (let i = 0; i < rows.length; i++) {
    try {
      const data = rows[i];
      const idCha = resolveChaIdForm(data.cha_id);
      if (idCha) {
        const parent = all.find((d) => d.id === idCha);
        if (!parent) {
          errors.push(txt('partnerCategory.import.parentMissing', { row: i + 2 }));
          continue;
        }
        if (parent.cap_do !== 1) {
          errors.push(txt('partnerCategory.import.parentNotRoot', { row: i + 2 }));
          continue;
        }
      }
      await createPartnerCategory(kind, { ...data, cha_id: idCha ?? undefined });
      created++;
      const fresh = await getPartnerCategories(kind);
      all.length = 0;
      all.push(...fresh);
    } catch (e: unknown) {
      errors.push(`Dòng ${i + 2}: ${e instanceof Error ? e.message : 'Lỗi'}`);
    }
  }
  return { created, errors };
};
