-- Tài khoản / quỹ thu chi — tc_tai_khoan
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tc_tai_khoan (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ten_quy           TEXT NOT NULL,
  loai_quy          TEXT NOT NULL CHECK (loai_quy IN ('Tiền mặt', 'Ngân hàng')),
  chi_nhanh_id      BIGINT REFERENCES public.var_chi_nhanh (id) ON DELETE SET NULL,
  ngan_hang         TEXT,
  ma_ngan_hang_bin  TEXT,
  so_tai_khoan      TEXT,
  chu_tai_khoan     TEXT,
  so_du_khoi_dau    NUMERIC(18, 2) NOT NULL DEFAULT 0,
  trang_thai        TEXT NOT NULL DEFAULT 'Đang hoạt động'
                    CHECK (trang_thai IN ('Đang hoạt động', 'Ngừng hoạt động')),
  tg_tao            TIMESTAMPTZ NOT NULL DEFAULT now(),
  tg_cap_nhat       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_tc_tai_khoan_ten_lower
  ON public.tc_tai_khoan (lower(trim(ten_quy)));

CREATE INDEX IF NOT EXISTS idx_tc_tai_khoan_chi_nhanh ON public.tc_tai_khoan (chi_nhanh_id);
CREATE INDEX IF NOT EXISTS idx_tc_tai_khoan_loai_quy ON public.tc_tai_khoan (loai_quy);
CREATE INDEX IF NOT EXISTS idx_tc_tai_khoan_trang_thai ON public.tc_tai_khoan (trang_thai);

ALTER TABLE public.tc_tai_khoan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tc_tai_khoan_select ON public.tc_tai_khoan;
CREATE POLICY tc_tai_khoan_select ON public.tc_tai_khoan
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS tc_tai_khoan_modify ON public.tc_tai_khoan;
CREATE POLICY tc_tai_khoan_modify ON public.tc_tai_khoan
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS trg_tc_tai_khoan_updated ON public.tc_tai_khoan;
CREATE TRIGGER trg_tc_tai_khoan_updated
  BEFORE UPDATE ON public.tc_tai_khoan
  FOR EACH ROW EXECUTE FUNCTION public.set_tg_cap_nhat();
