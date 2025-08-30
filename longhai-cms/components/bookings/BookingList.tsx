"use client";

import React, { useEffect } from 'react';
import { useBookingStore } from '../../store/bookingStore';
import { Button } from '../ui/button';

export default function BookingList() {
  const {
    bookings,
    loading,
    error,
    filters,
    fetchBookings,
    cancelBooking,
    confirmBooking,
    setFilters,
    clearFilters,
  } = useBookingStore();

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusFilter = (status: string) => {
    setFilters({ status });
  };

  const handleConfirmBooking = async (id: number) => {
    if (confirm('Xác nhận đặt chỗ này?')) {
      await confirmBooking(id);
    }
  };

  const handleCancelBooking = async (id: number) => {
    if (confirm('Hủy đặt chỗ này?')) {
      await cancelBooking(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { class: 'bg-yellow-100 text-yellow-800', text: 'Chờ xác nhận' },
      confirmed: { class: 'bg-green-100 text-green-800', text: 'Đã xác nhận' },
      cancelled: { class: 'bg-red-100 text-red-800', text: 'Đã hủy' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.class}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Quản lý Đặt chỗ</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({ status: 'pending' })}
            className={filters.status === 'pending' ? 'bg-blue-50' : ''}
          >
            Chờ xác nhận
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({ status: 'confirmed' })}
            className={filters.status === 'confirmed' ? 'bg-green-50' : ''}
          >
            Đã xác nhận
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({ status: 'cancelled' })}
            className={filters.status === 'cancelled' ? 'bg-red-50' : ''}
          >
            Đã hủy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
          >
            Tất cả
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã đặt chỗ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khách hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sự kiện
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số lượng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tổng tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày đặt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  BK{String(booking.id).padStart(6, '0')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {booking.user?.name || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {booking.user?.email || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {booking.event?.title || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {booking.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(booking.total_price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(booking.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(booking.created_at).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {booking.status === 'pending' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConfirmBooking(booking.id)}
                        className="mr-2"
                      >
                        Xác nhận
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Hủy
                      </Button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      Hủy
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {bookings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Không có đặt chỗ nào
          </div>
        )}
      </div>
    </div>
  );
}
