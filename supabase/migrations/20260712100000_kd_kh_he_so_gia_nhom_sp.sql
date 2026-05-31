-- Hệ số giá bán theo loại KH (danh mục cấp 2) × loại hàng (danh mục HH cấp 2)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.kd_kh_he_so_gia_nhom_sp (
  id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  danh_muc_khach_hang_id  BIGINT NOT NULL REFERENCES public.kd_danh_muc_doi_tac (id) ON DELETE CASCADE,
  nhom_san_pham_id        BIGINT NOT NULL REFERENCES public.sx_danh_muc_hang_hoa (id) ON DELETE CASCADE,
  he_so_gia               NUMERIC(10,4) NOT NULL DEFAULT 1 CHECK (he_so_gia > 0),
  tg_tao                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  tg_cap_nhat             TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_kd_kh_he_so_dm_nhom UNIQUE (danh_muc_khach_hang_id, nhom_san_pham_id)
);

CREATE INDEX IF NOT EXISTS idx_kd_kh_he_so_dm_kh ON public.kd_kh_he_so_gia_nhom_sp (danh_muc_khach_hang_id);
CREATE INDEX IF NOT EXISTS idx_kd_kh_he_so_nhom ON public.kd_kh_he_so_gia_nhom_sp (nhom_san_pham_id);

ALTER TABLE public.kd_kh_he_so_gia_nhom_sp ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS kd_kh_he_so_gia_select ON public.kd_kh_he_so_gia_nhom_sp;
CREATE POLICY kd_kh_he_so_gia_select ON public.kd_kh_he_so_gia_nhom_sp
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS kd_kh_he_so_gia_modify ON public.kd_kh_he_so_gia_nhom_sp;
CREATE POLICY kd_kh_he_so_gia_modify ON public.kd_kh_he_so_gia_nhom_sp
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.kd_kh_he_so_assert_danh_muc_cap2() RETURNS trigger AS $$
DECLARE
  v_cap int;
  v_loai text;
BEGIN
  SELECT dm.cap_do, dm.loai_doi_tac INTO v_cap, v_loai
  FROM public.kd_danh_muc_doi_tac dm
  WHERE dm.id = NEW.danh_muc_khach_hang_id;
  IF v_cap IS NULL THEN
    RAISE EXCEPTION 'kd_kh_he_so_gia: danh_muc_khach_hang_id % không tồn tại', NEW.danh_muc_khach_hang_id;
  END IF;
  IF v_loai <> 'khach_hang' THEN
    RAISE EXCEPTION 'kd_kh_he_so_gia: chỉ áp dụng cho danh mục khách hàng';
  END IF;
  IF v_cap <> 2 THEN
    RAISE EXCEPTION 'kd_kh_he_so_gia: chỉ danh mục KH cấp 2 mới được cấu hình hệ số';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.kd_kh_he_so_assert_loai_hang_cap2() RETURNS trigger AS $$
DECLARE
  v_cap int;
BEGIN
  SELECT dm.cap_do INTO v_cap
  FROM public.sx_danh_muc_hang_hoa dm
  WHERE dm.id = NEW.nhom_san_pham_id;
  IF v_cap IS NULL THEN
    RAISE EXCEPTION 'kd_kh_he_so_gia: nhom_san_pham_id % không tồn tại', NEW.nhom_san_pham_id;
  END IF;
  IF v_cap <> 2 THEN
    RAISE EXCEPTION 'kd_kh_he_so_gia: chỉ loại hàng danh mục cấp 2 (cap_do=2)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_kd_kh_he_so_dm_cap2 ON public.kd_kh_he_so_gia_nhom_sp;
CREATE TRIGGER trg_kd_kh_he_so_dm_cap2
  BEFORE INSERT OR UPDATE OF danh_muc_khach_hang_id ON public.kd_kh_he_so_gia_nhom_sp
  FOR EACH ROW EXECUTE FUNCTION public.kd_kh_he_so_assert_danh_muc_cap2();

DROP TRIGGER IF EXISTS trg_kd_kh_he_so_loai_hang_cap2 ON public.kd_kh_he_so_gia_nhom_sp;
CREATE TRIGGER trg_kd_kh_he_so_loai_hang_cap2
  BEFORE INSERT OR UPDATE OF nhom_san_pham_id ON public.kd_kh_he_so_gia_nhom_sp
  FOR EACH ROW EXECUTE FUNCTION public.kd_kh_he_so_assert_loai_hang_cap2();

DROP TRIGGER IF EXISTS trg_kd_kh_he_so_gia_updated ON public.kd_kh_he_so_gia_nhom_sp;
CREATE TRIGGER trg_kd_kh_he_so_gia_updated
  BEFORE UPDATE ON public.kd_kh_he_so_gia_nhom_sp
  FOR EACH ROW EXECUTE FUNCTION public.set_tg_cap_nhat();
