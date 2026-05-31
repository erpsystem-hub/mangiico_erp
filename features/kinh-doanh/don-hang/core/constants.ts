import { txt } from '@/lib/text';

export const TRANG_THAI_DON_HANG = ['Nháp', 'Mới', 'Hoàn thành', 'Hủy'] as const;
export type TrangThaiDonHang = (typeof TRANG_THAI_DON_HANG)[number];

export const TRANG_THAI_DON_HANG_OPTIONS: { value: TrangThaiDonHang; label: string }[] =
  TRANG_THAI_DON_HANG.map((v) => ({
    value: v,
    label: v,
  }));

export function trangThaiDonHangLabel(status: string): string {
  return TRANG_THAI_DON_HANG.includes(status as TrangThaiDonHang)
    ? status
    : status;
}

export function canEditOrderCode(status: TrangThaiDonHang): boolean {
  return status === 'Nháp';
}

/** V1: chỉ xóa đơn ở trạng thái Nháp hoặc Mới. */
export function canDeleteSalesOrder(status: TrangThaiDonHang): boolean {
  return status === 'Nháp' || status === 'Mới';
}

export function salesOrderNoViewMessage(): string {
  return txt('salesOrder.noViewPermission');
}
