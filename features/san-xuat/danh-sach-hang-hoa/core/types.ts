import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';

export interface ProductCatalogItem {
  id: string;
  ma_san_pham: string;
  ten_san_pham: string;
  danh_muc_id: string;
  ten_danh_muc: string;
  ten_nhom_danh_muc: string;
  ma_danh_muc: string | null;
  mo_ta: string | null;
  trang_thai: TrangThaiHoatDong;
  tg_tao: string;
  tg_cap_nhat: string;
}

export interface ProductAttributeValue {
  thuoc_tinh_id: string;
  ten_hien_thi: string;
  gia_tri: string;
  bat_buoc: boolean;
  thu_tu: number;
}

export interface ProductCatalogFilters {
  status: string[];
  id_danh_muc_goc: string[];
  columnSearch: Record<string, string>;
}
