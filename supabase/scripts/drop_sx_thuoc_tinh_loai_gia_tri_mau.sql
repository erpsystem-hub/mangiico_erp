-- Chạy trực tiếp trên Supabase SQL Editor (hoặc: npx supabase db query --linked --file supabase/scripts/drop_sx_thuoc_tinh_loai_gia_tri_mau.sql)
-- Bỏ cột loai, gia_tri_mau khỏi bảng sx_thuoc_tinh_hang_hoa (đã deploy migration cũ có 2 cột này).

DROP INDEX IF EXISTS public.idx_sx_thuoc_tinh_loai;

ALTER TABLE public.sx_thuoc_tinh_hang_hoa
  DROP COLUMN IF EXISTS loai,
  DROP COLUMN IF EXISTS gia_tri_mau;
