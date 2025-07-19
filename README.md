# Long Hải Ticket Management System

Hệ thống quản lý vé sự kiện và đặt chỗ cho Long Hải Promotion.

## 🚀 Tính năng chính

### Backend (Laravel)
- **API RESTful** cho quản lý sự kiện, vé, đặt chỗ
- **Authentication & Authorization** với Laravel Sanctum
- **Database Management** với SQLite
- **File Upload** cho hình ảnh sự kiện
- **Multi-price tickets** với nhiều loại vé khác nhau

### CMS (Next.js + TypeScript)
- **Dashboard quản lý** sự kiện, vé, người dùng
- **Event Management** với form tạo/sửa sự kiện
- **User Management** với phân quyền
- **Booking Management** theo dõi đặt chỗ
- **Modern UI** với Tailwind CSS

### User Frontend (Next.js)
- **Event Listing** hiển thị danh sách sự kiện
- **Event Details** chi tiết sự kiện và đặt vé
- **Booking System** hệ thống đặt chỗ
- **Responsive Design** tương thích mobile

## 🛠️ Công nghệ sử dụng

### Backend
- **Laravel 11** - PHP Framework
- **SQLite** - Database
- **Laravel Sanctum** - API Authentication
- **Cloudinary** - Cloud Image Storage & CDN
- **Docker** - Containerization

### Frontend
- **Next.js 14** - React Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP Client

## 📁 Cấu trúc dự án

```
longhai-ticket/
├── longhai-backend/          # Laravel API
├── longhai-cms/             # Next.js CMS
├── longhai-user/            # Next.js User Frontend
├── docker/                  # Docker configuration
├── database/                # Database migrations
└── docker-compose.yml       # Docker compose
```

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Docker & Docker Compose
- Node.js 18+
- PHP 8.2+

### 1. Clone repository
```bash
git clone https://github.com/NguyenZak/longhai-ticket.git
cd longhai-ticket
```

### 2. Chạy với Docker
```bash
# Development
./dev.sh

# Hoặc
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Setup Backend
```bash
cd longhai-backend
composer install
php artisan migrate --seed
php artisan serve
```

### 4. Setup CMS
```bash
cd longhai-cms
npm install
npm run dev
```

### 5. Setup User Frontend
```bash
cd longhai-user
npm install
npm run dev
```

## 🌐 URLs

- **Backend API**: http://localhost:8000
- **CMS Dashboard**: http://localhost:3000
- **User Frontend**: http://localhost:3001

## 📊 Database Schema

### Events Table
- `id` - Primary Key
- `title` - Tên sự kiện
- `slug` - URL friendly name
- `description` - Mô tả sự kiện
- `image` - Hình ảnh chính
- `venue` - Địa điểm
- `location_detail` - Chi tiết địa điểm
- `start_date`, `end_date` - Thời gian sự kiện
- `time` - Giờ diễn ra
- `status` - Trạng thái (preparing, active, ended)
- `display_status` - Trạng thái hiển thị tùy chỉnh
- `total_seats`, `available_seats` - Số ghế
- `price`, `price_display` - Giá vé
- `artists` - JSON danh sách nghệ sĩ
- `ticket_prices` - JSON các loại vé

### Users Table
- `id` - Primary Key
- `name`, `email` - Thông tin cá nhân
- `role` - Vai trò (admin, user)
- `permissions` - Quyền hạn
- `status` - Trạng thái tài khoản

### Bookings Table
- `id` - Primary Key
- `user_id` - ID người dùng
- `event_id` - ID sự kiện
- `ticket_id` - ID vé
- `quantity` - Số lượng
- `total_price` - Tổng tiền
- `status` - Trạng thái đặt chỗ

## 🔧 API Endpoints

### Events
- `GET /api/events` - Lấy danh sách sự kiện
- `GET /api/events/{id}` - Chi tiết sự kiện
- `POST /api/events` - Tạo sự kiện mới
- `PUT /api/events/{id}` - Cập nhật sự kiện
- `DELETE /api/events/{id}` - Xóa sự kiện

### Auth
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/logout` - Đăng xuất

### Bookings
- `GET /api/bookings` - Lấy danh sách đặt chỗ
- `POST /api/bookings` - Tạo đặt chỗ mới
- `PUT /api/bookings/{id}` - Cập nhật đặt chỗ

## 👥 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📝 License

Dự án này được phát triển cho Long Hải Promotion.

## 📞 Liên hệ

- **Email**: contact@longhai.com
- **Website**: https://longhai.com 
