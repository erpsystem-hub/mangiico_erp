import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';

export interface ProductAttribute {
  id: string;
  ten_hien_thi: string;
  cac_gia_tri: string[];
  thu_tu: number;
  trang_thai: TrangThaiHoatDong;
  tg_tao: string;
  tg_cap_nhat: string;
}

export interface ProductAttributeFilters {
  status: string[];
  columnSearch: Record<string, string>;
}
