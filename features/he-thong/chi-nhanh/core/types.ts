import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';

export interface Branch {
  id: string;
  ten_chi_nhanh: string;
  ma_chi_nhanh: string | null;
  dia_chi: string | null;
  dien_thoai: string | null;
  email: string | null;
  mo_ta: string | null;
  thu_tu: number;
  trang_thai: TrangThaiHoatDong;
  tg_tao: string;
  tg_cap_nhat: string;
}

export interface BranchFilters {
  status: string[];
  columnSearch: Record<string, string>;
}
