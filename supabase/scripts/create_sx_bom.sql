-- Tạo bảng BOM (chạy sau sx_danh_muc_hang_hoa, sx_danh_sach_nguyen_lieu)
-- Nội dung đồng bộ migration 20260711700000_sx_bom.sql + 20260712600000_remove_sx_danh_sach_san_pham.sql
BEGIN;

DROP TABLE IF EXISTS public.sx_bom_chi_tiet CASCADE;
DROP TABLE IF EXISTS public.sx_bom CASCADE;

CREATE TABLE public.sx_bom (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  danh_muc_id     BIGINT NOT NULL REFERENCES public.sx_danh_muc_hang_hoa (id) ON DELETE RESTRICT,
  nguyen_lieu_id  BIGINT NOT NULL REFERENCES public.sx_danh_sach_nguyen_lieu (id) ON DELETE RESTRICT,
  so_luong        NUMERIC NOT NULL CHECK (so_luong > 0),
  don_vi_tinh     TEXT NOT NULL DEFAULT '',
  ghi_chu         TEXT,
  thu_tu          INT NOT NULL DEFAULT 0,
  trang_thai      TEXT NOT NULL DEFAULT 'Đang hoạt động'
                  CHECK (trang_thai IN ('Đang hoạt động', 'Ngừng hoạt động')),
  tg_tao          TIMESTAMPTZ NOT NULL DEFAULT now(),
  tg_cap_nhat     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_sx_bom_dm_nl UNIQUE (danh_muc_id, nguyen_lieu_id)
);

CREATE INDEX idx_sx_bom_danh_muc ON public.sx_bom (danh_muc_id);
CREATE INDEX idx_sx_bom_nguyen_lieu ON public.sx_bom (nguyen_lieu_id);
CREATE INDEX idx_sx_bom_trang_thai ON public.sx_bom (trang_thai);

DROP TRIGGER IF EXISTS trg_sx_bom_updated ON public.sx_bom;
CREATE TRIGGER trg_sx_bom_updated
  BEFORE UPDATE ON public.sx_bom
  FOR EACH ROW EXECUTE FUNCTION public.set_tg_cap_nhat();

ALTER TABLE public.sx_bom ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sx_bom_select ON public.sx_bom;
CREATE POLICY sx_bom_select ON public.sx_bom
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS sx_bom_modify ON public.sx_bom;
CREATE POLICY sx_bom_modify ON public.sx_bom
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

COMMIT;
