import { txt } from '@/lib/text';

export const TRANG_THAI_DON_MUA = [
  'Nháp',
  'Đã đặt',
  'Đang giao',
  'Đã nhận',
  'Hủy',
] as const;
export type TrangThaiDonMua = (typeof TRANG_THAI_DON_MUA)[number];

export const TRANG_THAI_DON_MUA_OPTIONS: { value: TrangThaiDonMua; label: string }[] =
  TRANG_THAI_DON_MUA.map((v) => ({
    value: v,
    label: v,
  }));

export function canEditOrderCode(status: TrangThaiDonMua): boolean {
  return status === 'Nháp';
}

export function canEditPurchaseOrder(status: TrangThaiDonMua): boolean {
  return status === 'Nháp';
}

/** Chỉ xóa đơn ở trạng thái Nháp hoặc Đã đặt. */
export function canDeletePurchaseOrder(status: TrangThaiDonMua): boolean {
  return status === 'Nháp' || status === 'Đã đặt';
}

export function purchaseOrderNoViewMessage(): string {
  return txt('purchaseOrder.noViewPermission');
}
