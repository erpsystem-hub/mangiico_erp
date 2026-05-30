-- Bỏ cột loai, gia_tri_mau khỏi sx_thuoc_tinh_hang_hoa
DROP INDEX IF EXISTS public.idx_sx_thuoc_tinh_loai;

ALTER TABLE public.sx_thuoc_tinh_hang_hoa
  DROP COLUMN IF EXISTS loai,
  DROP COLUMN IF EXISTS gia_tri_mau;
