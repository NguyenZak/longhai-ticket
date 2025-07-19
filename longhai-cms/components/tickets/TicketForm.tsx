'use client';
import React, { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';
import ColorPicker from '@/components/common/ColorPicker';

interface Event {
  id: number;
  title: string;
  venue: string;
  start_date: string;
}

interface Ticket {
  id?: number;
  event_id: number;
  name: string;
  prices: number[];
  quantities: number[];
  status: 'active' | 'inactive' | 'sold_out' | 'preparing';
  description?: string;
  color?: string;
}

interface TicketFormProps {
  ticket?: Ticket;
  onClose: () => void;
  onSuccess: () => void;
}

const TicketForm: React.FC<TicketFormProps> = ({ ticket, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<Ticket>({
    event_id: 0,
    name: '',
    prices: [0],
    quantities: [0],
    status: 'active',
    description: '',
    color: '#4CAF50'
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents();
    if (ticket) {
      setFormData({
        ...ticket,
        prices: ticket.prices || [0],
        quantities: ticket.quantities || [0]
      });
    }
  }, [ticket]);

  const fetchEvents = async () => {
    try {
      const response = await apiCall('/events');
      setEvents(response.data || []);
    } catch (err: any) {
      setError('Không thể tải danh sách sự kiện');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'event_id' ? parseInt(value) || 0 : value
    }));
  };

  const handlePriceChange = (index: number, value: string) => {
    const newPrices = [...formData.prices];
    newPrices[index] = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, prices: newPrices }));
  };

  const handleQuantityChange = (index: number, value: string) => {
    const newQuantities = [...formData.quantities];
    newQuantities[index] = parseInt(value) || 0;
    setFormData(prev => ({ ...prev, quantities: newQuantities }));
  };

  const addPriceQuantity = () => {
    setFormData(prev => ({
      ...prev,
      prices: [...prev.prices, 0],
      quantities: [...prev.quantities, 0]
    }));
  };

  const removePriceQuantity = (index: number) => {
    if (formData.prices.length > 1) {
      setFormData(prev => ({
        ...prev,
        prices: prev.prices.filter((_, i) => i !== index),
        quantities: prev.quantities.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    if (!formData.event_id) {
      setError('Vui lòng chọn sự kiện');
      return false;
    }
    if (!formData.name.trim()) {
      setError('Tên vé là bắt buộc');
      return false;
    }
    if (formData.prices.some(price => price <= 0)) {
      setError('Tất cả giá vé phải lớn hơn 0');
      return false;
    }
    if (formData.quantities.some(qty => qty <= 0)) {
      setError('Tất cả số lượng vé phải lớn hơn 0');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      if (ticket?.id) {
        // Update ticket
        await apiCall(`/tickets/${ticket.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        // Create new ticket
        await apiCall('/tickets', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {ticket ? 'Sửa vé' : 'Thêm vé mới'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sự kiện *
              </label>
              <select
                name="event_id"
                value={formData.event_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Chọn sự kiện</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tên vé *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Trạng thái
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
                <option value="sold_out">Hết vé</option>
                <option value="preparing">Chuẩn bị</option>
              </select>
            </div>

            <div>
              <ColorPicker
                value={formData.color || '#4CAF50'}
                onChange={(color) => setFormData(prev => ({ ...prev, color }))}
                label="Màu sắc"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Giá vé và số lượng *
              </label>
              <button
                type="button"
                onClick={addPriceQuantity}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                + Thêm loại
              </button>
            </div>
            
            <div className="space-y-2">
              {formData.prices.map((price, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => handlePriceChange(index, e.target.value)}
                    placeholder="Giá vé (VND)"
                    min="0"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="number"
                    value={formData.quantities[index]}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                    placeholder="Số lượng"
                    min="1"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  {formData.prices.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePriceQuantity(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : (ticket ? 'Cập nhật' : 'Thêm mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketForm; 