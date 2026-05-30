-- Seed thuộc tính hàng hóa mẫu
INSERT INTO public.sx_thuoc_tinh_hang_hoa (ten_hien_thi, trang_thai, thu_tu)
SELECT v.ten_hien_thi, v.trang_thai, v.thu_tu
FROM (
  VALUES
    ('Mã vải', 'Đang hoạt động', 1),
    ('Sơ đồ - Vai', 'Đang hoạt động', 2),
    ('Số đo - Ngực', 'Đang hoạt động', 3),
    ('Vải chính', 'Đang hoạt động', 4)
) AS v(ten_hien_thi, trang_thai, thu_tu)
WHERE NOT EXISTS (
  SELECT 1 FROM public.sx_thuoc_tinh_hang_hoa t
  WHERE lower(trim(t.ten_hien_thi)) = lower(trim(v.ten_hien_thi))
);
