-- Thứ tự hiển thị cột matrix / danh sách — sx_thuoc_tinh_hang_hoa, sx_thong_so_do
-- ============================================================================
ALTER TABLE public.sx_thuoc_tinh_hang_hoa
  ADD COLUMN IF NOT EXISTS thu_tu INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.sx_thong_so_do
  ADD COLUMN IF NOT EXISTS thu_tu INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_sx_thuoc_tinh_thu_tu ON public.sx_thuoc_tinh_hang_hoa (thu_tu);
CREATE INDEX IF NOT EXISTS idx_sx_thong_so_do_thu_tu ON public.sx_thong_so_do (thu_tu);

COMMENT ON COLUMN public.sx_thuoc_tinh_hang_hoa.thu_tu IS 'Thứ tự cột matrix danh mục / danh sách';
COMMENT ON COLUMN public.sx_thong_so_do.thu_tu IS 'Thứ tự cột matrix danh mục / danh sách';
