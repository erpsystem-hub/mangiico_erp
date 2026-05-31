-- Seed nhóm + danh sách đối tác demo — sau migration kd_doi_tac
BEGIN;

-- Khách hàng — nhóm cấp 1
INSERT INTO public.kd_danh_muc_doi_tac (loai_doi_tac, ten_danh_muc, ma_danh_muc, mo_ta, cha_id, duong_dan, cap_do, trang_thai, thu_tu)
SELECT 'khach_hang', v.ten, v.ma, v.mo_ta, NULL, '', 0, 'Đang hoạt động', v.thu_tu
FROM (VALUES
  ('Khách lẻ', 'KH-LE', 'Khách hàng mua lẻ', 10),
  ('Khách sỉ', 'KH-SI', 'Đại lý / bán sỉ', 20)
) AS v(ten, ma, mo_ta, thu_tu)
WHERE NOT EXISTS (
  SELECT 1 FROM public.kd_danh_muc_doi_tac dm
  WHERE dm.loai_doi_tac = 'khach_hang' AND lower(trim(dm.ten_danh_muc)) = lower(trim(v.ten))
);

INSERT INTO public.kd_danh_muc_doi_tac (loai_doi_tac, ten_danh_muc, ma_danh_muc, mo_ta, cha_id, duong_dan, cap_do, trang_thai, thu_tu)
SELECT 'khach_hang', v.ten, v.ma, v.mo_ta, p.id, '', 0, 'Đang hoạt động', v.thu_tu
FROM (VALUES
  ('Shop online', 'KH-ONL', NULL::text, 'Khách lẻ', 1),
  ('Cửa hàng', 'KH-CH', NULL::text, 'Khách lẻ', 2),
  ('Đại lý miền Bắc', 'KH-MB', NULL::text, 'Khách sỉ', 1)
) AS v(ten, ma, mo_ta, ten_cha, thu_tu)
JOIN public.kd_danh_muc_doi_tac p
  ON p.loai_doi_tac = 'khach_hang'
 AND lower(trim(p.ten_danh_muc)) = lower(trim(v.ten_cha))
 AND p.cha_id IS NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.kd_danh_muc_doi_tac dm
  WHERE dm.loai_doi_tac = 'khach_hang' AND lower(trim(dm.ten_danh_muc)) = lower(trim(v.ten))
);

-- NCC — nhóm cấp 1
INSERT INTO public.kd_danh_muc_doi_tac (loai_doi_tac, ten_danh_muc, ma_danh_muc, mo_ta, cha_id, duong_dan, cap_do, trang_thai, thu_tu)
SELECT 'nha_cung_cap', v.ten, v.ma, v.mo_ta, NULL, '', 0, 'Đang hoạt động', v.thu_tu
FROM (VALUES
  ('NCC vải', 'NCC-VAI', 'Cung cấp vải', 10),
  ('NCC phụ liệu', 'NCC-PL', 'Khuy, kéo, nhãn', 20)
) AS v(ten, ma, mo_ta, thu_tu)
WHERE NOT EXISTS (
  SELECT 1 FROM public.kd_danh_muc_doi_tac dm
  WHERE dm.loai_doi_tac = 'nha_cung_cap' AND lower(trim(dm.ten_danh_muc)) = lower(trim(v.ten))
);

INSERT INTO public.kd_danh_muc_doi_tac (loai_doi_tac, ten_danh_muc, ma_danh_muc, mo_ta, cha_id, duong_dan, cap_do, trang_thai, thu_tu)
SELECT 'nha_cung_cap', v.ten, v.ma, v.mo_ta, p.id, '', 0, 'Đang hoạt động', v.thu_tu
FROM (VALUES
  ('Vải nội địa', 'NCC-VN', NULL::text, 'NCC vải', 1),
  ('Vải nhập', 'NCC-NK', NULL::text, 'NCC vải', 2),
  ('Phụ liệu may', 'NCC-PLM', NULL::text, 'NCC phụ liệu', 1)
) AS v(ten, ma, mo_ta, ten_cha, thu_tu)
JOIN public.kd_danh_muc_doi_tac p
  ON p.loai_doi_tac = 'nha_cung_cap'
 AND lower(trim(p.ten_danh_muc)) = lower(trim(v.ten_cha))
 AND p.cha_id IS NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.kd_danh_muc_doi_tac dm
  WHERE dm.loai_doi_tac = 'nha_cung_cap' AND lower(trim(dm.ten_danh_muc)) = lower(trim(v.ten))
);

-- Danh sách KH
INSERT INTO public.kd_danh_sach_doi_tac (
  loai_doi_tac, ma_doi_tac, ten_doi_tac, danh_muc_id, dien_thoai, email, dia_chi, ma_so_thue, nguoi_lien_he, trang_thai
)
SELECT 'khach_hang', v.ma, v.ten, dm.id, v.sdt, v.email, v.dc, v.mst, v.nlh, 'Đang hoạt động'
FROM (VALUES
  ('KH-001', 'Công ty ABC', 'Shop online', '0901111111', 'abc@example.com', 'Hà Nội', '0101234567', 'Nguyễn A'),
  ('KH-002', 'Shop XYZ', 'Cửa hàng', '0902222222', 'xyz@example.com', 'TP.HCM', NULL::text, 'Trần B'),
  ('KH-003', 'Đại lý Đông', 'Đại lý miền Bắc', '0903333333', NULL::text, 'Hải Phòng', '0209876543', 'Lê C')
) AS v(ma, ten, ten_dm, sdt, email, dc, mst, nlh)
JOIN public.kd_danh_muc_doi_tac dm
  ON dm.loai_doi_tac = 'khach_hang' AND dm.cap_do = 2 AND lower(trim(dm.ten_danh_muc)) = lower(trim(v.ten_dm))
WHERE NOT EXISTS (
  SELECT 1 FROM public.kd_danh_sach_doi_tac x
  WHERE x.loai_doi_tac = 'khach_hang' AND lower(trim(x.ma_doi_tac)) = lower(trim(v.ma))
);

-- Danh sách NCC
INSERT INTO public.kd_danh_sach_doi_tac (
  loai_doi_tac, ma_doi_tac, ten_doi_tac, danh_muc_id, dien_thoai, email, nguoi_lien_he, trang_thai
)
SELECT 'nha_cung_cap', v.ma, v.ten, dm.id, v.sdt, v.email, v.nlh, 'Đang hoạt động'
FROM (VALUES
  ('NCC-001', 'Xưởng vải Minh', 'Vải nội địa', '0241111111', 'minh@example.com', 'Phạm D'),
  ('NCC-002', 'Import Fabric Co', 'Vải nhập', '0282222222', 'import@example.com', 'John'),
  ('NCC-003', 'Phụ liệu Hòa', 'Phụ liệu may', '0243333333', 'hoa@example.com', 'Võ E')
) AS v(ma, ten, ten_dm, sdt, email, nlh)
JOIN public.kd_danh_muc_doi_tac dm
  ON dm.loai_doi_tac = 'nha_cung_cap' AND dm.cap_do = 2 AND lower(trim(dm.ten_danh_muc)) = lower(trim(v.ten_dm))
WHERE NOT EXISTS (
  SELECT 1 FROM public.kd_danh_sach_doi_tac x
  WHERE x.loai_doi_tac = 'nha_cung_cap' AND lower(trim(x.ma_doi_tac)) = lower(trim(v.ma))
);

COMMIT;
