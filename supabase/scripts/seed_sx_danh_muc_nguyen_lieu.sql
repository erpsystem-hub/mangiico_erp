-- Seed danh mục nguyên liệu (2 cấp) — chạy sau migration sx_danh_muc_nguyen_lieu
BEGIN;

INSERT INTO public.sx_danh_muc_nguyen_lieu (ten_danh_muc, ma_danh_muc, mo_ta, cha_id, duong_dan, cap_do, trang_thai, thu_tu)
SELECT v.ten, v.ma, v.mo_ta, NULL, '', 0, 'Đang hoạt động', v.thu_tu
FROM (VALUES
  ('Vải & vải lót', 'VAI', 'Nguyên liệu vải chính và lót', 10),
  ('Chỉ & sợi', 'CHI', 'Chỉ may, chỉ thêu', 20),
  ('Phụ liệu may', 'PL', 'Khuy, kéo, nhãn, phụ kiện', 30),
  ('Hóa chất', 'HC', 'Nhuộm, hoàn tất, hóa chất xử lý', 40)
) AS v(ten, ma, mo_ta, thu_tu)
WHERE NOT EXISTS (
  SELECT 1 FROM public.sx_danh_muc_nguyen_lieu dm
  WHERE lower(trim(dm.ten_danh_muc)) = lower(trim(v.ten))
);

INSERT INTO public.sx_danh_muc_nguyen_lieu (ten_danh_muc, ma_danh_muc, mo_ta, cha_id, duong_dan, cap_do, trang_thai, thu_tu)
SELECT v.ten, v.ma, v.mo_ta, p.id, '', 0, 'Đang hoạt động', v.thu_tu
FROM (VALUES
  ('Vải cotton', 'VAI-CT', NULL::text, 'Vải & vải lót', 1),
  ('Vải poly', 'VAI-PY', NULL::text, 'Vải & vải lót', 2),
  ('Vải lót', 'VAI-LOT', NULL::text, 'Vải & vải lót', 3),
  ('Chỉ polyester', 'CHI-PY', NULL::text, 'Chỉ & sợi', 1),
  ('Chỉ cotton', 'CHI-CT', NULL::text, 'Chỉ & sợi', 2),
  ('Khuy & nút', 'KHUY', NULL::text, 'Phụ liệu may', 1),
  ('Kéo', 'KEO', NULL::text, 'Phụ liệu may', 2)
) AS v(ten, ma, mo_ta, ten_cha, thu_tu)
JOIN public.sx_danh_muc_nguyen_lieu p
  ON lower(trim(p.ten_danh_muc)) = lower(trim(v.ten_cha))
 AND p.cha_id IS NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.sx_danh_muc_nguyen_lieu dm
  WHERE lower(trim(dm.ten_danh_muc)) = lower(trim(v.ten))
);

COMMIT;
