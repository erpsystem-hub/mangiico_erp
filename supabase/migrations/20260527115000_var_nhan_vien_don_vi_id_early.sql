-- Early add don_vi_id required by cong_viec_bao_cao_don_vi_phan_quyen (20260527120000).
-- Idempotent: repeated in 20260610160000_var_nhan_vien_don_vi_id.sql.
ALTER TABLE public.var_nhan_vien
  ADD COLUMN IF NOT EXISTS don_vi_id BIGINT REFERENCES public.var_ssn_xa_phuong (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_var_nhan_vien_don_vi ON public.var_nhan_vien (don_vi_id);
