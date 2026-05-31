-- Bỏ cột tỷ lệ hao hụt khỏi sx_bom (nếu đã tạo từ migration trước)
ALTER TABLE public.sx_bom DROP COLUMN IF EXISTS ty_le_hao_hut;
