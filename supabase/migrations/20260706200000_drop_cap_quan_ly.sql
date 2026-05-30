-- Bỏ cột `cap_quan_ly` khỏi `var_chuc_vu` và cập nhật RPC danh sách nhân viên (overload có chi nhánh).

DROP INDEX IF EXISTS public.idx_var_chuc_vu_cap_quan_ly;

ALTER TABLE public.var_chuc_vu
  DROP COLUMN IF EXISTS cap_quan_ly;

-- Phải DROP trước — Postgres không cho CREATE OR REPLACE khi đổi RETURNS TABLE.
DROP FUNCTION IF EXISTS public.get_nhan_vien_page(
  text, integer, integer, text[], bigint[], bigint[], bigint[], text, boolean
);
DROP FUNCTION IF EXISTS public.get_nhan_vien_page(
  text, integer, integer, text[], bigint[], bigint[], text, boolean
);

CREATE FUNCTION public.get_nhan_vien_page(
  p_search text DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0,
  p_trang_thai text[] DEFAULT NULL,
  p_id_phong_ban bigint[] DEFAULT NULL,
  p_id_chuc_vu bigint[] DEFAULT NULL,
  p_id_chi_nhanh bigint[] DEFAULT NULL,
  p_order_by text DEFAULT 'ten_tai_khoan',
  p_ascending boolean DEFAULT true
)
RETURNS TABLE (
  id bigint,
  ten_tai_khoan text,
  ho_va_ten text,
  id_phong_ban bigint,
  id_bo_phan bigint,
  id_chuc_vu bigint,
  trang_thai text,
  tg_tao timestamptz,
  tg_cap_nhat timestamptz,
  ten_phong_ban text,
  ten_bo_phan text,
  ten_chuc_vu text,
  ten_chi_nhanh text,
  total_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
AS $$
DECLARE
  v_order_col text;
  v_dir text;
BEGIN
  v_order_col := CASE lower(trim(coalesce(p_order_by, '')))
    WHEN 'ho_va_ten' THEN 'ho_va_ten'
    WHEN 'trang_thai' THEN 'trang_thai'
    WHEN 'tg_cap_nhat' THEN 'tg_cap_nhat'
    WHEN 'tg_tao' THEN 'tg_tao'
    WHEN 'ten_phong_ban' THEN 'ten_phong_ban'
    WHEN 'ten_chuc_vu' THEN 'ten_chuc_vu'
    WHEN 'ten_chi_nhanh' THEN 'ten_chi_nhanh'
    ELSE 'ten_tai_khoan'
  END;
  v_dir := CASE WHEN coalesce(p_ascending, true) THEN 'ASC' ELSE 'DESC' END;

  RETURN QUERY EXECUTE format(
    $q$
    WITH branch_agg AS (
      SELECT
        nvcn.nhan_vien_id,
        string_agg(cn.ten_chi_nhanh, ', ' ORDER BY cn.thu_tu, cn.ten_chi_nhanh) AS ten_chi_nhanh
      FROM public.var_nhan_vien_chi_nhanh nvcn
      JOIN public.var_chi_nhanh cn ON cn.id = nvcn.chi_nhanh_id
      GROUP BY nvcn.nhan_vien_id
    ),
    base AS (
      SELECT
        nv.id,
        nv.ten_tai_khoan,
        nv.ho_va_ten,
        nv.id_phong_ban,
        nv.id_bo_phan,
        nv.id_chuc_vu,
        nv.trang_thai,
        nv.tg_tao,
        nv.tg_cap_nhat,
        pb.ten_phong_ban,
        bp.ten_phong_ban AS ten_bo_phan,
        cv.ten_chuc_vu,
        ba.ten_chi_nhanh
      FROM public.var_nhan_vien nv
      LEFT JOIN public.var_phong_ban pb ON pb.id = nv.id_phong_ban
      LEFT JOIN public.var_phong_ban bp ON bp.id = nv.id_bo_phan
      LEFT JOIN public.var_chuc_vu cv ON cv.id = nv.id_chuc_vu
      LEFT JOIN branch_agg ba ON ba.nhan_vien_id = nv.id
      WHERE ($1 IS NULL OR trim($1) = '' OR (
        nv.ten_tai_khoan ILIKE '%%' || $1 || '%%'
        OR nv.ho_va_ten ILIKE '%%' || $1 || '%%'
        OR pb.ten_phong_ban ILIKE '%%' || $1 || '%%'
        OR bp.ten_phong_ban ILIKE '%%' || $1 || '%%'
        OR cv.ten_chuc_vu ILIKE '%%' || $1 || '%%'
        OR ba.ten_chi_nhanh ILIKE '%%' || $1 || '%%'
      ))
      AND ($2 IS NULL OR cardinality($2) = 0 OR nv.trang_thai = ANY ($2))
      AND ($3 IS NULL OR cardinality($3) = 0 OR nv.id_phong_ban = ANY ($3))
      AND ($4 IS NULL OR cardinality($4) = 0 OR nv.id_chuc_vu = ANY ($4))
      AND (
        $5 IS NULL OR cardinality($5) = 0 OR EXISTS (
          SELECT 1 FROM public.var_nhan_vien_chi_nhanh nvcn_f
          WHERE nvcn_f.nhan_vien_id = nv.id
            AND nvcn_f.chi_nhanh_id = ANY ($5)
        )
      )
    )
    SELECT
      b.*,
      COUNT(*) OVER()::bigint AS total_count
    FROM base b
    ORDER BY %I %s NULLS LAST, b.id ASC
    LIMIT greatest($6, 1)
    OFFSET greatest($7, 0)
    $q$,
    v_order_col,
    v_dir
  )
  USING p_search, p_trang_thai, p_id_phong_ban, p_id_chuc_vu, p_id_chi_nhanh, p_limit, p_offset;
END;
$$;

COMMENT ON FUNCTION public.get_nhan_vien_page(
  text, integer, integer, text[], bigint[], bigint[], bigint[], text, boolean
) IS
  'Phân trang + search + filter server-side cho danh sách nhân viên (Mangiico Hệ thống).';

GRANT EXECUTE ON FUNCTION public.get_nhan_vien_page(
  text, integer, integer, text[], bigint[], bigint[], bigint[], text, boolean
) TO authenticated;
