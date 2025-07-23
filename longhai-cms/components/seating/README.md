# Seating Editor (Pretix-style Clone)

## Mô tả

Đây là bộ component React dựng lại giao diện và chức năng cơ bản của Pretix Seating Plan Editor, phù hợp cho dự án Next.js.

## Cấu trúc thư mục
```
longhai-cms/components/seating/
  Toolbar.tsx
  SidebarLeft.tsx
  SidebarRight.tsx
  SeatMapEditor.tsx
  index.tsx
```

## Cách sử dụng với Next.js

1. **Tạo page mới:**
```tsx
// pages/seating.tsx
import SeatingEditorPage from '../components/seating';

export default function SeatingPage() {
  return <SeatingEditorPage />;
}
```

2. **Cài đặt Tailwind CSS (nếu chưa có):**
- Làm theo hướng dẫn: https://tailwindcss.com/docs/guides/nextjs

3. **Chạy dự án:**
```
yarn dev
# hoặc
npm run dev
```

## Tính năng chính
- Toolbar: chọn công cụ, thêm ghế, undo/redo, zoom, v.v.
- SidebarLeft: quản lý Zone, Category
- SidebarRight: chỉnh sửa Plan, upload ảnh nền, xem thuộc tính
- SeatMapEditor: vẽ sơ đồ ghế, pan/zoom, chọn/thêm ghế

## Tuỳ biến
- Có thể truyền props cho từng component để mở rộng chức năng.
- Dummy data, có thể thay bằng API/backend.

---
**Bản dựng lại bởi AI dựa trên Pretix Seating Editor** 