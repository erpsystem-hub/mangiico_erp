# Design system — Mangiico ERP

Nguồn truth cho token: [`lib/theme/tokens.ts`](../lib/theme/tokens.ts).

## Màu

- **Primary accent:** 8 preset trong `PRIMARY_COLOR_MAP`; user chọn từ menu tài khoản.
- **Semantic UI:** `--background`, `--primary`, `--muted`, `--destructive`… trong `index.css` (`:root` + `.dark`).
- **Badge / status:** `BADGE_COLOR_CLASSES`, `SEMANTIC_COLOR_DOT_HEX`, `SEMANTIC_COLOR_CHART_FILL` — dùng trong `EnumBadge`, `RadioGroup`, chart.

Default primary CSS khớp store (`blue` → `221.2 83.2% 53.3%`).

## Font

- **Default UI:** Be Vietnam Pro + Noto Sans fallback (`lib/theme/fonts.ts`, `store/useStore.ts`).
- **Pre-React boot:** `public/theme-boot.js` ↔ `lib/theme/tokens.ts` (tránh FOUC).
- **PDF export:** Noto Sans TTF (`public/fonts/NotoSans-Regular.ttf`) — riêng với UI font.
- **Print legacy:** Times New Roman (`lib/print/print-service.ts`).

## Typography

- Root scale: `html[data-text-size]` — small 14px / medium 16px / large 18px.
- Utilities: `.text-body-sm`, `.text-caption` trong `index.css`.
- Ramp tham chiếu: `TYPOGRAPHY` trong `tokens.ts`.

## Cài đặt người dùng

Trang [`pages/Settings.tsx`](../pages/Settings.tsx) tại route `/cai-dat` (layout `max-w-5xl mx-auto`, giống farm-erp/mttqvn): chế độ hiển thị sáng/tối/hệ thống, màu chủ đạo — persist `ui-storage`. Menu tài khoản chỉ có link tới trang này.

## Liên quan

- Export: [`docs/conventions-vi-export.md`](conventions-vi-export.md)
- Module CRUD: [`docs/checklist-module.md`](checklist-module.md)
