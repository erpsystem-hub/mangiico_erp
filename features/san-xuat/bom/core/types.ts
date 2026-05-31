import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';

export interface BomItem {
  id: string;
  san_pham_id: string;
  danh_muc_id_sp: string;
  ma_san_pham: string;
  ten_san_pham: string;
  ten_danh_muc_sp: string;
  ten_nhom_danh_muc_sp: string;
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
