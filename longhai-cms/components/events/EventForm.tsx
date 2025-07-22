'use client';

import React, { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';
import Swal from 'sweetalert2';

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
  price_display?: string;
  min_price?: string;
  max_price?: string;
  price_range_display?: string;
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



function toTime24h(val: string | undefined): string {
  if (!val) return '';
  
  // Kiểm tra nếu giá trị đã đúng định dạng HH:mm
  if (/^\d{2}:\d{2}$/.test(val)) {
    return val;
  }
  
  // Thử parse với Date object
  try {
  const time = new Date(`2000-01-01T${val}`);
    if (isNaN(time.getTime())) {
      return '';
    }
  return time.toTimeString().slice(0, 5);
  } catch (error) {
    console.error('Error parsing time:', val, error);
    return '';
  }
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
  display_status: '',
    total_seats: 0,
    available_seats: 0,
  price: '',
  price_display: '',
  min_price: '',
  max_price: '',
  price_range_display: '',
  image: '',
  map_image: '',
  artists: [],
  ticket_prices: []
};

const EventForm: React.FC<EventFormProps> = ({ event, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<Event>(EMPTY_EVENT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageError, setImageError] = useState('');
  const [mapImageFile, setMapImageFile] = useState<File | null>(null);
  const [mapImagePreview, setMapImagePreview] = useState('');
  const [mapImageError, setMapImageError] = useState('');
  const [artistImageFiles, setArtistImageFiles] = useState<{[key: number]: File}>({});
  const [artistImagePreviews, setArtistImagePreviews] = useState<{[key: number]: string}>({});

  useEffect(() => {
    if (event) {
      try {
        console.log('Loading event data:', event);
        console.log('Event time from server:', event.time);
        setFormData({
          ...event,
          start_date: event.start_date ? new Date(event.start_date).toISOString().slice(0, 10) : '',
          end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 10) : '',
          time: event.time || '',
          artists: event.artists || [],
          ticket_prices: event.ticket_prices || []
        });
        
        // Set existing images
        if (event.image) setImagePreview(event.image);
        if (event.map_image) setMapImagePreview(event.map_image);
        if (event.artists) {
          const previews: {[key: number]: string} = {};
          event.artists.forEach((artist, index) => {
            if (artist.image) previews[index] = artist.image;
          });
          setArtistImagePreviews(previews);
        }
      } catch (error) {
        console.error('Error setting event data:', error);
        setFormData(EMPTY_EVENT);
      }
    } else {
      setFormData(EMPTY_EVENT);
      setImagePreview('');
      setMapImagePreview('');
      setArtistImagePreviews({});
      setArtistImageFiles({});
    }
  }, [event]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Skip time field as it has its own handler
    if (name === 'time') {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'total_seats' || name === 'available_seats' ? parseInt(value) || 0 : value,
    }));
  };

  // Xử lý thay đổi ngày giờ với Flatpickr
  const handleDateChange = (name: 'start_date' | 'end_date', dates: Date[]) => {
    if (dates.length > 0) {
      const date = dates[0];
      const formattedDate = date.toISOString().slice(0, 16);
      setFormData(prev => ({ ...prev, [name]: formattedDate }));
    }
  };

  // Xử lý thay đổi mô tả
  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({ ...prev, description: value }));
  };

  // Xử lý thay đổi ảnh
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
    } catch (err: unknown) {
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
    } catch (err: unknown) {
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
      
      // Upload event image
      if (imageFile) {
        console.log('🖼️ Uploading event image...');
        submitData.image = await uploadEventImage(imageFile);
      }
      
      // Upload map image
      if (mapImageFile) {
        console.log('🗺️ Uploading map image...');
        submitData.map_image = await uploadEventImage(mapImageFile, true);
      }
      
      // Upload artist images
      if (Object.keys(artistImageFiles).length > 0) {
        console.log('🎭 Uploading artist images...');
        for (const [index, file] of Object.entries(artistImageFiles)) {
          const imageUrl = await uploadArtistImage(file);
          submitData.artists[parseInt(index)].image = imageUrl;
        }
      }
      
      // Ensure time is in correct format (input type="time" already provides HH:mm format)
      console.log('Time before submit:', submitData.time);
      if (submitData.time) {
        // Input type="time" already provides HH:mm format, just ensure it's valid
        if (!/^\d{2}:\d{2}$/.test(submitData.time)) {
          console.warn('Invalid time format:', submitData.time);
          submitData.time = '';
        }
      }
      console.log('Time after validation:', submitData.time);
      
      // Đảm bảo luôn gửi trường price là số, mặc định 0 nếu không hợp lệ
      // if (!submitData.price || isNaN(Number(submitData.price))) {
      //   submitData.price = 0;
      // } else {
      //   submitData.price = Number(submitData.price);
      // }
      
      console.log('📤 Final submitData:', submitData);

      if (event?.id) {
        console.log('🔄 Updating existing event...');
        await apiCall(`/events/${event.id}`, { method: 'PUT', body: JSON.stringify(submitData) });
        console.log('✅ Event updated successfully');
        
        // Hiển thị popup thông báo cập nhật thành công
        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Sự kiện đã được cập nhật thành công.',
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#3085d6',
          timer: 3000,
          timerProgressBar: true
        });
      } else {
        console.log('🆕 Creating new event...');
        await apiCall('/events', { method: 'POST', body: JSON.stringify(submitData) });
        console.log('✅ Event created successfully');
        
        // Hiển thị popup thông báo tạo mới thành công
        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Sự kiện mới đã được tạo thành công.',
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#3085d6',
          timer: 3000,
          timerProgressBar: true
        });
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('💥 Form submission error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
                <input type="text" name="title" value={formData.title || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Nhập tiêu đề sự kiện" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Slug (URL)</label>
                <input type="text" name="slug" value={formData.slug || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="slug-tu-dong" />
              </div>
            </div>
            {/* Description */}
              {/* Description Section - Updated */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mô tả sự kiện *</label>
          </div>
          <ReactQuill 
            theme="snow"
            value={formData.description || ''} 
            onChange={handleDescriptionChange}
            placeholder="Nhập mô tả sự kiện..."
            modules={{
              toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
                ['link', 'image'],
                ['clean']
              ]
            }}
            className="w-full"
          />
          {/* {formData.description && (
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded border">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Xem trước:</p>
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: formData.description }}
              />
            </div>
          )} */}
        </div>
            {/* Venue and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Địa điểm *</label>
                <input type="text" name="venue" value={formData.venue || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Nhập địa điểm" />
              </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chi tiết địa điểm</label>
                <input type="text" name="location_detail" value={formData.location_detail || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Ví dụ: Tầng 2, Phòng 201" />
              </div>
            </div>
            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ngày bắt đầu *</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date || ''}
                  onChange={handleInputChange}
                  min={new Date().toISOString().slice(0, 10)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ngày kết thúc *</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date || ''}
                  onChange={handleInputChange}
                  min={formData.start_date || new Date().toISOString().slice(0, 10)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Giờ diễn ra</label>
                <input 
                  type="time" 
                  name="time" 
                  value={formData.time || ''} 
                  onChange={(e) => {
                    console.log('Time input changed:', e.target.value);
                    setFormData(prev => {
                      console.log('Previous formData.time:', prev.time);
                      const newData = { ...prev, time: e.target.value };
                      console.log('New formData.time:', newData.time);
                      return newData;
                    });
                  }} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                  step="900"
                  title="Chọn giờ diễn ra"
                />
                
              </div>
            </div>
            {/* Seats and Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tổng số ghế *</label>
                <input type="numeric" name="total_seats" value={formData.total_seats || 0} onChange={handleInputChange} min="1" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Số ghế còn trống *</label>
                <input type="numeric" name="available_seats" value={formData.available_seats || 0} onChange={handleInputChange} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trạng thái *</label>
              <select
                name="status"
                  value={["preparing","active","ended"].includes(formData.status || '') ? (formData.status || '') : 'other'}
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
                {!["preparing","active","ended"].includes(formData.status || '') && (
                  <input
                    type="text"
                    name="status"
                    value={formData.status || ''}
                    onChange={handleInputChange}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Nhập trạng thái tùy chỉnh"
                    required
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trạng thái hiển thị</label>
                <input type="text" name="display_status" value={formData.display_status || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Ví dụ: Sắp diễn ra, Đang bán vé..." />
              </div>
            </div>
                        {/* Event Image */}
          <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ảnh sự kiện</label>
              <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="event-image-input"
                />
                <label 
                  htmlFor="event-image-input"
                  className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${
                    imagePreview 
                      ? 'border-blue-400 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  {imagePreview ? (
                    <div className="flex flex-col items-center">
                      <img src={imagePreview} alt="Event preview" className="h-40 object-cover rounded-lg border border-gray-200 dark:border-gray-600 mb-2" />
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        Click để thay đổi ảnh
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, GIF tối đa 10MB</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <svg className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-blue-600 dark:text-blue-400">Click để tải ảnh</span> hoặc kéo thả vào đây
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">PNG, JPG, GIF tối đa 10MB</span>
                    </div>
                  )}
                </label>
              </div>
              {imageError && <p className="text-red-500 text-sm mt-2">{imageError}</p>}
            </div>
                        {/* Map Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ảnh sơ đồ địa điểm</label>
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleMapImageChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="map-image-input"
                />
                <label 
                  htmlFor="map-image-input"
                  className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${
                    mapImagePreview 
                      ? 'border-green-400 dark:border-green-400 bg-green-50 dark:bg-green-900/20' 
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-green-400 dark:hover:border-green-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  {mapImagePreview ? (
                    <div className="flex flex-col items-center">
                      <img src={mapImagePreview} alt="Map preview" className="h-40 object-cover rounded-lg border border-gray-200 dark:border-gray-600 mb-2" />
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                        Click để thay đổi sơ đồ
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, GIF tối đa 10MB</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <svg className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-green-600 dark:text-green-400">Click để tải sơ đồ</span> hoặc kéo thả vào đây
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">PNG, JPG, GIF tối đa 10MB</span>
                    </div>
                  )}
                </label>
              </div>
              {mapImageError && <p className="text-red-500 text-sm mt-2">{mapImageError}</p>}
            </div>
            {/* Artists */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nghệ sĩ</label>
                <button type="button" onClick={addArtist} className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">Thêm nghệ sĩ</button>
              </div>
              {formData.artists?.map((artist, index) => (
                <div key={index} className="flex gap-4 mb-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex-1">
                    <input type="text" value={artist.name} onChange={e => updateArtist(index, 'name', e.target.value)} placeholder="Tên nghệ sĩ" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                                    <div className="flex-1">
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => handleArtistImageChange(index, e)} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        id={`artist-image-input-${index}`}
                      />
                      <label 
                        htmlFor={`artist-image-input-${index}`}
                        className={`flex items-center justify-center w-full px-3 py-2 border-2 border-dashed rounded-md cursor-pointer transition-colors duration-200 ${
                          artistImagePreviews[index]
                            ? 'border-purple-400 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20' 
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 hover:border-purple-400 dark:hover:border-purple-400 hover:bg-gray-50 dark:hover:bg-gray-500'
                        }`}
                      >
                        {artistImagePreviews[index] ? (
                          <div className="flex flex-col items-center">
                            <img src={artistImagePreviews[index]} alt="Artist preview" className="w-16 h-16 object-cover rounded-md border border-gray-200 dark:border-gray-600 mb-1" />
                            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                              Click để thay đổi
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium text-purple-600 dark:text-purple-400">Tải ảnh</span>
                            </span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                  <div className="flex-1">
                  <button type="button" onClick={() => removeArtist(index)} className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Xóa
                  </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Thông tin giá vé</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Giá vé thấp nhất</label>
                  <input 
                    type="number" 
                    name="min_price" 
                    value={formData.min_price || ''} 
                    onChange={handleInputChange} 
                    min="0" 
                    step="1000"
                    placeholder="0" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Giá vé cao nhất</label>
                  <input 
                    type="number" 
                    name="max_price" 
                    value={formData.max_price || ''} 
                    onChange={handleInputChange} 
                    min="0" 
                    step="1000"
                    placeholder="0" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hiển thị giá vé</label>
                  <input 
                    type="text" 
                    name="price_range_display" 
                    value={formData.price_range_display || ''} 
                    onChange={handleInputChange} 
                    placeholder="Ví dụ: Từ 500.000đ đến 2.000.000đ" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                  />
                </div>
              </div>
              {(formData.min_price || formData.max_price) && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/20 dark:border-blue-700">
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    💰 Range giá vé: {formData.min_price ? `${parseInt(formData.min_price).toLocaleString('vi-VN')}đ` : '0đ'} - {formData.max_price ? `${parseInt(formData.max_price).toLocaleString('vi-VN')}đ` : '0đ'}
                  </span>
                </div>
              )}
            </div>
            {/* Ticket Prices */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Loại vé</label>
                <button type="button" onClick={addTicketPrice} className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">Thêm loại vé</button>
              </div>
              {formData.ticket_prices?.map((ticket, index) => (
                <div key={index} className="flex gap-4 mb-4 p-4 border rounded">
                  <div className="flex-1">
                    <input type="text" value={ticket.name} onChange={e => updateTicketPrice(index, 'name', e.target.value)} placeholder="Tên loại vé" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <div className="flex-1">
                    <input type="text" value={ticket.price} onChange={e => updateTicketPrice(index, 'price', e.target.value)} placeholder="Giá vé (VNĐ)" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <button type="button" onClick={() => removeTicketPrice(index)} className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600">Xóa</button>
                </div>
              ))}
            </div>
            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              Hủy
            </button>
              <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Đang xử lý...' : (event ? 'Cập nhật' : 'Tạo sự kiện')}
            </button>
          </div>
        </form>
      </div>

      
    </>
  );
};
export default EventForm;