import type { MaterialCategory } from '../core/types';
import type { MaterialCategoryFormValues } from '../core/schema';
import { createRepository } from '@/lib/data/create-repository';
import { getSupabase } from '@/lib/supabase/client';
import { handleSupabaseError } from '@/lib/supabase/errors';
import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';
import { normalizeTrangThaiHoatDong } from '@/lib/constants/trang-thai';
import {
  MATERIAL_CATEGORY_RETURNING_FULL,
  MATERIAL_CATEGORY_RETURNING_STATUS_ONLY,
  MATERIAL_CATEGORY_SELECT_FULL,
} from '../core/supabase-select';
import { txt } from '@/lib/text';

const repo = createRepository<MaterialCategory>({
  tableName: 'sx_danh_muc_nguyen_lieu',
  select: MATERIAL_CATEGORY_SELECT_FULL,
});

function normalizeMaterialCategoryRow(raw: MaterialCategory): MaterialCategory {
  return {
    ...raw,
    id: String(raw.id),
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

async function assertParentIsRoot(chaId: string | null): Promise<void> {
  if (!chaId) return;
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');
  const chaNum = normInt8Fk(chaId);
  if (chaNum == null) throw new Error(txt('materialCategory.service.parentNotRoot'));
  const { data: parent, error } = await supabase
    .from('sx_danh_muc_nguyen_lieu')
    .select('id, cap_do')
    .eq('id', chaNum)
    .maybeSingle();
  if (error) handleSupabaseError(error);
  if (!parent) throw new Error(txt('materialCategory.service.parentNotFound'));
  if (Number((parent as { cap_do: number }).cap_do) !== 1) {
    throw new Error(txt('materialCategory.service.parentNotRoot'));
  }
}

export const getMaterialCategories = async (): Promise<MaterialCategory[]> => {
  const list = await repo.getAll({ orderBy: 'duong_dan', ascending: true });
  return list.map((row) => normalizeMaterialCategoryRow(row as MaterialCategory));
};

export const createMaterialCategory = async (
  data: MaterialCategoryFormValues,
): Promise<MaterialCategory> => {
  const chaId = resolveChaIdForm(data.cha_id);
  await assertParentIsRoot(chaId);
  const now = new Date().toISOString();
  const ten = data.ten_danh_muc.trim();
  const ma =
    data.ma_danh_muc != null && String(data.ma_danh_muc).trim() !== ''
      ? String(data.ma_danh_muc).trim()
      : null;

  const inserted = await repo.insert(
    {
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
    } as unknown as Omit<MaterialCategory, 'id'> & { id?: string },
    { returningSelect: MATERIAL_CATEGORY_RETURNING_FULL },
  );
  return normalizeMaterialCategoryRow(inserted as MaterialCategory);
};

export const updateMaterialCategory = async (
  id: string,
  data: MaterialCategoryFormValues,
): Promise<MaterialCategory> => {
  const chaId = resolveChaIdForm(data.cha_id);
  await assertParentIsRoot(chaId);
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
  if (idNum == null) throw new Error(txt('materialCategory.service.notFound'));
  const chaNum = normInt8Fk(chaId ?? undefined);

  const { data: existingRow, error: e0 } = await supabase
    .from('sx_danh_muc_nguyen_lieu')
    .select('id, cha_id, duong_dan, cap_do')
    .eq('id', idNum)
    .maybeSingle();
  if (e0) handleSupabaseError(e0);
  if (!existingRow) throw new Error(txt('materialCategory.service.notFound'));
  const existing = {
    cha_id:
      (existingRow as { cha_id: number | string | null }).cha_id == null
        ? null
        : String((existingRow as { cha_id: number | string }).cha_id),
    duong_dan: String((existingRow as { duong_dan: string }).duong_dan),
    cap_do: Number((existingRow as { cap_do: number | string }).cap_do),
  };

  if (existing.cap_do === 2 && chaId !== existing.cha_id) {
    throw new Error(txt('materialCategory.service.level2ParentLocked'));
  }

  if (chaId === existing.cha_id) {
    duong_dan = existing.duong_dan;
    cap_do = existing.cap_do;
  } else {
    const { data: rpcData, error: rpcErr } = await supabase.rpc(
      'get_sx_danh_muc_nguyen_lieu_path_level',
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
    } as unknown as Partial<MaterialCategory>,
    { returningSelect: MATERIAL_CATEGORY_RETURNING_FULL },
  );
  return normalizeMaterialCategoryRow(updated as MaterialCategory);
};

export const updateMaterialCategoryStatus = async (
  id: string,
  status: TrangThaiHoatDong,
): Promise<MaterialCategory> => {
  const existing = await repo.getById(id);
  if (!existing) throw new Error(txt('materialCategory.service.notFound'));
  const updated = await repo.update(
    id,
    { trang_thai: status, tg_cap_nhat: new Date().toISOString() } as unknown as Partial<MaterialCategory>,
    { returningSelect: MATERIAL_CATEGORY_RETURNING_STATUS_ONLY },
  );
  return normalizeMaterialCategoryRow(updated as MaterialCategory);
};

export const deleteMaterialCategory = async (id: string): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');
  const idNum = normInt8Fk(id);
  if (idNum != null) {
    const { count, error } = await supabase
      .from('sx_danh_muc_nguyen_lieu')
      .select('id', { count: 'exact', head: true })
      .eq('cha_id', idNum);
    if (error) handleSupabaseError(error);
    if ((count ?? 0) > 0) throw new Error(txt('materialCategory.service.hasChildren'));
  }
  await repo.remove([id]);
};

export const importMaterialCategories = async (
  rows: MaterialCategoryFormValues[],
): Promise<{ created: number; errors: string[] }> => {
  const errors: string[] = [];
  let created = 0;
  const all = await getMaterialCategories();
  for (let i = 0; i < rows.length; i++) {
    try {
      const data = rows[i];
      const idCha = resolveChaIdForm(data.cha_id);
      if (idCha) {
        const parent = all.find((d) => d.id === idCha);
        if (!parent) {
          errors.push(txt('materialCategory.import.parentMissing', { row: i + 2 }));
          continue;
        }
        if (parent.cap_do !== 1) {
          errors.push(txt('materialCategory.import.parentNotRoot', { row: i + 2 }));
          continue;
        }
      }
      await createMaterialCategory({ ...data, cha_id: idCha ?? undefined });
      created++;
      const fresh = await getMaterialCategories();
      all.length = 0;
      all.push(...fresh);
    } catch (e: unknown) {
      errors.push(`Dòng ${i + 2}: ${e instanceof Error ? e.message : 'Lỗi'}`);
    }
  }
  return { created, errors };
};
