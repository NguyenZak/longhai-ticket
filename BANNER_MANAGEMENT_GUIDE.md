# 🎨 Hệ thống Quản lý Banner

## 📋 Tổng quan
Hệ thống quản lý banner cho phép admin thêm, sửa, xóa banner hiển thị trên trang chủ của website.

## 🚀 Tính năng

### ✅ Đã hoàn thành:
- ✅ **Database**: Bảng `banners` với đầy đủ fields
- ✅ **API**: CRUD operations cho banner
- ✅ **Upload**: Upload ảnh banner qua Cloudinary
- ✅ **CMS**: Giao diện quản lý banner trong admin panel
- ✅ **Frontend**: HeroSlider tự động load banner từ API
- ✅ **Responsive**: Hỗ trợ ảnh desktop và mobile riêng biệt

## 📁 Cấu trúc Files

### Backend (Laravel)
```
longhai-backend/
├── database/migrations/2025_01_15_000000_create_banners_table.php
├── app/Models/Banner.php
├── app/Http/Controllers/API/BannerController.php
├── database/seeders/BannerSeeder.php
└── routes/api.php
```

### CMS (Next.js)
```
longhai-cms/
├── app/(defaults)/banners/page.tsx
└── components/banners/
    ├── BannerForm.tsx
    └── BannerList.tsx
```

### User Frontend (Next.js)
```
longhai-user/
└── src/components/HeroSlider.tsx
```

## 🎯 Cách sử dụng

### 1. **Truy cập CMS**
```
http://localhost:3000/banners
```

### 2. **Thêm Banner Mới**
1. Click "Thêm Banner Mới"
2. Điền thông tin:
   - **Tiêu đề**: Tiêu đề banner
   - **Mô tả**: Mô tả ngắn
   - **Ảnh Desktop**: Ảnh cho desktop (1920x800)
   - **Ảnh Mobile**: Ảnh cho mobile (tùy chọn)
   - **Link URL**: Link khi click vào banner
   - **Text nút**: Text hiển thị trên nút
   - **Thứ tự**: Thứ tự hiển thị
   - **Ngày bắt đầu/kết thúc**: Thời gian hiển thị
   - **Trạng thái**: Bật/tắt banner

### 3. **Quản lý Banner**
- **Sửa**: Click "Sửa" để chỉnh sửa
- **Xóa**: Click "Xóa" để xóa banner
- **Sắp xếp**: Thay đổi "Thứ tự" để sắp xếp

## 🔧 API Endpoints

### Lấy banner cho trang chủ
```http
GET /api/banners
```

### Lấy tất cả banner (admin)
```http
GET /api/banners/all
```

### Thêm banner mới
```http
POST /api/banners
```

### Cập nhật banner
```http
PUT /api/banners/{id}
```

### Xóa banner
```http
DELETE /api/banners/{id}
```

### Upload ảnh banner
```http
POST /api/banners/upload
```

## 📊 Database Schema

```sql
CREATE TABLE banners (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NULL,
    description TEXT NULL,
    image VARCHAR(255) NOT NULL,
    mobile_image VARCHAR(255) NULL,
    link_url VARCHAR(255) NULL,
    button_text VARCHAR(100) NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMP NULL,
    end_date TIMESTAMP NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 🎨 Frontend Integration

### HeroSlider Component
- Tự động fetch banner từ API
- Hỗ trợ ảnh desktop/mobile responsive
- Auto-play với delay 4 giây
- Navigation buttons
- Fallback banners nếu API lỗi

### Responsive Design
- **Desktop**: Ảnh 1920x800
- **Mobile**: Ảnh mobile riêng (nếu có)
- **Auto-crop**: Cloudinary tự động crop ảnh

## 🔒 Bảo mật

### Validation Rules
- **Ảnh**: JPEG, PNG, JPG, GIF, WebP, max 5MB
- **URL**: Phải là URL hợp lệ
- **Text**: Giới hạn độ dài
- **Date**: End date phải sau start date

### Access Control
- Chỉ admin có thể quản lý banner
- Public API chỉ trả về banner active
- Upload qua Cloudinary với preset

## 🚀 Deployment

### 1. **Chạy Migration**
```bash
cd longhai-backend
php artisan migrate
```

### 2. **Seed Data**
```bash
php artisan db:seed --class=BannerSeeder
```

### 3. **Test API**
```bash
curl http://localhost:8000/api/banners
```

## 🎯 Best Practices

### Ảnh Banner
- **Desktop**: 1920x800px, format WebP/JPEG
- **Mobile**: 800x600px, format WebP/JPEG
- **File size**: < 500KB cho performance
- **Alt text**: Mô tả rõ ràng cho SEO

### Content
- **Tiêu đề**: Ngắn gọn, hấp dẫn
- **Mô tả**: 50-100 ký tự
- **CTA**: Rõ ràng, actionable
- **Link**: Đúng trang đích

### Performance
- **Lazy loading**: Ảnh load khi cần
- **CDN**: Cloudinary delivery
- **Caching**: API response caching
- **Optimization**: Auto-optimize ảnh

## 🔧 Troubleshooting

### Banner không hiển thị
1. Kiểm tra `is_active = true`
2. Kiểm tra `start_date` và `end_date`
3. Kiểm tra API response
4. Kiểm tra console errors

### Upload lỗi
1. Kiểm tra Cloudinary config
2. Kiểm tra file size < 5MB
3. Kiểm tra file format
4. Kiểm tra network connection

### Ảnh không load
1. Kiểm tra Cloudinary URL
2. Kiểm tra Next.js image domains
3. Kiểm tra CORS settings
4. Kiểm tra fallback images

## 📈 Analytics

### Metrics cần track
- **Impressions**: Số lần banner hiển thị
- **Clicks**: Số lần click vào banner
- **CTR**: Click-through rate
- **Performance**: Load time, file size

### Future Enhancements
- [ ] A/B testing banners
- [ ] Analytics tracking
- [ ] Banner scheduling
- [ ] Multi-language support
- [ ] Banner templates
- [ ] Performance optimization 