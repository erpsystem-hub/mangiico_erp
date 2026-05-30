#!/usr/bin/env bash
# Kiểm tra cấu hình Supabase + dữ liệu demo Hệ thống (phòng ban, chức vụ, nhân viên, phân quyền).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Kiểm tra .env.local"
ENV_FILE="$ROOT/.env.local"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "⚠️  Chưa có .env.local — copy từ .env.example và điền VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY"
  echo "   App sẽ chạy mock mode (danh sách trống)."
  exit 1
fi

# shellcheck disable=SC1090
source <(grep -E '^VITE_SUPABASE_(URL|ANON_KEY)=' "$ENV_FILE" | sed 's/^/export /')

URL="$(echo "${VITE_SUPABASE_URL:-}" | xargs)"
KEY="$(echo "${VITE_SUPABASE_ANON_KEY:-}" | xargs)"

if [[ -z "$URL" || -z "$KEY" ]]; then
  echo "⚠️  Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trong .env.local"
  exit 1
fi

if grep -q '^VITE_FORCE_MOCK=true' "$ENV_FILE" 2>/dev/null; then
  echo "⚠️  VITE_FORCE_MOCK=true — app đang ép mock mode dù có URL/key"
fi

MATRIX_ENABLED=false
if grep -qE '^VITE_USE_PERMISSION_MATRIX=true' "$ENV_FILE" 2>/dev/null; then
  MATRIX_ENABLED=true
  echo "✓ Ma trận phân quyền: bật (VITE_USE_PERMISSION_MATRIX=true)"
else
  echo "⚠️  Ma trận phân quyền TẮT — app chỉ cho xem, không CRUD (kể cả cap_bac=1)"
  echo "   Thêm vào .env.local: VITE_USE_PERMISSION_MATRIX=true rồi restart dev server"
fi

echo "✓ Env Supabase: ${URL}"

echo ""
echo "==> Kiểm tra migrations (project linked)"
if ! npx supabase@latest projects list >/dev/null 2>&1; then
  echo "⚠️  Chưa đăng nhập Supabase CLI — chạy: npx supabase login"
else
  echo "✓ Supabase CLI sẵn sàng"
fi

echo ""
echo "==> Đếm bản ghi Hệ thống trên DB linked"
SQL="SELECT
  (SELECT count(*)::int FROM public.var_phong_ban) AS phong_ban,
  (SELECT count(*)::int FROM public.var_chuc_vu) AS chuc_vu,
  (SELECT count(*)::int FROM public.var_nhan_vien) AS nhan_vien,
  (SELECT count(*)::int FROM public.var_phan_quyen) AS phan_quyen,
  (SELECT count(DISTINCT chuc_vu_id)::int FROM public.var_phan_quyen) AS chuc_vu_co_quyen;"

if ! RESULT=$(npx supabase@latest db query --linked -o csv "$SQL" 2>&1); then
  echo "⚠️  Không query được DB linked:"
  echo "$RESULT"
  echo ""
  echo "Gợi ý: npx supabase link && npx supabase db push"
  exit 1
fi

echo "$RESULT"

PB=$(echo "$RESULT" | tail -n 1 | cut -d',' -f1)
CV=$(echo "$RESULT" | tail -n 1 | cut -d',' -f2)
NV=$(echo "$RESULT" | tail -n 1 | cut -d',' -f3)
PQ=$(echo "$RESULT" | tail -n 1 | cut -d',' -f4)
PQ_CV=$(echo "$RESULT" | tail -n 1 | cut -d',' -f5)

if [[ "${PB:-0}" -eq 0 && "${CV:-0}" -eq 0 && "${NV:-0}" -eq 0 ]]; then
  echo ""
  echo "⚠️  DB trống — chạy seed demo:"
  echo "   npm run seed:demo"
  echo ""
  echo "Sau seed, tạo user Auth (Dashboard → Authentication → Users):"
  echo "   Email: nguyen.quoc.hung@gmail.com  |  Password: (đặt + Auto Confirm)"
  echo "   Đăng nhập app: username nguyen.quoc.hung"
  exit 1
fi

echo ""
echo "✓ Dữ liệu Hệ thống (phòng ban=$PB, chức vụ=$CV, nhân viên=$NV, phân quyền=$PQ dòng / $PQ_CV chức vụ)"

if [[ "${PQ:-0}" -eq 0 ]]; then
  echo "⚠️  Chưa có var_phan_quyen — chạy:"
  echo "   npx supabase db query --linked --file supabase/scripts/seed_var_phan_quyen.sql"
elif [[ "${CV:-0}" -gt 1 && "${PQ_CV:-0}" -le 1 ]]; then
  echo "⚠️  Phân quyền chỉ gán cho 1 chức vụ — nhân viên khác không vào được module khi ma trận bật."
  echo "   Gợi ý: npx supabase db query --linked --file supabase/scripts/seed_var_phan_quyen_other_roles.sql"
fi

if [[ "$MATRIX_ENABLED" == "false" && "${PQ:-0}" -gt 0 ]]; then
  echo ""
  echo "⚠️  DB đã có phân quyền nhưng ma trận client đang tắt — bật VITE_USE_PERMISSION_MATRIX=true"
fi

echo "  Nếu app vẫn trống: kiểm tra đã đăng nhập (RLS yêu cầu authenticated)."
