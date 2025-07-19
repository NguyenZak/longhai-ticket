# 🎭 Hệ thống Quản lý Sơ đồ Ghế - Long Hai Ticket

## 📋 Tổng quan

Hệ thống quản lý sơ đồ ghế cho phép tạo, chỉnh sửa và quản lý sơ đồ ghế cho các sự kiện một cách trực quan và chuyên nghiệp.

## ✨ Tính năng chính

### 🎨 Vẽ ghế trực quan
- **Canvas-based editor** với giao diện giống Figma
- **Zoom và pan** để xem chi tiết
- **Grid system** để căn chỉnh chính xác
- **Real-time preview** khi vẽ

### 📋 Template có sẵn
- **Nhà hát** - Bố cục cong với VIP, Premium, Standard
- **Sân khấu** - Standing area + seated area
- **Hội nghị** - Bàn tròn cho meeting
- **Rạp chiếu phim** - Layout truyền thống

### 🎫 Quản lý loại vé
- **Gán ghế với loại vé** cụ thể
- **Tự động cập nhật màu sắc** theo loại vé
- **Hiển thị giá vé** trên từng ghế
- **Thống kê theo loại vé**

### ✏️ Tùy chỉnh nâng cao
- **Sửa tên ghế** và tên hàng
- **Vẽ hàng ghế** nhanh chóng
- **Import/Export** dữ liệu JSON
- **Undo/Redo** các thao tác

## 🏗️ Kiến trúc hệ thống

### Frontend (Next.js + TypeScript)
```
longhai-cms/
├── app/(defaults)/seating/
│   └── page.tsx                 # Trang chính quản lý seating
├── components/seating/
│   ├── SeatingCanvas.tsx        # Canvas vẽ ghế
│   └── SeatingEditor.tsx        # Editor với templates
└── lib/
    └── api.ts                   # API utilities
```

### Backend (Laravel)
```
longhai-backend/
├── app/Http/Controllers/API/
│   └── SeatingController.php    # API endpoints
├── app/Models/
│   └── Seat.php                 # Seat model
└── database/migrations/
    └── create_seats_table.php   # Database schema
```

## 🚀 Cách sử dụng

### 1. Truy cập hệ thống
- Đăng nhập vào CMS với quyền admin
- Vào menu **Seating** trong sidebar
- Chọn sự kiện cần quản lý sơ đồ ghế

### 2. Tạo sơ đồ ghế
- **Chọn template** phù hợp với loại sự kiện
- **Vẽ ghế** bằng cách click vào canvas
- **Vẽ hàng ghế** bằng công cụ "Draw Row"
- **Gán loại vé** cho từng ghế

### 3. Tùy chỉnh
- **Sửa tên ghế** bằng cách double-click
- **Thay đổi màu sắc** theo loại vé
- **Điều chỉnh vị trí** bằng drag & drop
- **Xóa ghế** bằng công cụ eraser

### 4. Lưu và xuất
- **Lưu sơ đồ** vào database
- **Xuất file JSON** để backup
- **Import file** để khôi phục

## 🔧 API Endpoints

### Events
```http
GET /api/events                    # Lấy danh sách sự kiện
GET /api/events/{id}              # Lấy chi tiết sự kiện
```

### Seating
```http
GET /api/seats/{eventId}          # Lấy sơ đồ ghế của sự kiện
POST /api/seats/{eventId}         # Lưu sơ đồ ghế
PUT /api/seats/{eventId}/{seatId} # Cập nhật ghế cụ thể
DELETE /api/seats/{eventId}/{seatId} # Xóa ghế
GET /api/seats/{eventId}/stats    # Thống kê ghế
```

### Ticket Types
```http
GET /api/tickets/types            # Lấy danh sách loại vé
```

## 📊 Database Schema

### Bảng `seats`
```sql
CREATE TABLE seats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_id BIGINT NOT NULL,
    seat_id VARCHAR(255) NOT NULL,
    row INT NOT NULL,
    column INT NOT NULL,
    x DECIMAL(10,2) NOT NULL,
    y DECIMAL(10,2) NOT NULL,
    width DECIMAL(10,2) NOT NULL,
    height DECIMAL(10,2) NOT NULL,
    status ENUM('available', 'occupied', 'reserved', 'disabled') DEFAULT 'available',
    price DECIMAL(10,2) NULL,
    category VARCHAR(255) NULL,
    color VARCHAR(7) NULL,
    ticket_type VARCHAR(255) NULL,
    seat_name VARCHAR(255) NULL,
    row_name VARCHAR(255) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE KEY unique_seat (event_id, seat_id)
);
```

## 🎨 Giao diện Figma-style

### Design System
- **Color Palette**: Blue gradients, modern grays
- **Typography**: Inter font family
- **Spacing**: 8px grid system
- **Shadows**: Subtle elevation effects
- **Animations**: Smooth transitions

### Components
- **Canvas**: Full-screen drawing area
- **Toolbar**: Professional controls
- **Sidebar**: Template and settings panels
- **Cards**: Information display
- **Buttons**: Modern action buttons

## 🧪 Testing

### File test API
```bash
# Mở file test-seating-api.html trong browser
# Đăng nhập với admin@longhai.com / password
# Test các API endpoints
```

### Manual testing
1. Tạo sự kiện mới
2. Vào trang Seating
3. Chọn template và vẽ ghế
4. Test các tính năng vẽ, sửa, xóa
5. Lưu và kiểm tra database

## 🔒 Bảo mật

- **Authentication**: Laravel Sanctum tokens
- **Authorization**: Role-based access control
- **Validation**: Input sanitization
- **CORS**: Configured for frontend domain

## 🚀 Deployment

### Frontend
```bash
cd longhai-cms
npm run build
npm start
```

### Backend
```bash
cd longhai-backend
php artisan migrate
php artisan serve
```

### Docker
```bash
docker-compose up -d
```

## 📝 Changelog

### v1.0.0 (2025-07-13)
- ✅ Canvas-based seating editor
- ✅ Template system (Theater, Concert, Conference, Cinema)
- ✅ Ticket type integration
- ✅ Figma-style UI/UX
- ✅ API endpoints for CRUD operations
- ✅ Import/Export functionality
- ✅ Real-time statistics

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📞 Support

- **Email**: support@longhai.com
- **Documentation**: [Wiki](https://github.com/longhai/seating-system/wiki)
- **Issues**: [GitHub Issues](https://github.com/longhai/seating-system/issues)

---

**Long Hai Ticket System** - Professional Event Management Solution 