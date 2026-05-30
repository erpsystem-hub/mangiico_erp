-- Baseline schema Mangiico ERP — module Hệ thống only.
-- Squashed from legacy migrations (see supabase/migrations_archive/legacy/).

-- ============================================================================
-- Shared trigger helper
-- ============================================================================
CREATE OR REPLACE FUNCTION public.set_tg_cap_nhat() RETURNS trigger AS $$
BEGIN
  NEW.tg_cap_nhat = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- var_phong_ban — cây phòng ban
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.var_phong_ban (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ten_phong_ban   TEXT NOT NULL,
  mo_ta           TEXT,
  cha_id          BIGINT REFERENCES public.var_phong_ban (id) ON DELETE SET NULL,
  cap_do          INTEGER NOT NULL DEFAULT 0,
  duong_dan       TEXT NOT NULL DEFAULT '',
  trang_thai      TEXT NOT NULL DEFAULT 'Đang hoạt động'
                  CHECK (trang_thai IN ('Đang hoạt động','Ngừng hoạt động')),
  thu_tu          INTEGER NOT NULL DEFAULT 0,
  tg_tao          TIMESTAMPTZ NOT NULL DEFAULT now(),
  tg_cap_nhat     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_var_phong_ban_ten_lower
  ON public.var_phong_ban (lower(trim(ten_phong_ban)));
CREATE INDEX IF NOT EXISTS idx_var_phong_ban_cha ON public.var_phong_ban (cha_id);
CREATE INDEX IF NOT EXISTS idx_var_phong_ban_duong_dan ON public.var_phong_ban (duong_dan);

ALTER TABLE public.var_phong_ban ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS var_phong_ban_select ON public.var_phong_ban;
CREATE POLICY var_phong_ban_select ON public.var_phong_ban
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS var_phong_ban_modify ON public.var_phong_ban;
CREATE POLICY var_phong_ban_modify ON public.var_phong_ban
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.var_phong_ban_path_after_insert() RETURNS trigger AS $$
DECLARE
  p_duong text;
  p_cap   int;
BEGIN
  IF NEW.cha_id IS NULL THEN
    UPDATE public.var_phong_ban
    SET duong_dan = '/' || NEW.id::text, cap_do = 1
    WHERE id = NEW.id;
  ELSE
    SELECT p.duong_dan, p.cap_do INTO p_duong, p_cap
    FROM public.var_phong_ban p
    WHERE p.id = NEW.cha_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'var_phong_ban: cha_id % không tồn tại', NEW.cha_id;
    END IF;
    UPDATE public.var_phong_ban
    SET duong_dan = p_duong || '/' || NEW.id::text, cap_do = p_cap + 1
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_var_phong_ban_path_ins ON public.var_phong_ban;
CREATE TRIGGER trg_var_phong_ban_path_ins
  AFTER INSERT ON public.var_phong_ban
  FOR EACH ROW EXECUTE FUNCTION public.var_phong_ban_path_after_insert();

DROP TRIGGER IF EXISTS trg_var_phong_ban_updated ON public.var_phong_ban;
CREATE TRIGGER trg_var_phong_ban_updated
  BEFORE UPDATE ON public.var_phong_ban
  FOR EACH ROW EXECUTE FUNCTION public.set_tg_cap_nhat();

-- ============================================================================
-- var_chuc_vu — chức vụ
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.var_chuc_vu (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ten_chuc_vu     TEXT NOT NULL,
  mo_ta           TEXT,
  phong_ban_id    BIGINT REFERENCES public.var_phong_ban (id) ON DELETE SET NULL,
  cap_bac         SMALLINT,
  cap_quan_ly     TEXT CHECK (cap_quan_ly IS NULL OR cap_quan_ly IN ('Tỉnh', 'Xã phường')),
  trang_thai      TEXT NOT NULL DEFAULT 'Đang hoạt động'
                  CHECK (trang_thai IN ('Đang hoạt động','Ngừng hoạt động')),
  thu_tu          INTEGER NOT NULL DEFAULT 0,
  tg_tao          TIMESTAMPTZ NOT NULL DEFAULT now(),
  tg_cap_nhat     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_var_chuc_vu_ten_lower
  ON public.var_chuc_vu (lower(trim(ten_chuc_vu)));
CREATE INDEX IF NOT EXISTS idx_var_chuc_vu_phong_ban ON public.var_chuc_vu (phong_ban_id);
CREATE INDEX IF NOT EXISTS idx_var_chuc_vu_cap_bac ON public.var_chuc_vu (cap_bac);
CREATE INDEX IF NOT EXISTS idx_var_chuc_vu_cap_quan_ly ON public.var_chuc_vu (cap_quan_ly);
CREATE INDEX IF NOT EXISTS idx_var_chuc_vu_thu_tu ON public.var_chuc_vu (thu_tu);

ALTER TABLE public.var_chuc_vu ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS var_chuc_vu_select ON public.var_chuc_vu;
CREATE POLICY var_chuc_vu_select ON public.var_chuc_vu
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS var_chuc_vu_modify ON public.var_chuc_vu;
CREATE POLICY var_chuc_vu_modify ON public.var_chuc_vu
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS trg_var_chuc_vu_updated ON public.var_chuc_vu;
CREATE TRIGGER trg_var_chuc_vu_updated
  BEFORE UPDATE ON public.var_chuc_vu
  FOR EACH ROW EXECUTE FUNCTION public.set_tg_cap_nhat();

-- ============================================================================
-- var_nhan_vien — nhân viên (không don_vi_id)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.var_nhan_vien (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ten_tai_khoan   TEXT NOT NULL UNIQUE,
  ho_va_ten       TEXT NOT NULL,
  hinh_anh        TEXT,
  id_phong_ban    BIGINT,
  id_bo_phan      BIGINT,
  id_chuc_vu      BIGINT,
  trang_thai      TEXT NOT NULL DEFAULT 'Hoạt động'
                  CHECK (trang_thai IN ('Hoạt động','Khóa')),
  tg_tao          TIMESTAMPTZ NOT NULL DEFAULT now(),
  tg_cap_nhat     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_var_nhan_vien_username ON public.var_nhan_vien (lower(ten_tai_khoan));
CREATE INDEX IF NOT EXISTS idx_var_nhan_vien_phong_ban ON public.var_nhan_vien (id_phong_ban);
CREATE INDEX IF NOT EXISTS idx_var_nhan_vien_chuc_vu ON public.var_nhan_vien (id_chuc_vu);

ALTER TABLE public.var_nhan_vien ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS var_nhan_vien_select ON public.var_nhan_vien;
CREATE POLICY var_nhan_vien_select ON public.var_nhan_vien
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS var_nhan_vien_modify ON public.var_nhan_vien;
CREATE POLICY var_nhan_vien_modify ON public.var_nhan_vien
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS trg_var_nhan_vien_updated ON public.var_nhan_vien;
CREATE TRIGGER trg_var_nhan_vien_updated
  BEFORE UPDATE ON public.var_nhan_vien
  FOR EACH ROW EXECUTE FUNCTION public.set_tg_cap_nhat();

-- ============================================================================
-- var_thong_tin_to_chuc — singleton branding
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.var_thong_tin_to_chuc (
  id            BIGINT NOT NULL PRIMARY KEY DEFAULT 1,
  CONSTRAINT var_thong_tin_to_chuc_singleton CHECK (id = 1),
  ten_ung_dung  TEXT NOT NULL DEFAULT 'Mangiico ERP',
  mo_ta_ngan    TEXT,
  url_logo      TEXT,
  ten_to_chuc   TEXT NOT NULL,
  dia_chi       TEXT,
  dien_thoai    TEXT,
  email         TEXT,
  website       TEXT,
  tg_tao        TIMESTAMPTZ NOT NULL DEFAULT now(),
  tg_cap_nhat   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.var_thong_tin_to_chuc ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS var_thong_tin_to_chuc_select ON public.var_thong_tin_to_chuc;
CREATE POLICY var_thong_tin_to_chuc_select ON public.var_thong_tin_to_chuc
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS var_thong_tin_to_chuc_modify ON public.var_thong_tin_to_chuc;
CREATE POLICY var_thong_tin_to_chuc_modify ON public.var_thong_tin_to_chuc
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS trg_var_thong_tin_to_chuc_updated ON public.var_thong_tin_to_chuc;
CREATE TRIGGER trg_var_thong_tin_to_chuc_updated
  BEFORE UPDATE ON public.var_thong_tin_to_chuc
  FOR EACH ROW EXECUTE FUNCTION public.set_tg_cap_nhat();

INSERT INTO public.var_thong_tin_to_chuc (
  id, ten_ung_dung, mo_ta_ngan, url_logo, ten_to_chuc, dia_chi, dien_thoai, email, website
)
VALUES (
  1,
  'Mangiico ERP',
  'Hệ thống quản trị doanh nghiệp',
  'https://datafiles.nghean.gov.vn/nan-ubnd/6556/Album/quochuy%20(1).png',
  'Công ty TNHH Mangiico',
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- var_phan_quyen — ma trận quyền theo chức vụ
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.var_phan_quyen (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  module_key      TEXT NOT NULL,
  chuc_vu_id      BIGINT NOT NULL REFERENCES public.var_chuc_vu (id) ON DELETE CASCADE,
  quyen           TEXT NOT NULL DEFAULT '',
  tg_cap_nhat     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_var_phan_quyen_chuc_vu_module
  ON public.var_phan_quyen (chuc_vu_id, module_key);
CREATE INDEX IF NOT EXISTS idx_var_phan_quyen_chuc_vu ON public.var_phan_quyen (chuc_vu_id);

ALTER TABLE public.var_phan_quyen ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS var_phan_quyen_select ON public.var_phan_quyen;
CREATE POLICY var_phan_quyen_select ON public.var_phan_quyen
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS var_phan_quyen_modify ON public.var_phan_quyen;
CREATE POLICY var_phan_quyen_modify ON public.var_phan_quyen
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS trg_var_phan_quyen_updated ON public.var_phan_quyen;
CREATE TRIGGER trg_var_phan_quyen_updated
  BEFORE UPDATE ON public.var_phan_quyen
  FOR EACH ROW EXECUTE FUNCTION public.set_tg_cap_nhat();

-- ============================================================================
-- RPC — egress optimizations (Hệ thống)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_nhan_vien_count_by_chuc_vu()
RETURNS TABLE (id_chuc_vu BIGINT, so_nhan_vien BIGINT)
LANGUAGE SQL
STABLE
SECURITY INVOKER
AS $$
  SELECT id_chuc_vu, COUNT(*)::BIGINT AS so_nhan_vien
  FROM public.var_nhan_vien
  WHERE id_chuc_vu IS NOT NULL
  GROUP BY id_chuc_vu;
$$;

CREATE OR REPLACE FUNCTION public.get_phong_ban_path_level(p_id BIGINT, p_cha_id BIGINT)
RETURNS TABLE (duong_dan TEXT, cap_do INT)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
AS $$
DECLARE
  parent_path TEXT;
  parent_level INT;
BEGIN
  IF p_cha_id IS NULL THEN
    RETURN QUERY SELECT ('/' || p_id::TEXT)::TEXT, 1;
    RETURN;
  END IF;

  SELECT vp.duong_dan, vp.cap_do
    INTO parent_path, parent_level
    FROM public.var_phong_ban vp
   WHERE vp.id = p_cha_id;

  IF parent_path IS NULL THEN
    RETURN QUERY SELECT ('/' || p_id::TEXT)::TEXT, 1;
    RETURN;
  END IF;

  RETURN QUERY SELECT (parent_path || '/' || p_id::TEXT)::TEXT, parent_level + 1;
END;
$$;

COMMENT ON FUNCTION public.get_nhan_vien_count_by_chuc_vu IS
  'Đếm nhân viên theo chức vụ — dùng ma trận phân quyền.';
COMMENT ON FUNCTION public.get_phong_ban_path_level IS
  'Tính duong_dan/cap_do phòng ban khi đổi cha — tránh getAll client.';

-- ============================================================================
-- Storage — bucket avatars (private, signed URL)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  false,
  2 * 1024 * 1024,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "avatars_auth_select" ON storage.objects;
CREATE POLICY "avatars_auth_select"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_auth_write" ON storage.objects;
CREATE POLICY "avatars_auth_write"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_auth_update" ON storage.objects;
CREATE POLICY "avatars_auth_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars')
  WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_auth_delete" ON storage.objects;
CREATE POLICY "avatars_auth_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars');
