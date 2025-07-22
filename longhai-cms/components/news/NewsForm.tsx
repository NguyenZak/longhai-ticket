'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import IconPlus from '@/components/icon/icon-plus';
import IconX from '@/components/icon/icon-x';
import IconTag from '@/components/icon/icon-tag';
import IconImage from '@/components/icon/icon-image';
import { apiCall } from '@/lib/api';
import NewsPreview from './NewsPreview';
import axios from 'axios';

interface News {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image?: string;
  author: string;
  category: string;
  tags: string[];
  read_time: number;
  featured: boolean;
  published_at?: string;
  status: 'draft' | 'published' | 'archived';
  meta_title?: string;
  meta_description?: string;
  created_at?: string;
  updated_at?: string;
}

interface NewsFormProps {
  news?: News | null;
  onSuccess: () => void;
}

export default function NewsForm({ news, onSuccess }: NewsFormProps) {
  const [formData, setFormData] = useState<News>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
    author: '',
    category: '',
    tags: [],
    read_time: 5,
    featured: false,
    status: 'draft',
    meta_title: '',
    meta_description: ''
  });

  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<{id:number, name:string, slug:string, type:string}[]>([]);

  useEffect(() => {
    if (news) {
      // Chuẩn hóa dữ liệu để không có trường nào null/undefined
      setFormData({
        title: news.title || '',
        slug: news.slug || '',
        excerpt: news.excerpt || '',
        content: news.content || '',
        image: news.image || '',
        author: news.author || '',
        category: news.category || '',
        tags: Array.isArray(news.tags) ? news.tags : [],
        read_time: typeof news.read_time === 'number' ? news.read_time : 5,
        featured: !!news.featured,
        status: news.status || 'draft',
        published_at: news.published_at || '',
        meta_title: news.meta_title || '',
        meta_description: news.meta_description || '',
        id: news.id,
      });
    }
    // Lấy danh sách category từ API
    axios.get((process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000") + '/api/categories?type=news')
      .then(res => setCategoryOptions(res.data.data || []))
      .catch(() => setCategoryOptions([]));
  }, [news]);

  const handleInputChange = (field: keyof News, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

 // Hàm chuyển tiếng Việt có dấu sang không dấu và tạo slug
function removeVietnameseTones(str: string) {
  return str
    .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
    .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
    .replace(/ì|í|ị|ỉ|ĩ/g, "i")
    .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
    .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
    .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
    .replace(/đ/g, "d")
    .replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A")
    .replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E")
    .replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I")
    .replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O")
    .replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U")
    .replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y")
    .replace(/Đ/g, "D");
}
function generateSlug(str: string) {
  return removeVietnameseTones(str)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}


  const handleTitleChange = (title: string) => {
    handleInputChange('title', title);
    if (!formData.slug || formData.slug === generateSlug(formData.title)) {
      handleInputChange('slug', generateSlug(title));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề là bắt buộc';
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Tóm tắt là bắt buộc';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Nội dung là bắt buộc';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Tác giả là bắt buộc';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Danh mục là bắt buộc';
    }

    if (formData.read_time < 1 || formData.read_time > 60) {
      newErrors.read_time = 'Thời gian đọc phải từ 1-60 phút';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const url = news ? `/news/${news.id}` : '/news';
      const method = news ? 'PUT' : 'POST';
      const data = await apiCall(url, {
        method,
        body: JSON.stringify(formData),
      });
      if (data.success) {
        onSuccess();
      } else {
        const errorMessage = data.message || 'Có lỗi xảy ra';
        if (data.errors) {
          setErrors(data.errors);
        } else {
          alert(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error saving news:', error);
      alert('Có lỗi xảy ra khi lưu tin tức');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Sự kiện',
    'Nghệ sĩ',
    'Thông báo',
    'Behind the scenes',
    'Phỏng vấn',
    'Công nghệ'
  ];

  // Thêm hàm upload ảnh giống EventForm
  const uploadNewsImage = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('image', file);
    // Nếu backend có endpoint riêng cho news thì dùng /upload/news-image, nếu không thì dùng /upload/event-image
    const response = await apiCall('/upload/event-image', {
      method: 'POST',
      body: fd,
      headers: {},
    });
    if (!response.success) throw new Error(response.message || 'Upload failed');
    return response.data.url;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Nhập tiêu đề tin tức"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="slug-tin-tuc"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Tóm tắt *</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  placeholder="Tóm tắt ngắn gọn về tin tức"
                  rows={3}
                  className={errors.excerpt ? 'border-red-500' : ''}
                />
                {errors.excerpt && <p className="text-red-500 text-sm mt-1">{errors.excerpt}</p>}
              </div>

              <div className="mb-4">
                <label className="block font-medium mb-1">Nội dung *</label>
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={value => setFormData(prev => ({ ...prev, content: value }))}
                  placeholder="Nhập nội dung tin tức..."
                  modules={{
                    toolbar: [
                      [{ 'font': [] }],
                      [{ 'size': ['small', false, 'large', 'huge'] }],
                    
                      // Header
                      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    
                      // Text styles
                      ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
                    
                      // Lists
                      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                      [{ 'indent': '-1' }, { 'indent': '+1' }],
                    
                      // Text direction & alignment
                      [{ 'direction': 'rtl' }],
                      [{ 'align': [] }],
                    
                      // Color & background
                      [{ 'color': [] }, { 'background': [] }],
                    
                      // Scripts
                      [{ 'script': 'sub' }, { 'script': 'super' }],
                    
                      // Link, image, video, formula
                      ['link', 'image', 'video', 'formula'],
                    
                      // Clear formatting
                      ['clean']
                    ]
                  }}
                  className="w-full quill-content"
                  
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-semibold">SEO</h3>
              <div>
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => handleInputChange('meta_title', e.target.value)}
                  placeholder="Meta title cho SEO"
                />
              </div>
              <div>
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => handleInputChange('meta_description', e.target.value)}
                  placeholder="Meta description cho SEO"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Cài đặt xuất bản</h3>
              
              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Bản nháp</option>
                  <option value="published">Xuất bản</option>
                  <option value="archived">Lưu trữ</option>
                </select>
              </div>

              <div>
                <Label htmlFor="published_at">Ngày xuất bản</Label>
                <Input
                  id="published_at"
                  type="datetime-local"
                  value={formData.published_at ? new Date(formData.published_at).toISOString().slice(0, 16) : ''}
                  onChange={(e) => handleInputChange('published_at', e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <label className="w-12 h-6 relative">
                  <input
                    type="checkbox"
                    className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
                    id="custom_switch_checkbox1"
                    checked={formData.featured}
                    onChange={e => handleInputChange('featured', e.target.checked)}
                  />
                  <span className="outline_checkbox bg-icon border-2 border-[#ebedf2] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#ebedf2] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full before:bg-[url(/assets/images/close.svg)] before:bg-no-repeat before:bg-center peer-checked:before:left-7 peer-checked:before:bg-[url(/assets/images/checked.svg)] peer-checked:border-primary peer-checked:before:bg-primary before:transition-all before:duration-300"></span>
                </label>
                <Label htmlFor="featured">Đánh dấu nổi bật</Label>
              </div>
            </CardContent>
          </Card>

          {/* Meta Information */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Thông tin bổ sung</h3>
              
              <div>
                <Label htmlFor="author">Tác giả *</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                  placeholder="Tên tác giả"
                  className={errors.author ? 'border-red-500' : ''}
                />
                {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author}</p>}
              </div>

              <div>
                <Label htmlFor="category">Danh mục *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Chọn danh mục</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              <div>
                <Label htmlFor="read_time">Thời gian đọc (phút)</Label>
                <Input
                  id="read_time"
                  type="number"
                  min="1"
                  max="60"
                  value={formData.read_time}
                  onChange={(e) => handleInputChange('read_time', parseInt(e.target.value))}
                  className={errors.read_time ? 'border-red-500' : ''}
                />
                {errors.read_time && <p className="text-red-500 text-sm mt-1">{errors.read_time}</p>}
              </div>

              <div>
                <Label htmlFor="image">Hình ảnh</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    placeholder="URL hình ảnh"
                    className="flex-1"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploading(true);
                      try {
                        const url = await uploadNewsImage(file);
                        handleInputChange('image', url);
                      } catch (err) {
                        alert('Upload thất bại');
                      } finally {
                        setUploading(false);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    title="Tải ảnh lên"
                  >
                    <IconImage className="w-5 h-5" />
                    {uploading ? 'Đang tải...' : 'Upload'}
                  </Button>
                </div>
                {formData.image && (
                  <div className="mt-2">
                    <img src={formData.image} alt="Preview" className="max-h-32 rounded border" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <IconTag className="w-5 h-5 text-gray-500" /> Tags
              </h3>
              <div className="flex space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Thêm tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} size="sm">
                  <IconPlus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block bg-green-50 text-green-700 text-xs rounded-2xl px-2 py-0.5 border border-green-200 font-medium"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <IconX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() => setShowPreview(true)}
        >
          Preview
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Đang lưu...' : (news ? 'Cập nhật' : 'Tạo tin tức')}
        </button>
        <button
          type="button"
          className="btn btn-outline-danger"
          onClick={() => onSuccess()}
        >
          Hủy
        </button>
      </div>

      {/* Preview modal */}
      {showPreview && (
        <NewsPreview
          news={{
            id: news?.id ?? 0,
            title: formData.title,
            slug: news?.slug ?? '',
            excerpt: formData.excerpt,
            content: formData.content,
            image: formData.image,
            author: formData.author,
            category: formData.category,
            tags: formData.tags,
            read_time: news?.read_time ?? 0,
            featured: formData.featured,
            published_at: formData.published_at || '',
            status: formData.status,
            meta_title: formData.meta_title || '',
            meta_description: formData.meta_description || '',
            created_at: (news && typeof news.created_at === 'string') ? news.created_at : new Date().toISOString(),
            updated_at: (news && typeof news.updated_at === 'string') ? news.updated_at : new Date().toISOString(),
          }}
          onClose={() => setShowPreview(false)}
        />
      )}
    </form>
  );
} 