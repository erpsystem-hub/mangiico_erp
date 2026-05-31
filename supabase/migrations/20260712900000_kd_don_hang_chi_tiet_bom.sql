-- BOM thực tế theo dòng đơn hàng (sinh từ mẫu sx_bom của danh mục)

CREATE TABLE IF NOT EXISTS public.kd_don_hang_chi_tiet_bom (
  id                   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  don_hang_chi_tiet_id BIGINT NOT NULL REFERENCES public.kd_don_hang_chi_tiet (id) ON DELETE CASCADE,
  nguyen_lieu_id       BIGINT NOT NULL REFERENCES public.sx_danh_sach_nguyen_lieu (id) ON DELETE RESTRICT,
  bom_mau_id           BIGINT NULL REFERENCES public.sx_bom (id) ON DELETE SET NULL,
  so_luong_dinh_muc    NUMERIC NOT NULL CHECK (so_luong_dinh_muc > 0),
  so_luong_tong        NUMERIC NOT NULL CHECK (so_luong_tong > 0),
  don_vi_tinh          TEXT NOT NULL DEFAULT '',
  ghi_chu              TEXT,
  thu_tu               INT NOT NULL DEFAULT 0,
  tg_tao               TIMESTAMPTZ NOT NULL DEFAULT now(),
  tg_cap_nhat          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_kd_dh_ct_bom_line_nl UNIQUE (don_hang_chi_tiet_id, nguyen_lieu_id)
);

CREATE INDEX IF NOT EXISTS idx_kd_dh_ct_bom_line ON public.kd_don_hang_chi_tiet_bom (don_hang_chi_tiet_id);
CREATE INDEX IF NOT EXISTS idx_kd_dh_ct_bom_nl ON public.kd_don_hang_chi_tiet_bom (nguyen_lieu_id);

COMMENT ON TABLE public.kd_don_hang_chi_tiet_bom IS
  'BOM thực tế theo dòng đơn hàng — sinh từ sx_bom danh mục, có SL/SP và SL tổng';

-- Tính so_luong_tong trước khi ghi
CREATE OR REPLACE FUNCTION public.kd_don_hang_chi_tiet_bom_recalc_tong() RETURNS trigger AS $$
DECLARE
  v_line_qty numeric;
BEGIN
  SELECT ct.so_luong INTO v_line_qty
  FROM public.kd_don_hang_chi_tiet ct
  WHERE ct.id = NEW.don_hang_chi_tiet_id;

  IF v_line_qty IS NULL THEN
    RAISE EXCEPTION 'kd_don_hang_chi_tiet_bom: dòng đơn % không tồn tại', NEW.don_hang_chi_tiet_id;
  END IF;

  NEW.so_luong_tong := NEW.so_luong_dinh_muc * v_line_qty;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_kd_dh_ct_bom_recalc_tong ON public.kd_don_hang_chi_tiet_bom;
CREATE TRIGGER trg_kd_dh_ct_bom_recalc_tong
  BEFORE INSERT OR UPDATE OF so_luong_dinh_muc, don_hang_chi_tiet_id
  ON public.kd_don_hang_chi_tiet_bom
  FOR EACH ROW EXECUTE FUNCTION public.kd_don_hang_chi_tiet_bom_recalc_tong();

-- Nguyên liệu phải có trong BOM mẫu danh mục (Đang hoạt động)
CREATE OR REPLACE FUNCTION public.kd_don_hang_chi_tiet_bom_assert_material() RETURNS trigger AS $$
DECLARE
  v_danh_muc_id bigint;
BEGIN
  SELECT ct.danh_muc_id INTO v_danh_muc_id
  FROM public.kd_don_hang_chi_tiet ct
  WHERE ct.id = NEW.don_hang_chi_tiet_id;

  IF v_danh_muc_id IS NULL THEN
    RAISE EXCEPTION 'kd_don_hang_chi_tiet_bom: dòng đơn % không tồn tại', NEW.don_hang_chi_tiet_id;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.sx_bom b
    WHERE b.danh_muc_id = v_danh_muc_id
      AND b.nguyen_lieu_id = NEW.nguyen_lieu_id
      AND b.trang_thai = 'Đang hoạt động'
  ) THEN
    RAISE EXCEPTION 'kd_don_hang_chi_tiet_bom: nguyên liệu % không thuộc BOM mẫu danh mục', NEW.nguyen_lieu_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_kd_dh_ct_bom_assert_material ON public.kd_don_hang_chi_tiet_bom;
CREATE TRIGGER trg_kd_dh_ct_bom_assert_material
  BEFORE INSERT OR UPDATE OF nguyen_lieu_id, don_hang_chi_tiet_id
  ON public.kd_don_hang_chi_tiet_bom
  FOR EACH ROW EXECUTE FUNCTION public.kd_don_hang_chi_tiet_bom_assert_material();

-- Khi số lượng SP trên dòng đơn đổi → cập nhật SL tổng BOM con
CREATE OR REPLACE FUNCTION public.kd_don_hang_chi_tiet_bom_on_line_qty_change() RETURNS trigger AS $$
BEGIN
  IF NEW.so_luong IS DISTINCT FROM OLD.so_luong THEN
    UPDATE public.kd_don_hang_chi_tiet_bom b
    SET so_luong_tong = b.so_luong_dinh_muc * NEW.so_luong,
        tg_cap_nhat = now()
    WHERE b.don_hang_chi_tiet_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_kd_dh_ct_bom_on_line_qty ON public.kd_don_hang_chi_tiet;
CREATE TRIGGER trg_kd_dh_ct_bom_on_line_qty
  AFTER UPDATE OF so_luong ON public.kd_don_hang_chi_tiet
  FOR EACH ROW EXECUTE FUNCTION public.kd_don_hang_chi_tiet_bom_on_line_qty_change();

DROP TRIGGER IF EXISTS trg_kd_dh_ct_bom_updated ON public.kd_don_hang_chi_tiet_bom;
CREATE TRIGGER trg_kd_dh_ct_bom_updated
  BEFORE UPDATE ON public.kd_don_hang_chi_tiet_bom
  FOR EACH ROW EXECUTE FUNCTION public.set_tg_cap_nhat();

ALTER TABLE public.kd_don_hang_chi_tiet_bom ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS kd_don_hang_chi_tiet_bom_select ON public.kd_don_hang_chi_tiet_bom;
CREATE POLICY kd_don_hang_chi_tiet_bom_select ON public.kd_don_hang_chi_tiet_bom
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS kd_don_hang_chi_tiet_bom_modify ON public.kd_don_hang_chi_tiet_bom;
CREATE POLICY kd_don_hang_chi_tiet_bom_modify ON public.kd_don_hang_chi_tiet_bom
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Sinh BOM từ mẫu sx_bom của danh mục dòng đơn
CREATE OR REPLACE FUNCTION public.kd_generate_don_hang_chi_tiet_bom(
  p_don_hang_chi_tiet_id bigint,
  p_replace boolean DEFAULT false
) RETURNS void AS $$
DECLARE
  v_danh_muc_id bigint;
  v_line_qty numeric;
  v_existing int;
  v_template_count int;
BEGIN
  SELECT ct.danh_muc_id, ct.so_luong
  INTO v_danh_muc_id, v_line_qty
  FROM public.kd_don_hang_chi_tiet ct
  WHERE ct.id = p_don_hang_chi_tiet_id;

  IF v_danh_muc_id IS NULL THEN
    RAISE EXCEPTION 'kd_generate_don_hang_chi_tiet_bom: dòng đơn % không tồn tại', p_don_hang_chi_tiet_id;
  END IF;

  SELECT count(*)::int INTO v_existing
  FROM public.kd_don_hang_chi_tiet_bom
  WHERE don_hang_chi_tiet_id = p_don_hang_chi_tiet_id;

  IF v_existing > 0 AND NOT p_replace THEN
    RAISE EXCEPTION 'kd_generate_don_hang_chi_tiet_bom: dòng đơn đã có BOM — truyền p_replace = true để ghi đè';
  END IF;

  SELECT count(*)::int INTO v_template_count
  FROM public.sx_bom b
  WHERE b.danh_muc_id = v_danh_muc_id
    AND b.trang_thai = 'Đang hoạt động';

  IF v_template_count = 0 THEN
    RAISE EXCEPTION 'kd_generate_don_hang_chi_tiet_bom: danh mục % chưa có BOM mẫu đang hoạt động', v_danh_muc_id;
  END IF;

  IF p_replace THEN
    DELETE FROM public.kd_don_hang_chi_tiet_bom
    WHERE don_hang_chi_tiet_id = p_don_hang_chi_tiet_id;
  END IF;

  INSERT INTO public.kd_don_hang_chi_tiet_bom (
    don_hang_chi_tiet_id,
    nguyen_lieu_id,
    bom_mau_id,
    so_luong_dinh_muc,
    so_luong_tong,
    don_vi_tinh,
    ghi_chu,
    thu_tu
  )
  SELECT
    p_don_hang_chi_tiet_id,
    b.nguyen_lieu_id,
    b.id,
    b.so_luong,
    b.so_luong * v_line_qty,
    b.don_vi_tinh,
    b.ghi_chu,
    b.thu_tu
  FROM public.sx_bom b
  WHERE b.danh_muc_id = v_danh_muc_id
    AND b.trang_thai = 'Đang hoạt động'
  ORDER BY b.thu_tu, b.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.kd_generate_don_hang_chi_tiet_bom(bigint, boolean) TO authenticated;
