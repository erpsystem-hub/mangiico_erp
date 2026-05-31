import type { AppResource } from '@/lib/permissions';
import type { PartnerKind } from './types';
import { txt } from '@/lib/text';

export const PARTNER_KINDS: PartnerKind[] = ['khach_hang', 'nha_cung_cap'];

/** Một module phân quyền cho cả tab Nhóm và Danh sách. */
export function partnerListResource(kind: PartnerKind): AppResource {
  return kind === 'khach_hang' ? 'customerList' : 'supplierList';
}

export function partnerCategoryResource(kind: PartnerKind): AppResource {
  return partnerListResource(kind);
}

export function partnerKindLabel(kind: PartnerKind): string {
  return kind === 'khach_hang'
    ? txt('partnerCategory.kindCustomer')
    : txt('partnerCategory.kindSupplier');
}

export function partnerModuleBackPath(kind: PartnerKind): string {
  return '/kinh-doanh';
}
