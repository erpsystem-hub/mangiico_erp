-- Seed tùy chọn: một dòng phân quyền mẫu cho chức vụ đầu tiên.
-- Chạy sau khi có var_chuc_vu (vd. sau `npm run seed:demo`).
-- Idempotent: bỏ qua nếu cặp (chuc_vu_id, module_key) đã tồn tại.

INSERT INTO public.var_phan_quyen (module_key, chuc_vu_id, quyen)
SELECT 'nhan-vien', cv.id, 'xem,them,sua'
FROM public.var_chuc_vu cv
ORDER BY cv.id
LIMIT 1
ON CONFLICT (chuc_vu_id, module_key) DO NOTHING;

INSERT INTO public.var_phan_quyen (module_key, chuc_vu_id, quyen)
SELECT 'phong-ban', cv.id, 'xem,them,sua,xoa'
FROM public.var_chuc_vu cv
ORDER BY cv.id
LIMIT 1
ON CONFLICT (chuc_vu_id, module_key) DO NOTHING;

INSERT INTO public.var_phan_quyen (module_key, chuc_vu_id, quyen)
SELECT 'chuc-vu', cv.id, 'xem,them,sua,xoa'
FROM public.var_chuc_vu cv
ORDER BY cv.id
LIMIT 1
ON CONFLICT (chuc_vu_id, module_key) DO NOTHING;

INSERT INTO public.var_phan_quyen (module_key, chuc_vu_id, quyen)
SELECT 'thong-tin-to-chuc', cv.id, 'xem,sua'
FROM public.var_chuc_vu cv
ORDER BY cv.id
LIMIT 1
ON CONFLICT (chuc_vu_id, module_key) DO NOTHING;

INSERT INTO public.var_phan_quyen (module_key, chuc_vu_id, quyen)
SELECT 'chi-nhanh', cv.id, 'xem,them,sua,xoa'
FROM public.var_chuc_vu cv
ORDER BY cv.id
LIMIT 1
ON CONFLICT (chuc_vu_id, module_key) DO NOTHING;

INSERT INTO public.var_phan_quyen (module_key, chuc_vu_id, quyen)
SELECT 'phan-quyen', cv.id, 'xem,sua'
FROM public.var_chuc_vu cv
ORDER BY cv.id
LIMIT 1
ON CONFLICT (chuc_vu_id, module_key) DO NOTHING;
