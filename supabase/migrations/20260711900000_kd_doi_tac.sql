-- Đối tác kinh doanh — kd_danh_muc_doi_tac (cây 2 cấp) + kd_danh_sach_doi_tac
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.kd_danh_muc_doi_tac (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  loai_doi_tac    TEXT NOT NULL CHECK (loai_doi_tac IN ('khach_hang', 'nha_cung_cap')),
  ten_danh_muc    TEXT NOT NULL,
  ma_danh_muc     TEXT,
  mo_ta           TEXT,
  cha_id          BIGINT REFERENCES public.kd_danh_muc_doi_tac (id) ON DELETE SET NULL,
  cap_do          INTEGER NOT NULL DEFAULT 0 CHECK (cap_do IN (0, 1, 2)),
  duong_dan       TEXT NOT NULL DEFAULT '',
  trang_thai      TEXT NOT NULL DEFAULT 'Đang hoạt động'
                  CHECK (trang_thai IN ('Đang hoạt động', 'Ngừng hoạt động')),
  thu_tu          INTEGER NOT NULL DEFAULT 0,
  tg_tao          TIMESTAMPTZ NOT NULL DEFAULT now(),
  tg_cap_nhat     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_kd_danh_muc_dt_ten_lower
  ON public.kd_danh_muc_doi_tac (loai_doi_tac, lower(trim(ten_danh_muc)));

CREATE UNIQUE INDEX IF NOT EXISTS uq_kd_danh_muc_dt_ma_lower
  ON public.kd_danh_muc_doi_tac (loai_doi_tac, lower(trim(ma_danh_muc)))
  WHERE ma_danh_muc IS NOT NULL AND trim(ma_danh_muc) <> '';

CREATE INDEX IF NOT EXISTS idx_kd_danh_muc_dt_loai ON public.kd_danh_muc_doi_tac (loai_doi_tac);
CREATE INDEX IF NOT EXISTS idx_kd_danh_muc_dt_cha_id ON public.kd_danh_muc_doi_tac (cha_id);
CREATE INDEX IF NOT EXISTS idx_kd_danh_muc_dt_duong_dan ON public.kd_danh_muc_doi_tac (duong_dan);
CREATE INDEX IF NOT EXISTS idx_kd_danh_muc_dt_thu_tu ON public.kd_danh_muc_doi_tac (thu_tu);
CREATE INDEX IF NOT EXISTS idx_kd_danh_muc_dt_trang_thai ON public.kd_danh_muc_doi_tac (trang_thai);

ALTER TABLE public.kd_danh_muc_doi_tac ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS kd_danh_muc_doi_tac_select ON public.kd_danh_muc_doi_tac;
CREATE POLICY kd_danh_muc_doi_tac_select ON public.kd_danh_muc_doi_tac
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS kd_danh_muc_doi_tac_modify ON public.kd_danh_muc_doi_tac;
CREATE POLICY kd_danh_muc_doi_tac_modify ON public.kd_danh_muc_doi_tac
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.kd_danh_muc_doi_tac_assert_cha_loai() RETURNS trigger AS $$
DECLARE
  p_loai text;
BEGIN
  IF NEW.cha_id IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT p.loai_doi_tac INTO p_loai
  FROM public.kd_danh_muc_doi_tac p
  WHERE p.id = NEW.cha_id;
  IF p_loai IS NULL THEN
    RAISE EXCEPTION 'kd_danh_muc_doi_tac: cha_id % không tồn tại', NEW.cha_id;
  END IF;
  IF p_loai <> NEW.loai_doi_tac THEN
    RAISE EXCEPTION 'kd_danh_muc_doi_tac: cha_id phải cùng loai_doi_tac';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_kd_danh_muc_dt_cha_loai ON public.kd_danh_muc_doi_tac;
CREATE TRIGGER trg_kd_danh_muc_dt_cha_loai
  BEFORE INSERT OR UPDATE OF cha_id, loai_doi_tac ON public.kd_danh_muc_doi_tac
  FOR EACH ROW EXECUTE FUNCTION public.kd_danh_muc_doi_tac_assert_cha_loai();

CREATE OR REPLACE FUNCTION public.kd_danh_muc_doi_tac_path_after_insert() RETURNS trigger AS $$
DECLARE
  p_duong text;
  p_cap   int;
BEGIN
  IF NEW.cha_id IS NULL THEN
    UPDATE public.kd_danh_muc_doi_tac
    SET duong_dan = '/' || NEW.id::text, cap_do = 1
    WHERE id = NEW.id;
  ELSE
    SELECT p.duong_dan, p.cap_do INTO p_duong, p_cap
    FROM public.kd_danh_muc_doi_tac p
    WHERE p.id = NEW.cha_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'kd_danh_muc_doi_tac: cha_id % không tồn tại', NEW.cha_id;
    END IF;
    IF p_cap >= 2 THEN
      RAISE EXCEPTION 'kd_danh_muc_doi_tac: chỉ cho phép tối đa 2 cấp';
    END IF;
    UPDATE public.kd_danh_muc_doi_tac
    SET duong_dan = p_duong || '/' || NEW.id::text, cap_do = p_cap + 1
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_kd_danh_muc_dt_path_ins ON public.kd_danh_muc_doi_tac;
CREATE TRIGGER trg_kd_danh_muc_dt_path_ins
  AFTER INSERT ON public.kd_danh_muc_doi_tac
  FOR EACH ROW EXECUTE FUNCTION public.kd_danh_muc_doi_tac_path_after_insert();

DROP TRIGGER IF EXISTS trg_kd_danh_muc_doi_tac_updated ON public.kd_danh_muc_doi_tac;
CREATE TRIGGER trg_kd_danh_muc_doi_tac_updated
  BEFORE UPDATE ON public.kd_danh_muc_doi_tac
  FOR EACH ROW EXECUTE FUNCTION public.set_tg_cap_nhat();

CREATE OR REPLACE FUNCTION public.get_kd_danh_muc_doi_tac_path_level(p_id BIGINT, p_cha_id BIGINT)
RETURNS TABLE (duong_dan TEXT, cap_do INT)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
AS $$
DECLARE
  parent_path TEXT;
  parent_level INT;
BEGIN
  IF p_cha_id IS NULL THEN
    RETURN QUERY SELECT ('/' || p_id::TEXT)::TEXT, 1;
    RETURN;
  END IF;

  SELECT dm.duong_dan, dm.cap_do
    INTO parent_path, parent_level
    FROM public.kd_danh_muc_doi_tac dm
   WHERE dm.id = p_cha_id;

  IF parent_path IS NULL THEN
    RAISE EXCEPTION 'kd_danh_muc_doi_tac: cha_id % không tồn tại', p_cha_id;
  END IF;

  IF parent_level >= 2 THEN
    RAISE EXCEPTION 'kd_danh_muc_doi_tac: chỉ cho phép tối đa 2 cấp';
  END IF;

  RETURN QUERY SELECT (parent_path || '/' || p_id::TEXT)::TEXT, parent_level + 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_kd_danh_muc_doi_tac_path_level(BIGINT, BIGINT) TO authenticated;

-- Danh sách đối tác
CREATE TABLE IF NOT EXISTS public.kd_danh_sach_doi_tac (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  loai_doi_tac    TEXT NOT NULL CHECK (loai_doi_tac IN ('khach_hang', 'nha_cung_cap')),
  ma_doi_tac      TEXT NOT NULL,
  ten_doi_tac     TEXT NOT NULL,
  danh_muc_id     BIGINT NOT NULL REFERENCES public.kd_danh_muc_doi_tac (id) ON DELETE RESTRICT,
  dien_thoai      TEXT,
  email           TEXT,
  dia_chi         TEXT,
  ma_so_thue      TEXT,
  nguoi_lien_he   TEXT,
  mo_ta           TEXT,
  trang_thai      TEXT NOT NULL DEFAULT 'Đang hoạt động'
                  CHECK (trang_thai IN ('Đang hoạt động', 'Ngừng hoạt động')),
  tg_tao          TIMESTAMPTZ NOT NULL DEFAULT now(),
  tg_cap_nhat     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_kd_danh_sach_dt_ma_lower
  ON public.kd_danh_sach_doi_tac (loai_doi_tac, lower(trim(ma_doi_tac)));

CREATE INDEX IF NOT EXISTS idx_kd_danh_sach_dt_loai ON public.kd_danh_sach_doi_tac (loai_doi_tac);
CREATE INDEX IF NOT EXISTS idx_kd_danh_sach_dt_danh_muc ON public.kd_danh_sach_doi_tac (danh_muc_id);
CREATE INDEX IF NOT EXISTS idx_kd_danh_sach_dt_trang_thai ON public.kd_danh_sach_doi_tac (trang_thai);

CREATE OR REPLACE FUNCTION public.kd_doi_tac_assert_danh_muc_cap2() RETURNS trigger AS $$
DECLARE
  v_cap int;
  v_loai text;
BEGIN
  SELECT dm.cap_do, dm.loai_doi_tac INTO v_cap, v_loai
  FROM public.kd_danh_muc_doi_tac dm
  WHERE dm.id = NEW.danh_muc_id;
  IF v_cap IS NULL THEN
    RAISE EXCEPTION 'kd_danh_sach_doi_tac: danh_muc_id % không tồn tại', NEW.danh_muc_id;
  END IF;
  IF v_cap <> 2 THEN
    RAISE EXCEPTION 'kd_danh_sach_doi_tac: chỉ được chọn danh mục cấp 2';
  END IF;
  IF v_loai <> NEW.loai_doi_tac THEN
    RAISE EXCEPTION 'kd_danh_sach_doi_tac: danh_muc_id phải cùng loai_doi_tac';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_kd_doi_tac_danh_muc_cap2 ON public.kd_danh_sach_doi_tac;
CREATE TRIGGER trg_kd_doi_tac_danh_muc_cap2
  BEFORE INSERT OR UPDATE OF danh_muc_id, loai_doi_tac ON public.kd_danh_sach_doi_tac
  FOR EACH ROW EXECUTE FUNCTION public.kd_doi_tac_assert_danh_muc_cap2();

DROP TRIGGER IF EXISTS trg_kd_danh_sach_doi_tac_updated ON public.kd_danh_sach_doi_tac;
CREATE TRIGGER trg_kd_danh_sach_doi_tac_updated
  BEFORE UPDATE ON public.kd_danh_sach_doi_tac
  FOR EACH ROW EXECUTE FUNCTION public.set_tg_cap_nhat();

ALTER TABLE public.kd_danh_sach_doi_tac ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS kd_danh_sach_doi_tac_select ON public.kd_danh_sach_doi_tac;
CREATE POLICY kd_danh_sach_doi_tac_select ON public.kd_danh_sach_doi_tac
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS kd_danh_sach_doi_tac_modify ON public.kd_danh_sach_doi_tac;
CREATE POLICY kd_danh_sach_doi_tac_modify ON public.kd_danh_sach_doi_tac
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

COMMENT ON TABLE public.kd_danh_muc_doi_tac IS 'Nhóm khách hàng / nhà cung cấp (cây 2 cấp, phân loai_doi_tac)';
COMMENT ON TABLE public.kd_danh_sach_doi_tac IS 'Danh sách đối tác kinh doanh';
