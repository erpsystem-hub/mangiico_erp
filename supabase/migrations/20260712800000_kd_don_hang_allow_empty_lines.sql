-- Cho phép tạo/sửa đơn hàng không có dòng (thêm dòng sau từ drawer chi tiết)

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
  v_lines        jsonb;
BEGIN
  v_lines := COALESCE(p_lines, '[]'::jsonb);
  IF jsonb_typeof(v_lines) <> 'array' THEN
    RAISE EXCEPTION 'kd_upsert_don_hang: p_lines phải là mảng JSON';
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

  FOR v_line IN SELECT * FROM jsonb_array_elements(v_lines)
  LOOP
    v_i := v_i + 1;
    INSERT INTO public.kd_don_hang_chi_tiet (
      don_hang_id, danh_muc_id, so_luong, don_vi_tinh, don_gia, ghi_chu, thu_tu
    ) VALUES (
      v_id,
      (v_line->>'danh_muc_id')::bigint,
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
