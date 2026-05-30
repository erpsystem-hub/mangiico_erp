---
name: tanstack-query-crud-list-detail
description: Chuẩn hoá TanStack Query cho module CRUD (list + detail drawer + form)—query keys, transactional options, cache mutation, onView seed, lỗi list ErrorState, đóng form không invalidate thừa. Dùng khi tạo/sửa features/**/hooks/use-*.ts hoặc index list module.
---

# TanStack Query — CRUD list + detail + form

## Khi nào dùng skill này

- Tạo hoặc review module có **bảng danh sách**, **drawer chi tiết**, **drawer form** (CRUD).
- Sửa hook `use-*` hoặc `index.tsx` trang list có `useQuery` / `useMutation`.

## Checklist nhanh

1. **`lib/query-keys.ts`**: thêm `moduleKey: { all, detail(id) }`.
2. **`hooks/use-*.ts`**
   - `useQuery` list: spread **`transactionalCrudListQueryOptions`** cho CRUD Supabase.
   - Mutations: **`setQueryData`** list/detail; delete **`removeQueries`** từng `detail(id)`.
3. **`index.tsx`**
   - **`onView`**: `queryClient.setQueryData(queryKeys.*.detail(item.id), item)` rồi `setViewingId`.
   - List: `isError` + **`ErrorState`** + `refetch`.
   - **`handleCloseForm`**: không `invalidateQueries(detail)` khi Hủy nếu cache đã khớp.
4. **Egress**: đọc [`.cursor/rules/egress-checklist.mdc`](mdc:.cursor/rules/egress-checklist.mdc) mục **C**.

## Ví dụ tham chiếu trong repo

- Nhân viên: `features/he-thong/nhan-vien/` (list + detail + form, avatar storage).
- Phòng ban: `features/he-thong/phong-ban/` (tree, RPC path level).
- Chức vụ: `features/he-thong/chuc-vu/`.
