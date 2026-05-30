-- Seed thông số đo mẫu
INSERT INTO public.sx_thong_so_do (ten_hien_thi, don_vi, trang_thai, thu_tu)
SELECT v.ten_hien_thi, v.don_vi, v.trang_thai, v.thu_tu
FROM (
  VALUES
    ('Ngực', 'cm', 'Đang hoạt động', 1),
    ('Eo', 'cm', 'Đang hoạt động', 2),
    ('Dài áo', 'cm', 'Đang hoạt động', 3),
    ('Vai', 'cm', 'Đang hoạt động', 4),
    ('Tay dài', 'cm', 'Đang hoạt động', 5),
    ('Chiều cao', 'cm', 'Đang hoạt động', 6)
) AS v(ten_hien_thi, don_vi, trang_thai, thu_tu)
WHERE NOT EXISTS (
  SELECT 1 FROM public.sx_thong_so_do t
  WHERE lower(trim(t.ten_hien_thi)) = lower(trim(v.ten_hien_thi))
);
