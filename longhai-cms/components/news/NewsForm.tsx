'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import IconPlus from '@/components/icon/icon-plus';
import IconX from '@/components/icon/icon-x';
import IconTag from '@/components/icon/icon-tag';
import IconImage from '@/components/icon/icon-image';
import { apiCall } from '@/lib/api';
import NewsPreview from './NewsPreview';

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

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

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
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      [{ 'color': [] }, { 'background': [] }],
                      [{ 'align': [] }],
                      ['link', 'image'],
                      ['clean'],
                      ['code-block']
                    ]
                  }}
                  className="w-full"
                  style={{ minHeight: 500 }}
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
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                />
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
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
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
                      const formDataUpload = new FormData();
                      formDataUpload.append('file', file);
                      const res = await fetch('/api/upload', {
                        method: 'POST',
                        body: formDataUpload,
                      });
                      const data = await res.json();
                      setUploading(false);
                      if (data.success) {
                        handleInputChange('image', data.url);
                      } else {
                        alert(data.message || 'Upload thất bại');
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
                  <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <IconX className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => setShowPreview(true)}>
          Preview
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Đang lưu...' : (news ? 'Cập nhật' : 'Tạo tin tức')}
        </Button>
        <Button type="button" variant="outline" onClick={() => onSuccess()}>
          Hủy
        </Button>
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