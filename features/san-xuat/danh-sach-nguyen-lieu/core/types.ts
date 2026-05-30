import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';

export interface MaterialCatalogItem {
  id: string;
  ma_nguyen_lieu: string;
  ten_nguyen_lieu: string;
  danh_muc_id: string;
  ten_danh_muc: string;
  ten_nhom_danh_muc: string;
  ma_danh_muc: string | null;
  don_vi_tinh: string;
  mau_sac: string | null;
  thanh_phan: string | null;
  kho_vai: string | null;
  dinh_luong_gsm: number | null;
  xuat_xu: string | null;
  mo_ta: string | null;
  trang_thai: TrangThaiHoatDong;
  tg_tao: string;
  tg_cap_nhat: string;
}

export interface MaterialCatalogFilters {
  status: string[];
  id_danh_muc_goc: string[];
  columnSearch: Record<string, string>;
}
