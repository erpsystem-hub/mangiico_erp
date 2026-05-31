export interface OrderLineBomItem {
  id: string;
  don_hang_chi_tiet_id: string;
  nguyen_lieu_id: string;
  ma_nguyen_lieu: string;
  ten_nguyen_lieu: string;
  bom_mau_id: string | null;
  so_luong_dinh_muc: number;
  so_luong_tong: number;
  don_vi_tinh: string;
  ghi_chu: string | null;
  thu_tu: number;
  tg_tao: string;
  tg_cap_nhat: string;
}
