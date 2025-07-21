# Định dạng Ngày tháng

## Tổng quan

Hệ thống đã được cập nhật để hiển thị ngày tháng theo định dạng dd/mm/yy và giờ theo 24h format.

## Các utility functions

### 1. `formatDate(dateString: string)`
Format ngày tháng theo định dạng `dd/mm/yy HH:mm`

```tsx
import { formatDate } from '@/lib/dateUtils';

// Ví dụ: "25/12/24 14:30"
const formattedDate = formatDate('2024-12-25T14:30:00');
```

### 2. `formatDateOnly(dateString: string)`
Format chỉ ngày tháng theo định dạng `dd/mm/yyyy`

```tsx
import { formatDateOnly } from '@/lib/dateUtils';

// Ví dụ: "25/12/2024"
const formattedDate = formatDateOnly('2024-12-25T14:30:00');
```

### 3. `formatTimeOnly(dateString: string)`
Format chỉ giờ theo định dạng `HH:mm` (24h)

```tsx
import { formatTimeOnly } from '@/lib/dateUtils';

// Ví dụ: "14:30"
const formattedTime = formatTimeOnly('2024-12-25T14:30:00');
```

### 4. `toDateTimeLocal(dateString: string)`
Chuyển đổi date string sang format cho datetime-local input

```tsx
import { toDateTimeLocal } from '@/lib/dateUtils';

// Ví dụ: "2024-12-25T14:30"
const dateTimeLocal = toDateTimeLocal('2024-12-25T14:30:00');
```

## Components

### DateDisplay Component

Component để hiển thị ngày tháng với icon:

```tsx
import DateDisplay from '@/components/common/DateDisplay';

// Hiển thị ngày và giờ
<DateDisplay date="2024-12-25T14:30:00" />

// Chỉ hiển thị ngày
<DateDisplay date="2024-12-25T14:30:00" showTime={false} />
```

Props:
- `date`: Date string
- `showTime`: Boolean, mặc định true
- `className`: CSS classes tùy chỉnh

## Cách sử dụng

### Trong bảng dữ liệu

```tsx
import { formatDate } from '@/lib/dateUtils';

// Trong table cell
<td className="px-6 py-4 whitespace-nowrap text-sm">
  {formatDate(event.start_date)}
</td>
```

### Trong form

```tsx
import { toDateTimeLocal } from '@/lib/dateUtils';

// Trong form input
<input
  type="datetime-local"
  value={toDateTimeLocal(event.start_date)}
  onChange={handleChange}
/>
```

### Với DateDisplay component

```tsx
import DateDisplay from '@/components/common/DateDisplay';

// Trong table
<td className="px-6 py-4 whitespace-nowrap">
  <DateDisplay date={event.start_date} />
</td>
```

## Ví dụ thực tế

### Trước khi cập nhật
```
2024-12-25T14:30:00.000Z
```

### Sau khi cập nhật
```
25/12/24 14:30
```

## Lưu ý

1. **Timezone**: Tất cả dates được xử lý theo timezone local của browser
2. **Consistency**: Sử dụng các utility functions để đảm bảo format nhất quán
3. **Performance**: Các functions được tối ưu để xử lý nhanh
4. **Accessibility**: DateDisplay component có icon để dễ nhận biết

## Troubleshooting

### Date không hiển thị đúng
- Kiểm tra format của date string
- Đảm bảo date string hợp lệ
- Kiểm tra timezone

### Format không đúng
- Kiểm tra import utility functions
- Đảm bảo sử dụng đúng function cho mục đích
- Kiểm tra locale settings

### Component không render
- Kiểm tra import DateDisplay
- Kiểm tra props được truyền đúng
- Kiểm tra CSS classes 