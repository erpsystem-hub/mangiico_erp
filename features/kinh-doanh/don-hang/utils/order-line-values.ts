import { txt } from '@/lib/text';
import type {
  CategoryAttributeLink,
  CategoryMeasurementLink,
} from '@/features/san-xuat/danh-muc-hang-hoa/core/types';
import type {
  SalesOrderLineAttributeValue,
  SalesOrderLineMeasurementValue,
} from '../core/types';

export function buildEmptyLineAttributeValues(
  template: CategoryAttributeLink[],
): { thuoc_tinh_id: string; gia_tri: string }[] {
  return template.map((t) => ({ thuoc_tinh_id: t.thuoc_tinh_id, gia_tri: '' }));
}

export function buildEmptyLineMeasurementValues(
  template: CategoryMeasurementLink[],
): { thong_so_do_id: string; gia_tri: number | null }[] {
  return template.map((t) => ({ thong_so_do_id: t.thong_so_do_id, gia_tri: null }));
}

export function mergeLineAttributeValuesWithTemplate(
  template: CategoryAttributeLink[],
  existing: SalesOrderLineAttributeValue[] | { thuoc_tinh_id: string; gia_tri: string }[],
): { thuoc_tinh_id: string; gia_tri: string }[] {
  const byId = new Map(existing.map((e) => [e.thuoc_tinh_id, e.gia_tri]));
  return template.map((t) => ({
    thuoc_tinh_id: t.thuoc_tinh_id,
    gia_tri: byId.get(t.thuoc_tinh_id) ?? '',
  }));
}

export function mergeLineMeasurementValuesWithTemplate(
  template: CategoryMeasurementLink[],
  existing: SalesOrderLineMeasurementValue[] | { thong_so_do_id: string; gia_tri: number | null }[],
): { thong_so_do_id: string; gia_tri: number | null }[] {
  const byId = new Map(existing.map((e) => [e.thong_so_do_id, e.gia_tri]));
  return template.map((t) => ({
    thong_so_do_id: t.thong_so_do_id,
    gia_tri: byId.get(t.thong_so_do_id) ?? null,
  }));
}

export function validateRequiredLineAttributeValues(
  template: CategoryAttributeLink[],
  values: { thuoc_tinh_id: string; gia_tri: string }[],
): string | null {
  const errors = collectLineAttributeFieldErrors(template, values);
  const first = Object.values(errors)[0];
  return first ?? null;
}

export function validateRequiredLineMeasurementValues(
  template: CategoryMeasurementLink[],
  values: { thong_so_do_id: string; gia_tri: number | null }[],
): string | null {
  const errors = collectLineMeasurementFieldErrors(template, values);
  const first = Object.values(errors)[0];
  return first ?? null;
}

/** Mọi thuộc tính trong template danh mục đều bắt buộc nhập trên dòng đơn. */
export function collectLineAttributeFieldErrors(
  template: CategoryAttributeLink[],
  values: { thuoc_tinh_id: string; gia_tri: string }[],
): Record<string, string> {
  const errors: Record<string, string> = {};
  const byId = new Map(values.map((v) => [v.thuoc_tinh_id, v.gia_tri]));
  for (const link of template) {
    const val = (byId.get(link.thuoc_tinh_id) ?? '').trim();
    if (!val) {
      errors[link.thuoc_tinh_id] = txt('salesOrder.validation.attributeRequired', {
        name: link.ten_hien_thi,
      });
    }
  }
  return errors;
}

/** Mọi thông số đo trong template danh mục đều bắt buộc nhập trên dòng đơn. */
export function collectLineMeasurementFieldErrors(
  template: CategoryMeasurementLink[],
  values: { thong_so_do_id: string; gia_tri: number | null }[],
): Record<string, string> {
  const errors: Record<string, string> = {};
  const byId = new Map(values.map((v) => [v.thong_so_do_id, v.gia_tri]));
  for (const link of template) {
    const val = byId.get(link.thong_so_do_id);
    if (val == null || !Number.isFinite(Number(val))) {
      errors[link.thong_so_do_id] = txt('salesOrder.validation.measurementRequired', {
        name: link.ten_hien_thi,
      });
    }
  }
  return errors;
}
