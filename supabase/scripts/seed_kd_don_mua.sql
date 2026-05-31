-- Seed đơn mua nguyên liệu demo — sau seed_kd_doi_tac + seed_sx_danh_sach_nguyen_lieu
BEGIN;

-- Đơn 1: Nháp — Xưởng vải Minh, vải cotton
INSERT INTO public.kd_don_mua (
  ma_don_mua, nha_cung_cap_id, ngay_dat, ngay_giao_du_kien, ghi_chu, trang_thai
)
SELECT
  'DM-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-001',
  ncc.id,
  CURRENT_DATE,
  CURRENT_DATE + 7,
  'Đơn mua vải demo',
  'Nháp'
FROM public.kd_danh_sach_doi_tac ncc
WHERE ncc.loai_doi_tac = 'nha_cung_cap'
  AND lower(trim(ncc.ma_doi_tac)) = 'ncc-001'
  AND NOT EXISTS (
    SELECT 1 FROM public.kd_don_mua dm
    WHERE lower(trim(dm.ma_don_mua)) = lower('DM-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-001')
  );

INSERT INTO public.kd_don_mua_chi_tiet (don_mua_id, nguyen_lieu_id, so_luong, don_vi_tinh, don_gia, thu_tu)
SELECT dm.id, nl.id, 100, 'm', 85000, 1
FROM public.kd_don_mua dm
JOIN public.kd_danh_sach_doi_tac ncc ON ncc.id = dm.nha_cung_cap_id
JOIN public.sx_danh_sach_nguyen_lieu nl ON lower(trim(nl.ma_nguyen_lieu)) = 'vai-ct-001'
WHERE lower(trim(dm.ma_don_mua)) = lower('DM-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-001')
  AND NOT EXISTS (
    SELECT 1 FROM public.kd_don_mua_chi_tiet ct WHERE ct.don_mua_id = dm.id
  );

-- Đơn 2: Đã đặt — Phụ liệu Hòa, khuy nhựa
INSERT INTO public.kd_don_mua (
  ma_don_mua, nha_cung_cap_id, ngay_dat, ngay_giao_du_kien, trang_thai
)
SELECT
  'DM-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-002',
  ncc.id,
  CURRENT_DATE - 2,
  CURRENT_DATE + 5,
  'Đã đặt'
FROM public.kd_danh_sach_doi_tac ncc
WHERE ncc.loai_doi_tac = 'nha_cung_cap'
  AND lower(trim(ncc.ma_doi_tac)) = 'ncc-003'
  AND NOT EXISTS (
    SELECT 1 FROM public.kd_don_mua dm
    WHERE lower(trim(dm.ma_don_mua)) = lower('DM-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-002')
  );

INSERT INTO public.kd_don_mua_chi_tiet (don_mua_id, nguyen_lieu_id, so_luong, don_vi_tinh, don_gia, thu_tu)
SELECT dm.id, nl.id, 5000, 'cái', 120, 1
FROM public.kd_don_mua dm
JOIN public.sx_danh_sach_nguyen_lieu nl ON lower(trim(nl.ma_nguyen_lieu)) = 'khuy-nl-01'
WHERE lower(trim(dm.ma_don_mua)) = lower('DM-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-002')
  AND NOT EXISTS (
    SELECT 1 FROM public.kd_don_mua_chi_tiet ct WHERE ct.don_mua_id = dm.id
  );

COMMIT;
