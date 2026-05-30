import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';

export interface MaterialCategory {
  id: string;
  ten_danh_muc: string;
  ma_danh_muc: string | null;
  mo_ta?: string | null;
  cha_id: string | null;
  cap_do: number;
  duong_dan: string;
  trang_thai: TrangThaiHoatDong;
  thu_tu: number;
  tg_tao: string;
  tg_cap_nhat: string;
}

export interface MaterialCategoryFilters {
  columnSearch: Record<string, string>;
  status: string[];
  id_danh_muc_goc: string[];
}
