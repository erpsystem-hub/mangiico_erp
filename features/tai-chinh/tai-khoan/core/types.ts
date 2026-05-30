import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';
import type { LoaiQuy } from './constants';

export interface FinanceAccount {
  id: string;
  ten_quy: string;
  loai_quy: LoaiQuy;
  chi_nhanh_id: string | null;
  ten_chi_nhanh?: string | null;
  ma_chi_nhanh?: string | null;
  ngan_hang: string | null;
  ma_ngan_hang_bin: string | null;
  so_tai_khoan: string | null;
  chu_tai_khoan: string | null;
  so_du_khoi_dau: number;
  trang_thai: TrangThaiHoatDong;
  tg_tao: string;
  tg_cap_nhat: string;
}

export interface FinanceAccountFilters {
  loai_quy: string[];
  chi_nhanh_id: string[];
  status: string[];
  columnSearch: Record<string, string>;
}
