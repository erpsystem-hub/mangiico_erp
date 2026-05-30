-- Drop removed modules: MTTQ, Viết bài, Giao việc, Tỉnh thành/Xã phường
-- Safe to re-run: IF EXISTS / IF EXISTS on all objects.

-- 1. Clean permission rows for removed modules
DELETE FROM public.var_phan_quyen
WHERE module_key IN (
  -- MTTQ
  'danh-sach-tap-huan', 'danh-sach-khen-thuong', 'nhiem-ky', 'ky-hop',
  'danh-sach-uy-vien', 'bao-cao-uy-vien', 'danh-sach-can-bo', 'bao-cao-can-bo',
  'thiet-lap-cai-dat', 'dot-cuu-tro', 'hang-hoa', 'nhap-xuat-kho', 'ton-kho',
  'danh-sach-kho', 'don-vi-cuu-tro', 'don-vi-ho-tro', 'bao-cao-ho-tro',
  'danh-sach-tang-luong', 'thiet-lap-luong',
  -- Viết bài
  'bai-viet', 'nhuan-but-viet-bai', 'hoa-hong-viet-bai', 'bc-thong-ke-bai-viet', 'thiet-lap-bai-viet',
  -- Giao việc
  'cong-viec', 'bao-cao-cong-viec', 'chuong-trinh-nam',
  -- Trang thông tin khác
  'tin-tuc-mttq', 'zalo-oa', 'mat-tran-so', 'quan-ly-van-ban',
  -- Địa bàn
  'danh-sach-tinh-thanh'
)
OR module_key LIKE 'mat-tran-to-quoc/%'
OR module_key LIKE 'quan-ly-viet-bai/%'
OR module_key LIKE 'quan-ly-giao-viec/%'
OR module_key LIKE 'trang-thong-tin-khac/%'
OR module_key LIKE 'he-thong/danh-sach-tinh-thanh%';

-- 2. Drop views
DROP VIEW IF EXISTS public.v_diem_danh_ky_hop_summary CASCADE;
DROP VIEW IF EXISTS public.v_diem_danh_uy_vien_summary CASCADE;
DROP VIEW IF EXISTS public.kho_ton_kho_view CASCADE;
DROP VIEW IF EXISTS public.v_cong_viec_bao_cao CASCADE;
DROP VIEW IF EXISTS public.v_xa_phuong_min CASCADE;

-- 3. Drop RPCs / trigger functions (dynamic for overloaded signatures)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = ANY(ARRAY[
        'get_diem_danh_for_nhiem_ky',
        'get_xa_counts_by_tinh_thanh',
        'get_bai_viet_page',
        'get_cong_viec_page',
        'cong_viec_bao_cao_kpi',
        'cong_viec_bao_cao_trend',
        'cong_viec_bao_cao_phan_bo_trang_thai',
        'cong_viec_bao_cao_phan_bo_muc_do',
        'cong_viec_bao_cao_top_trach_nhiem',
        'cong_viec_bao_cao_top_nguoi_tao',
        'cong_viec_bao_cao_lookup',
        'cong_viec_bao_cao_filter_options',
        'mttq_can_bo_validate_thiet_lap_loai',
        'mttq_khen_thuong_ct_touch_parent',
        'mttq_lop_tap_huan_ct_touch_parent',
        'mttq_uy_vien_uy_ban_touch_nhiem_ky',
        'bai_viet_danh_sach_validate_khac_loai',
        'bai_viet_danh_sach_enforce_don_gia',
        'fn_kho_kiem_tra_ton_kho',
        'fn_kho_sinh_so_phieu',
        'rpc_kho_tao_phieu_nhap_xuat',
        'rpc_kho_cap_nhat_phieu_nhap_xuat',
        'luong_thiet_lap_ngach_seed_bac'
      ])
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.sig || ' CASCADE';
  END LOOP;
END $$;

-- 4. Drop tables (child → parent)
DROP TABLE IF EXISTS public.mttq_diem_danh_uy_vien CASCADE;
DROP TABLE IF EXISTS public.mttq_uy_vien_uy_ban CASCADE;
DROP TABLE IF EXISTS public.mttq_ky_hop CASCADE;
DROP TABLE IF EXISTS public.mttq_nhiem_ky CASCADE;
DROP TABLE IF EXISTS public.mttq_lop_tap_huan_ct CASCADE;
DROP TABLE IF EXISTS public.mttq_lop_tap_huan CASCADE;
DROP TABLE IF EXISTS public.mttq_khen_thuong_ct CASCADE;
DROP TABLE IF EXISTS public.mttq_khen_thuong CASCADE;
DROP TABLE IF EXISTS public.mttq_tang_luong CASCADE;
DROP TABLE IF EXISTS public.mttq_can_bo CASCADE;
DROP TABLE IF EXISTS public.mttq_thiet_lap CASCADE;

DROP TABLE IF EXISTS public.kho_nhap_xuat_kho_ct CASCADE;
DROP TABLE IF EXISTS public.kho_nhap_xuat_kho CASCADE;
DROP TABLE IF EXISTS public.kho_danh_sach_hang_hoa CASCADE;
DROP TABLE IF EXISTS public.kho_danh_muc_hang_hoa CASCADE;
DROP TABLE IF EXISTS public.kho_dot_cuu_tro CASCADE;
DROP TABLE IF EXISTS public.kho_don_vi_cuu_tro CASCADE;
DROP TABLE IF EXISTS public.kho_danh_sach_kho CASCADE;

DROP TABLE IF EXISTS public.luong_thiet_lap_bac_luong CASCADE;
DROP TABLE IF EXISTS public.luong_thiet_lap_ngach_luong CASCADE;
DROP TABLE IF EXISTS public.luong_thiet_lap_cau_hinh CASCADE;

DROP TABLE IF EXISTS public.bai_viet_danh_sach CASCADE;
DROP TABLE IF EXISTS public.bai_viet_thiet_lap_khac CASCADE;
DROP TABLE IF EXISTS public.bai_viet_thiet_lap_the_loai CASCADE;

DROP TABLE IF EXISTS public.cong_viec_danh_sach CASCADE;
DROP TABLE IF EXISTS public.chuong_trinh_nam CASCADE;

-- 5. Remove don_vi_id from nhân viên (FK to var_ssn_xa_phuong)
ALTER TABLE public.var_nhan_vien DROP COLUMN IF EXISTS don_vi_id;

-- 6. Drop địa bàn catalog
DROP TABLE IF EXISTS public.var_ssn_xa_phuong CASCADE;
DROP TABLE IF EXISTS public.var_ssn_tinh_thanh CASCADE;
