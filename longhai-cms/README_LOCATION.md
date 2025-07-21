# Tính năng Chọn Địa điểm

## Tổng quan

Tính năng chọn địa điểm đã được tích hợp vào form sự kiện, sử dụng dữ liệu từ [Đơn vị hành chính Việt Nam](https://github.com/thanhtrungit97/dvhcvn.git) được lưu trữ local. Người dùng có thể chọn giữa hai tùy chọn: chọn từ dropdown hoặc nhập thủ công.

## Các thành phần

### 1. LocationService (`lib/locationService.ts`)

Service để load dữ liệu địa điểm từ file local:

- `loadData()`: Load dữ liệu từ file `/data/data.json`
- `getProvinces()`: Lấy danh sách tỉnh/thành phố
- `getWards(provinceId)`: Lấy danh sách phường/xã theo tỉnh
- `getFullLocation(provinceId, wardId)`: Tạo địa chỉ đầy đủ

### 2. LocationSelector (`components/events/LocationSelector.tsx`)

Component với hai tùy chọn chọn địa điểm:

#### Tùy chọn 1: Chọn từ danh sách
- Dropdown 1: Chọn Tỉnh/Thành phố
- Dropdown 2: Chọn Phường/Xã (hiển thị sau khi chọn tỉnh)

#### Tùy chọn 2: Nhập thủ công
- Input text để nhập địa điểm tự do

### 3. VenueDisplay (`components/events/VenueDisplay.tsx`)

Component hiển thị địa điểm với tooltip:

- Hiển thị icon địa điểm
- Tooltip khi hover để xem địa chỉ đầy đủ
- Xử lý trường hợp chưa có địa điểm

## Cách sử dụng

### Trong form sự kiện

```tsx
import LocationSelector from '@/components/events/LocationSelector';

// Trong form
<LocationSelector
  value={formData.venue}
  onChange={(value) => setFormData(prev => ({ ...prev, venue: value }))}
  className="w-full"
/>
```

### Hiển thị địa điểm

```tsx
import VenueDisplay from '@/components/events/VenueDisplay';

// Trong bảng
<VenueDisplay venue={event.venue} />
```

## Tính năng

### 1. Toggle giữa hai chế độ
- **Chọn từ danh sách**: Sử dụng dropdown để chọn từ dữ liệu có sẵn
- **Nhập thủ công**: Nhập địa điểm tự do theo ý muốn

### 2. Cache dữ liệu
- Dữ liệu được cache để tránh load lại nhiều lần
- Cache được lưu trong memory

### 3. Validation
- Bắt buộc chọn đầy đủ 2 cấp khi dùng dropdown: Tỉnh → Phường/Xã
- Hoặc nhập địa điểm khi dùng chế độ thủ công
- Hiển thị thông báo lỗi nếu không thể load dữ liệu

### 4. UX/UI
- Radio buttons để chọn chế độ
- Loading state khi đang load dữ liệu
- Disabled state cho dropdown chưa sẵn sàng
- Tooltip hiển thị địa chỉ đầy đủ
- Icon địa điểm để dễ nhận biết

### 5. Responsive
- Hoạt động tốt trên mobile và desktop
- Dropdown tự động điều chỉnh kích thước

### 6. Tự động phát hiện chế độ
- Nếu có giá trị ban đầu không khớp với dropdown, tự động chuyển sang chế độ nhập thủ công
- Chuyển đổi mượt mà giữa hai chế độ

## Dữ liệu

Dữ liệu được lưu trữ trong file:
- `public/data/data.json` - File dữ liệu địa điểm Việt Nam

## Cấu trúc dữ liệu

### Province
```json
{
  "province_code": "01",
  "name": "Thành phố Hà Nội",
  "short_name": "Thành phố Hà Nội",
  "code": "HNI",
  "place_type": "Thành phố Trung Ương",
  "wards": [...]
}
```

### Ward
```json
{
  "ward_code": "00004",
  "name": "Phường Ba Đình",
  "province_code": "01"
}
```

## Lưu ý

1. **Dữ liệu local**: Dữ liệu được lưu trữ local, không cần internet để hoạt động
2. **Cấu trúc 2 cấp**: Chỉ có Tỉnh và Phường/Xã, không có cấp Quận/Huyện
3. **Performance**: Dữ liệu được cache để tối ưu performance
4. **Cập nhật dữ liệu**: Có thể cập nhật file `data.json` để thay đổi dữ liệu
5. **Linh hoạt**: Có thể chọn từ danh sách hoặc nhập thủ công tùy theo nhu cầu

## Cách cập nhật dữ liệu

1. Download file mới từ repository GitHub:
```bash
curl -o public/data/data.json https://raw.githubusercontent.com/thanhtrungit97/dvhcvn/main/json/data.json
```

2. Restart ứng dụng để load dữ liệu mới

## Troubleshooting

### Lỗi không load được dữ liệu
- Kiểm tra file `public/data/data.json` có tồn tại không
- Kiểm tra console để xem lỗi network
- Thử refresh trang

### Dropdown không hiển thị
- Kiểm tra import component
- Kiểm tra CSS classes
- Kiểm tra state management

### Địa điểm không lưu được
- Kiểm tra validation
- Kiểm tra API endpoint
- Kiểm tra database schema

### Toggle không hoạt động
- Kiểm tra radio buttons có được render đúng không
- Kiểm tra state management của useManualInput
- Kiểm tra event handlers 