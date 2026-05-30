-- Danh sách nguyên liệu — sx_danh_sach_nguyen_lieu (thuộc tính cố định ngành may)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sx_danh_sach_nguyen_lieu (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ma_nguyen_lieu  TEXT NOT NULL,
  ten_nguyen_lieu TEXT NOT NULL,
  danh_muc_id     BIGINT NOT NULL REFERENCES public.sx_danh_muc_nguyen_lieu (id) ON DELETE RESTRICT,
  don_vi_tinh     TEXT NOT NULL DEFAULT '',
  mau_sac         TEXT,
  thanh_phan      TEXT,
  kho_vai         TEXT,
  dinh_luong_gsm  NUMERIC,
  xuat_xu         TEXT,
  mo_ta           TEXT,
  trang_thai      TEXT NOT NULL DEFAULT 'Đang hoạt động'
                  CHECK (trang_thai IN ('Đang hoạt động', 'Ngừng hoạt động')),
  tg_tao          TIMESTAMPTZ NOT NULL DEFAULT now(),
  tg_cap_nhat     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_sx_danh_sach_nl_ma_lower
  ON public.sx_danh_sach_nguyen_lieu (lower(trim(ma_nguyen_lieu)));

CREATE INDEX IF NOT EXISTS idx_sx_danh_sach_nl_danh_muc ON public.sx_danh_sach_nguyen_lieu (danh_muc_id);
CREATE INDEX IF NOT EXISTS idx_sx_danh_sach_nl_trang_thai ON public.sx_danh_sach_nguyen_lieu (trang_thai);

CREATE OR REPLACE FUNCTION public.sx_nguyen_lieu_assert_danh_muc_cap2() RETURNS trigger AS $$
DECLARE
  v_cap int;
BEGIN
  SELECT dm.cap_do INTO v_cap
  FROM public.sx_danh_muc_nguyen_lieu dm
  WHERE dm.id = NEW.danh_muc_id;
  IF v_cap IS NULL THEN
    RAISE EXCEPTION 'sx_danh_sach_nguyen_lieu: danh_muc_id % không tồn tại', NEW.danh_muc_id;
  END IF;
  IF v_cap <> 2 THEN
    RAISE EXCEPTION 'sx_danh_sach_nguyen_lieu: chỉ được chọn danh mục cấp 2';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sx_nguyen_lieu_danh_muc_cap2 ON public.sx_danh_sach_nguyen_lieu;
CREATE TRIGGER trg_sx_nguyen_lieu_danh_muc_cap2
  BEFORE INSERT OR UPDATE OF danh_muc_id ON public.sx_danh_sach_nguyen_lieu
  FOR EACH ROW EXECUTE FUNCTION public.sx_nguyen_lieu_assert_danh_muc_cap2();

DROP TRIGGER IF EXISTS trg_sx_danh_sach_nguyen_lieu_updated ON public.sx_danh_sach_nguyen_lieu;
CREATE TRIGGER trg_sx_danh_sach_nguyen_lieu_updated
  BEFORE UPDATE ON public.sx_danh_sach_nguyen_lieu
  FOR EACH ROW EXECUTE FUNCTION public.set_tg_cap_nhat();

ALTER TABLE public.sx_danh_sach_nguyen_lieu ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sx_danh_sach_nguyen_lieu_select ON public.sx_danh_sach_nguyen_lieu;
CREATE POLICY sx_danh_sach_nguyen_lieu_select ON public.sx_danh_sach_nguyen_lieu
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS sx_danh_sach_nguyen_lieu_modify ON public.sx_danh_sach_nguyen_lieu;
CREATE POLICY sx_danh_sach_nguyen_lieu_modify ON public.sx_danh_sach_nguyen_lieu
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

COMMENT ON TABLE public.sx_danh_sach_nguyen_lieu IS 'Danh sách nguyên liệu may mặc (thuộc tính cố định)';
