'use client';

import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import Swal from 'sweetalert2';
import NewsForm from '@/components/news/NewsForm';
import NewsPreview from '@/components/news/NewsPreview';
import IconEye from '@/components/icon/icon-eye';
import IconEdit from '@/components/icon/icon-edit';
import IconTrash from '@/components/icon/icon-trash';
import IconMore from '@/components/icon/icon-more';
import IconStar from '@/components/icon/icon-star';
import IconCalendar from '@/components/icon/icon-calendar';
import IconArchive from '@/components/icon/icon-archive';
import IconCopy from '@/components/icon/icon-copy';
import IconUser from '@/components/icon/icon-user';
import IconClock from '@/components/icon/icon-clock';
import Link from "next/link";
import axios from 'axios';
import ComponentsDatatablesAdvanced from '../../../components/datatables/components-datatables-advanced';
import '../../../styles/datatables.css';

interface News {
  id: number;
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
  published_at: string;
  status: 'draft' | 'published' | 'archived';
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [previewNews, setPreviewNews] = useState<News | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<{id:number, name:string, slug:string, type:string}[]>([]);

  useEffect(() => {
    fetchNews();
    // Lấy danh sách category từ API
    axios.get((process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000") + '/api/categories?type=news')
      .then(res => setCategoryOptions(res.data.data || []))
      .catch(() => setCategoryOptions([]));
  }, []);

  // Hàm showMessage giống Note
  const showMessage = (msg = '', type = 'success') => {
    const toast: any = Swal.mixin({
      toast: true,
      position: 'top',
      showConfirmButton: false,
      timer: 3000,
      customClass: { container: 'toast' },
    });
    toast.fire({
      icon: type,
      title: msg,
      padding: '10px 20px',
    });
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/news');
      if (data.success) {
        setNews(data.data.data || data.data);
      } else {
        showMessage(data.message || 'Không thể tải tin tức', 'error');
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      showMessage('Không thể tải tin tức', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Bạn có chắc chắn muốn xoá tin tức này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xoá',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    });
    if (!result.isConfirmed) return;
    try {
      const data = await apiCall(`/news/${id}`, { method: 'DELETE' });
      if (data.success) {
        showMessage('Tin tức đã được xóa thành công', 'success');
        fetchNews();
      } else {
        showMessage(data.message || 'Không thể xóa tin tức', 'error');
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      showMessage('Không thể xóa tin tức', 'error');
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      const data = await apiCall(`/news/${id}/toggle-featured`, { method: 'POST' });
      if (data.success) {
        showMessage('Trạng thái nổi bật đã được cập nhật', 'success');
        fetchNews();
      } else {
        showMessage(data.message || 'Không thể cập nhật trạng thái nổi bật', 'error');
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
      showMessage('Không thể cập nhật trạng thái nổi bật', 'error');
    }
  };

  const handlePublish = async (id: number) => {
    try {
      const data = await apiCall(`/news/${id}/publish`, { method: 'POST' });
      if (data.success) {
        showMessage('Tin tức đã được xuất bản', 'success');
        fetchNews();
      } else {
        showMessage(data.message || 'Không thể xuất bản tin tức', 'error');
      }
    } catch (error) {
      console.error('Error publishing news:', error);
      showMessage('Không thể xuất bản tin tức', 'error');
    }
  };

  const handleArchive = async (id: number) => {
    try {
      const data = await apiCall(`/news/${id}/archive`, { method: 'POST' });
      if (data.success) {
        showMessage('Tin tức đã được lưu trữ', 'success');
        fetchNews();
      } else {
        showMessage(data.message || 'Không thể lưu trữ tin tức', 'error');
      }
    } catch (error) {
      console.error('Error archiving news:', error);
      showMessage('Không thể lưu trữ tin tức', 'error');
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      const data = await apiCall(`/news/${id}/duplicate`, { method: 'POST' });
      if (data.success) {
        showMessage('Tin tức đã được sao chép thành công', 'success');
        fetchNews();
      } else {
        showMessage(data.message || 'Không thể sao chép tin tức', 'error');
      }
    } catch (error) {
      console.error('Error duplicating news:', error);
      showMessage('Không thể sao chép tin tức', 'error');
    }
  };

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Bản nháp', className: 'text-gray-800 border-gray-300' },
      published: { label: 'Đã xuất bản', className: 'text-green-700 border-green-300' },
      archived: { label: 'Đã lưu trữ', className: 'text-orange-700 border-orange-300' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant="outline" className={`whitespace-nowrap ${config.className}`}>{config.label}</Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    return (
      <Badge variant="outline" className="text-xs rounded-2xl px-3 py-1 bg-blue-50 text-blue-700 border-blue-200 font-semibold">{category}</Badge>
    );
  };

  const getCategoryName = (slug: string) => {
    const found = categoryOptions.find(c => c.slug === slug);
    return found ? found.name : slug;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {/* Bỏ Toast component khỏi render */}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Tin tức</h1>
          <p className="text-gray-600">Quản lý và xuất bản tin tức cho website</p>
        </div>
        <Link href="/news/create">
          <Button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center'>
            + Thêm tin tức
          </Button>
        </Link>
      </div>

      {/* News Preview */}
      {previewNews && (
        <NewsPreview
          news={previewNews}
          onClose={() => setPreviewNews(null)}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{news.length}</div>
          <div className="text-sm text-gray-600">Tổng số tin tức</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">
            {news.filter(item => item.status === 'published').length}
          </div>
          <div className="text-sm text-gray-600">Đã xuất bản</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {news.filter(item => item.status === 'draft').length}
          </div>
          <div className="text-sm text-gray-600">Bản nháp</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-pink-600">
            {news.filter(item => item.featured).length}
          </div>
          <div className="text-sm text-gray-600">Nổi bật</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <Input
                placeholder="Tìm kiếm tin tức..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-48 h-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="draft">Bản nháp</option>
            <option value="published">Đã xuất bản</option>
            <option value="archived">Đã lưu trữ</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-48 h-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả danh mục</option>
            <option value="Sự kiện">Sự kiện</option>
            <option value="Nghệ sĩ">Nghệ sĩ</option>
            <option value="Thông báo">Thông báo</option>
            <option value="Behind the scenes">Behind the scenes</option>
            <option value="Phỏng vấn">Phỏng vấn</option>
            <option value="Công nghệ">Công nghệ</option>
          </select>
        </div>
      </Card>

      {/* News Table */}
      <ComponentsDatatablesAdvanced
        data={filteredNews}
        onPreview={setPreviewNews}
        onEdit={news => window.location.href = `/news/${news.id}/edit`}
        onDelete={handleDelete}
        onToggleFeatured={handleToggleFeatured}
        onPublish={handlePublish}
        onArchive={handleArchive}
        onDuplicate={handleDuplicate}
      />
    </div>
  );
} 