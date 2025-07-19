# 🔧 Hướng dẫn Fix Lỗi Upload Ảnh

## 🚨 Vấn đề hiện tại
Upload ảnh đang bị lỗi do thiếu cấu hình Cloudinary. Hệ thống đã được chuyển từ lưu trữ local sang Cloudinary nhưng chưa được cấu hình đầy đủ.

## ✅ Đã Fix
- ✅ Xóa storage local cũ
- ✅ Cập nhật .gitignore
- ✅ Thêm route `/upload/map-image`
- ✅ Sửa CloudinaryService để handle missing config
- ✅ Cập nhật EventSeeder với Cloudinary URLs

## 🔧 Cần làm để Fix hoàn toàn

### 1. Thiết lập Cloudinary Account
1. Truy cập https://cloudinary.com
2. Đăng ký tài khoản miễn phí
3. Vào Dashboard để lấy credentials

### 2. Cấu hình Environment Variables
Thêm vào file `longhai-backend/.env`:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name
```

### 3. Restart Laravel Server
```bash
cd longhai-backend
php artisan config:clear
php artisan cache:clear
php artisan serve
```

### 4. Test Upload
1. Mở CMS tại http://localhost:3000
2. Tạo/sửa event
3. Upload ảnh sự kiện
4. Kiểm tra ảnh được upload lên Cloudinary

## 🧪 Test Scripts
Đã tạo các script test:
- `test-cloudinary.php` - Test cấu hình Cloudinary
- `test-upload.php` - Test API endpoints
- `test-api-upload.php` - Test upload thực tế

## 📋 Checklist
- [ ] Có tài khoản Cloudinary
- [ ] Đã thêm credentials vào .env
- [ ] Đã restart Laravel server
- [ ] Test upload thành công
- [ ] Ảnh hiển thị đúng trên frontend

## 🆘 Troubleshooting

### Lỗi "Cloudinary is not configured"
- Kiểm tra .env file có đúng credentials
- Restart Laravel server
- Clear config cache: `php artisan config:clear`

### Lỗi "Authentication required"
- Đảm bảo đã đăng nhập vào CMS
- Kiểm tra token trong localStorage

### Lỗi "Upload failed"
- Kiểm tra kết nối internet
- Kiểm tra Cloudinary account có active
- Xem logs Laravel: `tail -f storage/logs/laravel.log`

## 📞 Hỗ trợ
Nếu vẫn gặp vấn đề, hãy:
1. Kiểm tra logs Laravel
2. Chạy test scripts
3. Kiểm tra Network tab trong browser DevTools
4. Liên hệ support với thông tin lỗi chi tiết 