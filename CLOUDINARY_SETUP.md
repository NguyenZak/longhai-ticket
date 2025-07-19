# Cloudinary Setup Guide

Hướng dẫn cấu hình Cloudinary cho Long Hai Ticket Management System.

## 1. Tạo tài khoản Cloudinary

1. Truy cập [Cloudinary](https://cloudinary.com/)
2. Đăng ký tài khoản miễn phí
3. Xác nhận email

## 2. Lấy thông tin cấu hình

Sau khi đăng nhập vào Cloudinary Dashboard:

1. **Cloud Name**: Tìm trong phần "Account Details"
2. **API Key**: Tìm trong phần "Account Details" 
3. **API Secret**: Tìm trong phần "Account Details"

## 3. Cấu hình Upload Preset

1. Vào **Settings** > **Upload**
2. Tạo **Upload Preset** mới:
   - Name: `longhai_events` (hoặc tên tùy chọn)
   - Signing Mode: `Unsigned`
   - Folder: `longhai-events`
   - Allowed formats: `jpg, png, gif, webp`
   - Max file size: `10MB`

## 4. Cấu hình Environment Variables

Thêm các biến môi trường vào file `.env`:

```env
# Cloudinary Configuration
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=longhai_events
```

## 5. Cấu hình Cloudinary Service

File `app/Services/CloudinaryService.php` đã được tạo với các tính năng:

- ✅ Upload ảnh với optimization
- ✅ Upload nhiều ảnh cùng lúc
- ✅ Xóa ảnh
- ✅ Tạo URL với transformations
- ✅ Hỗ trợ các kích thước khác nhau

## 6. API Endpoints

### Upload Event Image
```
POST /api/upload/event-image
Content-Type: multipart/form-data
Body: { image: File }
```

### Upload Artist Image
```
POST /api/upload/artist-image
Content-Type: multipart/form-data
Body: { image: File }
```

### Upload Map Image
```
POST /api/upload/map-image
Content-Type: multipart/form-data
Body: { image: File }
```

### Delete Image
```
POST /api/upload/delete-image
Content-Type: application/json
Body: { public_id: "cloudinary_public_id" }
```

## 7. Response Format

```json
{
  "success": true,
  "message": "Image uploaded successfully to Cloudinary",
  "data": {
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/longhai-events/image.jpg",
    "public_id": "longhai-events/image",
    "width": 1200,
    "height": 800,
    "format": "jpg",
    "bytes": 245760,
    "thumbnail_url": "https://res.cloudinary.com/your-cloud/image/upload/c_fill,w_150,h_150/longhai-events/image.jpg",
    "small_url": "https://res.cloudinary.com/your-cloud/image/upload/c_fill,w_300,h_200/longhai-events/image.jpg",
    "medium_url": "https://res.cloudinary.com/your-cloud/image/upload/c_fill,w_800,h_600/longhai-events/image.jpg",
    "large_url": "https://res.cloudinary.com/your-cloud/image/upload/c_fill,w_1200,h_800/longhai-events/image.jpg"
  }
}
```

## 8. Image Transformations

Cloudinary tự động tối ưu ảnh với:

- **Auto format**: Chuyển đổi sang format tối ưu (WebP, AVIF)
- **Auto quality**: Tự động điều chỉnh chất lượng
- **Responsive images**: Nhiều kích thước cho responsive design
- **CDN**: Phân phối toàn cầu

## 9. Folder Structure

```
longhai-events/     # Ảnh sự kiện chính
longhai-artists/    # Ảnh nghệ sĩ
longhai-maps/       # Ảnh sơ đồ địa điểm
```

## 10. Security

- ✅ Upload Preset với unsigned uploads
- ✅ File type validation
- ✅ File size limits
- ✅ Folder organization
- ✅ Automatic optimization

## 11. Testing

1. Chạy migration và seeder:
```bash
php artisan migrate:fresh --seed
```

2. Test upload qua EventForm trong CMS

3. Kiểm tra ảnh đã được upload lên Cloudinary Dashboard

## 12. Troubleshooting

### Lỗi "Invalid API Key"
- Kiểm tra lại API Key và Secret trong .env
- Đảm bảo Cloud Name đúng

### Lỗi "Upload Preset not found"
- Tạo Upload Preset trong Cloudinary Dashboard
- Kiểm tra tên preset trong .env

### Lỗi "File too large"
- Tăng giới hạn file size trong Upload Preset
- Hoặc giảm kích thước ảnh trước khi upload

### Lỗi "Invalid file type"
- Kiểm tra Allowed formats trong Upload Preset
- Đảm bảo file là ảnh hợp lệ

## 13. Performance Tips

1. **Sử dụng WebP format** cho ảnh web
2. **Optimize ảnh** trước khi upload
3. **Sử dụng CDN URLs** cho production
4. **Cache transformations** để tăng tốc độ

## 14. Monitoring

Theo dõi usage trong Cloudinary Dashboard:
- Storage usage
- Bandwidth usage
- Transformations count
- Upload count

---

**Lưu ý**: Cloudinary có giới hạn miễn phí 25GB storage và 25GB bandwidth/tháng. Nếu vượt quá, cần upgrade plan. 