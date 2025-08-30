'use client';
import BookingList from '../../../components/bookings/BookingList';

export default function BookingsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Quản lý Đặt chỗ
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Quản lý và theo dõi các đặt chỗ của khách hàng
        </p>
      </div>
      
      <BookingList />
    </div>
  );
} 