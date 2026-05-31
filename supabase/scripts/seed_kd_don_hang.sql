-- Seed đơn hàng demo — sau seed_kd_doi_tac + seed_sx_danh_muc_hang_hoa
BEGIN;

SELECT public.kd_upsert_don_hang(
  jsonb_build_object(
    'khach_hang_id', kh.id::text,
    'ngay_dat', CURRENT_DATE::text,
    'trang_thai', 'Mới',
    'dia_chi_giao', kh.dia_chi,
    'ghi_chu', 'Đơn demo 1'
  ),
  jsonb_build_array(
    jsonb_build_object(
      'danh_muc_id', dm.id::text,
      'so_luong', 10,
      'don_vi_tinh', 'cái',
      'don_gia', 250000,
      'thu_tu', 1
    )
  )
)
FROM public.kd_danh_sach_doi_tac kh
JOIN public.sx_danh_muc_hang_hoa dm ON lower(trim(dm.ma_danh_muc)) = 'ao'
WHERE kh.loai_doi_tac = 'khach_hang' AND lower(trim(kh.ma_doi_tac)) = 'kh-001'
  AND dm.cap_do = 2
  AND NOT EXISTS (
    SELECT 1 FROM public.kd_don_hang dh
    JOIN public.kd_danh_sach_doi_tac k2 ON k2.id = dh.khach_hang_id
    WHERE lower(trim(k2.ma_doi_tac)) = 'kh-001'
      AND dh.ngay_dat = CURRENT_DATE
      AND dh.ghi_chu = 'Đơn demo 1'
  );

SELECT public.kd_upsert_don_hang(
  jsonb_build_object(
    'khach_hang_id', kh.id::text,
    'ngay_dat', CURRENT_DATE::text,
    'trang_thai', 'Nháp',
    'ghi_chu', 'Đơn demo 2'
  ),
  jsonb_build_array(
    jsonb_build_object(
      'danh_muc_id', dm1.id::text,
      'so_luong', 5,
      'don_vi_tinh', 'cái',
      'don_gia', 180000,
      'thu_tu', 1
    ),
    jsonb_build_object(
      'danh_muc_id', dm2.id::text,
      'so_luong', 20,
      'don_vi_tinh', 'm',
      'don_gia', 45000,
      'thu_tu', 2
    )
  )
)
FROM public.kd_danh_sach_doi_tac kh
JOIN public.sx_danh_muc_hang_hoa dm1 ON lower(trim(dm1.ma_danh_muc)) = 'ao'
JOIN public.sx_danh_muc_hang_hoa dm2 ON lower(trim(dm2.ma_danh_muc)) = 'vai'
WHERE kh.loai_doi_tac = 'khach_hang' AND lower(trim(kh.ma_doi_tac)) = 'kh-002'
  AND dm1.cap_do = 2 AND dm2.cap_do = 2
  AND NOT EXISTS (
    SELECT 1 FROM public.kd_don_hang dh
    JOIN public.kd_danh_sach_doi_tac k2 ON k2.id = dh.khach_hang_id
    WHERE lower(trim(k2.ma_doi_tac)) = 'kh-002' AND dh.ghi_chu = 'Đơn demo 2'
  );

COMMIT;
