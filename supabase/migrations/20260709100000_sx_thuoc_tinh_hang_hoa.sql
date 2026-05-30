-- Thuộc tính hàng hóa — sx_thuoc_tinh_hang_hoa
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sx_thuoc_tinh_hang_hoa (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ten_hien_thi  TEXT NOT NULL,
  trang_thai    TEXT NOT NULL DEFAULT 'Đang hoạt động'
                CHECK (trang_thai IN ('Đang hoạt động', 'Ngừng hoạt động')),
  tg_tao        TIMESTAMPTZ NOT NULL DEFAULT now(),
  tg_cap_nhat   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_sx_thuoc_tinh_ten_lower
  ON public.sx_thuoc_tinh_hang_hoa (lower(trim(ten_hien_thi)));

CREATE INDEX IF NOT EXISTS idx_sx_thuoc_tinh_trang_thai ON public.sx_thuoc_tinh_hang_hoa (trang_thai);

ALTER TABLE public.sx_thuoc_tinh_hang_hoa ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sx_thuoc_tinh_hang_hoa_select ON public.sx_thuoc_tinh_hang_hoa;
CREATE POLICY sx_thuoc_tinh_hang_hoa_select ON public.sx_thuoc_tinh_hang_hoa
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS sx_thuoc_tinh_hang_hoa_modify ON public.sx_thuoc_tinh_hang_hoa;
CREATE POLICY sx_thuoc_tinh_hang_hoa_modify ON public.sx_thuoc_tinh_hang_hoa
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS trg_sx_thuoc_tinh_hang_hoa_updated ON public.sx_thuoc_tinh_hang_hoa;
CREATE TRIGGER trg_sx_thuoc_tinh_hang_hoa_updated
  BEFORE UPDATE ON public.sx_thuoc_tinh_hang_hoa
  FOR EACH ROW EXECUTE FUNCTION public.set_tg_cap_nhat();
