-- Gán quyền xem cơ bản cho mọi chức vụ trừ Giám đốc (id=1 đã có quyền đầy đủ).
-- Chạy sau seed_var_phan_quyen.sql hoặc khi chỉ có quyền cho chuc_vu_id=1.
-- Idempotent: ON CONFLICT DO NOTHING.

INSERT INTO public.var_phan_quyen (module_key, chuc_vu_id, quyen)
SELECT m.module_key, cv.id, m.quyen
FROM public.var_chuc_vu cv
CROSS JOIN (
  VALUES
    ('nhan-vien', 'xem'),
    ('phong-ban', 'xem'),
    ('chuc-vu', 'xem'),
    ('thong-tin-to-chuc', 'xem'),
    ('phan-quyen', 'xem')
) AS m(module_key, quyen)
WHERE cv.id <> 1
ON CONFLICT (chuc_vu_id, module_key) DO NOTHING;
