-- Seed hệ số giá KH × loại hàng (danh mục HH cấp 2) — sau seed_kd_doi_tac + seed_sx_danh_muc_hang_hoa
BEGIN;

INSERT INTO public.kd_kh_he_so_gia_nhom_sp (danh_muc_khach_hang_id, nhom_san_pham_id, he_so_gia)
SELECT dm.id, loai.id, v.he_so
FROM (VALUES
  ('Shop online', 'Áo', 1.15),
  ('Shop online', 'Khuy & nút', 1.05),
  ('Cửa hàng', 'Áo', 1.20),
  ('Đại lý miền Bắc', 'Áo', 1.30),
  ('Đại lý miền Bắc', 'Vải', 1.10)
) AS v(ten_loai_kh, ten_loai_hang, he_so)
JOIN public.kd_danh_muc_doi_tac dm
  ON dm.loai_doi_tac = 'khach_hang'
 AND dm.cap_do = 2
 AND lower(trim(dm.ten_danh_muc)) = lower(trim(v.ten_loai_kh))
JOIN public.sx_danh_muc_hang_hoa loai
  ON loai.cap_do = 2
 AND loai.cha_id IS NOT NULL
 AND lower(trim(loai.ten_danh_muc)) = lower(trim(v.ten_loai_hang))
ON CONFLICT (danh_muc_khach_hang_id, nhom_san_pham_id) DO UPDATE
  SET he_so_gia = EXCLUDED.he_so_gia;

COMMIT;
