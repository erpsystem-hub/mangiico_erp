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

/** Dòng BOM phẳng kèm thông tin đơn + sản phẩm — cho tab BOM toàn bộ lệnh SX. */
export interface ProductionOrderBomRow {
  id: string;
  don_hang_chi_tiet_id: string;
  don_hang_id: string;
  ma_don_hang: string;
  ten_khach_hang: string;
  ngay_dat: string;
  ngay_giao_du_kien: string | null;
  danh_muc_id: string;
  ma_danh_muc: string;
  ten_danh_muc: string;
  ten_nhom_danh_muc: string;
  sl_san_pham: number;
  nguyen_lieu_id: string;
  ma_nguyen_lieu: string;
  ten_nguyen_lieu: string;
  so_luong_dinh_muc: number;
  so_luong_tong: number;
  don_vi_tinh: string;
}
