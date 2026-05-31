-- Giá trị thuộc tính / thông số đo theo dòng đơn hàng (kế thừa cấu hình danh mục SP)

CREATE TABLE IF NOT EXISTS public.kd_don_hang_chi_tiet_thuoc_tinh (
  id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  don_hang_chi_tiet_id  BIGINT NOT NULL REFERENCES public.kd_don_hang_chi_tiet (id) ON DELETE CASCADE,
  thuoc_tinh_id         BIGINT NOT NULL REFERENCES public.sx_thuoc_tinh_hang_hoa (id) ON DELETE RESTRICT,
  gia_tri               TEXT NOT NULL DEFAULT '',
  CONSTRAINT uq_kd_dh_ct_tt UNIQUE (don_hang_chi_tiet_id, thuoc_tinh_id)
);

CREATE INDEX IF NOT EXISTS idx_kd_dh_ct_tt_line ON public.kd_don_hang_chi_tiet_thuoc_tinh (don_hang_chi_tiet_id);

CREATE TABLE IF NOT EXISTS public.kd_don_hang_chi_tiet_thong_so_do (
  id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  don_hang_chi_tiet_id  BIGINT NOT NULL REFERENCES public.kd_don_hang_chi_tiet (id) ON DELETE CASCADE,
  thong_so_do_id        BIGINT NOT NULL REFERENCES public.sx_thong_so_do (id) ON DELETE RESTRICT,
  gia_tri               NUMERIC,
  CONSTRAINT uq_kd_dh_ct_tsd UNIQUE (don_hang_chi_tiet_id, thong_so_do_id)
);

CREATE INDEX IF NOT EXISTS idx_kd_dh_ct_tsd_line ON public.kd_don_hang_chi_tiet_thong_so_do (don_hang_chi_tiet_id);

-- Thuộc tính phải được gán cho danh mục của sản phẩm trên dòng đơn
CREATE OR REPLACE FUNCTION public.kd_don_hang_ct_tt_assert_in_category() RETURNS trigger AS $$
DECLARE
  v_sp_id bigint;
  v_dm_id bigint;
BEGIN
  SELECT ct.san_pham_id INTO v_sp_id
  FROM public.kd_don_hang_chi_tiet ct
  WHERE ct.id = NEW.don_hang_chi_tiet_id;
  IF v_sp_id IS NULL THEN
    RAISE EXCEPTION 'kd_don_hang_chi_tiet_thuoc_tinh: dòng đơn % không tồn tại', NEW.don_hang_chi_tiet_id;
  END IF;
  SELECT sp.danh_muc_id INTO v_dm_id FROM public.sx_danh_sach_san_pham sp WHERE sp.id = v_sp_id;
  IF NOT EXISTS (
    SELECT 1 FROM public.sx_danh_muc_thuoc_tinh j
    WHERE j.danh_muc_id = v_dm_id AND j.thuoc_tinh_id = NEW.thuoc_tinh_id
  ) THEN
    RAISE EXCEPTION 'kd_don_hang_chi_tiet_thuoc_tinh: thuộc tính không thuộc danh mục sản phẩm';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.kd_don_hang_ct_tsd_assert_in_category() RETURNS trigger AS $$
DECLARE
  v_sp_id bigint;
  v_dm_id bigint;
BEGIN
  SELECT ct.san_pham_id INTO v_sp_id
  FROM public.kd_don_hang_chi_tiet ct
  WHERE ct.id = NEW.don_hang_chi_tiet_id;
  IF v_sp_id IS NULL THEN
    RAISE EXCEPTION 'kd_don_hang_chi_tiet_thong_so_do: dòng đơn % không tồn tại', NEW.don_hang_chi_tiet_id;
  END IF;
  SELECT sp.danh_muc_id INTO v_dm_id FROM public.sx_danh_sach_san_pham sp WHERE sp.id = v_sp_id;
  IF NOT EXISTS (
    SELECT 1 FROM public.sx_danh_muc_thong_so_do j
    WHERE j.danh_muc_id = v_dm_id AND j.thong_so_do_id = NEW.thong_so_do_id
  ) THEN
    RAISE EXCEPTION 'kd_don_hang_chi_tiet_thong_so_do: thông số đo không thuộc danh mục sản phẩm';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_kd_dh_ct_tt_in_category ON public.kd_don_hang_chi_tiet_thuoc_tinh;
CREATE TRIGGER trg_kd_dh_ct_tt_in_category
  BEFORE INSERT OR UPDATE ON public.kd_don_hang_chi_tiet_thuoc_tinh
  FOR EACH ROW EXECUTE FUNCTION public.kd_don_hang_ct_tt_assert_in_category();

DROP TRIGGER IF EXISTS trg_kd_dh_ct_tsd_in_category ON public.kd_don_hang_chi_tiet_thong_so_do;
CREATE TRIGGER trg_kd_dh_ct_tsd_in_category
  BEFORE INSERT OR UPDATE ON public.kd_don_hang_chi_tiet_thong_so_do
  FOR EACH ROW EXECUTE FUNCTION public.kd_don_hang_ct_tsd_assert_in_category();

ALTER TABLE public.kd_don_hang_chi_tiet_thuoc_tinh ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kd_don_hang_chi_tiet_thong_so_do ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS kd_don_hang_chi_tiet_thuoc_tinh_select ON public.kd_don_hang_chi_tiet_thuoc_tinh;
CREATE POLICY kd_don_hang_chi_tiet_thuoc_tinh_select ON public.kd_don_hang_chi_tiet_thuoc_tinh
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS kd_don_hang_chi_tiet_thuoc_tinh_modify ON public.kd_don_hang_chi_tiet_thuoc_tinh;
CREATE POLICY kd_don_hang_chi_tiet_thuoc_tinh_modify ON public.kd_don_hang_chi_tiet_thuoc_tinh
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS kd_don_hang_chi_tiet_thong_so_do_select ON public.kd_don_hang_chi_tiet_thong_so_do;
CREATE POLICY kd_don_hang_chi_tiet_thong_so_do_select ON public.kd_don_hang_chi_tiet_thong_so_do
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS kd_don_hang_chi_tiet_thong_so_do_modify ON public.kd_don_hang_chi_tiet_thong_so_do;
CREATE POLICY kd_don_hang_chi_tiet_thong_so_do_modify ON public.kd_don_hang_chi_tiet_thong_so_do
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

COMMENT ON TABLE public.kd_don_hang_chi_tiet_thuoc_tinh IS 'Giá trị thuộc tính theo dòng đơn hàng';
COMMENT ON TABLE public.kd_don_hang_chi_tiet_thong_so_do IS 'Giá trị thông số đo theo dòng đơn hàng';

-- Cập nhật RPC upsert: lưu thuộc tính / thông số đo kèm mỗi dòng
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
  v_line_id      bigint;
  v_attr         jsonb;
  v_spec         jsonb;
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
    )
    RETURNING id INTO v_line_id;

    IF v_line ? 'thuoc_tinh_values' AND jsonb_typeof(v_line->'thuoc_tinh_values') = 'array' THEN
      FOR v_attr IN SELECT * FROM jsonb_array_elements(v_line->'thuoc_tinh_values')
      LOOP
        IF NULLIF(trim(v_attr->>'thuoc_tinh_id'), '') IS NULL THEN
          CONTINUE;
        END IF;
        INSERT INTO public.kd_don_hang_chi_tiet_thuoc_tinh (
          don_hang_chi_tiet_id, thuoc_tinh_id, gia_tri
        ) VALUES (
          v_line_id,
          (v_attr->>'thuoc_tinh_id')::bigint,
          COALESCE(trim(v_attr->>'gia_tri'), '')
        );
      END LOOP;
    END IF;

    IF v_line ? 'thong_so_do_values' AND jsonb_typeof(v_line->'thong_so_do_values') = 'array' THEN
      FOR v_spec IN SELECT * FROM jsonb_array_elements(v_line->'thong_so_do_values')
      LOOP
        IF NULLIF(trim(v_spec->>'thong_so_do_id'), '') IS NULL THEN
          CONTINUE;
        END IF;
        INSERT INTO public.kd_don_hang_chi_tiet_thong_so_do (
          don_hang_chi_tiet_id, thong_so_do_id, gia_tri
        ) VALUES (
          v_line_id,
          (v_spec->>'thong_so_do_id')::bigint,
          NULLIF(trim(v_spec->>'gia_tri'), '')::numeric
        );
      END LOOP;
    END IF;
  END LOOP;

  PERFORM public.kd_don_hang_recalc_tong_tien(v_id);

  RETURN jsonb_build_object('id', v_id, 'ma_don_hang', (
    SELECT ma_don_hang FROM public.kd_don_hang WHERE id = v_id
  ));
END;
$$;
