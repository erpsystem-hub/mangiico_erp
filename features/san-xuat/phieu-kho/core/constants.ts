import { txt } from '@/lib/text';

export const LOAI_PHIEU_KHO = ['Nhập', 'Xuất'] as const;
export type LoaiPhieuKho = (typeof LOAI_PHIEU_KHO)[number];

export const MUC_DICH_NHAP = [
  'Nhập sản xuất',
  'Nhập mua hàng',
  'Nhập điều chỉnh',
  'Nhập chuyển kho',
  'Nhập trả hàng',
] as const;

export const MUC_DICH_XUAT = [
  'Xuất sản xuất',
  'Xuất bán hàng',
  'Xuất điều chỉnh',
  'Xuất chuyển kho',
  'Xuất hao hụt',
  'Xuất mẫu',
] as const;

export type MucDichNhap = (typeof MUC_DICH_NHAP)[number];
export type MucDichXuat = (typeof MUC_DICH_XUAT)[number];
export type MucDichPhieuKho = MucDichNhap | MucDichXuat;

export const TRANG_THAI_PHIEU_KHO = ['Nháp', 'Hoàn thành', 'Hủy'] as const;
export type TrangThaiPhieuKho = (typeof TRANG_THAI_PHIEU_KHO)[number];

export const LOAI_HANG_PHIEU = ['nguyen_lieu', 'thanh_pham'] as const;
export type LoaiHangPhieu = (typeof LOAI_HANG_PHIEU)[number];

export function mucDichOptionsForLoai(loai: LoaiPhieuKho): readonly MucDichPhieuKho[] {
  return loai === 'Nhập' ? MUC_DICH_NHAP : MUC_DICH_XUAT;
}

export function needsKhoDich(mucDich: string): boolean {
  return mucDich === 'Nhập chuyển kho' || mucDich === 'Xuất chuyển kho';
}

export function canEditWarehouseSlip(status: TrangThaiPhieuKho, daPostTon: boolean): boolean {
  return status === 'Nháp' && !daPostTon;
}

export function canDeleteWarehouseSlip(status: TrangThaiPhieuKho, daPostTon: boolean): boolean {
  return status === 'Nháp' && !daPostTon;
}

export function canCancelWarehouseSlip(status: TrangThaiPhieuKho): boolean {
  return status === 'Hoàn thành';
}

export function warehouseSlipNoViewMessage(): string {
  return txt('warehouseSlip.noViewPermission');
}
