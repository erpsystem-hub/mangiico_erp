-- Seed kho mặc định (chạy sau create_sx_phieu_kho.sql)
INSERT INTO public.sx_danh_sach_kho (ma_kho, ten_kho, dia_chi, trang_thai, thu_tu)
SELECT v.ma_kho, v.ten_kho, v.dia_chi, v.trang_thai, v.thu_tu
FROM (VALUES
  ('KHO-CHINH', 'Kho chính', 'Kho nguyên liệu & thành phẩm', 'Đang hoạt động', 0),
  ('KHO-NL', 'Kho nguyên liệu', 'Kho vải, phụ liệu', 'Đang hoạt động', 1),
  ('KHO-TP', 'Kho thành phẩm', 'Kho hàng may xong', 'Đang hoạt động', 2)
) AS v(ma_kho, ten_kho, dia_chi, trang_thai, thu_tu)
WHERE NOT EXISTS (
  SELECT 1 FROM public.sx_danh_sach_kho k WHERE lower(trim(k.ma_kho)) = lower(trim(v.ma_kho))
);
