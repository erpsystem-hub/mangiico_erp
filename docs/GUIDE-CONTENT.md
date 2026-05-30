# Quy ước nội dung trang Hướng dẫn module

## Nguyên tắc

- **Mọi module** trong submenu (vd. Hệ thống) **nên có trang hướng dẫn** khi product yêu cầu onboarding người dùng.
- Khi **cập nhật code hoặc nghiệp vụ của một module**, cập nhật nội dung hướng dẫn tương ứng.

## Nơi lưu nội dung

- **Chuỗi giao diện (tiếng Việt):** `features/<nhóm>/<module>/text.ts` hoặc `lib/text/ui.ts`, tra qua `txt()`.
- **Không** dùng `locales/*.json` — app chỉ tiếng Việt qua `lib/text`.

Key gợi ý cho hướng dẫn (nếu thêm section guide vào module text):

- `{module}.guide.intro` — câu ngắn dưới tiêu đề
- `{module}.guide.overview` — mục đích, đối tượng sử dụng
- `{module}.guide.permissions` — ai được xem/tạo/sửa/xóa/xuất
- `{module}.guide.workflow` — luồng thao tác, trạng thái
- `{module}.guide.quickStart` — 3–5 bước sử dụng nhanh
- `{module}.guide.faq` — câu hỏi thường gặp

## Module hiện có (Hệ thống)

| Route | Module | Ghi chú |
|-------|--------|---------|
| `/he-thong/nhan-vien` | Nhân viên | CRUD + import/export |
| `/he-thong/phong-ban` | Phòng ban | Pattern B — lọc theo cột |
| `/he-thong/chuc-vu` | Chức vụ | Liên kết phòng ban, cấp bậc |
| `/he-thong/phan-quyen` | Phân quyền | Ma trận quyền theo chức vụ |
| `/he-thong/thong-tin-to-chuc` | Thông tin tổ chức | Cài đặt branding |

Sub-feature không route: `features/he-thong/cap-bac/` — lookup dùng chung bởi Chức vụ / Nhân viên.

## Checklist khi thêm module mới

1. Implement module theo [`checklist-module.md`](checklist-module.md) (route, page, nghiệp vụ).
2. Thêm `text.ts` với key tiếng Việt; merge trong `lib/text/index.ts`.
3. Đăng ký route trong `App.tsx`, menu trong `lib/sidebar-menu.tsx` / `SystemDashboard.tsx`, phân quyền trong `permission-modules-config.ts`.
4. (Tuỳ chọn) Thêm section hướng dẫn vào `text.ts` nếu product cần trang guide.

## Checklist khi cập nhật module

1. Cập nhật code / nghiệp vụ.
2. Chỉnh `features/**/text.ts` cho đúng label, validation, thông báo.
3. Nếu thêm quyền hoặc trạng thái mới → cập nhật ma trận phân quyền và copy UI liên quan.
