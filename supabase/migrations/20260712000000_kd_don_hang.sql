-- Đơn hàng bán — kd_don_hang + kd_don_hang_chi_tiet
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.kd_don_hang (
  id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ma_don_hang         TEXT NOT NULL,
  khach_hang_id       BIGINT NOT NULL REFERENCES public.kd_danh_sach_doi_tac (id) ON DELETE RESTRICT,
  chi_nhanh_id        BIGINT REFERENCES public.var_chi_nhanh (id) ON DELETE SET NULL,
  nhan_vien_id        BIGINT REFERENCES public.var_nhan_vien (id) ON DELETE SET NULL,
  ngay_dat            DATE NOT NULL DEFAULT CURRENT_DATE,
  ngay_giao_du_kien   DATE,
  dia_chi_giao        TEXT,
  ghi_chu             TEXT,
  trang_thai          TEXT NOT NULL DEFAULT 'Nháp'
                      CHECK (trang_thai IN ('Nháp', 'Mới', 'Hoàn thành', 'Hủy')),
  tong_tien           NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (tong_tien >= 0),
  tg_tao              TIMESTAMPTZ NOT NULL DEFAULT now(),
  tg_cap_nhat         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_kd_don_hang_ma_lower
  ON public.kd_don_hang (lower(trim(ma_don_hang)));

CREATE INDEX IF NOT EXISTS idx_kd_don_hang_khach ON public.kd_don_hang (khach_hang_id);
CREATE INDEX IF NOT EXISTS idx_kd_don_hang_ngay_dat ON public.kd_don_hang (ngay_dat);
CREATE INDEX IF NOT EXISTS idx_kd_don_hang_trang_thai ON public.kd_don_hang (trang_thai);
CREATE INDEX IF NOT EXISTS idx_kd_don_hang_tg_cap_nhat ON public.kd_don_hang (tg_cap_nhat DESC);

CREATE TABLE IF NOT EXISTS public.kd_don_hang_chi_tiet (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  don_hang_id     BIGINT NOT NULL REFERENCES public.kd_don_hang (id) ON DELETE CASCADE,
  san_pham_id     BIGINT NOT NULL REFERENCES public.sx_danh_sach_san_pham (id) ON DELETE RESTRICT,
  so_luong        NUMERIC NOT NULL CHECK (so_luong > 0),
  don_vi_tinh     TEXT NOT NULL DEFAULT 'cái',
  don_gia         NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (don_gia >= 0),
  thanh_tien      NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (thanh_tien >= 0),
  ghi_chu         TEXT,
  thu_tu          INTEGER NOT NULL DEFAULT 0,
  tg_tao          TIMESTAMPTZ NOT NULL DEFAULT now(),
  tg_cap_nhat     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kd_dh_ct_don_hang ON public.kd_don_hang_chi_tiet (don_hang_id);
CREATE INDEX IF NOT EXISTS idx_kd_dh_ct_san_pham ON public.kd_don_hang_chi_tiet (san_pham_id);

-- Khách hàng phải loại khach_hang + đang hoạt động
CREATE OR REPLACE FUNCTION public.kd_don_hang_assert_khach_hang() RETURNS trigger AS $$
DECLARE
  v_loai text;
  v_tt   text;
BEGIN
  SELECT dt.loai_doi_tac, dt.trang_thai INTO v_loai, v_tt
  FROM public.kd_danh_sach_doi_tac dt
  WHERE dt.id = NEW.khach_hang_id;
  IF v_loai IS NULL THEN
    RAISE EXCEPTION 'kd_don_hang: khach_hang_id % không tồn tại', NEW.khach_hang_id;
  END IF;
  IF v_loai <> 'khach_hang' THEN
    RAISE EXCEPTION 'kd_don_hang: chỉ được chọn đối tác loại khách hàng';
  END IF;
  IF v_tt <> 'Đang hoạt động' THEN
    RAISE EXCEPTION 'kd_don_hang: khách hàng không ở trạng thái Đang hoạt động';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_kd_don_hang_khach ON public.kd_don_hang;
CREATE TRIGGER trg_kd_don_hang_khach
  BEFORE INSERT OR UPDATE OF khach_hang_id ON public.kd_don_hang
  FOR EACH ROW EXECUTE FUNCTION public.kd_don_hang_assert_khach_hang();

-- Sản phẩm đang hoạt động
CREATE OR REPLACE FUNCTION public.kd_don_hang_chi_tiet_assert_san_pham() RETURNS trigger AS $$
DECLARE
  v_tt text;
BEGIN
  SELECT sp.trang_thai INTO v_tt
  FROM public.sx_danh_sach_san_pham sp
  WHERE sp.id = NEW.san_pham_id;
  IF v_tt IS NULL THEN
    RAISE EXCEPTION 'kd_don_hang_chi_tiet: san_pham_id % không tồn tại', NEW.san_pham_id;
  END IF;
  IF v_tt <> 'Đang hoạt động' THEN
    RAISE EXCEPTION 'kd_don_hang_chi_tiet: sản phẩm không ở trạng thái Đang hoạt động';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.kd_don_hang_chi_tiet_calc_thanh_tien() RETURNS trigger AS $$
BEGIN
  NEW.thanh_tien := round(NEW.so_luong * NEW.don_gia, 2);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_kd_dh_ct_san_pham ON public.kd_don_hang_chi_tiet;
CREATE TRIGGER trg_kd_dh_ct_san_pham
  BEFORE INSERT OR UPDATE OF san_pham_id ON public.kd_don_hang_chi_tiet
  FOR EACH ROW EXECUTE FUNCTION public.kd_don_hang_chi_tiet_assert_san_pham();

DROP TRIGGER IF EXISTS trg_kd_dh_ct_thanh_tien ON public.kd_don_hang_chi_tiet;
CREATE TRIGGER trg_kd_dh_ct_thanh_tien
  BEFORE INSERT OR UPDATE OF so_luong, don_gia ON public.kd_don_hang_chi_tiet
  FOR EACH ROW EXECUTE FUNCTION public.kd_don_hang_chi_tiet_calc_thanh_tien();

CREATE OR REPLACE FUNCTION public.kd_don_hang_recalc_tong_tien(p_don_hang_id BIGINT) RETURNS void AS $$
BEGIN
  UPDATE public.kd_don_hang dh
  SET tong_tien = COALESCE((
    SELECT SUM(ct.thanh_tien)
    FROM public.kd_don_hang_chi_tiet ct
    WHERE ct.don_hang_id = p_don_hang_id
  ), 0),
  tg_cap_nhat = now()
  WHERE dh.id = p_don_hang_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.kd_don_hang_chi_tiet_after_change() RETURNS trigger AS $$
DECLARE
  v_id bigint;
BEGIN
  v_id := COALESCE(NEW.don_hang_id, OLD.don_hang_id);
  PERFORM public.kd_don_hang_recalc_tong_tien(v_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_kd_dh_ct_recalc ON public.kd_don_hang_chi_tiet;
CREATE TRIGGER trg_kd_dh_ct_recalc
  AFTER INSERT OR UPDATE OR DELETE ON public.kd_don_hang_chi_tiet
  FOR EACH ROW EXECUTE FUNCTION public.kd_don_hang_chi_tiet_after_change();

DROP TRIGGER IF EXISTS trg_kd_don_hang_updated ON public.kd_don_hang;
CREATE TRIGGER trg_kd_don_hang_updated
  BEFORE UPDATE ON public.kd_don_hang
  FOR EACH ROW EXECUTE FUNCTION public.set_tg_cap_nhat();

DROP TRIGGER IF EXISTS trg_kd_don_hang_chi_tiet_updated ON public.kd_don_hang_chi_tiet;
CREATE TRIGGER trg_kd_don_hang_chi_tiet_updated
  BEFORE UPDATE ON public.kd_don_hang_chi_tiet
  FOR EACH ROW EXECUTE FUNCTION public.set_tg_cap_nhat();

-- Mã đơn: DH-YYYYMMDD-###
CREATE OR REPLACE FUNCTION public.kd_generate_ma_don_hang(p_ngay_dat DATE) RETURNS text AS $$
DECLARE
  v_prefix text;
  v_seq    int;
BEGIN
  v_prefix := 'DH-' || to_char(p_ngay_dat, 'YYYYMMDD') || '-';
  SELECT COALESCE(max(
    NULLIF(regexp_replace(ma_don_hang, '^' || v_prefix, ''), '')::int
  ), 0) + 1 INTO v_seq
  FROM public.kd_don_hang
  WHERE ma_don_hang LIKE v_prefix || '%';
  RETURN v_prefix || lpad(v_seq::text, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Upsert đơn + thay toàn bộ dòng (transaction)
CREATE OR REPLACE FUNCTION public.kd_upsert_don_hang(
  p_header jsonb,
  p_lines  jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_id           bigint;
  v_ma           text;
  v_ngay         date;
  v_line         jsonb;
  v_i            int := 0;
BEGIN
  IF p_lines IS NULL OR jsonb_array_length(p_lines) < 1 THEN
    RAISE EXCEPTION 'kd_upsert_don_hang: cần ít nhất một dòng sản phẩm';
  END IF;

  v_id := NULLIF(trim(p_header->>'id'), '')::bigint;
  v_ngay := COALESCE((p_header->>'ngay_dat')::date, CURRENT_DATE);
  v_ma := NULLIF(trim(p_header->>'ma_don_hang'), '');
  IF v_ma IS NULL OR v_ma = '' THEN
    v_ma := public.kd_generate_ma_don_hang(v_ngay);
  END IF;

  IF v_id IS NULL THEN
    INSERT INTO public.kd_don_hang (
      ma_don_hang, khach_hang_id, chi_nhanh_id, nhan_vien_id,
      ngay_dat, ngay_giao_du_kien, dia_chi_giao, ghi_chu, trang_thai
    ) VALUES (
      v_ma,
      (p_header->>'khach_hang_id')::bigint,
      NULLIF(trim(p_header->>'chi_nhanh_id'), '')::bigint,
      NULLIF(trim(p_header->>'nhan_vien_id'), '')::bigint,
      v_ngay,
      NULLIF(trim(p_header->>'ngay_giao_du_kien'), '')::date,
      NULLIF(trim(p_header->>'dia_chi_giao'), ''),
      NULLIF(trim(p_header->>'ghi_chu'), ''),
      COALESCE(NULLIF(trim(p_header->>'trang_thai'), ''), 'Nháp')
    )
    RETURNING id INTO v_id;
  ELSE
    UPDATE public.kd_don_hang SET
      ma_don_hang = CASE
        WHEN trang_thai = 'Nháp' THEN v_ma
        ELSE ma_don_hang
      END,
      khach_hang_id = (p_header->>'khach_hang_id')::bigint,
      chi_nhanh_id = NULLIF(trim(p_header->>'chi_nhanh_id'), '')::bigint,
      nhan_vien_id = NULLIF(trim(p_header->>'nhan_vien_id'), '')::bigint,
      ngay_dat = v_ngay,
      ngay_giao_du_kien = NULLIF(trim(p_header->>'ngay_giao_du_kien'), '')::date,
      dia_chi_giao = NULLIF(trim(p_header->>'dia_chi_giao'), ''),
      ghi_chu = NULLIF(trim(p_header->>'ghi_chu'), ''),
      trang_thai = COALESCE(NULLIF(trim(p_header->>'trang_thai'), ''), trang_thai),
      tg_cap_nhat = now()
    WHERE id = v_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'kd_upsert_don_hang: đơn % không tồn tại', v_id;
    END IF;
    DELETE FROM public.kd_don_hang_chi_tiet WHERE don_hang_id = v_id;
  END IF;

  FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines)
  LOOP
    v_i := v_i + 1;
    INSERT INTO public.kd_don_hang_chi_tiet (
      don_hang_id, san_pham_id, so_luong, don_vi_tinh, don_gia, ghi_chu, thu_tu
    ) VALUES (
      v_id,
      (v_line->>'san_pham_id')::bigint,
      (v_line->>'so_luong')::numeric,
      COALESCE(NULLIF(trim(v_line->>'don_vi_tinh'), ''), 'cái'),
      COALESCE((v_line->>'don_gia')::numeric, 0),
      NULLIF(trim(v_line->>'ghi_chu'), ''),
      COALESCE((v_line->>'thu_tu')::int, v_i)
    );
  END LOOP;

  PERFORM public.kd_don_hang_recalc_tong_tien(v_id);

  RETURN jsonb_build_object('id', v_id, 'ma_don_hang', (
    SELECT ma_don_hang FROM public.kd_don_hang WHERE id = v_id
  ));
END;
$$;

GRANT EXECUTE ON FUNCTION public.kd_upsert_don_hang(jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.kd_generate_ma_don_hang(date) TO authenticated;

ALTER TABLE public.kd_don_hang ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kd_don_hang_chi_tiet ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS kd_don_hang_select ON public.kd_don_hang;
CREATE POLICY kd_don_hang_select ON public.kd_don_hang
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS kd_don_hang_modify ON public.kd_don_hang;
CREATE POLICY kd_don_hang_modify ON public.kd_don_hang
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS kd_don_hang_chi_tiet_select ON public.kd_don_hang_chi_tiet;
CREATE POLICY kd_don_hang_chi_tiet_select ON public.kd_don_hang_chi_tiet
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS kd_don_hang_chi_tiet_modify ON public.kd_don_hang_chi_tiet;
CREATE POLICY kd_don_hang_chi_tiet_modify ON public.kd_don_hang_chi_tiet
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

COMMENT ON TABLE public.kd_don_hang IS 'Đơn hàng bán';
COMMENT ON TABLE public.kd_don_hang_chi_tiet IS 'Chi tiết đơn hàng bán';
