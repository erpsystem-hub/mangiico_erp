-- Seed danh mục hàng hóa may mặc (2 cấp) — chạy sau migration sx_danh_muc_hang_hoa
BEGIN;

INSERT INTO public.sx_danh_muc_hang_hoa (ten_danh_muc, ma_danh_muc, mo_ta, cha_id, duong_dan, cap_do, trang_thai, thu_tu)
SELECT v.ten, v.ma, v.mo_ta, NULL, '', 0, 'Đang hoạt động', v.thu_tu
FROM (VALUES
  ('Thành phẩm may mặc', 'TP', 'Sản phẩm hoàn chỉnh xuất kho/bán', 10),
  ('Nguyên phụ liệu', 'NPL', 'Vải, chỉ, hóa chất, phụ liệu may', 20),
  ('Phụ kiện & bao bì', 'PK', 'Khuy, kéo, nhãn, túi, bao bì', 30),
  ('Bán thành phẩm', 'BTP', 'Cắt may, bán thành phẩm chưa hoàn thiện', 40)
) AS v(ten, ma, mo_ta, thu_tu)
WHERE NOT EXISTS (
  SELECT 1 FROM public.sx_danh_muc_hang_hoa dm
  WHERE lower(trim(dm.ten_danh_muc)) = lower(trim(v.ten))
);

INSERT INTO public.sx_danh_muc_hang_hoa (ten_danh_muc, ma_danh_muc, mo_ta, cha_id, duong_dan, cap_do, trang_thai, thu_tu)
SELECT v.ten, v.ma, v.mo_ta, p.id, '', 0, 'Đang hoạt động', v.thu_tu
FROM (VALUES
  ('Áo', 'AO', NULL::text, 'Thành phẩm may mặc', 1),
  ('Quần', 'QUAN', NULL::text, 'Thành phẩm may mặc', 2),
  ('Váy & đầm', 'VAY', NULL::text, 'Thành phẩm may mặc', 3),
  ('Áo khoác & vest', 'AK', NULL::text, 'Thành phẩm may mặc', 4),
  ('Đồ bộ & set', 'BO', NULL::text, 'Thành phẩm may mặc', 5),
  ('Đồ lót & đồ ngủ', 'OL', NULL::text, 'Thành phẩm may mặc', 6),
  ('Vải', 'VAI', NULL::text, 'Nguyên phụ liệu', 1),
  ('Chỉ & sợi', 'CHI', NULL::text, 'Nguyên phụ liệu', 2),
  ('Phụ liệu may', 'PLM', NULL::text, 'Nguyên phụ liệu', 3),
  ('Hóa chất & nhuộm', 'HC', NULL::text, 'Nguyên phụ liệu', 4),
  ('Khuy & nút', 'KHUY', NULL::text, 'Phụ kiện & bao bì', 1),
  ('Kéo', 'KEO', NULL::text, 'Phụ kiện & bao bì', 2),
  ('Nhãn & mác', 'NHAN', NULL::text, 'Phụ kiện & bao bì', 3),
  ('Túi & bao bì', 'TUI', NULL::text, 'Phụ kiện & bao bì', 4),
  ('Thân/cục cắt dở', 'BTP-CD', NULL::text, 'Bán thành phẩm', 1),
  ('Bán thành may ráp', 'BTP-RAP', NULL::text, 'Bán thành phẩm', 2)
) AS v(ten, ma, mo_ta, ten_cha, thu_tu)
JOIN public.sx_danh_muc_hang_hoa p
  ON lower(trim(p.ten_danh_muc)) = lower(trim(v.ten_cha))
 AND p.cha_id IS NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.sx_danh_muc_hang_hoa dm
  WHERE lower(trim(dm.ten_danh_muc)) = lower(trim(v.ten))
);

COMMIT;
