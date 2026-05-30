-- Seed nguyên liệu demo — sau seed_sx_danh_muc_nguyen_lieu
BEGIN;

INSERT INTO public.sx_danh_sach_nguyen_lieu (
  ma_nguyen_lieu, ten_nguyen_lieu, danh_muc_id,
  don_vi_tinh, mau_sac, thanh_phan, kho_vai, dinh_luong_gsm, xuat_xu, mo_ta, trang_thai
)
SELECT
  v.ma, v.ten, dm.id,
  v.dvt, v.mau, v.tp, v.kho, v.gsm, v.xx, v.mo_ta, 'Đang hoạt động'
FROM (VALUES
  ('VAI-CT-001', 'Vải cotton trắng 40s', 'Vải cotton', 'm', 'Trắng', '100% Cotton', '150cm', 140::numeric, 'Việt Nam', 'Vải chính may áo'),
  ('CHI-PY-001', 'Chỉ polyester 40/2', 'Chỉ polyester', 'cuộn', 'Trắng', '100% Polyester', NULL::text, NULL::numeric, 'Trung Quốc', 'Chỉ may chính'),
  ('KHUY-NL-01', 'Khuy nhựa 12mm', 'Khuy & nút', 'cái', 'Trắng', 'Nhựa ABS', NULL::text, NULL::numeric, NULL::text, 'Phụ liệu may')
) AS v(ma, ten, ten_dm, dvt, mau, tp, kho, gsm, xx, mo_ta)
JOIN public.sx_danh_muc_nguyen_lieu dm
  ON lower(trim(dm.ten_danh_muc)) = lower(trim(v.ten_dm))
 AND dm.cap_do = 2
WHERE NOT EXISTS (
  SELECT 1 FROM public.sx_danh_sach_nguyen_lieu nl
  WHERE lower(trim(nl.ma_nguyen_lieu)) = lower(trim(v.ma))
);

COMMIT;
