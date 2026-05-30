import type { MeasurementSpec } from '../core/types';
import { MeasurementSpecFormValues, measurementSpecSchema } from '../core/schema';
import {
  normalizeTrangThaiHoatDong,
  parseTrangThaiHoatDongImport,
  type TrangThaiHoatDong,
} from '@/lib/constants/trang-thai';
import { createRepository } from '@/lib/data/create-repository';
import { getSupabase } from '@/lib/supabase/client';
import { handleSupabaseError } from '@/lib/supabase/errors';
import {
  MEASUREMENT_SPEC_RETURNING_FULL,
  MEASUREMENT_SPEC_RETURNING_STATUS_ONLY,
  MEASUREMENT_SPEC_SELECT_FULL,
} from '../core/supabase-select';
import { txt } from '@/lib/text';

const repo = createRepository<MeasurementSpec>({
  tableName: 'sx_thong_so_do',
  select: MEASUREMENT_SPEC_SELECT_FULL,
});

function normalizeMeasurementSpecRow(raw: MeasurementSpec): MeasurementSpec {
  return {
    ...raw,
    id: String(raw.id),
    ten_hien_thi: String(raw.ten_hien_thi).trim(),
    thu_tu: typeof raw.thu_tu === 'number' ? raw.thu_tu : Number(raw.thu_tu ?? 0),
    don_vi: String(raw.don_vi).trim(),
    trang_thai: normalizeTrangThaiHoatDong(raw.trang_thai),
  };
}

async function nextThuTu(): Promise<number> {
  const list = await repo.getAll({ orderBy: 'thu_tu', ascending: false });
  const max = list[0] ? Number((list[0] as MeasurementSpec).thu_tu) : 0;
  return max + 1;
}

async function assertUniqueTenHienThi(ten: string, excludeId?: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const tenKey = ten.trim().toLowerCase();
  const { data, error } = await supabase.from('sx_thong_so_do').select('id,ten_hien_thi');
  handleSupabaseError(error);
  for (const row of data ?? []) {
    if (excludeId && String(row.id) === excludeId) continue;
    if (String(row.ten_hien_thi).trim().toLowerCase() === tenKey) {
      throw new Error(txt('measurementSpec.service.duplicateName'));
    }
  }
}

export const getMeasurementSpecs = async (): Promise<MeasurementSpec[]> => {
  const list = await repo.getAll({ orderBy: 'thu_tu', ascending: true });
  return list.map((row) => normalizeMeasurementSpecRow(row as MeasurementSpec));
};

export const getMeasurementSpecById = async (id: string): Promise<MeasurementSpec | null> => {
  const row = await repo.getById(id);
  return row ? normalizeMeasurementSpecRow(row as MeasurementSpec) : null;
};

export const createMeasurementSpec = async (
  data: MeasurementSpecFormValues,
): Promise<MeasurementSpec> => {
  const now = new Date().toISOString();
  const ten = data.ten_hien_thi.trim();
  await assertUniqueTenHienThi(ten);

  const thu_tu = data.thu_tu ?? (await nextThuTu());
  const payload = {
    ten_hien_thi: ten,
    thu_tu,
    don_vi: data.don_vi.trim(),
    trang_thai: data.trang_thai,
    tg_tao: now,
    tg_cap_nhat: now,
  };

  const inserted = await repo.insert(payload as unknown as Omit<MeasurementSpec, 'id'> & { id?: string }, {
    returningSelect: MEASUREMENT_SPEC_RETURNING_FULL,
  });
  const full = await getMeasurementSpecById(String(inserted.id));
  if (!full) throw new Error(txt('measurementSpec.service.createFetchFailed'));
  return full;
};

export const updateMeasurementSpec = async (
  id: string,
  data: MeasurementSpecFormValues,
): Promise<MeasurementSpec> => {
  const ten = data.ten_hien_thi.trim();
  await assertUniqueTenHienThi(ten, id);

  const payload = {
    ten_hien_thi: ten,
    thu_tu: data.thu_tu ?? 0,
    don_vi: data.don_vi.trim(),
    trang_thai: data.trang_thai,
    tg_cap_nhat: new Date().toISOString(),
  };

  await repo.update(id, payload as unknown as Partial<MeasurementSpec>, {
    returningSelect: MEASUREMENT_SPEC_RETURNING_FULL,
  });
  const full = await getMeasurementSpecById(id);
  if (!full) throw new Error(txt('measurementSpec.service.notFound'));
  return full;
};

export const updateMeasurementSpecStatus = async (
  ids: string[],
  status: TrangThaiHoatDong,
): Promise<MeasurementSpec | undefined> => {
  const now = new Date().toISOString();
  const results = await Promise.all(
    ids.map((id) =>
      repo.update(id, { trang_thai: status, tg_cap_nhat: now } as Partial<MeasurementSpec>, {
        returningSelect: MEASUREMENT_SPEC_RETURNING_STATUS_ONLY,
      }),
    ),
  );
  if (ids.length !== 1) return undefined;
  const full = await getMeasurementSpecById(String(results[0].id));
  return full ?? undefined;
};

export const deleteMeasurementSpecs = async (ids: string[]): Promise<void> => {
  await repo.remove(ids);
};

export const importMeasurementSpecs = async (
  rows: Record<string, unknown>[],
): Promise<{ created: number; errors: string[] }> => {
  const errors: string[] = [];
  let created = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const ten_hien_thi = String(row.ten_hien_thi ?? '').trim();
    const don_vi = String(row.don_vi ?? '').trim();
    if (!ten_hien_thi) {
      errors.push(`Dòng ${i + 2}: Thiếu tên hiển thị`);
      continue;
    }
    if (!don_vi) {
      errors.push(`Dòng ${i + 2}: Thiếu đơn vị đo`);
      continue;
    }

    const parsed = measurementSpecSchema.safeParse({
      ten_hien_thi,
      don_vi,
      trang_thai: parseTrangThaiHoatDongImport(row.trang_thai),
    });

    if (!parsed.success) {
      const msg = parsed.error.flatten().formErrors[0] ?? parsed.error.message;
      errors.push(`Dòng ${i + 2}: ${msg}`);
      continue;
    }

    try {
      await createMeasurementSpec(parsed.data);
      created++;
    } catch (e: unknown) {
      errors.push(`Dòng ${i + 2}: ${e instanceof Error ? e.message : 'Lỗi'}`);
    }
  }

  return { created, errors };
};
