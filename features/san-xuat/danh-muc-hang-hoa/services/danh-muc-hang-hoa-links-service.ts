import { getSupabase } from '@/lib/supabase/client';
import { handleSupabaseError } from '@/lib/supabase/errors';
import type {
  CategoryAttributeLink,
  CategoryAttributeLinkInput,
  CategoryLinksBundle,
  CategoryMeasurementLink,
  CategoryMeasurementLinkInput,
} from '../core/types';

function normId(v: string): number | null {
  const s = String(v).trim();
  if (!/^\d+$/.test(s)) return null;
  return Number(s);
}

export async function getCategoryAttributeLinks(
  danhMucId: string,
): Promise<CategoryAttributeLink[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');
  const dmId = normId(danhMucId);
  if (dmId == null) return [];

  const { data, error } = await supabase
    .from('sx_danh_muc_thuoc_tinh')
    .select(
      'thuoc_tinh_id, bat_buoc, thu_tu, sx_thuoc_tinh_hang_hoa ( ten_hien_thi )',
    )
    .eq('danh_muc_id', dmId)
    .order('thu_tu', { ascending: true });
  if (error) handleSupabaseError(error);

  return (data ?? []).map((row) => {
    const master = row.sx_thuoc_tinh_hang_hoa as { ten_hien_thi: string } | null;
    return {
      thuoc_tinh_id: String(row.thuoc_tinh_id),
      ten_hien_thi: master?.ten_hien_thi ?? '',
      bat_buoc: Boolean(row.bat_buoc),
      thu_tu: Number(row.thu_tu),
    };
  });
}

export async function getCategoryMeasurementLinks(
  danhMucId: string,
): Promise<CategoryMeasurementLink[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');
  const dmId = normId(danhMucId);
  if (dmId == null) return [];

  const { data, error } = await supabase
    .from('sx_danh_muc_thong_so_do')
    .select('thong_so_do_id, bat_buoc, thu_tu, sx_thong_so_do ( ten_hien_thi, don_vi )')
    .eq('danh_muc_id', dmId)
    .order('thu_tu', { ascending: true });
  if (error) handleSupabaseError(error);

  return (data ?? []).map((row) => {
    const master = row.sx_thong_so_do as { ten_hien_thi: string; don_vi: string } | null;
    return {
      thong_so_do_id: String(row.thong_so_do_id),
      ten_hien_thi: master?.ten_hien_thi ?? '',
      don_vi: master?.don_vi ?? '',
      bat_buoc: Boolean(row.bat_buoc),
      thu_tu: Number(row.thu_tu),
    };
  });
}

export async function getCategoryLinks(danhMucId: string): Promise<CategoryLinksBundle> {
  const [attributeLinks, measurementLinks] = await Promise.all([
    getCategoryAttributeLinks(danhMucId),
    getCategoryMeasurementLinks(danhMucId),
  ]);
  return { attributeLinks, measurementLinks };
}

export async function clearCategoryLinks(danhMucId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');
  const dmId = normId(danhMucId);
  if (dmId == null) return;

  const { error: e1 } = await supabase
    .from('sx_danh_muc_thuoc_tinh')
    .delete()
    .eq('danh_muc_id', dmId);
  if (e1) handleSupabaseError(e1);

  const { error: e2 } = await supabase
    .from('sx_danh_muc_thong_so_do')
    .delete()
    .eq('danh_muc_id', dmId);
  if (e2) handleSupabaseError(e2);
}

export async function replaceCategoryAttributeLinks(
  danhMucId: string,
  rows: CategoryAttributeLinkInput[],
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');
  const dmId = normId(danhMucId);
  if (dmId == null) return;

  const { error: delErr } = await supabase
    .from('sx_danh_muc_thuoc_tinh')
    .delete()
    .eq('danh_muc_id', dmId);
  if (delErr) handleSupabaseError(delErr);

  if (rows.length === 0) return;

  const payload = rows.map((r, i) => {
    const tid = normId(r.thuoc_tinh_id);
    if (tid == null) throw new Error(`Invalid thuoc_tinh_id: ${r.thuoc_tinh_id}`);
    return {
      danh_muc_id: dmId,
      thuoc_tinh_id: tid,
      bat_buoc: r.bat_buoc,
      thu_tu: r.thu_tu ?? i,
    };
  });

  const { error } = await supabase.from('sx_danh_muc_thuoc_tinh').insert(payload);
  if (error) handleSupabaseError(error);
}

export async function replaceCategoryMeasurementLinks(
  danhMucId: string,
  rows: CategoryMeasurementLinkInput[],
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');
  const dmId = normId(danhMucId);
  if (dmId == null) return;

  const { error: delErr } = await supabase
    .from('sx_danh_muc_thong_so_do')
    .delete()
    .eq('danh_muc_id', dmId);
  if (delErr) handleSupabaseError(delErr);

  if (rows.length === 0) return;

  const payload = rows.map((r, i) => {
    const sid = normId(r.thong_so_do_id);
    if (sid == null) throw new Error(`Invalid thong_so_do_id: ${r.thong_so_do_id}`);
    return {
      danh_muc_id: dmId,
      thong_so_do_id: sid,
      bat_buoc: r.bat_buoc,
      thu_tu: r.thu_tu ?? i,
    };
  });

  const { error } = await supabase.from('sx_danh_muc_thong_so_do').insert(payload);
  if (error) handleSupabaseError(error);
}

export async function syncCategoryLinksForCategory(
  danhMucId: string,
  capDo: number,
  attributeLinks: CategoryAttributeLinkInput[],
  measurementLinks: CategoryMeasurementLinkInput[],
): Promise<void> {
  if (capDo !== 2) {
    await clearCategoryLinks(danhMucId);
    return;
  }
  await replaceCategoryAttributeLinks(danhMucId, attributeLinks);
  await replaceCategoryMeasurementLinks(danhMucId, measurementLinks);
}

/** danh_muc_id → set of linked master ids */
export type CategoryLinkMatrix = Map<string, Set<string>>;

function buildLinkMatrix(rows: { danh_muc_id: number; master_id: number }[]): CategoryLinkMatrix {
  const m: CategoryLinkMatrix = new Map();
  for (const row of rows) {
    const dm = String(row.danh_muc_id);
    const mid = String(row.master_id);
    let set = m.get(dm);
    if (!set) {
      set = new Set();
      m.set(dm, set);
    }
    set.add(mid);
  }
  return m;
}

export async function getAllCategoryAttributeLinkKeys(): Promise<CategoryLinkMatrix> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');
  const { data, error } = await supabase
    .from('sx_danh_muc_thuoc_tinh')
    .select('danh_muc_id, thuoc_tinh_id');
  if (error) handleSupabaseError(error);
  const rows = (data ?? []).map((r) => ({
    danh_muc_id: Number(r.danh_muc_id),
    master_id: Number(r.thuoc_tinh_id),
  }));
  return buildLinkMatrix(rows);
}

export async function getAllCategoryMeasurementLinkKeys(): Promise<CategoryLinkMatrix> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');
  const { data, error } = await supabase
    .from('sx_danh_muc_thong_so_do')
    .select('danh_muc_id, thong_so_do_id');
  if (error) handleSupabaseError(error);
  const rows = (data ?? []).map((r) => ({
    danh_muc_id: Number(r.danh_muc_id),
    master_id: Number(r.thong_so_do_id),
  }));
  return buildLinkMatrix(rows);
}

async function nextJunctionThuTu(
  table: 'sx_danh_muc_thuoc_tinh' | 'sx_danh_muc_thong_so_do',
  danhMucId: number,
): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');
  const { data, error } = await supabase
    .from(table)
    .select('thu_tu')
    .eq('danh_muc_id', danhMucId)
    .order('thu_tu', { ascending: false })
    .limit(1);
  if (error) handleSupabaseError(error);
  const max = data?.[0] ? Number(data[0].thu_tu) : -1;
  return max + 1;
}

export async function toggleCategoryAttributeLink(
  danhMucId: string,
  thuocTinhId: string,
  linked: boolean,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');
  const dmId = normId(danhMucId);
  const tid = normId(thuocTinhId);
  if (dmId == null || tid == null) return;

  if (!linked) {
    const { error } = await supabase
      .from('sx_danh_muc_thuoc_tinh')
      .delete()
      .eq('danh_muc_id', dmId)
      .eq('thuoc_tinh_id', tid);
    if (error) handleSupabaseError(error);
    return;
  }

  const thu_tu = await nextJunctionThuTu('sx_danh_muc_thuoc_tinh', dmId);
  const { error } = await supabase.from('sx_danh_muc_thuoc_tinh').insert({
    danh_muc_id: dmId,
    thuoc_tinh_id: tid,
    bat_buoc: false,
    thu_tu,
  });
  if (error) handleSupabaseError(error);
}

export async function toggleCategoryMeasurementLink(
  danhMucId: string,
  thongSoDoId: string,
  linked: boolean,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');
  const dmId = normId(danhMucId);
  const sid = normId(thongSoDoId);
  if (dmId == null || sid == null) return;

  if (!linked) {
    const { error } = await supabase
      .from('sx_danh_muc_thong_so_do')
      .delete()
      .eq('danh_muc_id', dmId)
      .eq('thong_so_do_id', sid);
    if (error) handleSupabaseError(error);
    return;
  }

  const thu_tu = await nextJunctionThuTu('sx_danh_muc_thong_so_do', dmId);
  const { error } = await supabase.from('sx_danh_muc_thong_so_do').insert({
    danh_muc_id: dmId,
    thong_so_do_id: sid,
    bat_buoc: false,
    thu_tu,
  });
  if (error) handleSupabaseError(error);
}
