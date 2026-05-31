import type { TrangThaiDonMua } from './constants';

export interface PurchaseOrderLine {
  id: string;
  don_mua_id: string;
  nguyen_lieu_id: string;
  ma_nguyen_lieu: string;
  ten_nguyen_lieu: string;
  so_luong: number;
  don_vi_tinh: string;
  don_gia: number;
  thanh_tien: number;
  ghi_chu: string | null;
  thu_tu: number;
  tg_tao?: string;
  tg_cap_nhat?: string;
}

export interface PurchaseOrder {
  id: string;
  ma_don_mua: string;
  nha_cung_cap_id: string;
  ma_nha_cung_cap: string;
  ten_nha_cung_cap: string;
  chi_nhanh_id: string | null;
  ten_chi_nhanh: string | null;
  nhan_vien_id: string | null;
  ngay_dat: string;
  ngay_giao_du_kien: string | null;
  dia_chi_nhan: string | null;
  ghi_chu: string | null;
  trang_thai: TrangThaiDonMua;
  tong_tien: number;
  tg_tao: string;
  tg_cap_nhat: string;
  lines?: PurchaseOrderLine[];
}

import type { DateRangeValue } from '@/components/ui/DateRangePicker';

export interface PurchaseOrderFilters {
  status: string[];
  nha_cung_cap_ids: string[];
  columnSearch: Record<string, string>;
  dateRange: DateRangeValue;
}

export interface PurchaseOrderLineDraft {
  clientId: string;
  nguyen_lieu_id: string;
  so_luong: number;
  don_vi_tinh: string;
  don_gia: number;
  ghi_chu?: string;
  thu_tu: number;
}
