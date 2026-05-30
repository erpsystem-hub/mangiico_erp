-- RPC phân trang + lọc server-side cho var_nhan_vien (Mangiico Hệ thống).
-- Port pattern từ archive get_bai_viet_page / get_cong_viec_page — KHÔNG chạy file archive.

CREATE OR REPLACE FUNCTION public.get_nhan_vien_page(
  p_search text DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0,
  p_trang_thai text[] DEFAULT NULL,
  p_id_phong_ban bigint[] DEFAULT NULL,
  p_id_chuc_vu bigint[] DEFAULT NULL,
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
  cap_quan_ly text,
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
    WHEN 'cap_quan_ly' THEN 'cap_quan_ly'
    ELSE 'ten_tai_khoan'
  END;
  v_dir := CASE WHEN coalesce(p_ascending, true) THEN 'ASC' ELSE 'DESC' END;

  RETURN QUERY EXECUTE format(
    $q$
    WITH base AS (
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
        cv.cap_quan_ly::text AS cap_quan_ly
      FROM public.var_nhan_vien nv
      LEFT JOIN public.var_phong_ban pb ON pb.id = nv.id_phong_ban
      LEFT JOIN public.var_phong_ban bp ON bp.id = nv.id_bo_phan
      LEFT JOIN public.var_chuc_vu cv ON cv.id = nv.id_chuc_vu
      WHERE ($1 IS NULL OR trim($1) = '' OR (
        nv.ten_tai_khoan ILIKE '%%' || $1 || '%%'
        OR nv.ho_va_ten ILIKE '%%' || $1 || '%%'
        OR pb.ten_phong_ban ILIKE '%%' || $1 || '%%'
        OR bp.ten_phong_ban ILIKE '%%' || $1 || '%%'
        OR cv.ten_chuc_vu ILIKE '%%' || $1 || '%%'
      ))
      AND ($2 IS NULL OR cardinality($2) = 0 OR nv.trang_thai = ANY ($2))
      AND ($3 IS NULL OR cardinality($3) = 0 OR nv.id_phong_ban = ANY ($3))
      AND ($4 IS NULL OR cardinality($4) = 0 OR nv.id_chuc_vu = ANY ($4))
    )
    SELECT
      b.*,
      COUNT(*) OVER()::bigint AS total_count
    FROM base b
    ORDER BY %I %s NULLS LAST, b.id ASC
    LIMIT greatest($5, 1)
    OFFSET greatest($6, 0)
    $q$,
    v_order_col,
    v_dir
  )
  USING p_search, p_trang_thai, p_id_phong_ban, p_id_chuc_vu, p_limit, p_offset;
END;
$$;

COMMENT ON FUNCTION public.get_nhan_vien_page(
  text, integer, integer, text[], bigint[], bigint[], text, boolean
) IS
  'Phân trang + search + filter server-side cho danh sách nhân viên (Mangiico Hệ thống).';

GRANT EXECUTE ON FUNCTION public.get_nhan_vien_page(
  text, integer, integer, text[], bigint[], bigint[], text, boolean
) TO authenticated;
