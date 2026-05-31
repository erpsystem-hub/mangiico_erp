-- Danh sách giá trị chọn được cho từng thuộc tính hàng hóa
ALTER TABLE public.sx_thuoc_tinh_hang_hoa
  ADD COLUMN IF NOT EXISTS cac_gia_tri TEXT[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.sx_thuoc_tinh_hang_hoa.cac_gia_tri IS
  'Các giá trị được chọn cho thuộc tính (VD: mã vải, size, màu)';
