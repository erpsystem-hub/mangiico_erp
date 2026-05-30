-- RPC thống kê nhân viên — tránh fetch full table cho tab Thống kê.

CREATE OR REPLACE FUNCTION public.get_nhan_vien_summary()
RETURNS TABLE (tong BIGINT, hoat_dong BIGINT, khoa BIGINT)
LANGUAGE SQL
STABLE
SECURITY INVOKER
AS $$
  SELECT
    COUNT(*)::BIGINT AS tong,
    COUNT(*) FILTER (WHERE trang_thai = 'Hoạt động')::BIGINT AS hoat_dong,
    COUNT(*) FILTER (WHERE trang_thai = 'Khóa')::BIGINT AS khoa
  FROM public.var_nhan_vien;
$$;

CREATE OR REPLACE FUNCTION public.get_nhan_vien_count_by_phong_ban()
RETURNS TABLE (id_phong_ban BIGINT, so_nhan_vien BIGINT)
LANGUAGE SQL
STABLE
SECURITY INVOKER
AS $$
  SELECT id_phong_ban, COUNT(*)::BIGINT AS so_nhan_vien
  FROM public.var_nhan_vien
  WHERE id_phong_ban IS NOT NULL
  GROUP BY id_phong_ban;
$$;

COMMENT ON FUNCTION public.get_nhan_vien_summary IS
  'KPI tab Thống kê nhân viên — tổng / hoạt động / khóa.';
COMMENT ON FUNCTION public.get_nhan_vien_count_by_phong_ban IS
  'Đếm nhân viên theo phòng ban — biểu đồ tab Thống kê.';

GRANT EXECUTE ON FUNCTION public.get_nhan_vien_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_nhan_vien_count_by_phong_ban() TO authenticated;
