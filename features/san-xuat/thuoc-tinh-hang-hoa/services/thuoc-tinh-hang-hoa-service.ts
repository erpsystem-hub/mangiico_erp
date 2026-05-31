import type { ProductAttribute } from '../core/types';
import { ProductAttributeFormValues } from '../core/schema';
import {
  normalizeTrangThaiHoatDong,
  parseTrangThaiHoatDongImport,
  type TrangThaiHoatDong,
} from '@/lib/constants/trang-thai';
import { createRepository } from '@/lib/data/create-repository';
import { getSupabase } from '@/lib/supabase/client';
import { handleSupabaseError } from '@/lib/supabase/errors';
import {
  PRODUCT_ATTRIBUTE_RETURNING_FULL,
  PRODUCT_ATTRIBUTE_RETURNING_STATUS_ONLY,
  PRODUCT_ATTRIBUTE_SELECT_FULL,
} from '../core/supabase-select';
import { txt } from '@/lib/text';
import { productAttributeSchema } from '../core/schema';
import { normalizeCacGiaTri } from '../utils/normalize-cac-gia-tri';

const repo = createRepository<ProductAttribute>({
  tableName: 'sx_thuoc_tinh_hang_hoa',
  select: PRODUCT_ATTRIBUTE_SELECT_FULL,
});

function normalizeProductAttributeRow(raw: ProductAttribute): ProductAttribute {
  return {
    ...raw,
    id: String(raw.id),
    ten_hien_thi: String(raw.ten_hien_thi).trim(),
    cac_gia_tri: normalizeCacGiaTri(raw.cac_gia_tri),
    thu_tu: typeof raw.thu_tu === 'number' ? raw.thu_tu : Number(raw.thu_tu ?? 0),
    trang_thai: normalizeTrangThaiHoatDong(raw.trang_thai),
  };
}

async function nextThuTu(): Promise<number> {
  const list = await repo.getAll({ orderBy: 'thu_tu', ascending: false });
  const max = list[0] ? Number((list[0] as ProductAttribute).thu_tu) : 0;
  return max + 1;
}

async function assertUniqueTenHienThi(ten: string, excludeId?: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const tenKey = ten.trim().toLowerCase();
  const { data, error } = await supabase.from('sx_thuoc_tinh_hang_hoa').select('id,ten_hien_thi');
  handleSupabaseError(error);
  for (const row of data ?? []) {
    if (excludeId && String(row.id) === excludeId) continue;
    if (String(row.ten_hien_thi).trim().toLowerCase() === tenKey) {
      throw new Error(txt('productAttribute.service.duplicateName'));
    }
  }
}

export const getProductAttributes = async (): Promise<ProductAttribute[]> => {
  const list = await repo.getAll({ orderBy: 'thu_tu', ascending: true });
  return list.map((row) => normalizeProductAttributeRow(row as ProductAttribute));
};

export const getProductAttributeById = async (id: string): Promise<ProductAttribute | null> => {
  const row = await repo.getById(id);
  return row ? normalizeProductAttributeRow(row as ProductAttribute) : null;
};

export const createProductAttribute = async (
  data: ProductAttributeFormValues,
): Promise<ProductAttribute> => {
  const now = new Date().toISOString();
  const ten = data.ten_hien_thi.trim();
  await assertUniqueTenHienThi(ten);

  const thu_tu = data.thu_tu ?? (await nextThuTu());
  const payload = {
    ten_hien_thi: ten,
    cac_gia_tri: normalizeCacGiaTri(data.cac_gia_tri),
    thu_tu,
    trang_thai: data.trang_thai,
    tg_tao: now,
    tg_cap_nhat: now,
  };

  const inserted = await repo.insert(payload as unknown as Omit<ProductAttribute, 'id'> & { id?: string }, {
    returningSelect: PRODUCT_ATTRIBUTE_RETURNING_FULL,
  });
  const full = await getProductAttributeById(String(inserted.id));
  if (!full) throw new Error(txt('productAttribute.service.createFetchFailed'));
  return full;
};

export const updateProductAttribute = async (
  id: string,
  data: ProductAttributeFormValues,
): Promise<ProductAttribute> => {
  const ten = data.ten_hien_thi.trim();
  await assertUniqueTenHienThi(ten, id);

  const payload = {
    ten_hien_thi: ten,
    cac_gia_tri: normalizeCacGiaTri(data.cac_gia_tri),
    thu_tu: data.thu_tu ?? 0,
    trang_thai: data.trang_thai,
    tg_cap_nhat: new Date().toISOString(),
  };

  await repo.update(id, payload as unknown as Partial<ProductAttribute>, {
    returningSelect: PRODUCT_ATTRIBUTE_RETURNING_FULL,
  });
  const full = await getProductAttributeById(id);
  if (!full) throw new Error(txt('productAttribute.service.notFound'));
  return full;
};

export const updateProductAttributeStatus = async (
  ids: string[],
  status: TrangThaiHoatDong,
): Promise<ProductAttribute | undefined> => {
  const now = new Date().toISOString();
  const results = await Promise.all(
    ids.map((id) =>
      repo.update(id, { trang_thai: status, tg_cap_nhat: now } as Partial<ProductAttribute>, {
        returningSelect: PRODUCT_ATTRIBUTE_RETURNING_STATUS_ONLY,
      }),
    ),
  );
  if (ids.length !== 1) return undefined;
  const full = await getProductAttributeById(String(results[0].id));
  return full ?? undefined;
};

export const deleteProductAttributes = async (ids: string[]): Promise<void> => {
  await repo.remove(ids);
};

export const importProductAttributes = async (
  rows: Record<string, unknown>[],
): Promise<{ created: number; errors: string[] }> => {
  const errors: string[] = [];
  let created = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const ten_hien_thi = String(row.ten_hien_thi ?? '').trim();
    if (!ten_hien_thi) {
      errors.push(`Dòng ${i + 2}: Thiếu tên hiển thị`);
      continue;
    }

    const parsed = productAttributeSchema.safeParse({
      ten_hien_thi,
      cac_gia_tri: row.cac_gia_tri
        ? normalizeCacGiaTri(String(row.cac_gia_tri).split(/[,;|]/))
        : [],
      trang_thai: parseTrangThaiHoatDongImport(row.trang_thai),
    });

    if (!parsed.success) {
      const msg = parsed.error.flatten().formErrors[0] ?? parsed.error.message;
      errors.push(`Dòng ${i + 2}: ${msg}`);
      continue;
    }

    try {
      await createProductAttribute(parsed.data);
      created++;
    } catch (e: unknown) {
      errors.push(`Dòng ${i + 2}: ${e instanceof Error ? e.message : 'Lỗi'}`);
    }
  }

  return { created, errors };
};
