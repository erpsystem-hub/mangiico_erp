-- Seed chi nhánh mẫu + gán nhân viên (many-to-many).
-- Idempotent: bỏ qua bản ghi trùng tên / mã / cặp NV–CN.
--
-- Chạy sau migration var_chi_nhanh và (tùy chọn) seed_he_thong_demo.sql:
--   npm run seed:chi-nhanh
--
-- RLS: bảng nghiệp vụ chỉ SELECT khi role `authenticated`.

BEGIN;

-- ============================================================================
-- 1. Chi nhánh (5)
-- ============================================================================
INSERT INTO public.var_chi_nhanh (ten_chi_nhanh, ma_chi_nhanh, dia_chi, dien_thoai, email, thu_tu, trang_thai)
SELECT v.ten, v.ma, v.dia_chi, v.dien_thoai, v.email, v.thu_tu, 'Đang hoạt động'
FROM (
  VALUES
    ('Trụ sở chính Hà Nội', 'HN-HQ', 'Số 10 Phạm Hùng, Nam Từ Liêm, Hà Nội', '024 1234 5678', 'hanoi@mangiico.vn', 1),
    ('Chi nhánh TP. Hồ Chí Minh', 'HCM-01', '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh', '028 8765 4321', 'hcm@mangiico.vn', 2),
    ('Chi nhánh Đà Nẵng', 'DN-01', '45 Lê Duẩn, Hải Châu, Đà Nẵng', '0236 111 2222', 'danang@mangiico.vn', 3),
    ('Chi nhánh Cần Thơ', 'CT-01', '88 Mậu Thân, Ninh Kiều, Cần Thơ', '0292 333 4444', 'cantho@mangiico.vn', 4),
    ('Chi nhánh Hải Phòng', 'HP-01', '12 Lê Thánh Tông, Ngô Quyền, Hải Phòng', '0225 555 6666', 'haiphong@mangiico.vn', 5)
) AS v(ten, ma, dia_chi, dien_thoai, email, thu_tu)
WHERE NOT EXISTS (
  SELECT 1 FROM public.var_chi_nhanh cn
  WHERE lower(trim(cn.ten_chi_nhanh)) = lower(trim(v.ten))
);

-- ============================================================================
-- 2. Gán chi nhánh cho nhân viên (mỗi NV ≥ 1 CN; một số NV 2 CN)
-- ============================================================================
INSERT INTO public.var_nhan_vien_chi_nhanh (nhan_vien_id, chi_nhanh_id)
SELECT nv.id, cn.id
FROM (
  VALUES
    ('nguyen.quoc.hung', 'Trụ sở chính Hà Nội'),
    ('nguyen.quoc.hung', 'Chi nhánh TP. Hồ Chí Minh'),
    ('tran.thi.mai', 'Trụ sở chính Hà Nội'),
    ('pham.van.duc', 'Trụ sở chính Hà Nội'),
    ('le.thi.hong', 'Trụ sở chính Hà Nội'),
    ('hoang.minh.tuan', 'Trụ sở chính Hà Nội'),
    ('dang.thi.lan', 'Trụ sở chính Hà Nội'),
    ('vo.thanh.nam', 'Trụ sở chính Hà Nội'),
    ('bui.thi.xuan', 'Trụ sở chính Hà Nội'),
    ('do.van.hai', 'Trụ sở chính Hà Nội'),
    ('nguyen.thi.thu', 'Trụ sở chính Hà Nội'),
    ('ho.xuan.phuc', 'Trụ sở chính Hà Nội'),
    ('ly.minh.chau', 'Trụ sở chính Hà Nội'),
    ('phung.van.tai', 'Chi nhánh TP. Hồ Chí Minh'),
    ('phung.van.tai', 'Chi nhánh Đà Nẵng'),
    ('chu.quang.huy', 'Chi nhánh TP. Hồ Chí Minh'),
    ('tang.bich.ngoc', 'Chi nhánh TP. Hồ Chí Minh'),
    ('mac.van.linh', 'Chi nhánh TP. Hồ Chí Minh'),
    ('trinh.quoc.bao', 'Chi nhánh Đà Nẵng'),
    ('luong.thanh.phong', 'Chi nhánh Đà Nẵng'),
    ('hanh.thi.yen', 'Chi nhánh Cần Thơ'),
    ('duong.van.khoi', 'Chi nhánh Hải Phòng')
) AS v(tk, ten_cn)
JOIN public.var_nhan_vien nv
  ON lower(trim(nv.ten_tai_khoan)) = lower(trim(v.tk))
JOIN public.var_chi_nhanh cn
  ON lower(trim(cn.ten_chi_nhanh)) = lower(trim(v.ten_cn))
WHERE NOT EXISTS (
  SELECT 1 FROM public.var_nhan_vien_chi_nhanh x
  WHERE x.nhan_vien_id = nv.id AND x.chi_nhanh_id = cn.id
);

COMMIT;
