-- ============================================================================
-- Seed định mức BOM (bảng sx_bom)
-- ============================================================================
-- Điều kiện: đã chạy seed_sx_danh_muc_hang_hoa + seed_sx_danh_sach_nguyen_lieu
--
-- Chạy: npm run seed:sx-bom
-- Mỗi dòng = 1 cặp (loại hàng cấp 2 + nguyên liệu), UNIQUE (danh_muc_id, nguyen_lieu_id)
-- ============================================================================
BEGIN;

INSERT INTO public.sx_bom (
  danh_muc_id,
  nguyen_lieu_id,
  so_luong,
  don_vi_tinh,
  ghi_chu,
  thu_tu,
  trang_thai
)
SELECT
  dm.id,
  nl.id,
  v.sl,
  COALESCE(NULLIF(trim(nl.don_vi_tinh), ''), v.dvt),
  v.ghi_chu,
  v.thu_tu,
  v.trang_thai
FROM (
  VALUES
    ('AO', 'VAI-CT-001', 1.80::numeric, 'm',    'Vải chính — thân + tay',     1, 'Đang hoạt động'),
    ('AO', 'CHI-PY-001', 0.15::numeric, 'cuộn', 'Chỉ may chính',              2, 'Đang hoạt động'),
    ('AO', 'KHUY-NL-01', 8.00::numeric, 'cái',  'Khuy trước + khuy tay',      3, 'Đang hoạt động'),
    ('VAI', 'VAI-CT-001', 1.00::numeric, 'm',    'Vải nguồn định mức bán',     1, 'Đang hoạt động')
) AS v(ma_dm, ma_nl, sl, dvt, ghi_chu, thu_tu, trang_thai)
JOIN public.sx_danh_muc_hang_hoa dm
  ON lower(trim(dm.ma_danh_muc)) = lower(trim(v.ma_dm)) AND dm.cap_do = 2
JOIN public.sx_danh_sach_nguyen_lieu nl
  ON lower(trim(nl.ma_nguyen_lieu)) = lower(trim(v.ma_nl))
WHERE NOT EXISTS (
  SELECT 1
  FROM public.sx_bom b
  WHERE b.danh_muc_id = dm.id
    AND b.nguyen_lieu_id = nl.id
);

COMMIT;
