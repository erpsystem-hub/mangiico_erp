-- Phiếu kho — sx_danh_sach_kho, sx_phieu_kho, sx_phieu_kho_chi_tiet, sx_ton_kho
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.sx_danh_sach_kho (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ma_kho        TEXT NOT NULL,
  ten_kho       TEXT NOT NULL,
  chi_nhanh_id  BIGINT REFERENCES public.var_chi_nhanh (id) ON DELETE SET NULL,
  dia_chi       TEXT,
  ghi_chu       TEXT,
  trang_thai    TEXT NOT NULL DEFAULT 'Đang hoạt động'
                CHECK (trang_thai IN ('Đang hoạt động', 'Ngừng hoạt động')),
  thu_tu        INTEGER NOT NULL DEFAULT 0,
  tg_tao        TIMESTAMPTZ NOT NULL DEFAULT now(),
  tg_cap_nhat   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_sx_danh_sach_kho_ma_lower
  ON public.sx_danh_sach_kho (lower(trim(ma_kho)));

CREATE INDEX IF NOT EXISTS idx_sx_danh_sach_kho_chi_nhanh ON public.sx_danh_sach_kho (chi_nhanh_id);

CREATE TABLE IF NOT EXISTS public.sx_phieu_kho (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ma_phieu_kho    TEXT NOT NULL,
  loai_phieu      TEXT NOT NULL CHECK (loai_phieu IN ('Nhập', 'Xuất')),
  muc_dich        TEXT NOT NULL,
  kho_id          BIGINT NOT NULL REFERENCES public.sx_danh_sach_kho (id) ON DELETE RESTRICT,
  kho_dich_id     BIGINT REFERENCES public.sx_danh_sach_kho (id) ON DELETE SET NULL,
  ngay_phieu      DATE NOT NULL DEFAULT CURRENT_DATE,
  chi_nhanh_id    BIGINT REFERENCES public.var_chi_nhanh (id) ON DELETE SET NULL,
  nhan_vien_id    BIGINT REFERENCES public.var_nhan_vien (id) ON DELETE SET NULL,
  don_hang_id     BIGINT REFERENCES public.kd_don_hang (id) ON DELETE SET NULL,
  don_mua_id      BIGINT REFERENCES public.kd_don_mua (id) ON DELETE SET NULL,
  ghi_chu         TEXT,
  trang_thai      TEXT NOT NULL DEFAULT 'Nháp'
                  CHECK (trang_thai IN ('Nháp', 'Hoàn thành', 'Hủy')),
  da_post_ton     BOOLEAN NOT NULL DEFAULT false,
  tg_tao          TIMESTAMPTZ NOT NULL DEFAULT now(),
  tg_cap_nhat     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_sx_phieu_kho_ma_lower
  ON public.sx_phieu_kho (lower(trim(ma_phieu_kho)));

CREATE INDEX IF NOT EXISTS idx_sx_phieu_kho_kho ON public.sx_phieu_kho (kho_id);
CREATE INDEX IF NOT EXISTS idx_sx_phieu_kho_ngay ON public.sx_phieu_kho (ngay_phieu);
CREATE INDEX IF NOT EXISTS idx_sx_phieu_kho_loai ON public.sx_phieu_kho (loai_phieu);
CREATE INDEX IF NOT EXISTS idx_sx_phieu_kho_trang_thai ON public.sx_phieu_kho (trang_thai);
CREATE INDEX IF NOT EXISTS idx_sx_phieu_kho_don_hang ON public.sx_phieu_kho (don_hang_id);
CREATE INDEX IF NOT EXISTS idx_sx_phieu_kho_don_mua ON public.sx_phieu_kho (don_mua_id);
CREATE INDEX IF NOT EXISTS idx_sx_phieu_kho_tg_cap_nhat ON public.sx_phieu_kho (tg_cap_nhat DESC);

CREATE TABLE IF NOT EXISTS public.sx_phieu_kho_chi_tiet (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  phieu_kho_id     BIGINT NOT NULL REFERENCES public.sx_phieu_kho (id) ON DELETE CASCADE,
  loai_hang        TEXT NOT NULL CHECK (loai_hang IN ('nguyen_lieu', 'thanh_pham')),
  nguyen_lieu_id   BIGINT REFERENCES public.sx_danh_sach_nguyen_lieu (id) ON DELETE RESTRICT,
  danh_muc_id      BIGINT REFERENCES public.sx_danh_muc_hang_hoa (id) ON DELETE RESTRICT,
  so_luong         NUMERIC NOT NULL CHECK (so_luong > 0),
  don_vi_tinh      TEXT NOT NULL DEFAULT 'm',
  ghi_chu          TEXT,
  thu_tu           INTEGER NOT NULL DEFAULT 0,
  tg_tao           TIMESTAMPTZ NOT NULL DEFAULT now(),
  tg_cap_nhat      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_sx_pk_ct_hang CHECK (
    (loai_hang = 'nguyen_lieu' AND nguyen_lieu_id IS NOT NULL AND danh_muc_id IS NULL)
    OR (loai_hang = 'thanh_pham' AND danh_muc_id IS NOT NULL AND nguyen_lieu_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_sx_pk_ct_phieu ON public.sx_phieu_kho_chi_tiet (phieu_kho_id);
CREATE INDEX IF NOT EXISTS idx_sx_pk_ct_nguyen_lieu ON public.sx_phieu_kho_chi_tiet (nguyen_lieu_id);
CREATE INDEX IF NOT EXISTS idx_sx_pk_ct_danh_muc ON public.sx_phieu_kho_chi_tiet (danh_muc_id);

CREATE TABLE IF NOT EXISTS public.sx_ton_kho (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  kho_id           BIGINT NOT NULL REFERENCES public.sx_danh_sach_kho (id) ON DELETE RESTRICT,
  loai_hang        TEXT NOT NULL CHECK (loai_hang IN ('nguyen_lieu', 'thanh_pham')),
  nguyen_lieu_id   BIGINT REFERENCES public.sx_danh_sach_nguyen_lieu (id) ON DELETE RESTRICT,
  danh_muc_id      BIGINT REFERENCES public.sx_danh_muc_hang_hoa (id) ON DELETE RESTRICT,
  so_luong         NUMERIC NOT NULL DEFAULT 0 CHECK (so_luong >= 0),
  don_vi_tinh      TEXT NOT NULL DEFAULT 'm',
  tg_cap_nhat      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_sx_ton_kho_hang CHECK (
    (loai_hang = 'nguyen_lieu' AND nguyen_lieu_id IS NOT NULL AND danh_muc_id IS NULL)
    OR (loai_hang = 'thanh_pham' AND danh_muc_id IS NOT NULL AND nguyen_lieu_id IS NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_sx_ton_kho_nl
  ON public.sx_ton_kho (kho_id, nguyen_lieu_id)
  WHERE loai_hang = 'nguyen_lieu';

CREATE UNIQUE INDEX IF NOT EXISTS uq_sx_ton_kho_tp
  ON public.sx_ton_kho (kho_id, danh_muc_id)
  WHERE loai_hang = 'thanh_pham';

CREATE INDEX IF NOT EXISTS idx_sx_ton_kho_kho ON public.sx_ton_kho (kho_id);

-- tg_cap_nhat triggers
DROP TRIGGER IF EXISTS trg_sx_danh_sach_kho_updated ON public.sx_danh_sach_kho;
CREATE TRIGGER trg_sx_danh_sach_kho_updated
  BEFORE UPDATE ON public.sx_danh_sach_kho
  FOR EACH ROW EXECUTE FUNCTION public.set_tg_cap_nhat();

DROP TRIGGER IF EXISTS trg_sx_phieu_kho_updated ON public.sx_phieu_kho;
CREATE TRIGGER trg_sx_phieu_kho_updated
  BEFORE UPDATE ON public.sx_phieu_kho
  FOR EACH ROW EXECUTE FUNCTION public.set_tg_cap_nhat();

DROP TRIGGER IF EXISTS trg_sx_phieu_kho_chi_tiet_updated ON public.sx_phieu_kho_chi_tiet;
CREATE TRIGGER trg_sx_phieu_kho_chi_tiet_updated
  BEFORE UPDATE ON public.sx_phieu_kho_chi_tiet
  FOR EACH ROW EXECUTE FUNCTION public.set_tg_cap_nhat();

DROP TRIGGER IF EXISTS trg_sx_ton_kho_updated ON public.sx_ton_kho;
CREATE TRIGGER trg_sx_ton_kho_updated
  BEFORE UPDATE ON public.sx_ton_kho
  FOR EACH ROW EXECUTE FUNCTION public.set_tg_cap_nhat();

-- Validate muc_dich theo loai_phieu + don_hang Lệnh SX
CREATE OR REPLACE FUNCTION public.sx_phieu_kho_assert_business() RETURNS trigger AS $$
DECLARE
  v_tt_dh text;
  v_muc_dich_nhap text[] := ARRAY[
    'Nhập sản xuất', 'Nhập mua hàng', 'Nhập điều chỉnh', 'Nhập chuyển kho', 'Nhập trả hàng'
  ];
  v_muc_dich_xuat text[] := ARRAY[
    'Xuất sản xuất', 'Xuất bán hàng', 'Xuất điều chỉnh', 'Xuất chuyển kho', 'Xuất hao hụt', 'Xuất mẫu'
  ];
BEGIN
  IF NEW.loai_phieu = 'Nhập' AND NOT (NEW.muc_dich = ANY(v_muc_dich_nhap)) THEN
    RAISE EXCEPTION 'sx_phieu_kho: mục đích % không hợp lệ cho phiếu Nhập', NEW.muc_dich;
  END IF;
  IF NEW.loai_phieu = 'Xuất' AND NOT (NEW.muc_dich = ANY(v_muc_dich_xuat)) THEN
    RAISE EXCEPTION 'sx_phieu_kho: mục đích % không hợp lệ cho phiếu Xuất', NEW.muc_dich;
  END IF;

  IF NEW.kho_dich_id IS NOT NULL AND NEW.kho_dich_id = NEW.kho_id THEN
    RAISE EXCEPTION 'sx_phieu_kho: kho đích phải khác kho nguồn';
  END IF;

  IF NEW.muc_dich IN ('Nhập chuyển kho', 'Xuất chuyển kho') AND NEW.kho_dich_id IS NULL THEN
    RAISE EXCEPTION 'sx_phieu_kho: phiếu chuyển kho cần kho đích';
  END IF;

  IF NEW.don_hang_id IS NOT NULL THEN
    SELECT dh.trang_thai INTO v_tt_dh FROM public.kd_don_hang dh WHERE dh.id = NEW.don_hang_id;
    IF v_tt_dh IS NULL THEN
      RAISE EXCEPTION 'sx_phieu_kho: don_hang_id % không tồn tại', NEW.don_hang_id;
    END IF;
    IF v_tt_dh NOT IN ('Chuyển sản xuất', 'Hoàn thành') THEN
      RAISE EXCEPTION 'sx_phieu_kho: đơn hàng phải ở trạng thái Lệnh sản xuất';
    END IF;
  END IF;

  IF NEW.da_post_ton = true AND TG_OP = 'UPDATE' AND OLD.trang_thai = 'Hoàn thành' THEN
    IF NEW.loai_phieu IS DISTINCT FROM OLD.loai_phieu
       OR NEW.muc_dich IS DISTINCT FROM OLD.muc_dich
       OR NEW.kho_id IS DISTINCT FROM OLD.kho_id
       OR NEW.kho_dich_id IS DISTINCT FROM OLD.kho_dich_id THEN
      RAISE EXCEPTION 'sx_phieu_kho: không được sửa thông tin phiếu đã post tồn';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sx_phieu_kho_business ON public.sx_phieu_kho;
CREATE TRIGGER trg_sx_phieu_kho_business
  BEFORE INSERT OR UPDATE ON public.sx_phieu_kho
  FOR EACH ROW EXECUTE FUNCTION public.sx_phieu_kho_assert_business();

-- Kho đang hoạt động
CREATE OR REPLACE FUNCTION public.sx_phieu_kho_assert_kho() RETURNS trigger AS $$
DECLARE
  v_tt text;
BEGIN
  SELECT k.trang_thai INTO v_tt FROM public.sx_danh_sach_kho k WHERE k.id = NEW.kho_id;
  IF v_tt IS NULL THEN
    RAISE EXCEPTION 'sx_phieu_kho: kho_id % không tồn tại', NEW.kho_id;
  END IF;
  IF v_tt <> 'Đang hoạt động' THEN
    RAISE EXCEPTION 'sx_phieu_kho: kho không ở trạng thái Đang hoạt động';
  END IF;
  IF NEW.kho_dich_id IS NOT NULL THEN
    SELECT k.trang_thai INTO v_tt FROM public.sx_danh_sach_kho k WHERE k.id = NEW.kho_dich_id;
    IF v_tt IS NULL OR v_tt <> 'Đang hoạt động' THEN
      RAISE EXCEPTION 'sx_phieu_kho: kho đích không hợp lệ';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sx_phieu_kho_kho ON public.sx_phieu_kho;
CREATE TRIGGER trg_sx_phieu_kho_kho
  BEFORE INSERT OR UPDATE OF kho_id, kho_dich_id ON public.sx_phieu_kho
  FOR EACH ROW EXECUTE FUNCTION public.sx_phieu_kho_assert_kho();

-- Mã phiếu: PK-NK-YYYYMMDD-### / PK-XK-YYYYMMDD-###
CREATE OR REPLACE FUNCTION public.sx_generate_ma_phieu_kho(
  p_loai_phieu TEXT,
  p_ngay_phieu DATE DEFAULT CURRENT_DATE
) RETURNS text AS $$
DECLARE
  v_prefix text;
  v_seq    int;
BEGIN
  IF p_loai_phieu = 'Nhập' THEN
    v_prefix := 'PK-NK-' || to_char(p_ngay_phieu, 'YYYYMMDD') || '-';
  ELSIF p_loai_phieu = 'Xuất' THEN
    v_prefix := 'PK-XK-' || to_char(p_ngay_phieu, 'YYYYMMDD') || '-';
  ELSE
    RAISE EXCEPTION 'sx_generate_ma_phieu_kho: loai_phieu không hợp lệ';
  END IF;

  SELECT COALESCE(max(
    NULLIF(regexp_replace(ma_phieu_kho, '^' || v_prefix, ''), '')::int
  ), 0) + 1 INTO v_seq
  FROM public.sx_phieu_kho
  WHERE ma_phieu_kho LIKE v_prefix || '%';

  RETURN v_prefix || lpad(v_seq::text, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Post tồn kho
CREATE OR REPLACE FUNCTION public.sx_post_phieu_kho_ton(p_phieu_kho_id BIGINT) RETURNS void AS $$
DECLARE
  v_pk       record;
  v_line     record;
  v_delta    numeric;
  v_ton      numeric;
  v_kho_id   bigint;
BEGIN
  SELECT * INTO v_pk FROM public.sx_phieu_kho WHERE id = p_phieu_kho_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'sx_post_phieu_kho_ton: phiếu % không tồn tại', p_phieu_kho_id;
  END IF;
  IF v_pk.da_post_ton THEN
    RETURN;
  END IF;
  IF v_pk.trang_thai <> 'Hoàn thành' THEN
    RAISE EXCEPTION 'sx_post_phieu_kho_ton: chỉ post phiếu Hoàn thành';
  END IF;

  v_kho_id := v_pk.kho_id;

  FOR v_line IN
    SELECT * FROM public.sx_phieu_kho_chi_tiet
    WHERE phieu_kho_id = p_phieu_kho_id
    ORDER BY thu_tu, id
  LOOP
    IF v_pk.loai_phieu = 'Nhập' THEN
      v_delta := v_line.so_luong;
    ELSE
      v_delta := -v_line.so_luong;
    END IF;

    IF v_line.loai_hang = 'nguyen_lieu' THEN
      SELECT tk.so_luong INTO v_ton
      FROM public.sx_ton_kho tk
      WHERE tk.kho_id = v_kho_id
        AND tk.loai_hang = 'nguyen_lieu'
        AND tk.nguyen_lieu_id = v_line.nguyen_lieu_id;

      IF v_pk.loai_phieu = 'Xuất' AND COALESCE(v_ton, 0) < v_line.so_luong THEN
        RAISE EXCEPTION 'sx_post_phieu_kho_ton: không đủ tồn nguyên liệu id %', v_line.nguyen_lieu_id;
      END IF;

      IF EXISTS (
        SELECT 1 FROM public.sx_ton_kho tk
        WHERE tk.kho_id = v_kho_id AND tk.loai_hang = 'nguyen_lieu' AND tk.nguyen_lieu_id = v_line.nguyen_lieu_id
      ) THEN
        UPDATE public.sx_ton_kho
        SET so_luong = so_luong + v_delta, don_vi_tinh = v_line.don_vi_tinh, tg_cap_nhat = now()
        WHERE kho_id = v_kho_id AND loai_hang = 'nguyen_lieu' AND nguyen_lieu_id = v_line.nguyen_lieu_id;
      ELSE
        INSERT INTO public.sx_ton_kho (kho_id, loai_hang, nguyen_lieu_id, danh_muc_id, so_luong, don_vi_tinh)
        VALUES (v_kho_id, 'nguyen_lieu', v_line.nguyen_lieu_id, NULL, v_line.so_luong, v_line.don_vi_tinh);
      END IF;
    ELSE
      SELECT tk.so_luong INTO v_ton
      FROM public.sx_ton_kho tk
      WHERE tk.kho_id = v_kho_id
        AND tk.loai_hang = 'thanh_pham'
        AND tk.danh_muc_id = v_line.danh_muc_id;

      IF v_pk.loai_phieu = 'Xuất' AND COALESCE(v_ton, 0) < v_line.so_luong THEN
        RAISE EXCEPTION 'sx_post_phieu_kho_ton: không đủ tồn thành phẩm id %', v_line.danh_muc_id;
      END IF;

      IF EXISTS (
        SELECT 1 FROM public.sx_ton_kho tk
        WHERE tk.kho_id = v_kho_id AND tk.loai_hang = 'thanh_pham' AND tk.danh_muc_id = v_line.danh_muc_id
      ) THEN
        UPDATE public.sx_ton_kho
        SET so_luong = so_luong + v_delta, don_vi_tinh = v_line.don_vi_tinh, tg_cap_nhat = now()
        WHERE kho_id = v_kho_id AND loai_hang = 'thanh_pham' AND danh_muc_id = v_line.danh_muc_id;
      ELSE
        INSERT INTO public.sx_ton_kho (kho_id, loai_hang, nguyen_lieu_id, danh_muc_id, so_luong, don_vi_tinh)
        VALUES (v_kho_id, 'thanh_pham', NULL, v_line.danh_muc_id, v_line.so_luong, v_line.don_vi_tinh);
      END IF;
    END IF;
  END LOOP;

  UPDATE public.sx_phieu_kho
  SET da_post_ton = true, tg_cap_nhat = now()
  WHERE id = p_phieu_kho_id;
END;
$$ LANGUAGE plpgsql;

-- Unpost tồn (Hủy phiếu đã post)
CREATE OR REPLACE FUNCTION public.sx_unpost_phieu_kho_ton(p_phieu_kho_id BIGINT) RETURNS void AS $$
DECLARE
  v_pk   record;
  v_line record;
  v_delta numeric;
  v_ton  numeric;
BEGIN
  SELECT * INTO v_pk FROM public.sx_phieu_kho WHERE id = p_phieu_kho_id FOR UPDATE;
  IF NOT FOUND OR NOT v_pk.da_post_ton THEN
    RETURN;
  END IF;

  FOR v_line IN
    SELECT * FROM public.sx_phieu_kho_chi_tiet
    WHERE phieu_kho_id = p_phieu_kho_id
    ORDER BY thu_tu, id
  LOOP
    IF v_pk.loai_phieu = 'Nhập' THEN
      v_delta := -v_line.so_luong;
    ELSE
      v_delta := v_line.so_luong;
    END IF;

    IF v_line.loai_hang = 'nguyen_lieu' THEN
      SELECT tk.so_luong INTO v_ton
      FROM public.sx_ton_kho tk
      WHERE tk.kho_id = v_pk.kho_id AND tk.loai_hang = 'nguyen_lieu' AND tk.nguyen_lieu_id = v_line.nguyen_lieu_id
      FOR UPDATE;
      IF COALESCE(v_ton, 0) + v_delta < 0 THEN
        RAISE EXCEPTION 'sx_unpost_phieu_kho_ton: hoàn tồn âm nguyên liệu id %', v_line.nguyen_lieu_id;
      END IF;
      UPDATE public.sx_ton_kho
      SET so_luong = so_luong + v_delta, tg_cap_nhat = now()
      WHERE kho_id = v_pk.kho_id AND loai_hang = 'nguyen_lieu' AND nguyen_lieu_id = v_line.nguyen_lieu_id;
    ELSE
      SELECT tk.so_luong INTO v_ton
      FROM public.sx_ton_kho tk
      WHERE tk.kho_id = v_pk.kho_id AND loai_hang = 'thanh_pham' AND tk.danh_muc_id = v_line.danh_muc_id
      FOR UPDATE;
      IF COALESCE(v_ton, 0) + v_delta < 0 THEN
        RAISE EXCEPTION 'sx_unpost_phieu_kho_ton: hoàn tồn âm thành phẩm id %', v_line.danh_muc_id;
      END IF;
      UPDATE public.sx_ton_kho
      SET so_luong = so_luong + v_delta, tg_cap_nhat = now()
      WHERE kho_id = v_pk.kho_id AND loai_hang = 'thanh_pham' AND danh_muc_id = v_line.danh_muc_id;
    END IF;
  END LOOP;

  UPDATE public.sx_phieu_kho
  SET da_post_ton = false, tg_cap_nhat = now()
  WHERE id = p_phieu_kho_id;
END;
$$ LANGUAGE plpgsql;

-- Upsert phiếu kho + dòng
CREATE OR REPLACE FUNCTION public.sx_upsert_phieu_kho(
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
  v_loai         text;
  v_trang_thai   text;
  v_old_tt       text;
  v_old_post     boolean;
  v_line         jsonb;
  v_i            int := 0;
BEGIN
  IF p_lines IS NULL OR jsonb_array_length(p_lines) < 1 THEN
    RAISE EXCEPTION 'sx_upsert_phieu_kho: cần ít nhất một dòng chi tiết';
  END IF;

  v_id := NULLIF(trim(p_header->>'id'), '')::bigint;
  v_ngay := COALESCE((p_header->>'ngay_phieu')::date, CURRENT_DATE);
  v_loai := trim(p_header->>'loai_phieu');
  v_trang_thai := COALESCE(NULLIF(trim(p_header->>'trang_thai'), ''), 'Nháp');
  v_ma := NULLIF(trim(p_header->>'ma_phieu_kho'), '');
  IF v_ma IS NULL OR v_ma = '' THEN
    v_ma := public.sx_generate_ma_phieu_kho(v_loai, v_ngay);
  END IF;

  IF v_id IS NULL THEN
    INSERT INTO public.sx_phieu_kho (
      ma_phieu_kho, loai_phieu, muc_dich, kho_id, kho_dich_id,
      ngay_phieu, chi_nhanh_id, nhan_vien_id, don_hang_id, don_mua_id,
      ghi_chu, trang_thai
    ) VALUES (
      v_ma,
      v_loai,
      trim(p_header->>'muc_dich'),
      (p_header->>'kho_id')::bigint,
      NULLIF(trim(p_header->>'kho_dich_id'), '')::bigint,
      v_ngay,
      NULLIF(trim(p_header->>'chi_nhanh_id'), '')::bigint,
      NULLIF(trim(p_header->>'nhan_vien_id'), '')::bigint,
      NULLIF(trim(p_header->>'don_hang_id'), '')::bigint,
      NULLIF(trim(p_header->>'don_mua_id'), '')::bigint,
      NULLIF(trim(p_header->>'ghi_chu'), ''),
      v_trang_thai
    )
    RETURNING id INTO v_id;
  ELSE
    SELECT trang_thai, da_post_ton INTO v_old_tt, v_old_post
    FROM public.sx_phieu_kho WHERE id = v_id FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'sx_upsert_phieu_kho: phiếu % không tồn tại', v_id;
    END IF;

    IF v_old_post THEN
      RAISE EXCEPTION 'sx_upsert_phieu_kho: phiếu đã post tồn, không được sửa';
    END IF;

    IF v_old_tt = 'Hủy' THEN
      RAISE EXCEPTION 'sx_upsert_phieu_kho: phiếu đã hủy';
    END IF;

    UPDATE public.sx_phieu_kho SET
      ma_phieu_kho = CASE WHEN trang_thai = 'Nháp' THEN v_ma ELSE ma_phieu_kho END,
      loai_phieu = v_loai,
      muc_dich = trim(p_header->>'muc_dich'),
      kho_id = (p_header->>'kho_id')::bigint,
      kho_dich_id = NULLIF(trim(p_header->>'kho_dich_id'), '')::bigint,
      ngay_phieu = v_ngay,
      chi_nhanh_id = NULLIF(trim(p_header->>'chi_nhanh_id'), '')::bigint,
      nhan_vien_id = NULLIF(trim(p_header->>'nhan_vien_id'), '')::bigint,
      don_hang_id = NULLIF(trim(p_header->>'don_hang_id'), '')::bigint,
      don_mua_id = NULLIF(trim(p_header->>'don_mua_id'), '')::bigint,
      ghi_chu = NULLIF(trim(p_header->>'ghi_chu'), ''),
      trang_thai = v_trang_thai,
      tg_cap_nhat = now()
    WHERE id = v_id;

    DELETE FROM public.sx_phieu_kho_chi_tiet WHERE phieu_kho_id = v_id;
  END IF;

  FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines)
  LOOP
    v_i := v_i + 1;
    INSERT INTO public.sx_phieu_kho_chi_tiet (
      phieu_kho_id, loai_hang, nguyen_lieu_id, danh_muc_id,
      so_luong, don_vi_tinh, ghi_chu, thu_tu
    ) VALUES (
      v_id,
      trim(v_line->>'loai_hang'),
      NULLIF(trim(v_line->>'nguyen_lieu_id'), '')::bigint,
      NULLIF(trim(v_line->>'danh_muc_id'), '')::bigint,
      (v_line->>'so_luong')::numeric,
      COALESCE(NULLIF(trim(v_line->>'don_vi_tinh'), ''), 'm'),
      NULLIF(trim(v_line->>'ghi_chu'), ''),
      COALESCE((v_line->>'thu_tu')::int, v_i)
    );
  END LOOP;

  IF v_trang_thai = 'Hoàn thành' THEN
    PERFORM public.sx_post_phieu_kho_ton(v_id);
  END IF;

  RETURN jsonb_build_object('id', v_id, 'ma_phieu_kho', (
    SELECT ma_phieu_kho FROM public.sx_phieu_kho WHERE id = v_id
  ));
END;
$$;

-- Hủy phiếu
CREATE OR REPLACE FUNCTION public.sx_cancel_phieu_kho(p_phieu_kho_id BIGINT) RETURNS void AS $$
DECLARE
  v_pk record;
BEGIN
  SELECT * INTO v_pk FROM public.sx_phieu_kho WHERE id = p_phieu_kho_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'sx_cancel_phieu_kho: phiếu % không tồn tại', p_phieu_kho_id;
  END IF;
  IF v_pk.trang_thai = 'Hủy' THEN
    RETURN;
  END IF;
  IF v_pk.da_post_ton THEN
    PERFORM public.sx_unpost_phieu_kho_ton(p_phieu_kho_id);
  END IF;
  UPDATE public.sx_phieu_kho
  SET trang_thai = 'Hủy', tg_cap_nhat = now()
  WHERE id = p_phieu_kho_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.sx_generate_ma_phieu_kho(text, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sx_upsert_phieu_kho(jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sx_post_phieu_kho_ton(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sx_unpost_phieu_kho_ton(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sx_cancel_phieu_kho(bigint) TO authenticated;

-- RLS
ALTER TABLE public.sx_danh_sach_kho ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sx_phieu_kho ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sx_phieu_kho_chi_tiet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sx_ton_kho ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sx_danh_sach_kho_all ON public.sx_danh_sach_kho;
CREATE POLICY sx_danh_sach_kho_all ON public.sx_danh_sach_kho
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS sx_phieu_kho_all ON public.sx_phieu_kho;
CREATE POLICY sx_phieu_kho_all ON public.sx_phieu_kho
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS sx_phieu_kho_chi_tiet_all ON public.sx_phieu_kho_chi_tiet;
CREATE POLICY sx_phieu_kho_chi_tiet_all ON public.sx_phieu_kho_chi_tiet
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS sx_ton_kho_all ON public.sx_ton_kho;
CREATE POLICY sx_ton_kho_all ON public.sx_ton_kho
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

COMMENT ON TABLE public.sx_danh_sach_kho IS 'Danh sách kho';
COMMENT ON TABLE public.sx_phieu_kho IS 'Phiếu nhập/xuất kho';
COMMENT ON TABLE public.sx_phieu_kho_chi_tiet IS 'Chi tiết phiếu kho';
COMMENT ON TABLE public.sx_ton_kho IS 'Tồn kho theo kho và hàng';
