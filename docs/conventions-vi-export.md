# Quy ước tiếng Việt và xuất báo cáo

## Ngôn ngữ giao diện

- Ứng dụng **chỉ dùng tiếng Việt** cho mọi chuỗi người dùng thấy.
- Nguồn chuỗi: [`lib/text/ui.ts`](../lib/text/ui.ts) + `features/**/text.ts`, tra qua `txt()`.
- **Không** thêm `locales/*.json` hay i18next.
- `getLocale()` / `getLanguage()` trong [`lib/utils.ts`](../lib/utils.ts) cố định `vi-VN` / `vi`.
- Comment code có thể tiếng Anh; label UI phải tiếng Việt.

Kiểm tra nhanh:

```bash
npm run audit:vi
```

## Xuất Excel / CSV / PDF

Dùng [`lib/export/`](../lib/export/) — **không** gọi trực tiếp jsPDF/xlsx trong component.

```ts
import { exportTable } from '@/lib/export';

await exportTable('xlsx', {
  columns: [{ key: 'ten', label: 'Tên' }],
  rows: [{ ten: 'Phòng ban A' }],
  fileName: 'Danh_Sach_Phong_Ban',
});
```

### Excel (`.xlsx`)

- UTF-8 native — hỗ trợ dấu tiếng Việt.
- Tên sheet: `Du_lieu` (`shared.export.sheetName`).
- Tên file: `{fileName}_{DD-MM-YYYY}.xlsx`.

### CSV

- BOM `\uFEFF` để Excel Windows mở đúng encoding.

### PDF

- Font **Noto Sans** tại [`public/fonts/NotoSans-Regular.ttf`](../public/fonts/NotoSans-Regular.ttf).
- Lazy load qua `fetch` — hỗ trợ đầy đủ dấu tiếng Việt.
- Ngày trong header: `DD/MM/YYYY`.

UI xuất dùng [`components/shared/ExportDialog.tsx`](../components/shared/ExportDialog.tsx).

## Supabase migrations

- Chỉ **1 baseline** trong `supabase/migrations/` — schema Hệ thống (`var_*`).
- Lịch sử cũ lưu tại `supabase/migrations_archive/legacy/` (không chạy).
