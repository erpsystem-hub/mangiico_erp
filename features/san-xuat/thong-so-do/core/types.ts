import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';

export interface MeasurementSpec {
  id: string;
  ten_hien_thi: string;
  thu_tu: number;
  don_vi: string;
  trang_thai: TrangThaiHoatDong;
  tg_tao: string;
  tg_cap_nhat: string;
}

export interface MeasurementSpecFilters {
  status: string[];
  columnSearch: Record<string, string>;
}
