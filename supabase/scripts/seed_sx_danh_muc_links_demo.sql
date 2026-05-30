-- Demo: gán thuộc tính & số đo cho danh mục cấp 2 (Áo, Vải)
-- Chạy sau seed_sx_danh_muc_hang_hoa, seed_sx_thuoc_tinh, seed_sx_thong_so_do và migration junction
BEGIN;

INSERT INTO public.sx_danh_muc_thuoc_tinh (danh_muc_id, thuoc_tinh_id, bat_buoc, thu_tu)
SELECT dm.id, tt.id, v.bat_buoc, v.thu_tu
FROM (VALUES
  ('Áo', 'Màu sắc', false, 0),
  ('Áo', 'Vải chính', true, 1),
  ('Vải', 'Mã vải', true, 0)
) AS v(ten_dm, ten_tt, bat_buoc, thu_tu)
JOIN public.sx_danh_muc_hang_hoa dm
  ON lower(trim(dm.ten_danh_muc)) = lower(trim(v.ten_dm)) AND dm.cap_do = 2
JOIN public.sx_thuoc_tinh_hang_hoa tt
  ON lower(trim(tt.ten_hien_thi)) = lower(trim(v.ten_tt))
WHERE NOT EXISTS (
  SELECT 1 FROM public.sx_danh_muc_thuoc_tinh j
  WHERE j.danh_muc_id = dm.id AND j.thuoc_tinh_id = tt.id
);

INSERT INTO public.sx_danh_muc_thong_so_do (danh_muc_id, thong_so_do_id, bat_buoc, thu_tu)
SELECT dm.id, sd.id, v.bat_buoc, v.thu_tu
FROM (VALUES
  ('Áo', 'Ngực', true, 0),
  ('Áo', 'Dài áo', true, 1),
  ('Áo', 'Vai', false, 2),
  ('Vải', 'Chiều cao', false, 0)
) AS v(ten_dm, ten_sd, bat_buoc, thu_tu)
JOIN public.sx_danh_muc_hang_hoa dm
  ON lower(trim(dm.ten_danh_muc)) = lower(trim(v.ten_dm)) AND dm.cap_do = 2
JOIN public.sx_thong_so_do sd
  ON lower(trim(sd.ten_hien_thi)) = lower(trim(v.ten_sd))
WHERE NOT EXISTS (
  SELECT 1 FROM public.sx_danh_muc_thong_so_do j
  WHERE j.danh_muc_id = dm.id AND j.thong_so_do_id = sd.id
);

COMMIT;
