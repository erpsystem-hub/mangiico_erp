-- Seed demo Hệ thống: ~20 dòng/bảng (phòng ban 2 cấp, chức vụ, nhân viên).
-- Idempotent: bỏ qua bản ghi trùng tên / tài khoản.
-- Không tạo Supabase Auth — chỉ INSERT vào var_phong_ban, var_chuc_vu, var_nhan_vien.
--
-- SAU KHI SEED: tạo user Auth trong Dashboard → Authentication → Users → Add user
--   Email:    <ten_tai_khoan>@gmail.com   (vd. nguyen.quoc.hung@gmail.com)
--   Password: (đặt mật khẩu, bật Auto Confirm User)
--   Đăng nhập app: tên đăng nhập = phần trước @ (vd. nguyen.quoc.hung), không cần gõ @gmail.com
--
-- RLS: bảng nghiệp vụ chỉ SELECT khi role `authenticated` — phải đăng nhập mới thấy dữ liệu.
--
-- Chạy:
--   npm run seed:demo
-- hoặc:
--   npx supabase@latest db query --linked --file supabase/scripts/seed_he_thong_demo.sql
--
-- Sau seed (tùy chọn phân quyền mẫu):
--   supabase db execute --linked --file supabase/scripts/seed_var_phan_quyen.sql

BEGIN;

-- ============================================================================
-- 1. Phòng ban cấp 1 (5)
-- ============================================================================
INSERT INTO public.var_phong_ban (ten_phong_ban, cha_id, thu_tu, trang_thai)
SELECT v.ten, NULL, v.thu_tu, 'Đang hoạt động'
FROM (
  VALUES
    ('Ban Giám đốc', 1),
    ('Phòng Hành chính - Tổng hợp', 2),
    ('Phòng Tài chính - Kế toán', 3),
    ('Phòng Kinh doanh', 4),
    ('Phòng Kỹ thuật - Vận hành', 5)
) AS v(ten, thu_tu)
WHERE NOT EXISTS (
  SELECT 1 FROM public.var_phong_ban p
  WHERE lower(trim(p.ten_phong_ban)) = lower(trim(v.ten))
);

-- ============================================================================
-- 2. Phòng ban cấp 2 (15)
-- ============================================================================
INSERT INTO public.var_phong_ban (ten_phong_ban, cha_id, thu_tu, trang_thai)
SELECT v.ten, parent.id, v.thu_tu, 'Đang hoạt động'
FROM (
  VALUES
    ('Ban Giám đốc', 'Văn phòng Ban Giám đốc', 1),
    ('Ban Giám đốc', 'Phòng Pháp chế', 2),
    ('Ban Giám đốc', 'Bộ phận ISO', 3),
    ('Phòng Hành chính - Tổng hợp', 'Bộ phận Nhân sự', 1),
    ('Phòng Hành chính - Tổng hợp', 'Bộ phận Văn thư - Lưu trữ', 2),
    ('Phòng Hành chính - Tổng hợp', 'Bộ phận Hành chính', 3),
    ('Phòng Tài chính - Kế toán', 'Bộ phận Kế toán tổng hợp', 1),
    ('Phòng Tài chính - Kế toán', 'Bộ phận Thu chi', 2),
    ('Phòng Tài chính - Kế toán', 'Bộ phận Ngân sách', 3),
    ('Phòng Kinh doanh', 'Bộ phận Bán hàng', 1),
    ('Phòng Kinh doanh', 'Bộ phận Marketing', 2),
    ('Phòng Kinh doanh', 'Bộ phận Chăm sóc khách hàng', 3),
    ('Phòng Kỹ thuật - Vận hành', 'Bộ phận Sản xuất', 1),
    ('Phòng Kỹ thuật - Vận hành', 'Bộ phận Bảo trì', 2),
    ('Phòng Kỹ thuật - Vận hành', 'Bộ phận Kiểm soát chất lượng', 3)
) AS v(parent_ten, ten, thu_tu)
JOIN public.var_phong_ban parent
  ON lower(trim(parent.ten_phong_ban)) = lower(trim(v.parent_ten))
WHERE NOT EXISTS (
  SELECT 1 FROM public.var_phong_ban p
  WHERE lower(trim(p.ten_phong_ban)) = lower(trim(v.ten))
);

-- ============================================================================
-- 3. Chức vụ (20 — một chức vụ / phòng ban)
-- ============================================================================
INSERT INTO public.var_chuc_vu (ten_chuc_vu, phong_ban_id, cap_bac, cap_quan_ly, thu_tu, trang_thai)
SELECT v.ten_cv, pb.id, v.cap_bac, v.cap_quan_ly, v.thu_tu, 'Đang hoạt động'
FROM (
  VALUES
    ('Ban Giám đốc', 'Giám đốc điều hành', 1::smallint, 'Tỉnh', 1),
    ('Văn phòng Ban Giám đốc', 'Thư ký Ban Giám đốc', 4, 'Tỉnh', 2),
    ('Phòng Pháp chế', 'Trưởng phòng Pháp chế', 3, 'Tỉnh', 3),
    ('Bộ phận ISO', 'Chuyên viên ISO', 4, 'Xã phường', 4),
    ('Phòng Hành chính - Tổng hợp', 'Trưởng phòng Hành chính', 3, 'Tỉnh', 5),
    ('Bộ phận Nhân sự', 'Chuyên viên Nhân sự', 4, 'Xã phường', 6),
    ('Bộ phận Văn thư - Lưu trữ', 'Chuyên viên Văn thư', 4, 'Xã phường', 7),
    ('Bộ phận Hành chính', 'Nhân viên Hành chính', 4, 'Xã phường', 8),
    ('Phòng Tài chính - Kế toán', 'Trưởng phòng Tài chính', 3, 'Tỉnh', 9),
    ('Bộ phận Kế toán tổng hợp', 'Kế toán trưởng', 3, 'Tỉnh', 10),
    ('Bộ phận Thu chi', 'Chuyên viên Thu chi', 4, 'Xã phường', 11),
    ('Bộ phận Ngân sách', 'Chuyên viên Ngân sách', 4, 'Xã phường', 12),
    ('Phòng Kinh doanh', 'Trưởng phòng Kinh doanh', 3, 'Tỉnh', 13),
    ('Bộ phận Bán hàng', 'Nhân viên Kinh doanh', 4, 'Xã phường', 14),
    ('Bộ phận Marketing', 'Chuyên viên Marketing', 4, 'Xã phường', 15),
    ('Bộ phận Chăm sóc khách hàng', 'Chuyên viên CSKH', 4, 'Xã phường', 16),
    ('Phòng Kỹ thuật - Vận hành', 'Trưởng phòng Kỹ thuật', 3, 'Tỉnh', 17),
    ('Bộ phận Sản xuất', 'Giám sát Sản xuất', 3, 'Tỉnh', 18),
    ('Bộ phận Bảo trì', 'Kỹ thuật viên Bảo trì', 4, 'Xã phường', 19),
    ('Bộ phận Kiểm soát chất lượng', 'Chuyên viên QA', 4, 'Xã phường', 20)
) AS v(ten_pb, ten_cv, cap_bac, cap_quan_ly, thu_tu)
JOIN public.var_phong_ban pb
  ON lower(trim(pb.ten_phong_ban)) = lower(trim(v.ten_pb))
WHERE NOT EXISTS (
  SELECT 1 FROM public.var_chuc_vu cv
  WHERE lower(trim(cv.ten_chuc_vu)) = lower(trim(v.ten_cv))
);

-- ============================================================================
-- 4. Nhân viên (20 — một người / phòng ban)
-- id_phong_ban: phòng cấp 1 (cha hoặc chính nó)
-- id_bo_phan: bộ phận cấp 2 (hoặc bộ phận con đại diện nếu gán ở cấp 1)
-- ============================================================================
INSERT INTO public.var_nhan_vien (
  ten_tai_khoan, ho_va_ten, id_phong_ban, id_bo_phan, id_chuc_vu, trang_thai
)
SELECT
  v.tk,
  v.ho_ten,
  pb_cha.id,
  pb_bo.id,
  cv.id,
  v.trang_thai
FROM (
  VALUES
    ('nguyen.quoc.hung', 'Nguyễn Quốc Hùng', 'Ban Giám đốc', 'Văn phòng Ban Giám đốc', 'Giám đốc điều hành', 'Hoạt động'),
    ('tran.thi.mai', 'Trần Thị Mai', 'Ban Giám đốc', 'Văn phòng Ban Giám đốc', 'Thư ký Ban Giám đốc', 'Hoạt động'),
    ('pham.van.duc', 'Phạm Văn Đức', 'Ban Giám đốc', 'Phòng Pháp chế', 'Trưởng phòng Pháp chế', 'Hoạt động'),
    ('le.thi.hong', 'Lê Thị Hồng', 'Ban Giám đốc', 'Bộ phận ISO', 'Chuyên viên ISO', 'Hoạt động'),
    ('hoang.minh.tuan', 'Hoàng Minh Tuấn', 'Phòng Hành chính - Tổng hợp', 'Bộ phận Nhân sự', 'Trưởng phòng Hành chính', 'Hoạt động'),
    ('dang.thi.lan', 'Đặng Thị Lan', 'Phòng Hành chính - Tổng hợp', 'Bộ phận Nhân sự', 'Chuyên viên Nhân sự', 'Hoạt động'),
    ('vo.thanh.nam', 'Võ Thành Nam', 'Phòng Hành chính - Tổng hợp', 'Bộ phận Văn thư - Lưu trữ', 'Chuyên viên Văn thư', 'Hoạt động'),
    ('bui.thi.xuan', 'Bùi Thị Xuân', 'Phòng Hành chính - Tổng hợp', 'Bộ phận Hành chính', 'Nhân viên Hành chính', 'Hoạt động'),
    ('do.van.hai', 'Đỗ Văn Hải', 'Phòng Tài chính - Kế toán', 'Bộ phận Kế toán tổng hợp', 'Trưởng phòng Tài chính', 'Hoạt động'),
    ('nguyen.thi.thu', 'Nguyễn Thị Thu', 'Phòng Tài chính - Kế toán', 'Bộ phận Kế toán tổng hợp', 'Kế toán trưởng', 'Hoạt động'),
    ('ho.xuan.phuc', 'Hồ Xuân Phúc', 'Phòng Tài chính - Kế toán', 'Bộ phận Thu chi', 'Chuyên viên Thu chi', 'Hoạt động'),
    ('ly.minh.chau', 'Lý Minh Châu', 'Phòng Tài chính - Kế toán', 'Bộ phận Ngân sách', 'Chuyên viên Ngân sách', 'Khóa'),
    ('phung.van.tai', 'Phùng Văn Tài', 'Phòng Kinh doanh', 'Bộ phận Bán hàng', 'Trưởng phòng Kinh doanh', 'Hoạt động'),
    ('chu.quang.huy', 'Chu Quang Huy', 'Phòng Kinh doanh', 'Bộ phận Bán hàng', 'Nhân viên Kinh doanh', 'Hoạt động'),
    ('tang.bich.ngoc', 'Tăng Bích Ngọc', 'Phòng Kinh doanh', 'Bộ phận Marketing', 'Chuyên viên Marketing', 'Hoạt động'),
    ('mac.van.linh', 'Mạc Văn Linh', 'Phòng Kinh doanh', 'Bộ phận Chăm sóc khách hàng', 'Chuyên viên CSKH', 'Hoạt động'),
    ('trinh.quoc.bao', 'Trịnh Quốc Bảo', 'Phòng Kỹ thuật - Vận hành', 'Bộ phận Sản xuất', 'Trưởng phòng Kỹ thuật', 'Hoạt động'),
    ('luong.thanh.phong', 'Lương Thanh Phong', 'Phòng Kỹ thuật - Vận hành', 'Bộ phận Sản xuất', 'Giám sát Sản xuất', 'Hoạt động'),
    ('hanh.thi.yen', 'Hành Thị Yến', 'Phòng Kỹ thuật - Vận hành', 'Bộ phận Bảo trì', 'Kỹ thuật viên Bảo trì', 'Khóa'),
    ('duong.van.khoi', 'Dương Văn Khôi', 'Phòng Kỹ thuật - Vận hành', 'Bộ phận Kiểm soát chất lượng', 'Chuyên viên QA', 'Hoạt động')
) AS v(tk, ho_ten, ten_pb_cha, ten_pb_bo, ten_cv, trang_thai)
JOIN public.var_phong_ban pb_cha
  ON lower(trim(pb_cha.ten_phong_ban)) = lower(trim(v.ten_pb_cha))
JOIN public.var_phong_ban pb_bo
  ON lower(trim(pb_bo.ten_phong_ban)) = lower(trim(v.ten_pb_bo))
JOIN public.var_chuc_vu cv
  ON lower(trim(cv.ten_chuc_vu)) = lower(trim(v.ten_cv))
WHERE NOT EXISTS (
  SELECT 1 FROM public.var_nhan_vien nv
  WHERE lower(trim(nv.ten_tai_khoan)) = lower(trim(v.tk))
);

COMMIT;
