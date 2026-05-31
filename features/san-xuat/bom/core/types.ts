import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';

export interface BomItem {
  id: string;
  danh_muc_id: string;
  ma_danh_muc: string;
  ten_danh_muc: string;
  ten_nhom_danh_muc: string;
  nguyen_lieu_id: string;
  ma_nguyen_lieu: string;
  ten_nguyen_lieu: string;
  so_luong: number;
  don_vi_tinh: string;
  ghi_chu: string | null;
  thu_tu: number;
  trang_thai: TrangThaiHoatDong;
  tg_tao: string;
  tg_cap_nhat: string;
}

export interface BomFilters {
  status: string[];
  id_danh_muc_goc: string[];
  columnSearch: Record<string, string>;
}
