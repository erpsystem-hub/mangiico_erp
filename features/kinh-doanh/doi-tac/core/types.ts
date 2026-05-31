import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';

export type PartnerKind = 'khach_hang' | 'nha_cung_cap';

export interface PartnerCategory {
  id: string;
  loai_doi_tac: PartnerKind;
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

export interface PartnerCategoryFilters {
  columnSearch: Record<string, string>;
  status: string[];
  id_danh_muc_goc: string[];
}

export interface PartnerListItem {
  id: string;
  loai_doi_tac: PartnerKind;
  ma_doi_tac: string;
  ten_doi_tac: string;
  danh_muc_id: string;
  ten_danh_muc: string;
  ten_nhom_danh_muc: string;
  ma_danh_muc: string | null;
  dien_thoai: string | null;
  email: string | null;
  dia_chi: string | null;
  ma_so_thue: string | null;
  nguoi_lien_he: string | null;
  mo_ta: string | null;
  trang_thai: TrangThaiHoatDong;
  tg_tao: string;
  tg_cap_nhat: string;
}

export interface PartnerListFilters {
  status: string[];
  id_danh_muc_goc: string[];
  columnSearch: Record<string, string>;
}
