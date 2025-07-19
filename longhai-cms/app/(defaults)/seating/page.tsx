'use client';
import React, { useState, useEffect } from 'react';
import SeatingEditor from '@/components/seating/SeatingEditor';
import { apiCall } from '@/lib/api';

interface Event {
  id: string;
  title: string;
  start_date: string;
  venue: string;
  description?: string;
  status?: string;
}

interface TicketType {
  id: string;
  name: string;
  price: number;
  color: string;
}

const SeatingPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchEvents();
    fetchTicketTypes();
  }, []);

  const fetchEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const data = await apiCall('/events');
      setEvents(data.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setMessage({ type: 'error', text: 'Không thể tải danh sách sự kiện' });
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const fetchTicketTypes = async () => {
    try {
      const data = await apiCall('/tickets/types');
      setTicketTypes(data.types || []);
    } catch (error) {
      console.error('Error fetching ticket types:', error);
    }
  };

  const handleEventSelect = (eventId: string) => {
    setSelectedEvent(eventId);
    setMessage(null);
  };

  const handleSave = (seats: any[]) => {
    setMessage({ type: 'success', text: `Đã lưu ${seats.length} ghế cho sự kiện` });
  };

  const handleCancel = () => {
    setSelectedEvent('');
    setMessage(null);
  };

  return (
    <div className="seating-page bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🎭 Quản lý sơ đồ ghế
              </h1>
              <p className="text-gray-600 text-lg">
                Tạo và quản lý sơ đồ ghế cho các sự kiện
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Tổng sự kiện</div>
                <div className="text-2xl font-bold text-blue-600">{events.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-6 py-8">
        {/* Message */}
        {message && (
          <div className={`mb-8 p-4 rounded-xl shadow-sm ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              <span className="text-xl mr-3">
                {message.type === 'success' ? '✅' : '❌'}
              </span>
              {message.text}
            </div>
          </div>
        )}

        {/* Event Selection */}
        {!selectedEvent ? (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <div className="max-w-3xl">
                <h2 className="text-3xl font-bold mb-4">
                  Chào mừng đến với hệ thống quản lý sơ đồ ghế
                </h2>
                <p className="text-xl mb-6 opacity-90">
                  Tạo và quản lý sơ đồ ghế chuyên nghiệp cho các sự kiện của bạn
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎨</div>
                    <h3 className="font-semibold mb-1">Vẽ ghế dễ dàng</h3>
                    <p className="text-sm opacity-80">Giao diện trực quan với canvas</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎫</div>
                    <h3 className="font-semibold mb-1">Quản lý loại vé</h3>
                    <p className="text-sm opacity-80">Gán ghế với loại vé cụ thể</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <h3 className="font-semibold mb-1">Thống kê chi tiết</h3>
                    <p className="text-sm opacity-80">Theo dõi trạng thái ghế</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  🎯 Chọn sự kiện để quản lý sơ đồ ghế
                </h2>
                <div className="text-sm text-gray-500">
                  {events.length} sự kiện có sẵn
                </div>
              </div>
              
              {isLoadingEvents ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-6">⚙️</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Đang tải sự kiện...
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Vui lòng đợi trong giây lát.
                  </p>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-6">📅</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Chưa có sự kiện nào
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Vui lòng tạo sự kiện trước khi quản lý sơ đồ ghế
                  </p>
                  <button
                    onClick={() => window.location.href = '/events'}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    ➕ Tạo sự kiện mới
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => handleEventSelect(event.id)}
                      className="group p-6 bg-gray-50 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <span className="text-2xl">🎪</span>
                        </div>
                        <span className="text-blue-500 group-hover:text-blue-600 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-900 transition-colors">
                        {event.title}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <span className="mr-2">📅</span>
                          {new Date(event.start_date).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">📍</span>
                          {event.venue}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Features Overview */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                ✨ Tính năng mới
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-3xl">🎨</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Vẽ hàng ghế</h4>
                  <p className="text-gray-600 text-sm">
                    Vẽ nhanh hàng ghế với một click, hỗ trợ vẽ ghế đơn lẻ hoặc cả hàng
                  </p>
                </div>
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-3xl">🎫</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Gán loại vé</h4>
                  <p className="text-gray-600 text-sm">
                    Gán ghế với loại vé và giá cụ thể, tự động cập nhật màu sắc
                  </p>
                </div>
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-3xl">✏️</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Sửa tên ghế</h4>
                  <p className="text-gray-600 text-sm">
                    Tùy chỉnh tên ghế và tên hàng theo ý muốn, hỗ trợ tiếng Việt
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Seating Editor */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    🎨 Chỉnh sửa sơ đồ ghế
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Sự kiện: {events.find(e => e.id === selectedEvent)?.name}
                  </p>
                </div>
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  ← Quay lại
                </button>
              </div>
            </div>
            
            <SeatingEditor
              eventId={selectedEvent}
              onSave={handleSave}
              onCancel={handleCancel}
              ticketTypes={ticketTypes}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatingPage; 