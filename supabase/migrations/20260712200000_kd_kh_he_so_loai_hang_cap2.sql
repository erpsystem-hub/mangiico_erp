-- Ma trận hệ số: cột = loại hàng (danh mục HH cap_do=2), không phải nhóm cap_do=1
DELETE FROM public.kd_kh_he_so_gia_nhom_sp h
WHERE NOT EXISTS (
  SELECT 1 FROM public.sx_danh_muc_hang_hoa dm
  WHERE dm.id = h.nhom_san_pham_id AND dm.cap_do = 2
);

CREATE OR REPLACE FUNCTION public.kd_kh_he_so_assert_loai_hang_cap2() RETURNS trigger AS $$
DECLARE
  v_cap int;
BEGIN
  SELECT dm.cap_do INTO v_cap
  FROM public.sx_danh_muc_hang_hoa dm
  WHERE dm.id = NEW.nhom_san_pham_id;
  IF v_cap IS NULL THEN
    RAISE EXCEPTION 'kd_kh_he_so_gia: nhom_san_pham_id % không tồn tại', NEW.nhom_san_pham_id;
  END IF;
  IF v_cap <> 2 THEN
    RAISE EXCEPTION 'kd_kh_he_so_gia: chỉ loại hàng danh mục cấp 2 (cap_do=2)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_kd_kh_he_so_nhom_cap1 ON public.kd_kh_he_so_gia_nhom_sp;
DROP TRIGGER IF EXISTS trg_kd_kh_he_so_loai_hang_cap2 ON public.kd_kh_he_so_gia_nhom_sp;
CREATE TRIGGER trg_kd_kh_he_so_loai_hang_cap2
  BEFORE INSERT OR UPDATE OF nhom_san_pham_id ON public.kd_kh_he_so_gia_nhom_sp
  FOR EACH ROW EXECUTE FUNCTION public.kd_kh_he_so_assert_loai_hang_cap2();

DROP FUNCTION IF EXISTS public.kd_kh_he_so_assert_nhom_cap1();
