import type { TrangThaiDonHang } from './constants';

export interface SalesOrderLine {
  id: string;
  don_hang_id: string;
  danh_muc_id: string;
  ma_danh_muc: string;
  ten_danh_muc: string;
  ten_nhom_danh_muc: string;
  so_luong: number;
  don_vi_tinh: string;
  don_gia: number;
  thanh_tien: number;
  ghi_chu: string | null;
  thu_tu: number;
  tg_tao?: string;
  tg_cap_nhat?: string;
  thuoc_tinh_values?: SalesOrderLineAttributeValue[];
  thong_so_do_values?: SalesOrderLineMeasurementValue[];
}

export interface SalesOrderLineAttributeValue {
  thuoc_tinh_id: string;
  ten_hien_thi: string;
  gia_tri: string;
  bat_buoc?: boolean;
  thu_tu?: number;
}

export interface SalesOrderLineMeasurementValue {
  thong_so_do_id: string;
  ten_hien_thi: string;
  don_vi: string;
  gia_tri: number | null;
  bat_buoc?: boolean;
  thu_tu?: number;
}

export interface SalesOrder {
  id: string;
  ma_don_hang: string;
  khach_hang_id: string;
  ma_khach_hang: string;
  ten_khach_hang: string;
  chi_nhanh_id: string | null;
  ten_chi_nhanh: string | null;
  nhan_vien_id: string | null;
  ngay_dat: string;
  ngay_giao_du_kien: string | null;
  dia_chi_giao: string | null;
  ghi_chu: string | null;
  trang_thai: TrangThaiDonHang;
  tong_tien: number;
  tg_tao: string;
  tg_cap_nhat: string;
  lines?: SalesOrderLine[];
}

import type { DateRangeValue } from '@/components/ui/DateRangePicker';

export interface SalesOrderFilters {
  status: string[];
  khach_hang_ids: string[];
  columnSearch: Record<string, string>;
  /** Lọc theo ngày đặt (preset + tùy chọn). */
  dateRange: DateRangeValue;
}

/** Dòng chỉnh sửa trên form (có thể chưa có id DB). */
export interface SalesOrderLineDraft {
  clientId: string;
  danh_muc_id: string;
  so_luong: number;
  don_vi_tinh: string;
  don_gia: number;
  ghi_chu?: string;
  thu_tu: number;
}
