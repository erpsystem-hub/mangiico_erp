-- Seed tài khoản / quỹ mẫu (chạy sau var_chi_nhanh)
INSERT INTO public.tc_tai_khoan (
  ten_quy,
  loai_quy,
  chi_nhanh_id,
  ngan_hang,
  ma_ngan_hang_bin,
  so_tai_khoan,
  chu_tai_khoan,
  so_du_khoi_dau,
  trang_thai
)
SELECT
  'Quỹ tiền mặt ' || cn.ten_chi_nhanh,
  'Tiền mặt',
  cn.id,
  NULL,
  NULL,
  NULL,
  NULL,
  5000000,
  'Đang hoạt động'
FROM public.var_chi_nhanh cn
WHERE cn.ma_chi_nhanh = 'HCM-01'
  AND NOT EXISTS (
    SELECT 1 FROM public.tc_tai_khoan t
    WHERE lower(trim(t.ten_quy)) = lower(trim('Quỹ tiền mặt ' || cn.ten_chi_nhanh))
  )
LIMIT 1;

INSERT INTO public.tc_tai_khoan (
  ten_quy,
  loai_quy,
  chi_nhanh_id,
  ngan_hang,
  ma_ngan_hang_bin,
  so_tai_khoan,
  chu_tai_khoan,
  so_du_khoi_dau,
  trang_thai
)
SELECT
  'TK Vietcombank ' || cn.ten_chi_nhanh,
  'Ngân hàng',
  cn.id,
  'Ngân hàng TMCP Ngoại thương Việt Nam',
  '970436',
  '0123456789',
  'CONG TY TNHH MANGIICO',
  100000000,
  'Đang hoạt động'
FROM public.var_chi_nhanh cn
WHERE cn.ma_chi_nhanh = 'HCM-01'
  AND NOT EXISTS (
    SELECT 1 FROM public.tc_tai_khoan t
    WHERE lower(trim(t.ten_quy)) = lower(trim('TK Vietcombank ' || cn.ten_chi_nhanh))
  )
LIMIT 1;
