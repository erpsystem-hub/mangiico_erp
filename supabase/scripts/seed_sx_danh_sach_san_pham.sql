-- Demo sản phẩm — chạy sau seed danh mục + links demo
BEGIN;

INSERT INTO public.sx_danh_sach_san_pham (ma_san_pham, ten_san_pham, danh_muc_id, mo_ta, trang_thai)
SELECT v.ma, v.ten, dm.id, v.mo_ta, 'Đang hoạt động'
FROM (VALUES
  ('AO-001', 'Áo sơ mi trắng basic', 'Áo', 'SP demo áo'),
  ('VAI-001', 'Vải cotton 40s', 'Vải', 'SP demo vải')
) AS v(ma, ten, ten_dm, mo_ta)
JOIN public.sx_danh_muc_hang_hoa dm
  ON lower(trim(dm.ten_danh_muc)) = lower(trim(v.ten_dm)) AND dm.cap_do = 2
WHERE NOT EXISTS (
  SELECT 1 FROM public.sx_danh_sach_san_pham sp
  WHERE lower(trim(sp.ma_san_pham)) = lower(trim(v.ma))
);

INSERT INTO public.sx_san_pham_thuoc_tinh (san_pham_id, thuoc_tinh_id, gia_tri)
SELECT sp.id, tt.id, v.gia_tri
FROM (VALUES
  ('AO-001', 'Màu sắc', 'Trắng'),
  ('AO-001', 'Vải chính', 'Cotton 40s'),
  ('VAI-001', 'Mã vải', 'CT-40-WHT')
) AS v(ma_sp, ten_tt, gia_tri)
JOIN public.sx_danh_sach_san_pham sp ON lower(trim(sp.ma_san_pham)) = lower(trim(v.ma_sp))
JOIN public.sx_thuoc_tinh_hang_hoa tt ON lower(trim(tt.ten_hien_thi)) = lower(trim(v.ten_tt))
WHERE NOT EXISTS (
  SELECT 1 FROM public.sx_san_pham_thuoc_tinh j
  WHERE j.san_pham_id = sp.id AND j.thuoc_tinh_id = tt.id
);

COMMIT;
