-- Đơn mua nguyên liệu — kd_don_mua + kd_don_mua_chi_tiet
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.kd_don_mua (
  id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ma_don_mua          TEXT NOT NULL,
  nha_cung_cap_id     BIGINT NOT NULL REFERENCES public.kd_danh_sach_doi_tac (id) ON DELETE RESTRICT,
  chi_nhanh_id        BIGINT REFERENCES public.var_chi_nhanh (id) ON DELETE SET NULL,
  nhan_vien_id        BIGINT REFERENCES public.var_nhan_vien (id) ON DELETE SET NULL,
  ngay_dat            DATE NOT NULL DEFAULT CURRENT_DATE,
  ngay_giao_du_kien   DATE,
  dia_chi_nhan        TEXT,
  ghi_chu             TEXT,
  trang_thai          TEXT NOT NULL DEFAULT 'Nháp'
                      CHECK (trang_thai IN ('Nháp', 'Đã đặt', 'Đang giao', 'Đã nhận', 'Hủy')),
  tong_tien           NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (tong_tien >= 0),
  tg_tao              TIMESTAMPTZ NOT NULL DEFAULT now(),
  tg_cap_nhat         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_kd_don_mua_ma_lower
  ON public.kd_don_mua (lower(trim(ma_don_mua)));

CREATE INDEX IF NOT EXISTS idx_kd_don_mua_ncc ON public.kd_don_mua (nha_cung_cap_id);
CREATE INDEX IF NOT EXISTS idx_kd_don_mua_ngay_dat ON public.kd_don_mua (ngay_dat);
CREATE INDEX IF NOT EXISTS idx_kd_don_mua_trang_thai ON public.kd_don_mua (trang_thai);
CREATE INDEX IF NOT EXISTS idx_kd_don_mua_tg_cap_nhat ON public.kd_don_mua (tg_cap_nhat DESC);

CREATE TABLE IF NOT EXISTS public.kd_don_mua_chi_tiet (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  don_mua_id      BIGINT NOT NULL REFERENCES public.kd_don_mua (id) ON DELETE CASCADE,
  nguyen_lieu_id  BIGINT NOT NULL REFERENCES public.sx_danh_sach_nguyen_lieu (id) ON DELETE RESTRICT,
  so_luong        NUMERIC NOT NULL CHECK (so_luong > 0),
  don_vi_tinh     TEXT NOT NULL DEFAULT 'm',
  don_gia         NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (don_gia >= 0),
  thanh_tien      NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (thanh_tien >= 0),
  ghi_chu         TEXT,
  thu_tu          INTEGER NOT NULL DEFAULT 0,
  tg_tao          TIMESTAMPTZ NOT NULL DEFAULT now(),
  tg_cap_nhat     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kd_dm_ct_don_mua ON public.kd_don_mua_chi_tiet (don_mua_id);
CREATE INDEX IF NOT EXISTS idx_kd_dm_ct_nguyen_lieu ON public.kd_don_mua_chi_tiet (nguyen_lieu_id);

-- NCC phải loại nha_cung_cap + đang hoạt động
CREATE OR REPLACE FUNCTION public.kd_don_mua_assert_nha_cung_cap() RETURNS trigger AS $$
DECLARE
  v_loai text;
  v_tt   text;
BEGIN
  SELECT dt.loai_doi_tac, dt.trang_thai INTO v_loai, v_tt
  FROM public.kd_danh_sach_doi_tac dt
  WHERE dt.id = NEW.nha_cung_cap_id;
  IF v_loai IS NULL THEN
    RAISE EXCEPTION 'kd_don_mua: nha_cung_cap_id % không tồn tại', NEW.nha_cung_cap_id;
  END IF;
  IF v_loai <> 'nha_cung_cap' THEN
    RAISE EXCEPTION 'kd_don_mua: chỉ được chọn đối tác loại nhà cung cấp';
  END IF;
  IF v_tt <> 'Đang hoạt động' THEN
    RAISE EXCEPTION 'kd_don_mua: nhà cung cấp không ở trạng thái Đang hoạt động';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_kd_don_mua_ncc ON public.kd_don_mua;
CREATE TRIGGER trg_kd_don_mua_ncc
  BEFORE INSERT OR UPDATE OF nha_cung_cap_id ON public.kd_don_mua
  FOR EACH ROW EXECUTE FUNCTION public.kd_don_mua_assert_nha_cung_cap();

-- Nguyên liệu đang hoạt động
CREATE OR REPLACE FUNCTION public.kd_don_mua_chi_tiet_assert_nguyen_lieu() RETURNS trigger AS $$
DECLARE
  v_tt text;
BEGIN
  SELECT nl.trang_thai INTO v_tt
  FROM public.sx_danh_sach_nguyen_lieu nl
  WHERE nl.id = NEW.nguyen_lieu_id;
  IF v_tt IS NULL THEN
    RAISE EXCEPTION 'kd_don_mua_chi_tiet: nguyen_lieu_id % không tồn tại', NEW.nguyen_lieu_id;
  END IF;
  IF v_tt <> 'Đang hoạt động' THEN
    RAISE EXCEPTION 'kd_don_mua_chi_tiet: nguyên liệu không ở trạng thái Đang hoạt động';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.kd_don_mua_chi_tiet_calc_thanh_tien() RETURNS trigger AS $$
BEGIN
  NEW.thanh_tien := round(NEW.so_luong * NEW.don_gia, 2);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_kd_dm_ct_nguyen_lieu ON public.kd_don_mua_chi_tiet;
CREATE TRIGGER trg_kd_dm_ct_nguyen_lieu
  BEFORE INSERT OR UPDATE OF nguyen_lieu_id ON public.kd_don_mua_chi_tiet
  FOR EACH ROW EXECUTE FUNCTION public.kd_don_mua_chi_tiet_assert_nguyen_lieu();

DROP TRIGGER IF EXISTS trg_kd_dm_ct_thanh_tien ON public.kd_don_mua_chi_tiet;
CREATE TRIGGER trg_kd_dm_ct_thanh_tien
  BEFORE INSERT OR UPDATE OF so_luong, don_gia ON public.kd_don_mua_chi_tiet
  FOR EACH ROW EXECUTE FUNCTION public.kd_don_mua_chi_tiet_calc_thanh_tien();

CREATE OR REPLACE FUNCTION public.kd_don_mua_recalc_tong_tien(p_don_mua_id BIGINT) RETURNS void AS $$
BEGIN
  UPDATE public.kd_don_mua dm
  SET tong_tien = COALESCE((
    SELECT SUM(ct.thanh_tien)
    FROM public.kd_don_mua_chi_tiet ct
    WHERE ct.don_mua_id = p_don_mua_id
  ), 0),
  tg_cap_nhat = now()
  WHERE dm.id = p_don_mua_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.kd_don_mua_chi_tiet_after_change() RETURNS trigger AS $$
DECLARE
  v_id bigint;
BEGIN
  v_id := COALESCE(NEW.don_mua_id, OLD.don_mua_id);
  PERFORM public.kd_don_mua_recalc_tong_tien(v_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_kd_dm_ct_recalc ON public.kd_don_mua_chi_tiet;
CREATE TRIGGER trg_kd_dm_ct_recalc
  AFTER INSERT OR UPDATE OR DELETE ON public.kd_don_mua_chi_tiet
  FOR EACH ROW EXECUTE FUNCTION public.kd_don_mua_chi_tiet_after_change();

DROP TRIGGER IF EXISTS trg_kd_don_mua_updated ON public.kd_don_mua;
CREATE TRIGGER trg_kd_don_mua_updated
  BEFORE UPDATE ON public.kd_don_mua
  FOR EACH ROW EXECUTE FUNCTION public.set_tg_cap_nhat();

DROP TRIGGER IF EXISTS trg_kd_don_mua_chi_tiet_updated ON public.kd_don_mua_chi_tiet;
CREATE TRIGGER trg_kd_don_mua_chi_tiet_updated
  BEFORE UPDATE ON public.kd_don_mua_chi_tiet
  FOR EACH ROW EXECUTE FUNCTION public.set_tg_cap_nhat();

-- Mã đơn: DM-YYYYMMDD-###
CREATE OR REPLACE FUNCTION public.kd_generate_ma_don_mua(p_ngay_dat DATE) RETURNS text AS $$
DECLARE
  v_prefix text;
  v_seq    int;
BEGIN
  v_prefix := 'DM-' || to_char(p_ngay_dat, 'YYYYMMDD') || '-';
  SELECT COALESCE(max(
    NULLIF(regexp_replace(ma_don_mua, '^' || v_prefix, ''), '')::int
  ), 0) + 1 INTO v_seq
  FROM public.kd_don_mua
  WHERE ma_don_mua LIKE v_prefix || '%';
  RETURN v_prefix || lpad(v_seq::text, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Upsert đơn mua + thay toàn bộ dòng (transaction)
CREATE OR REPLACE FUNCTION public.kd_upsert_don_mua(
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
    RAISE EXCEPTION 'kd_upsert_don_mua: cần ít nhất một dòng nguyên liệu';
  END IF;

  v_id := NULLIF(trim(p_header->>'id'), '')::bigint;
  v_ngay := COALESCE((p_header->>'ngay_dat')::date, CURRENT_DATE);
  v_ma := NULLIF(trim(p_header->>'ma_don_mua'), '');
  IF v_ma IS NULL OR v_ma = '' THEN
    v_ma := public.kd_generate_ma_don_mua(v_ngay);
  END IF;

  IF v_id IS NULL THEN
    INSERT INTO public.kd_don_mua (
      ma_don_mua, nha_cung_cap_id, chi_nhanh_id, nhan_vien_id,
      ngay_dat, ngay_giao_du_kien, dia_chi_nhan, ghi_chu, trang_thai
    ) VALUES (
      v_ma,
      (p_header->>'nha_cung_cap_id')::bigint,
      NULLIF(trim(p_header->>'chi_nhanh_id'), '')::bigint,
      NULLIF(trim(p_header->>'nhan_vien_id'), '')::bigint,
      v_ngay,
      NULLIF(trim(p_header->>'ngay_giao_du_kien'), '')::date,
      NULLIF(trim(p_header->>'dia_chi_nhan'), ''),
      NULLIF(trim(p_header->>'ghi_chu'), ''),
      COALESCE(NULLIF(trim(p_header->>'trang_thai'), ''), 'Nháp')
    )
    RETURNING id INTO v_id;
  ELSE
    UPDATE public.kd_don_mua SET
      ma_don_mua = CASE
        WHEN trang_thai = 'Nháp' THEN v_ma
        ELSE ma_don_mua
      END,
      nha_cung_cap_id = (p_header->>'nha_cung_cap_id')::bigint,
      chi_nhanh_id = NULLIF(trim(p_header->>'chi_nhanh_id'), '')::bigint,
      nhan_vien_id = NULLIF(trim(p_header->>'nhan_vien_id'), '')::bigint,
      ngay_dat = v_ngay,
      ngay_giao_du_kien = NULLIF(trim(p_header->>'ngay_giao_du_kien'), '')::date,
      dia_chi_nhan = NULLIF(trim(p_header->>'dia_chi_nhan'), ''),
      ghi_chu = NULLIF(trim(p_header->>'ghi_chu'), ''),
      trang_thai = COALESCE(NULLIF(trim(p_header->>'trang_thai'), ''), trang_thai),
      tg_cap_nhat = now()
    WHERE id = v_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'kd_upsert_don_mua: đơn % không tồn tại', v_id;
    END IF;
    DELETE FROM public.kd_don_mua_chi_tiet WHERE don_mua_id = v_id;
  END IF;

  FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines)
  LOOP
    v_i := v_i + 1;
    INSERT INTO public.kd_don_mua_chi_tiet (
      don_mua_id, nguyen_lieu_id, so_luong, don_vi_tinh, don_gia, ghi_chu, thu_tu
    ) VALUES (
      v_id,
      (v_line->>'nguyen_lieu_id')::bigint,
      (v_line->>'so_luong')::numeric,
      COALESCE(NULLIF(trim(v_line->>'don_vi_tinh'), ''), 'm'),
      COALESCE((v_line->>'don_gia')::numeric, 0),
      NULLIF(trim(v_line->>'ghi_chu'), ''),
      COALESCE((v_line->>'thu_tu')::int, v_i)
    );
  END LOOP;

  PERFORM public.kd_don_mua_recalc_tong_tien(v_id);

  RETURN jsonb_build_object('id', v_id, 'ma_don_mua', (
    SELECT ma_don_mua FROM public.kd_don_mua WHERE id = v_id
  ));
END;
$$;

GRANT EXECUTE ON FUNCTION public.kd_upsert_don_mua(jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.kd_generate_ma_don_mua(date) TO authenticated;

ALTER TABLE public.kd_don_mua ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kd_don_mua_chi_tiet ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS kd_don_mua_select ON public.kd_don_mua;
CREATE POLICY kd_don_mua_select ON public.kd_don_mua
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS kd_don_mua_modify ON public.kd_don_mua;
CREATE POLICY kd_don_mua_modify ON public.kd_don_mua
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS kd_don_mua_chi_tiet_select ON public.kd_don_mua_chi_tiet;
CREATE POLICY kd_don_mua_chi_tiet_select ON public.kd_don_mua_chi_tiet
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS kd_don_mua_chi_tiet_modify ON public.kd_don_mua_chi_tiet;
CREATE POLICY kd_don_mua_chi_tiet_modify ON public.kd_don_mua_chi_tiet
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

COMMENT ON TABLE public.kd_don_mua IS 'Đơn mua nguyên liệu';
COMMENT ON TABLE public.kd_don_mua_chi_tiet IS 'Chi tiết đơn mua nguyên liệu';
