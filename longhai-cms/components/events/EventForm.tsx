'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { apiCall } from '@/lib/api';
import { API_BASE_URL } from '@/lib/api';
import { toDateTimeLocal } from '@/lib/dateUtils';
import { CldImage } from 'next-cloudinary';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';
import { SimpleImageUpload } from './CloudinaryUpload';

interface Event {
  id?: number;
  title: string;
  slug?: string;
  description: string;
  venue: string;
  location_detail?: string;
  start_date: string;
  end_date: string;
  time?: string;
  status: string; // Cho phép nhập thủ công
  display_status?: string; // Trạng thái hiển thị mới
  total_seats: number;
  available_seats: number;
  price: string;
  image?: string;
  map_image?: string;
  artists?: Array<{ name: string; image: string }>;
  ticket_prices?: Array<{ name: string; price: string }>;
}

interface EventFormProps {
  event?: Event | null;
  onClose: () => void;
  onSuccess: () => void;
}

function parsePriceInput(input: string): number {
  return parseInt(input.replace(/[^0-9]/g, ''), 10) || 0;
}
function formatPriceDisplay(price: number): string {
  return price.toLocaleString('vi-VN') + 'đ';
}
function toTime24h(val: string | undefined): string {
  if (!val) return '';
  if (/^\d{2}:\d{2}$/.test(val)) return val;
  if (/^\d{2}:\d{2}:\d{2}$/.test(val)) return val.slice(0, 5);
  const d = new Date(`1970-01-01T${val}`);
  if (!isNaN(d.getTime())) {
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  }
  return '';
}

const EMPTY_EVENT: Event = {
  title: '',
  slug: '',
  description: '',
  venue: '',
  location_detail: '',
  start_date: '',
  end_date: '',
  time: '',
  status: 'preparing',
  total_seats: 0,
  available_seats: 0,
  price: '',
  image: '',
  map_image: '',
  artists: [],
  ticket_prices: [],
  display_status: '',
};

const EventForm: React.FC<EventFormProps> = ({ event, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<Event>(EMPTY_EVENT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [mapImageFile, setMapImageFile] = useState<File | null>(null);
  const [mapImagePreview, setMapImagePreview] = useState<string>('');
  const [imageError, setImageError] = useState('');
  const [mapImageError, setMapImageError] = useState('');
  const [artistImageFiles, setArtistImageFiles] = useState<{ [key: number]: File }>({});
  const [artistImagePreviews, setArtistImagePreviews] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    if (event) {
      let time = event.time;
      if (!time && event.start_date) {
        const date = new Date(event.start_date);
        time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      }
      setFormData({
        ...event,
        price: event.price !== undefined && event.price !== null ? event.price.toString() : '',
        ticket_prices: event.ticket_prices?.map(tp => ({
          ...tp,
          price: tp.price !== undefined && tp.price !== null ? (tp.price as string | number).toString() : '',
        })) ?? [],
        start_date: event.start_date ? toDateTimeLocal(event.start_date) : '',
        end_date: event.end_date ? toDateTimeLocal(event.end_date) : '',
        time: toTime24h(time),
      });
      if (event.image) {
        setImagePreview(event.image);
      }
      if (event.map_image) {
        setMapImagePreview(event.map_image);
      }
      if (event.artists) {
        const previews: { [key: number]: string } = {};
        event.artists.forEach((artist, index) => {
          if (artist.image) previews[index] = artist.image;
        });
        setArtistImagePreviews(previews);
      }
    } else {
      setFormData(EMPTY_EVENT);
      setImagePreview('');
      setMapImagePreview('');
      setArtistImagePreviews({});
      setArtistImageFiles({});
    }
  }, [event]);

  useEffect(() => {
    if (!event && formData.start_date && !formData.time) {
      const date = new Date(formData.start_date);
      const h = date.getHours().toString().padStart(2, '0');
      const m = date.getMinutes().toString().padStart(2, '0');
      setFormData(prev => ({ ...prev, time: `${h}:${m}` }));
    }
  }, [formData.start_date, event, formData.time]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'total_seats' || name === 'available_seats' ? parseInt(value) || 0 : value,
    }));
  };

  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({ ...prev, description: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMapImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMapImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setMapImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleArtistImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArtistImageFiles(prev => ({ ...prev, [index]: file }));
      const reader = new FileReader();
      reader.onload = (e) => setArtistImagePreviews(prev => ({ ...prev, [index]: e.target?.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const addArtist = () => {
    setFormData(prev => ({ ...prev, artists: [...(prev.artists || []), { name: '', image: '' }] }));
  };
  const removeArtist = (index: number) => {
    setFormData(prev => ({ ...prev, artists: prev.artists?.filter((_, i) => i !== index) || [] }));
    setArtistImageFiles(prev => { const n = { ...prev }; delete n[index]; return n; });
    setArtistImagePreviews(prev => { const n = { ...prev }; delete n[index]; return n; });
  };
  const updateArtist = (index: number, field: 'name' | 'image', value: string) => {
    setFormData(prev => ({
      ...prev,
      artists: prev.artists?.map((artist, i) => i === index ? { ...artist, [field]: value } : artist) || [],
    }));
  };

  const addTicketPrice = () => {
    setFormData(prev => ({ ...prev, ticket_prices: [...(prev.ticket_prices || []), { name: '', price: '' }] }));
  };
  const removeTicketPrice = (index: number) => {
    setFormData(prev => ({ ...prev, ticket_prices: prev.ticket_prices?.filter((_, i) => i !== index) || [] }));
  };
  const updateTicketPrice = (index: number, field: 'name' | 'price', value: string) => {
    setFormData(prev => ({
      ...prev,
      ticket_prices: prev.ticket_prices?.map((ticket, i) => i === index ? { ...ticket, [field]: value } : ticket) || [],
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) return setError('Tiêu đề sự kiện là bắt buộc'), false;
    if (!formData.description.trim()) return setError('Mô tả sự kiện là bắt buộc'), false;
    if (!formData.venue.trim()) return setError('Địa điểm là bắt buộc'), false;
    if (!formData.start_date) return setError('Ngày bắt đầu là bắt buộc'), false;
    if (!formData.end_date) return setError('Ngày kết thúc là bắt buộc'), false;
    if (new Date(formData.end_date) <= new Date(formData.start_date)) return setError('Ngày kết thúc phải sau ngày bắt đầu'), false;
    if (parsePriceInput(formData.price) < 0) return setError('Giá vé không được âm'), false;
    return true;
  };

  const uploadEventImage = async (file: File, isMap = false): Promise<string> => {
    try {
      const fd = new FormData();
      fd.append('image', file);
      const endpoint = isMap ? '/upload/map-image' : '/upload/event-image';
      
      console.log('🔄 Uploading image to:', endpoint);
      console.log('📁 File:', file.name, file.size, file.type);
      
      const response = await apiCall(endpoint, {
        method: 'POST',
        body: fd,
        headers: {},
      });
      
      console.log('📥 Upload response:', response);
      
      if (!response.success) {
        console.error('❌ Upload failed:', response.message);
        throw new Error(response.message || 'Upload failed');
      }
      
      console.log('✅ Upload successful, URL:', response.data.url);
      return response.data.url;
    } catch (err: any) {
      console.error('💥 Upload error:', err);
      const errorMsg = isMap ? 'Tải ảnh sơ đồ thất bại, vui lòng thử lại.' : 'Tải ảnh sự kiện thất bại, vui lòng thử lại.';
      if (isMap) setMapImageError(errorMsg);
      else setImageError(errorMsg);
      throw err;
    }
  };

  const uploadArtistImage = async (file: File): Promise<string> => {
    try {
      const fd = new FormData();
      fd.append('image', file);
      const response = await apiCall('/upload/artist-image', {
        method: 'POST',
        body: fd,
        headers: {},
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Upload failed');
      }
      
      return response.data.url;
    } catch (err: any) {
      throw new Error('Tải ảnh nghệ sĩ thất bại, vui lòng thử lại.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setImageError('');
    setMapImageError('');
    if (!validateForm()) return;
    setLoading(true);
    setError('');
    try {
      const submitData: any = { ...formData };
      
      console.log('🔄 Starting form submission...');
      console.log('📁 Initial submitData:', submitData);
      
      if (imageFile) {
        console.log('🖼️ Uploading event image...');
        submitData.image = await uploadEventImage(imageFile, false);
        console.log('✅ Event image uploaded:', submitData.image);
      }
      
      if (submitData.artists && submitData.artists.length > 0) {
        console.log('🎭 Processing artists...');
        for (let i = 0; i < submitData.artists.length; i++) {
          const artist = submitData.artists[i];
          const file = artistImageFiles[i];
          if (file) {
            console.log(`🖼️ Uploading artist ${i} image...`);
            artist.image = await uploadArtistImage(file);
            console.log(`✅ Artist ${i} image uploaded:`, artist.image);
          } else if (!artist.image && artistImagePreviews[i]) {
            artist.image = artistImagePreviews[i];
            console.log(`📸 Using existing artist ${i} image:`, artist.image);
          }
        }
      }
      
      if (mapImageFile) {
        console.log('🗺️ Uploading map image...');
        submitData.map_image = await uploadEventImage(mapImageFile, true);
        console.log('✅ Map image uploaded:', submitData.map_image);
      }
      
      submitData.price = parsePriceInput(formData.price);
      if (submitData.ticket_prices) {
        submitData.ticket_prices = submitData.ticket_prices.map((ticket: any) => ({ ...ticket, price: parsePriceInput(ticket.price) }));
      }
      submitData.time = toTime24h(formData.time);
      
      console.log('📤 Final submitData:', submitData);
      
      if (event?.id) {
        console.log('🔄 Updating existing event...');
        await apiCall(`/events/${event.id}`, { method: 'PUT', body: JSON.stringify(submitData) });
        console.log('✅ Event updated successfully');
      } else {
        console.log('🆕 Creating new event...');
        await apiCall('/events', { method: 'POST', body: JSON.stringify(submitData) });
        console.log('✅ Event created successfully');
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('💥 Form submission error:', err);
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {event ? 'Sửa sự kiện' : 'Thêm sự kiện mới'}
        </h2>
      </div>
      
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tiêu đề sự kiện *</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Nhập tiêu đề sự kiện" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Slug (URL)</label>
              <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="slug-tu-dong" />
            </div>
          </div>
          {/* Description with Quill Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mô tả sự kiện *</label>
            <div className="border border-gray-300 rounded-md dark:border-gray-600">
              <ReactQuill theme="snow" value={formData.description} onChange={handleDescriptionChange} modules={{ toolbar: [[{ header: [1, 2, 3, false] }], ['bold', 'italic', 'underline', 'strike'], [{ list: 'ordered' }, { list: 'bullet' }], [{ color: [] }, { background: [] }], [{ align: [] }], ['link', 'image'], ['clean']] }} className="dark:bg-gray-700 dark:text-white" style={{ minHeight: '200px' }} />
            </div>
          </div>
          {/* Venue and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Địa điểm *</label>
              <input type="text" name="venue" value={formData.venue} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Nhập địa điểm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chi tiết địa điểm</label>
              <input type="text" name="location_detail" value={formData.location_detail} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Ví dụ: Tầng 2, Phòng 201" />
            </div>
          </div>
          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ngày bắt đầu *</label>
              <input type="datetime-local" name="start_date" value={formData.start_date} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ngày kết thúc *</label>
              <input type="datetime-local" name="end_date" value={formData.end_date} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Giờ diễn ra</label>
              <input type="time" name="time" value={formData.time} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" step="60" placeholder="HH:mm" />
            </div>
          </div>
          {/* Seats and Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tổng số ghế *</label>
              <input type="numeric" name="total_seats" value={formData.total_seats} onChange={handleInputChange} min="1" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            {/* Giá vé cơ bản */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Giá vé cơ bản (VNĐ) *</label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                autoComplete="off"
                inputMode="numeric"
              />
              {parsePriceInput(formData.price) > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Hiển thị: {formatPriceDisplay(parsePriceInput(formData.price))}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trạng thái *</label>
              <select
                name="status"
                value={["preparing","active","ended"].includes(formData.status) ? formData.status : 'other'}
                onChange={e => {
                  const value = e.target.value;
                  if (value === 'other') {
                    setFormData(prev => ({ ...prev, status: '' }));
                  } else {
                    setFormData(prev => ({ ...prev, status: value }));
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="preparing">Chuẩn bị</option>
                <option value="active">Đang diễn ra</option>
                <option value="ended">Đã kết thúc</option>
                <option value="other">Khác...</option>
              </select>
              {!["preparing","active","ended"].includes(formData.status) && (
                <input
                  type="text"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Nhập trạng thái tùy chỉnh"
                  required
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trạng thái hiển thị</label>
              <input
                type="text"
                name="display_status"
                value={formData.display_status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Nhập trạng thái hiển thị (không bắt buộc)"
              />
            </div>
          </div>
          {/* Event Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ảnh sự kiện</label>
            <div className="flex items-center space-x-4">
              <input type="file" accept="image/*" onChange={handleImageChange} className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              {imagePreview && <div className="w-20 h-20 border border-gray-300 rounded-md overflow-hidden"><img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /></div>}
            </div>
            {imageError && <div className="text-red-600 text-sm mt-1">{imageError}</div>}
          </div>
          {/* Map Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ảnh sơ đồ chỗ ngồi (link hoặc upload)</label>
            <div className="flex items-center space-x-4">
              <input type="text" name="map_image" value={formData.map_image} onChange={handleInputChange} className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="https://example.com/map.jpg" />
              <input type="file" accept="image/*" onChange={handleMapImageChange} className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              {mapImagePreview && <div className="w-20 h-20 border border-gray-300 rounded-md overflow-hidden"><img src={mapImagePreview} alt="Map Preview" className="w-full h-full object-cover" /></div>}
            </div>
            {mapImageError && <div className="text-red-600 text-sm mt-1">{mapImageError}</div>}
          </div>
          {/* Artists */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nghệ sĩ / Khách mời</label>
              <button type="button" onClick={addArtist} className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600">+ Thêm nghệ sĩ</button>
            </div>
            {formData.artists?.map((artist, index) => (
              <div key={index} className="border border-gray-300 rounded-md p-4 mb-4 dark:border-gray-600">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tên nghệ sĩ</label>
                    <input type="text" value={artist.name} onChange={e => updateArtist(index, 'name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Tên nghệ sĩ" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ảnh nghệ sĩ (Link hoặc Upload)</label>
                    <div className="space-y-2">
                      <input type="text" value={artist.image} onChange={e => updateArtist(index, 'image', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="https://example.com/image.jpg" />
                      <input type="file" accept="image/*" onChange={e => handleArtistImageChange(index, e)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    {artistImagePreviews[index] && <div className="w-16 h-16 border border-gray-300 rounded-md overflow-hidden mt-2"><img src={artistImagePreviews[index]} alt="Artist preview" className="w-full h-full object-cover" /></div>}
                  </div>
                  <div className="flex items-end">
                    <button type="button" onClick={() => removeArtist(index)} className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">Xóa</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Ticket Prices */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Loại vé và giá</label>
              <button type="button" onClick={addTicketPrice} className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600">+ Thêm loại vé</button>
            </div>
            {formData.ticket_prices?.map((ticket, index) => (
              <div key={index} className="border border-gray-300 rounded-md p-4 mb-4 dark:border-gray-600">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tên loại vé</label>
                    <input
                      type="text"
                      value={ticket.name}
                      onChange={e => updateTicketPrice(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Vé VIP, Vé thường..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Giá vé (VNĐ)</label>
                    <input
                      type="text"
                      value={ticket.price}
                      onChange={e => updateTicketPrice(index, 'price', e.target.value)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="0.00"
                      autoComplete="off"
                      inputMode="numeric"
                    />
                    {parsePriceInput(ticket.price) > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        Hiển thị: {formatPriceDisplay(parsePriceInput(ticket.price))}
                      </p>
                    )}
                  </div>
                  <div className="flex items-end">
                    <button type="button" onClick={() => removeTicketPrice(index)} className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">Xóa</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Submit Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              ← Quay lại
            </button>
            <div className="flex space-x-4">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Hủy</button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50">{loading ? 'Đang lưu...' : (event ? 'Cập nhật' : 'Tạo sự kiện')}</button>
            </div>
          </div>
        </form>
      </div>
    
  );
};

export default EventForm;