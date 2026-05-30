import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';
import type { LoaiDanhMuc } from './constants';

export interface FinanceCategory {
  id: string;
  ten_danh_muc: string;
  ma_danh_muc: string | null;
  loai: LoaiDanhMuc;
  mo_ta?: string | null;
  cha_id: string | null;
  cap_do: number;
  duong_dan: string;
  trang_thai: TrangThaiHoatDong;
  thu_tu: number;
  tg_tao: string;
  tg_cap_nhat: string;
}
