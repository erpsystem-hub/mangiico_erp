-- RPC thống kê nhân viên có filter (date range, phòng ban, trạng thái).
-- Aggregate trên DB — không tải full table; scale tới hàng chục nghìn rows.

CREATE INDEX IF NOT EXISTS idx_var_nhan_vien_tg_tao
  ON public.var_nhan_vien (tg_tao);

CREATE OR REPLACE FUNCTION public.get_nhan_vien_stats(
  p_as_at          timestamptz,
  p_range_start    timestamptz,
  p_range_end      timestamptz,
  p_id_phong_ban   bigint[] DEFAULT NULL,
  p_trang_thai     text[] DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
AS $$
DECLARE
  v_as_at_yoy timestamptz := p_as_at - interval '1 year';
  v_this_month text := to_char(p_as_at AT TIME ZONE 'UTC', 'YYYY-MM');
  v_prev_month text := to_char((date_trunc('month', p_as_at AT TIME ZONE 'UTC') - interval '1 month'), 'YYYY-MM');
  v_result jsonb;
BEGIN
  WITH
  base AS (
    SELECT id, id_phong_ban, id_chuc_vu, trang_thai, tg_tao
    FROM public.var_nhan_vien nv
    WHERE (p_id_phong_ban IS NULL OR cardinality(p_id_phong_ban) = 0 OR nv.id_phong_ban = ANY(p_id_phong_ban))
      AND (p_trang_thai IS NULL OR cardinality(p_trang_thai) = 0 OR nv.trang_thai = ANY(p_trang_thai))
  ),
  filtered AS (
    SELECT * FROM base WHERE tg_tao <= p_as_at
  ),
  yoy_filtered AS (
    SELECT * FROM base WHERE tg_tao <= v_as_at_yoy
  ),
  summary AS (
    SELECT
      COUNT(*)::bigint AS tong,
      COUNT(*) FILTER (WHERE trang_thai = 'Hoạt động')::bigint AS hoat_dong,
      COUNT(*) FILTER (WHERE trang_thai = 'Khóa')::bigint AS khoa
    FROM filtered
  ),
  yoy AS (
    SELECT
      COUNT(*)::bigint AS tong,
      COUNT(*) FILTER (WHERE trang_thai = 'Hoạt động')::bigint AS hoat_dong
    FROM yoy_filtered
  ),
  new_in_period AS (
    SELECT COUNT(*)::bigint AS cnt
    FROM base
    WHERE tg_tao >= p_range_start AND tg_tao <= p_range_end
  ),
  delta AS (
    SELECT
      COUNT(*) FILTER (WHERE to_char(tg_tao AT TIME ZONE 'UTC', 'YYYY-MM') = v_this_month)::bigint AS new_this_month,
      COUNT(*) FILTER (WHERE to_char(tg_tao AT TIME ZONE 'UTC', 'YYYY-MM') = v_prev_month)::bigint AS new_prev_month
    FROM filtered
  ),
  by_phong_ban AS (
    SELECT
      id_phong_ban,
      COUNT(*)::bigint AS tong,
      COUNT(*) FILTER (WHERE trang_thai = 'Hoạt động')::bigint AS hoat_dong,
      COUNT(*) FILTER (WHERE trang_thai = 'Khóa')::bigint AS khoa
    FROM filtered
    GROUP BY id_phong_ban
  ),
  by_chuc_vu AS (
    SELECT
      id_chuc_vu,
      COUNT(*)::bigint AS so_nhan_vien
    FROM filtered
    WHERE id_chuc_vu IS NOT NULL
    GROUP BY id_chuc_vu
  ),
  month_series AS (
    SELECT to_char(
      (date_trunc('month', p_as_at AT TIME ZONE 'UTC') - (n || ' months')::interval),
      'YYYY-MM'
    ) AS thang
    FROM generate_series(11, 0, -1) AS n
  ),
  trend_12m AS (
    SELECT
      ms.thang,
      COUNT(b.id)::bigint AS so_luong
    FROM month_series ms
    LEFT JOIN base b
      ON to_char(b.tg_tao AT TIME ZONE 'UTC', 'YYYY-MM') = ms.thang
    GROUP BY ms.thang
    ORDER BY ms.thang
  )
  SELECT jsonb_build_object(
    'summary', (SELECT jsonb_build_object('tong', tong, 'hoat_dong', hoat_dong, 'khoa', khoa) FROM summary),
    'new_in_period', (SELECT cnt FROM new_in_period),
    'yoy', (SELECT jsonb_build_object('tong', tong, 'hoat_dong', hoat_dong) FROM yoy),
    'delta', (SELECT jsonb_build_object('new_this_month', new_this_month, 'new_prev_month', new_prev_month) FROM delta),
    'by_phong_ban', COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'id_phong_ban', id_phong_ban,
          'tong', tong,
          'hoat_dong', hoat_dong,
          'khoa', khoa
        ) ORDER BY tong DESC
      ) FROM by_phong_ban),
      '[]'::jsonb
    ),
    'by_chuc_vu', COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'id_chuc_vu', id_chuc_vu,
          'so_nhan_vien', so_nhan_vien
        ) ORDER BY so_nhan_vien DESC
      ) FROM by_chuc_vu),
      '[]'::jsonb
    ),
    'trend_12m', COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object('thang', thang, 'so_luong', so_luong) ORDER BY thang
      ) FROM trend_12m),
      '[]'::jsonb
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.get_nhan_vien_stats(
  timestamptz, timestamptz, timestamptz, bigint[], text[]
) IS
  'Thống kê nhân viên có filter — KPI, theo phòng ban/chức vụ, trend 12 tháng (JSONB aggregate).';

GRANT EXECUTE ON FUNCTION public.get_nhan_vien_stats(
  timestamptz, timestamptz, timestamptz, bigint[], text[]
) TO authenticated;
