#!/usr/bin/env sh
# Kiểm tra nhanh chuỗi UI tiếng Anh phổ biến còn sót trong features/ + components/
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PATTERN='"Export |"Save |"Cancel |"Delete |"Guest User|"Import dữ liệu"|"Export dữ liệu"|label: .Excel'
if rg -n "$PATTERN" "$ROOT/features" "$ROOT/components" --glob '*.tsx' --glob '*.ts' 2>/dev/null; then
  echo "audit-vi-ui: phát hiện chuỗi UI tiếng Anh — xem các dòng trên."
  exit 1
fi
echo "audit-vi-ui: OK"
