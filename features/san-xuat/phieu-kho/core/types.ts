import type { DateRangeValue } from '@/components/ui/DateRangePicker';
import type { LoaiHangPhieu, LoaiPhieuKho, MucDichPhieuKho, TrangThaiPhieuKho } from './constants';

export interface WarehouseItem {
  id: string;
  ma_kho: string;
  ten_kho: string;
  chi_nhanh_id: string | null;
  dia_chi: string | null;
  trang_thai: string;
}

export interface WarehouseSlipLine {
  id: string;
  phieu_kho_id: string;
  loai_hang: LoaiHangPhieu;
  nguyen_lieu_id: string | null;
  danh_muc_id: string | null;
  ma_hang: string;
  ten_hang: string;
  so_luong: number;
  don_vi_tinh: string;
  ghi_chu: string | null;
  thu_tu: number;
  tg_tao?: string;
  tg_cap_nhat?: string;
}

export interface WarehouseSlip {
  id: string;
  ma_phieu_kho: string;
  loai_phieu: LoaiPhieuKho;
  muc_dich: MucDichPhieuKho;
  kho_id: string;
  ma_kho: string;
  ten_kho: string;
  kho_dich_id: string | null;
  ma_kho_dich: string | null;
  ten_kho_dich: string | null;
  ngay_phieu: string;
  chi_nhanh_id: string | null;
  ten_chi_nhanh: string | null;
  nhan_vien_id: string | null;
  don_hang_id: string | null;
  ma_don_hang: string | null;
  don_mua_id: string | null;
  ma_don_mua: string | null;
  ghi_chu: string | null;
  trang_thai: TrangThaiPhieuKho;
  da_post_ton: boolean;
  tg_tao: string;
  tg_cap_nhat: string;
  lines?: WarehouseSlipLine[];
}

export type WarehouseSlipListItem = WarehouseSlip & {
  so_dong: number;
};

export interface WarehouseSlipLineRow {
  id: string;
  phieu_kho_id: string;
  ma_phieu_kho: string;
  loai_phieu: LoaiPhieuKho;
  muc_dich: MucDichPhieuKho;
  kho_id: string;
  ten_kho: string;
  ngay_phieu: string;
  trang_thai: TrangThaiPhieuKho;
  loai_hang: LoaiHangPhieu;
  nguyen_lieu_id: string | null;
  danh_muc_id: string | null;
  ma_hang: string;
  ten_hang: string;
  so_luong: number;
  don_vi_tinh: string;
  ghi_chu: string | null;
  thu_tu: number;
  ma_don_hang: string | null;
  tg_cap_nhat?: string;
}

export interface WarehouseSlipFilters {
  loai_phieu: string[];
  muc_dich: string[];
  status: string[];
  kho_ids: string[];
  columnSearch: Record<string, string>;
  dateRange: DateRangeValue;
}

export interface WarehouseSlipLineFilters {
  loai_phieu: string[];
  muc_dich: string[];
  status: string[];
  kho_ids: string[];
  columnSearch: Record<string, string>;
  dateRange: DateRangeValue;
}

export interface WarehouseSlipLineDraft {
  clientId: string;
  loai_hang: LoaiHangPhieu;
  nguyen_lieu_id: string | null;
  danh_muc_id: string | null;
  so_luong: number;
  don_vi_tinh: string;
  ghi_chu?: string;
  thu_tu: number;
}
