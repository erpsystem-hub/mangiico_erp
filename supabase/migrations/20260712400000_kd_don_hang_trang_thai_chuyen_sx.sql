-- Thêm trạng thái "Chuyển sản xuất" cho đơn hàng bán
ALTER TABLE public.kd_don_hang DROP CONSTRAINT IF EXISTS kd_don_hang_trang_thai_check;
ALTER TABLE public.kd_don_hang ADD CONSTRAINT kd_don_hang_trang_thai_check
  CHECK (trang_thai IN ('Nháp', 'Mới', 'Chuyển sản xuất', 'Hoàn thành', 'Hủy'));
