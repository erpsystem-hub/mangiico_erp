-- Thông số đo — sx_thong_so_do
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sx_thong_so_do (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ten_hien_thi  TEXT NOT NULL,
  don_vi        TEXT NOT NULL CHECK (length(trim(don_vi)) > 0),
  trang_thai    TEXT NOT NULL DEFAULT 'Đang hoạt động'
                CHECK (trang_thai IN ('Đang hoạt động', 'Ngừng hoạt động')),
  tg_tao        TIMESTAMPTZ NOT NULL DEFAULT now(),
  tg_cap_nhat   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_sx_thong_so_do_ten_lower
  ON public.sx_thong_so_do (lower(trim(ten_hien_thi)));

CREATE INDEX IF NOT EXISTS idx_sx_thong_so_do_trang_thai ON public.sx_thong_so_do (trang_thai);

ALTER TABLE public.sx_thong_so_do ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sx_thong_so_do_select ON public.sx_thong_so_do;
CREATE POLICY sx_thong_so_do_select ON public.sx_thong_so_do
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS sx_thong_so_do_modify ON public.sx_thong_so_do;
CREATE POLICY sx_thong_so_do_modify ON public.sx_thong_so_do
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS trg_sx_thong_so_do_updated ON public.sx_thong_so_do;
CREATE TRIGGER trg_sx_thong_so_do_updated
  BEFORE UPDATE ON public.sx_thong_so_do
  FOR EACH ROW EXECUTE FUNCTION public.set_tg_cap_nhat();
