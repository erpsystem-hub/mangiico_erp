-- ============================================================================
-- Seed định mức BOM (bảng sx_bom)
-- ============================================================================
-- Điều kiện: đã chạy
--   seed_sx_danh_muc_hang_hoa + links (nếu cần)
--   seed_sx_danh_sach_san_pham   → AO-001, VAI-001
--   seed_sx_danh_muc_nguyen_lieu
--   seed_sx_danh_sach_nguyen_lieu → VAI-CT-001, CHI-PY-001, KHUY-NL-01
--
-- Chạy:
--   npm run seed:sx-bom
-- hoặc dán file này vào Supabase SQL Editor
--
-- Mỗi dòng = 1 cặp (sản phẩm + nguyên liệu), UNIQUE (san_pham_id, nguyen_lieu_id)
-- ============================================================================
BEGIN;

INSERT INTO public.sx_bom (
  san_pham_id,
  nguyen_lieu_id,
  so_luong,
  don_vi_tinh,
  ghi_chu,
  thu_tu,
  trang_thai
)
SELECT
  sp.id,
  nl.id,
  v.sl,
  COALESCE(NULLIF(trim(nl.don_vi_tinh), ''), v.dvt),
  v.ghi_chu,
  v.thu_tu,
  v.trang_thai
FROM (
  VALUES
    -- Định mức may áo sơ mi AO-001
    ('AO-001', 'VAI-CT-001', 1.80::numeric, 'm',    'Vải chính — thân + tay',     1, 'Đang hoạt động'),
    ('AO-001', 'CHI-PY-001', 0.15::numeric, 'cuộn', 'Chỉ may chính',              2, 'Đang hoạt động'),
    ('AO-001', 'KHUY-NL-01', 8.00::numeric, 'cái',  'Khuy trước + khuy tay',      3, 'Đang hoạt động'),
    -- SP vải thành phẩm VAI-001 (1 NL tham chiếu)
    ('VAI-001', 'VAI-CT-001', 1.00::numeric, 'm',    'Vải nguồn định mức bán',     1, 'Đang hoạt động')
) AS v(ma_sp, ma_nl, sl, dvt, ghi_chu, thu_tu, trang_thai)
JOIN public.sx_danh_sach_san_pham sp
  ON lower(trim(sp.ma_san_pham)) = lower(trim(v.ma_sp))
JOIN public.sx_danh_sach_nguyen_lieu nl
  ON lower(trim(nl.ma_nguyen_lieu)) = lower(trim(v.ma_nl))
WHERE NOT EXISTS (
  SELECT 1
  FROM public.sx_bom b
  WHERE b.san_pham_id = sp.id
    AND b.nguyen_lieu_id = nl.id
);

COMMIT;

-- Kiểm tra nhanh sau seed:
-- SELECT sp.ma_san_pham, nl.ma_nguyen_lieu, b.so_luong, b.don_vi_tinh, b.thu_tu, b.trang_thai
-- FROM public.sx_bom b
-- JOIN public.sx_danh_sach_san_pham sp ON sp.id = b.san_pham_id
-- JOIN public.sx_danh_sach_nguyen_lieu nl ON nl.id = b.nguyen_lieu_id
-- ORDER BY sp.ma_san_pham, b.thu_tu;
