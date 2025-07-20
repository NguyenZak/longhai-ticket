'use client';
import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';
import EventForm from '@/components/events/EventForm';
import VenueDisplay from '@/components/events/VenueDisplay';
import DateDisplay from '@/components/common/DateDisplay';
import { formatDate } from '@/lib/dateUtils';

interface EventData {
  id: number;
  title: string;
  description: string;
  venue: string;
  start_date: string;
  end_date: string;
  time?: string;
  status: 'preparing' | 'active' | 'ended';
  total_seats: number;
  available_seats: number;
  price: string;
  image?: string;
  display_status?: string; // Added for new logic
}

const EventsPage = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/events');
      setEvents(response.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa sự kiện này?')) return;
    
    try {
      await apiCall(`/events/${id}`, { method: 'DELETE' });
      fetchEvents();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === events.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(events.map((e) => e.id));
    }
  };

  const handleBulkDelete = async () => {
    setShowBulkDeleteModal(false);
    try {
      await apiCall('/events/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids: selectedIds })
      });
    } catch (err: any) {
      setError(err.message);
    }
    setSelectedIds([]);
    fetchEvents();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {!showForm ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Quản lý Sự kiện
            </h1>
            <div className="flex gap-2">
              {selectedIds.length > 0 && (
                <button
                  onClick={() => setShowBulkDeleteModal(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Xoá hàng loạt
                </button>
              )}
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thêm sự kiện
              </button>
            </div>
          </div>

          {/* Modal xác nhận xoá hàng loạt */}
          {showBulkDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Xác nhận xoá</h2>
                <p className="mb-6 text-gray-700 dark:text-gray-300">
                  Bạn có chắc chắn muốn xoá <b>{selectedIds.length}</b> sự kiện đã chọn không? Hành động này không thể hoàn tác.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowBulkDeleteModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Huỷ
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Xoá
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === events.length && events.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Sự kiện
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Địa điểm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ngày diễn ra
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Giờ diễn ra
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(event.id)}
                          onChange={() => handleSelect(event.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {event.image && (
                            <img
                              className="h-10 w-10 rounded-lg object-cover mr-3"
                              src={event.image}
                              alt={event.title}
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {event.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {event.description.replace(/<[^>]*>/g, '').substring(0, 50)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <VenueDisplay venue={event.venue} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <DateDisplay date={event.start_date} showTime={false} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {event.time || 'Chưa có giờ'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
                          {event.display_status && event.display_status.trim() !== ''
                            ? event.display_status
                            : (event.status === 'preparing' ? 'Sắp mở bán' : event.status === 'active' ? 'Đang mở bán' : 'Đã kết thúc')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setEditingEvent(event);
                            setShowForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {events.length === 0 && !loading && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Không có sự kiện</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Bắt đầu bằng cách tạo sự kiện đầu tiên.
              </p>
            </div>
          )}
        </>
      ) : (
        <EventForm
          event={editingEvent}
          onClose={() => {
            setShowForm(false);
            setEditingEvent(null);
          }}
          onSuccess={() => {
            fetchEvents();
            setShowForm(false);
            setEditingEvent(null);
          }}
        />
      )}
    </div>
  );
};

export default EventsPage; 