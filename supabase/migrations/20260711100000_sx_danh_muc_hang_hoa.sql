-- Danh mục hàng hóa — sx_danh_muc_hang_hoa (cây 2 cấp)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sx_danh_muc_hang_hoa (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ten_danh_muc    TEXT NOT NULL,
  ma_danh_muc     TEXT,
  mo_ta           TEXT,
  cha_id          BIGINT REFERENCES public.sx_danh_muc_hang_hoa (id) ON DELETE SET NULL,
  cap_do          INTEGER NOT NULL DEFAULT 0 CHECK (cap_do IN (0, 1, 2)),
  duong_dan       TEXT NOT NULL DEFAULT '',
  trang_thai      TEXT NOT NULL DEFAULT 'Đang hoạt động'
                  CHECK (trang_thai IN ('Đang hoạt động', 'Ngừng hoạt động')),
  thu_tu          INTEGER NOT NULL DEFAULT 0,
  tg_tao          TIMESTAMPTZ NOT NULL DEFAULT now(),
  tg_cap_nhat     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_sx_danh_muc_hang_hoa_ten_lower
  ON public.sx_danh_muc_hang_hoa (lower(trim(ten_danh_muc)));

CREATE UNIQUE INDEX IF NOT EXISTS uq_sx_danh_muc_ma_lower
  ON public.sx_danh_muc_hang_hoa (lower(trim(ma_danh_muc)))
  WHERE ma_danh_muc IS NOT NULL AND trim(ma_danh_muc) <> '';

CREATE INDEX IF NOT EXISTS idx_sx_danh_muc_cha_id ON public.sx_danh_muc_hang_hoa (cha_id);
CREATE INDEX IF NOT EXISTS idx_sx_danh_muc_duong_dan ON public.sx_danh_muc_hang_hoa (duong_dan);
CREATE INDEX IF NOT EXISTS idx_sx_danh_muc_thu_tu ON public.sx_danh_muc_hang_hoa (thu_tu);
CREATE INDEX IF NOT EXISTS idx_sx_danh_muc_trang_thai ON public.sx_danh_muc_hang_hoa (trang_thai);

ALTER TABLE public.sx_danh_muc_hang_hoa ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sx_danh_muc_hang_hoa_select ON public.sx_danh_muc_hang_hoa;
CREATE POLICY sx_danh_muc_hang_hoa_select ON public.sx_danh_muc_hang_hoa
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS sx_danh_muc_hang_hoa_modify ON public.sx_danh_muc_hang_hoa;
CREATE POLICY sx_danh_muc_hang_hoa_modify ON public.sx_danh_muc_hang_hoa
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.sx_danh_muc_hang_hoa_path_after_insert() RETURNS trigger AS $$
DECLARE
  p_duong text;
  p_cap   int;
BEGIN
  IF NEW.cha_id IS NULL THEN
    UPDATE public.sx_danh_muc_hang_hoa
    SET duong_dan = '/' || NEW.id::text, cap_do = 1
    WHERE id = NEW.id;
  ELSE
    SELECT p.duong_dan, p.cap_do INTO p_duong, p_cap
    FROM public.sx_danh_muc_hang_hoa p
    WHERE p.id = NEW.cha_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'sx_danh_muc_hang_hoa: cha_id % không tồn tại', NEW.cha_id;
    END IF;
    IF p_cap >= 2 THEN
      RAISE EXCEPTION 'sx_danh_muc_hang_hoa: chỉ cho phép tối đa 2 cấp';
    END IF;
    UPDATE public.sx_danh_muc_hang_hoa
    SET duong_dan = p_duong || '/' || NEW.id::text, cap_do = p_cap + 1
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sx_danh_muc_path_ins ON public.sx_danh_muc_hang_hoa;
CREATE TRIGGER trg_sx_danh_muc_path_ins
  AFTER INSERT ON public.sx_danh_muc_hang_hoa
  FOR EACH ROW EXECUTE FUNCTION public.sx_danh_muc_hang_hoa_path_after_insert();

DROP TRIGGER IF EXISTS trg_sx_danh_muc_hang_hoa_updated ON public.sx_danh_muc_hang_hoa;
CREATE TRIGGER trg_sx_danh_muc_hang_hoa_updated
  BEFORE UPDATE ON public.sx_danh_muc_hang_hoa
  FOR EACH ROW EXECUTE FUNCTION public.set_tg_cap_nhat();

CREATE OR REPLACE FUNCTION public.get_sx_danh_muc_hang_hoa_path_level(p_id BIGINT, p_cha_id BIGINT)
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
    FROM public.sx_danh_muc_hang_hoa dm
   WHERE dm.id = p_cha_id;

  IF parent_path IS NULL THEN
    RAISE EXCEPTION 'sx_danh_muc_hang_hoa: cha_id % không tồn tại', p_cha_id;
  END IF;

  IF parent_level >= 2 THEN
    RAISE EXCEPTION 'sx_danh_muc_hang_hoa: chỉ cho phép tối đa 2 cấp';
  END IF;

  RETURN QUERY SELECT (parent_path || '/' || p_id::TEXT)::TEXT, parent_level + 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_sx_danh_muc_hang_hoa_path_level(BIGINT, BIGINT) TO authenticated;

COMMENT ON FUNCTION public.get_sx_danh_muc_hang_hoa_path_level IS
  'Tính duong_dan/cap_do danh mục hàng hóa khi đổi cha — tối đa 2 cấp.';
