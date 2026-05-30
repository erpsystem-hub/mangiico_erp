-- Tạo bảng junction danh mục cấp 2 ↔ thuộc tính / số đo (chạy sau sx_danh_muc_hang_hoa, sx_thuoc_tinh, sx_thong_so_do)
-- Nội dung đồng bộ migration 20260711200000_sx_danh_muc_thuoc_tinh_thong_so_do.sql

CREATE TABLE IF NOT EXISTS public.sx_danh_muc_thuoc_tinh (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  danh_muc_id     BIGINT NOT NULL REFERENCES public.sx_danh_muc_hang_hoa (id) ON DELETE CASCADE,
  thuoc_tinh_id   BIGINT NOT NULL REFERENCES public.sx_thuoc_tinh_hang_hoa (id) ON DELETE RESTRICT,
  bat_buoc        BOOLEAN NOT NULL DEFAULT false,
  thu_tu          INTEGER NOT NULL DEFAULT 0,
  tg_tao          TIMESTAMPTZ NOT NULL DEFAULT now(),
  tg_cap_nhat     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_sx_dm_tt UNIQUE (danh_muc_id, thuoc_tinh_id)
);

CREATE INDEX IF NOT EXISTS idx_sx_dm_tt_danh_muc ON public.sx_danh_muc_thuoc_tinh (danh_muc_id);
CREATE INDEX IF NOT EXISTS idx_sx_dm_tt_thu_tu ON public.sx_danh_muc_thuoc_tinh (danh_muc_id, thu_tu);

CREATE TABLE IF NOT EXISTS public.sx_danh_muc_thong_so_do (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  danh_muc_id     BIGINT NOT NULL REFERENCES public.sx_danh_muc_hang_hoa (id) ON DELETE CASCADE,
  thong_so_do_id  BIGINT NOT NULL REFERENCES public.sx_thong_so_do (id) ON DELETE RESTRICT,
  bat_buoc        BOOLEAN NOT NULL DEFAULT false,
  thu_tu          INTEGER NOT NULL DEFAULT 0,
  tg_tao          TIMESTAMPTZ NOT NULL DEFAULT now(),
  tg_cap_nhat     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_sx_dm_tsd UNIQUE (danh_muc_id, thong_so_do_id)
);

CREATE INDEX IF NOT EXISTS idx_sx_dm_tsd_danh_muc ON public.sx_danh_muc_thong_so_do (danh_muc_id);
CREATE INDEX IF NOT EXISTS idx_sx_dm_tsd_thu_tu ON public.sx_danh_muc_thong_so_do (danh_muc_id, thu_tu);

CREATE OR REPLACE FUNCTION public.sx_danh_muc_link_assert_cap2() RETURNS trigger AS $$
DECLARE
  v_cap int;
BEGIN
  SELECT dm.cap_do INTO v_cap
  FROM public.sx_danh_muc_hang_hoa dm
  WHERE dm.id = NEW.danh_muc_id;
  IF v_cap IS NULL THEN
    RAISE EXCEPTION 'sx_danh_muc_link: danh_muc_id % không tồn tại', NEW.danh_muc_id;
  END IF;
  IF v_cap <> 2 THEN
    RAISE EXCEPTION 'sx_danh_muc_link: chỉ danh mục cấp 2 mới được gán thuộc tính/số đo';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sx_dm_tt_cap2 ON public.sx_danh_muc_thuoc_tinh;
CREATE TRIGGER trg_sx_dm_tt_cap2
  BEFORE INSERT OR UPDATE ON public.sx_danh_muc_thuoc_tinh
  FOR EACH ROW EXECUTE FUNCTION public.sx_danh_muc_link_assert_cap2();

DROP TRIGGER IF EXISTS trg_sx_dm_tsd_cap2 ON public.sx_danh_muc_thong_so_do;
CREATE TRIGGER trg_sx_dm_tsd_cap2
  BEFORE INSERT OR UPDATE ON public.sx_danh_muc_thong_so_do
  FOR EACH ROW EXECUTE FUNCTION public.sx_danh_muc_link_assert_cap2();

DROP TRIGGER IF EXISTS trg_sx_dm_tt_updated ON public.sx_danh_muc_thuoc_tinh;
CREATE TRIGGER trg_sx_dm_tt_updated
  BEFORE UPDATE ON public.sx_danh_muc_thuoc_tinh
  FOR EACH ROW EXECUTE FUNCTION public.set_tg_cap_nhat();

DROP TRIGGER IF EXISTS trg_sx_dm_tsd_updated ON public.sx_danh_muc_thong_so_do;
CREATE TRIGGER trg_sx_dm_tsd_updated
  BEFORE UPDATE ON public.sx_danh_muc_thong_so_do
  FOR EACH ROW EXECUTE FUNCTION public.set_tg_cap_nhat();

ALTER TABLE public.sx_danh_muc_thuoc_tinh ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sx_danh_muc_thong_so_do ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sx_danh_muc_thuoc_tinh_select ON public.sx_danh_muc_thuoc_tinh;
CREATE POLICY sx_danh_muc_thuoc_tinh_select ON public.sx_danh_muc_thuoc_tinh
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS sx_danh_muc_thuoc_tinh_modify ON public.sx_danh_muc_thuoc_tinh;
CREATE POLICY sx_danh_muc_thuoc_tinh_modify ON public.sx_danh_muc_thuoc_tinh
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS sx_danh_muc_thong_so_do_select ON public.sx_danh_muc_thong_so_do;
CREATE POLICY sx_danh_muc_thong_so_do_select ON public.sx_danh_muc_thong_so_do
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS sx_danh_muc_thong_so_do_modify ON public.sx_danh_muc_thong_so_do;
CREATE POLICY sx_danh_muc_thong_so_do_modify ON public.sx_danh_muc_thong_so_do
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
