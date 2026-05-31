-- Cập nhật branding mặc định: logo Mangiico + tên ứng dụng mới
ALTER TABLE public.var_thong_tin_to_chuc
  ALTER COLUMN ten_ung_dung SET DEFAULT 'Mangiico';

UPDATE public.var_thong_tin_to_chuc
SET
  ten_ung_dung = 'Mangiico',
  mo_ta_ngan = 'Hệ thống quản trị',
  url_logo = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKffuRSheGugfycCmEm46856oXbHMXKHiOjg&s',
  tg_cap_nhat = now()
WHERE id = 1
  AND (
    url_logo IS NULL
    OR url_logo = 'https://datafiles.nghean.gov.vn/nan-ubnd/6556/Album/quochuy%20(1).png'
    OR ten_ung_dung IN ('Mangiico ERP', '5F template')
  );
