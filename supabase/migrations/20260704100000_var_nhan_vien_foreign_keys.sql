-- FK var_nhan_vien → var_phong_ban / var_chuc_vu để PostgREST embed:
--   pb:var_phong_ban!id_phong_ban(...)
--   bp:var_phong_ban!id_bo_phan(...)
--   cv:var_chuc_vu!id_chuc_vu(...)

-- Dọn FK mồ côi (nếu có) trước khi ràng buộc.
UPDATE public.var_nhan_vien nv
SET id_phong_ban = NULL
WHERE nv.id_phong_ban IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.var_phong_ban pb WHERE pb.id = nv.id_phong_ban);

UPDATE public.var_nhan_vien nv
SET id_bo_phan = NULL
WHERE nv.id_bo_phan IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.var_phong_ban pb WHERE pb.id = nv.id_bo_phan);

UPDATE public.var_nhan_vien nv
SET id_chuc_vu = NULL
WHERE nv.id_chuc_vu IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.var_chuc_vu cv WHERE cv.id = nv.id_chuc_vu);

ALTER TABLE public.var_nhan_vien
  DROP CONSTRAINT IF EXISTS var_nhan_vien_id_phong_ban_fkey,
  DROP CONSTRAINT IF EXISTS var_nhan_vien_id_bo_phan_fkey,
  DROP CONSTRAINT IF EXISTS var_nhan_vien_id_chuc_vu_fkey;

ALTER TABLE public.var_nhan_vien
  ADD CONSTRAINT var_nhan_vien_id_phong_ban_fkey
    FOREIGN KEY (id_phong_ban) REFERENCES public.var_phong_ban (id) ON DELETE SET NULL,
  ADD CONSTRAINT var_nhan_vien_id_bo_phan_fkey
    FOREIGN KEY (id_bo_phan) REFERENCES public.var_phong_ban (id) ON DELETE SET NULL,
  ADD CONSTRAINT var_nhan_vien_id_chuc_vu_fkey
    FOREIGN KEY (id_chuc_vu) REFERENCES public.var_chuc_vu (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_var_nhan_vien_bo_phan ON public.var_nhan_vien (id_bo_phan);
