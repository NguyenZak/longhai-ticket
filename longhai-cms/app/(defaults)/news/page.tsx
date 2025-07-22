'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  // Xoá ref dropdownRef và useEffect lắng nghe click ngoài

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

  // Thêm hàm xử lý bản nháp nếu chưa có
  const handleDraft = async (id: number) => {
    // Ví dụ: chuyển trạng thái về draft, hoặc gọi API tương ứng
    try {
      const data = await apiCall(`/news/${id}/draft`, { method: 'POST' });
      if (data.success) {
        showMessage('Tin tức đã chuyển về bản nháp', 'success');
        fetchNews();
      } else {
        showMessage(data.message || 'Không thể chuyển về bản nháp', 'error');
      }
    } catch (error) {
      showMessage('Không thể chuyển về bản nháp', 'error');
    }
  };

  // Lọc realtime trên client
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
            {categoryOptions.map(cat => (
              <option key={cat.slug} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* News Table */}
      <div className="panel mt-6">
        <h5 className="mb-5 text-lg font-semibold dark:text-white-light"></h5>
        <div className="datatables">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-hover whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tiêu đề</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Danh mục</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tác giả</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ngày đăng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredNews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-500 py-8">Không có dữ liệu để hiển thị</td>
                  </tr>
                ) : (
                  filteredNews.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {item.image && <img src={item.image} alt={item.title} className="w-10 h-10 object-cover rounded" />}
                          <div>
                            <div className="font-semibold line-clamp-1">{item.title}</div>
                            <div className="text-xs text-gray-500 line-clamp-1">{item.excerpt}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="badge badge-outline-primary">{getCategoryName(item.category)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="flex items-center"><IconUser className="w-4 h-4 mr-1" />{item.author}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDate(item.published_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-row gap-2 items-center">
                          <button onClick={() => setPreviewNews(item)} className="btn btn-xs btn-ghost text-blue-600" title="Xem trước"><IconEye className="w-5 h-5" /></button>
                          <button onClick={() => window.location.href = `/news/${item.id}/edit`} className="btn btn-xs btn-ghost text-green-600" title="Chỉnh sửa"><IconEdit className="w-5 h-5" /></button>
                          {/* Dropdown thao tác mở rộng */}
                          <div className="relative">
                            <button
                              className="btn btn-xs btn-ghost text-gray-600"
                              title="Thao tác khác"
                              onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                            >
                              <IconMore className="w-5 h-5" />
                            </button>
                            {openDropdownId === item.id && (
                              <>
                                {/* Overlay nhỏ để bắt sự kiện click ngoài, chỉ hiện khi dropdown mở */}
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={() => setOpenDropdownId(null)}
                                  aria-label="Đóng dropdown"
                                />
                                <div className="absolute left-full top-0 ml-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50 animate-popupIn">
                                  {item.status === 'draft' && (
                                    <button className="flex items-center w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100" onClick={() => { handlePublish(item.id); setOpenDropdownId(null); }}><IconCalendar className="w-4 h-4 mr-2" />Xuất bản</button>
                                  )}
                                  {item.status === 'archived' && (
                                    <>
                                      <button className="flex items-center w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100" onClick={() => { handlePublish(item.id); setOpenDropdownId(null); }}><IconCalendar className="w-4 h-4 mr-2" />Xuất bản</button>
                                      <button className="flex items-center w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100" onClick={() => { handleDraft(item.id); setOpenDropdownId(null); }}><IconArchive className="w-4 h-4 mr-2" />Bản nháp</button>
                                    </>
                                  )}
                                  <button className="flex items-center w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100" onClick={() => { handleDuplicate(item.id); setOpenDropdownId(null); }}><IconCopy className="w-4 h-4 mr-2" />Sao chép</button>
                                  {(item.status === 'draft' || item.status === 'published') && (
                                    <button className="flex items-center w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100" onClick={() => { handleArchive(item.id); setOpenDropdownId(null); }}><IconArchive className="w-4 h-4 mr-2" />Lưu trữ</button>
                                  )}
                                  <button className="flex items-center w-full px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900 text-red-600 dark:text-red-300" onClick={() => { handleDelete(item.id); setOpenDropdownId(null); }}><IconTrash className="w-4 h-4 mr-2" />Xoá</button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 