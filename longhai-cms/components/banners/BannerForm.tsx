"use client";

import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { apiCall } from '../../lib/api';

interface BannerFormProps {
  banner?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BannerForm({ banner, onSuccess, onCancel }: BannerFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    mobile_image: '',
    link_url: '',
    button_text: '',
    sort_order: 0,
    is_active: true,
    start_date: '',
    end_date: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [mobileImageFile, setMobileImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || '',
        description: banner.description || '',
        image: banner.image || '',
        mobile_image: banner.mobile_image || '',
        link_url: banner.link_url || '',
        button_text: banner.button_text || '',
        sort_order: banner.sort_order || 0,
        is_active: banner.is_active ?? true,
        start_date: banner.start_date ? new Date(banner.start_date).toISOString().split('T')[0] : '',
        end_date: banner.end_date ? new Date(banner.end_date).toISOString().split('T')[0] : '',
      });
    }
  }, [banner]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'desktop' | 'mobile') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'desktop') {
        setImageFile(file);
        // Tạo preview URL
        const previewUrl = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, image: previewUrl }));
      } else {
        setMobileImageFile(file);
        const previewUrl = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, mobile_image: previewUrl }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = { ...formData };

      if (imageFile) {
        const fd = new FormData();
        fd.append('image', imageFile);
        const response = await apiCall('/upload/banner-image', {
          method: 'POST',
          body: fd,
        });
        if (response.success) {
          submitData.image = response.data.url;
        }
      }

      if (mobileImageFile) {
        const fd = new FormData();
        fd.append('image', mobileImageFile);
        const response = await apiCall('/upload/banner-image', {
          method: 'POST',
          body: fd,
        });
        if (response.success) {
          submitData.mobile_image = response.data.url;
        }
      }

      if (banner) {
        await apiCall(`/banners/${banner.id}`, {
          method: 'PUT',
          body: JSON.stringify(submitData),
        });
      } else {
        await apiCall('/banners', {
          method: 'POST',
          body: JSON.stringify(submitData),
        });
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">
        {banner ? 'Sửa Banner' : 'Thêm Banner Mới'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tiêu đề
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập tiêu đề banner"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập mô tả banner"
          />
        </div>

        {/* Desktop Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ảnh Desktop (1920x800)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'desktop')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {formData.image && (
            <div className="mt-2">
              <img 
                src={formData.image} 
                alt="Preview" 
                className="w-32 h-16 object-cover rounded"
              />
            </div>
          )}
        </div>

        {/* Mobile Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ảnh Mobile (tùy chọn)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'mobile')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {formData.mobile_image && (
            <div className="mt-2">
              <img 
                src={formData.mobile_image} 
                alt="Mobile Preview" 
                className="w-32 h-16 object-cover rounded"
              />
            </div>
          )}
        </div>

        {/* Link URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Link URL
          </label>
          <input
            type="url"
            name="link_url"
            value={formData.link_url}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com"
          />
        </div>

        {/* Button Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Text nút
          </label>
          <input
            type="text"
            name="button_text"
            value={formData.button_text}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Mua vé ngay"
          />
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thứ tự hiển thị
          </label>
          <input
            type="number"
            name="sort_order"
            value={formData.sort_order}
            onChange={handleInputChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày bắt đầu
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày kết thúc
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Hiển thị banner
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : (banner ? 'Cập nhật' : 'Thêm mới')}
          </button>
        </div>
      </form>
    </div>
  );
} 