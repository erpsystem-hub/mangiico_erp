-- Seed danh mục tài chính demo (2 cấp) — chạy sau migration tc_danh_muc_tai_chinh
BEGIN;

INSERT INTO public.tc_danh_muc_tai_chinh (ten_danh_muc, ma_danh_muc, loai, mo_ta, cha_id, duong_dan, cap_do, trang_thai, thu_tu)
SELECT v.ten, v.ma, v.loai, v.mo_ta, NULL, '', 0, 'Đang hoạt động', v.thu_tu
FROM (VALUES
  ('Doanh thu bán hàng', 'DT-BH', 'Thu', 'Nhóm thu từ bán hàng', 10),
  ('Chi phí vận hành', 'CP-VH', 'Chi', 'Nhóm chi vận hành', 20)
) AS v(ten, ma, loai, mo_ta, thu_tu)
WHERE NOT EXISTS (
  SELECT 1 FROM public.tc_danh_muc_tai_chinh dm
  WHERE lower(trim(dm.ten_danh_muc)) = lower(trim(v.ten))
);

-- Con cấp 2 (cha = gốc cap_do 1 sau trigger)
INSERT INTO public.tc_danh_muc_tai_chinh (ten_danh_muc, ma_danh_muc, loai, mo_ta, cha_id, duong_dan, cap_do, trang_thai, thu_tu)
SELECT v.ten, v.ma, v.loai, v.mo_ta, p.id, '', 0, 'Đang hoạt động', v.thu_tu
FROM (VALUES
  ('Bán lẻ', 'DT-BL', 'Thu', 'Doanh thu bán lẻ', 'Doanh thu bán hàng', 1),
  ('Điện nước', 'CP-DN', 'Chi', 'Tiền điện nước', 'Chi phí vận hành', 1)
) AS v(ten, ma, loai, mo_ta, ten_cha, thu_tu)
JOIN public.tc_danh_muc_tai_chinh p
  ON lower(trim(p.ten_danh_muc)) = lower(trim(v.ten_cha))
 AND p.cha_id IS NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.tc_danh_muc_tai_chinh dm
  WHERE lower(trim(dm.ten_danh_muc)) = lower(trim(v.ten))
);

COMMIT;
