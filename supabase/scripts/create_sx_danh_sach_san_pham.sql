-- Tạo bảng danh sách hàng hóa + giá trị thuộc tính (chạy sau sx_danh_muc_hang_hoa, sx_thuoc_tinh, junction DM-TT)
-- Nội dung đồng bộ migration 20260711400000_sx_danh_sach_san_pham.sql

BEGIN;

-- Danh sách hàng hóa — sx_danh_sach_san_pham + giá trị thuộc tính
CREATE TABLE IF NOT EXISTS public.sx_danh_sach_san_pham (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ma_san_pham     TEXT NOT NULL,
  ten_san_pham    TEXT NOT NULL,
  danh_muc_id     BIGINT NOT NULL REFERENCES public.sx_danh_muc_hang_hoa (id) ON DELETE RESTRICT,
  mo_ta           TEXT,
  trang_thai      TEXT NOT NULL DEFAULT 'Đang hoạt động'
                  CHECK (trang_thai IN ('Đang hoạt động', 'Ngừng hoạt động')),
  tg_tao          TIMESTAMPTZ NOT NULL DEFAULT now(),
  tg_cap_nhat     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_sx_danh_sach_san_pham_ma_lower
  ON public.sx_danh_sach_san_pham (lower(trim(ma_san_pham)));

CREATE INDEX IF NOT EXISTS idx_sx_danh_sach_sp_danh_muc ON public.sx_danh_sach_san_pham (danh_muc_id);
CREATE INDEX IF NOT EXISTS idx_sx_danh_sach_sp_trang_thai ON public.sx_danh_sach_san_pham (trang_thai);

CREATE TABLE IF NOT EXISTS public.sx_san_pham_thuoc_tinh (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  san_pham_id     BIGINT NOT NULL REFERENCES public.sx_danh_sach_san_pham (id) ON DELETE CASCADE,
  thuoc_tinh_id   BIGINT NOT NULL REFERENCES public.sx_thuoc_tinh_hang_hoa (id) ON DELETE RESTRICT,
  gia_tri         TEXT NOT NULL DEFAULT '',
  tg_tao          TIMESTAMPTZ NOT NULL DEFAULT now(),
  tg_cap_nhat     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_sx_sp_tt UNIQUE (san_pham_id, thuoc_tinh_id)
);

CREATE INDEX IF NOT EXISTS idx_sx_sp_tt_san_pham ON public.sx_san_pham_thuoc_tinh (san_pham_id);

CREATE OR REPLACE FUNCTION public.sx_san_pham_assert_danh_muc_cap2() RETURNS trigger AS $$
DECLARE
  v_cap int;
BEGIN
  SELECT dm.cap_do INTO v_cap
  FROM public.sx_danh_muc_hang_hoa dm
  WHERE dm.id = NEW.danh_muc_id;
  IF v_cap IS NULL THEN
    RAISE EXCEPTION 'sx_danh_sach_san_pham: danh_muc_id % không tồn tại', NEW.danh_muc_id;
  END IF;
  IF v_cap <> 2 THEN
    RAISE EXCEPTION 'sx_danh_sach_san_pham: chỉ được chọn danh mục cấp 2';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sx_san_pham_danh_muc_cap2 ON public.sx_danh_sach_san_pham;
CREATE TRIGGER trg_sx_san_pham_danh_muc_cap2
  BEFORE INSERT OR UPDATE OF danh_muc_id ON public.sx_danh_sach_san_pham
  FOR EACH ROW EXECUTE FUNCTION public.sx_san_pham_assert_danh_muc_cap2();

CREATE OR REPLACE FUNCTION public.sx_san_pham_thuoc_tinh_assert_in_category() RETURNS trigger AS $$
DECLARE
  v_dm_id bigint;
BEGIN
  SELECT sp.danh_muc_id INTO v_dm_id
  FROM public.sx_danh_sach_san_pham sp
  WHERE sp.id = NEW.san_pham_id;
  IF v_dm_id IS NULL THEN
    RAISE EXCEPTION 'sx_san_pham_thuoc_tinh: san_pham_id % không tồn tại', NEW.san_pham_id;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.sx_danh_muc_thuoc_tinh j
    WHERE j.danh_muc_id = v_dm_id AND j.thuoc_tinh_id = NEW.thuoc_tinh_id
  ) THEN
    RAISE EXCEPTION 'sx_san_pham_thuoc_tinh: thuộc tính không được gán cho danh mục sản phẩm';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sx_sp_tt_in_category ON public.sx_san_pham_thuoc_tinh;
CREATE TRIGGER trg_sx_sp_tt_in_category
  BEFORE INSERT OR UPDATE ON public.sx_san_pham_thuoc_tinh
  FOR EACH ROW EXECUTE FUNCTION public.sx_san_pham_thuoc_tinh_assert_in_category();

DROP TRIGGER IF EXISTS trg_sx_danh_sach_san_pham_updated ON public.sx_danh_sach_san_pham;
CREATE TRIGGER trg_sx_danh_sach_san_pham_updated
  BEFORE UPDATE ON public.sx_danh_sach_san_pham
  FOR EACH ROW EXECUTE FUNCTION public.set_tg_cap_nhat();

DROP TRIGGER IF EXISTS trg_sx_san_pham_thuoc_tinh_updated ON public.sx_san_pham_thuoc_tinh;
CREATE TRIGGER trg_sx_san_pham_thuoc_tinh_updated
  BEFORE UPDATE ON public.sx_san_pham_thuoc_tinh
  FOR EACH ROW EXECUTE FUNCTION public.set_tg_cap_nhat();

ALTER TABLE public.sx_danh_sach_san_pham ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sx_san_pham_thuoc_tinh ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sx_danh_sach_san_pham_select ON public.sx_danh_sach_san_pham;
CREATE POLICY sx_danh_sach_san_pham_select ON public.sx_danh_sach_san_pham
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS sx_danh_sach_san_pham_modify ON public.sx_danh_sach_san_pham;
CREATE POLICY sx_danh_sach_san_pham_modify ON public.sx_danh_sach_san_pham
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS sx_san_pham_thuoc_tinh_select ON public.sx_san_pham_thuoc_tinh;
CREATE POLICY sx_san_pham_thuoc_tinh_select ON public.sx_san_pham_thuoc_tinh
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS sx_san_pham_thuoc_tinh_modify ON public.sx_san_pham_thuoc_tinh;
CREATE POLICY sx_san_pham_thuoc_tinh_modify ON public.sx_san_pham_thuoc_tinh
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

COMMIT;
