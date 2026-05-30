import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';

export interface ProductCategory {
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

export interface CategoryAttributeLink {
  thuoc_tinh_id: string;
  ten_hien_thi: string;
  bat_buoc: boolean;
  thu_tu: number;
}

export interface CategoryMeasurementLink {
  thong_so_do_id: string;
  ten_hien_thi: string;
  don_vi: string;
  bat_buoc: boolean;
  thu_tu: number;
}

export interface CategoryLinksBundle {
  attributeLinks: CategoryAttributeLink[];
  measurementLinks: CategoryMeasurementLink[];
}

export type CategoryAttributeLinkInput = Pick<
  CategoryAttributeLink,
  'thuoc_tinh_id' | 'bat_buoc' | 'thu_tu'
>;

export type CategoryMeasurementLinkInput = Pick<
  CategoryMeasurementLink,
  'thong_so_do_id' | 'bat_buoc' | 'thu_tu'
>;
